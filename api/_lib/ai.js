const { OFFICIAL_KEYWORDS, RUMOUR_KEYWORDS, TARGET_TEAMS, hasAny, matchTeams } = require('./constants');

const TARGET_TEAM_CODES = TARGET_TEAMS.map(team => team.code);
const BRIEFING_STATUSES = ['OFFICIAL', 'RUMOUR', 'UPDATE', 'CONFIRMED', 'DENIED'];
const PUBLISHABLE_STATUSES = new Set(['OFFICIAL', 'CONFIRMED']);

const CLASSIFICATION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'is_target_relevant',
    'teams',
    'decision',
    'confidence',
    'entities',
    'evidence',
    'review_reason',
    'briefing',
  ],
  properties: {
    is_target_relevant: { type: 'boolean' },
    teams: {
      type: 'array',
      items: { type: 'string', enum: TARGET_TEAM_CODES },
    },
    decision: { type: 'string', enum: ['publish', 'review', 'discard'] },
    confidence: { type: 'number' },
    entities: {
      type: 'object',
      additionalProperties: false,
      required: ['players', 'clubs', 'competitions', 'journalists'],
      properties: {
        players: { type: 'array', items: { type: 'string' } },
        clubs: { type: 'array', items: { type: 'string' } },
        competitions: { type: 'array', items: { type: 'string' } },
        journalists: { type: 'array', items: { type: 'string' } },
      },
    },
    evidence: { type: 'array', items: { type: 'string' } },
    review_reason: {
      anyOf: [{ type: 'string' }, { type: 'null' }],
    },
    briefing: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'summary_short', 'summary_detail', 'tags', 'status'],
      properties: {
        title: { type: 'string' },
        summary_short: { type: 'string' },
        summary_detail: { type: 'string' },
        tags: {
          type: 'array',
          items: { type: 'string', enum: TARGET_TEAM_CODES },
        },
        status: { type: 'string', enum: BRIEFING_STATUSES },
      },
    },
  },
};

function parseOutputText(payload) {
  if (payload.output_text) return payload.output_text;
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) return content.text;
    }
  }
  return null;
}

function uniqueTargetTeams(values) {
  const allowed = new Set(TARGET_TEAM_CODES);
  const output = [];
  for (const value of values || []) {
    const code = String(value || '').trim().toUpperCase();
    if (allowed.has(code) && !output.includes(code)) output.push(code);
  }
  return output;
}

function normalizeConfidence(value) {
  let confidence = Number.isFinite(Number(value)) ? Number(value) : 0;
  if (confidence > 1 && confidence <= 100) confidence /= 100;
  return Math.max(0, Math.min(confidence, 1));
}

function normalizeDecision(value) {
  return ['publish', 'review', 'discard'].includes(value) ? value : 'review';
}

function normalizeStatus(value, fallback = 'UPDATE') {
  const normalized = String(value || '').trim().toUpperCase();
  if (BRIEFING_STATUSES.includes(normalized)) return normalized;
  if (normalized === 'OFFICIAL') return 'OFFICIAL';
  if (normalized === 'CONFIRMED') return 'CONFIRMED';
  if (normalized === 'RUMOUR' || normalized === 'RUMOR') return 'RUMOUR';
  if (normalized === 'IRRELEVANT' || normalized === 'AMBIGUOUS') return fallback;
  return fallback;
}

function reviewReason(value) {
  if (typeof value !== 'string') return null;
  const clean = value.trim();
  return clean ? clean : null;
}

function textSnippet(post, max = 220) {
  const text = String(post.text || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function isMediaHeavy(post) {
  return (post.media || []).length > 0 && String(post.text || '').trim().length < 40;
}

function legacyNewsTypeFromBriefingStatus(status, decision) {
  if (decision === 'discard') return 'irrelevant';
  const normalized = normalizeStatus(status);
  if (normalized === 'OFFICIAL' || normalized === 'CONFIRMED') return 'official';
  if (normalized === 'RUMOUR') return 'rumour';
  return 'ambiguous';
}

function normalizeBriefing(result, teams, post) {
  const source = result.briefing || {};
  const status = normalizeStatus(source.status, 'UPDATE');
  const fallbackSummary = textSnippet(post);
  const title = String(source.title || '검수 필요 EPL 업데이트').trim();
  const summaryShort = String(source.summary_short || fallbackSummary).trim();
  const summaryDetail = String(source.summary_detail || source.summary_short || fallbackSummary).trim();

  return {
    title,
    summary_short: summaryShort,
    summary_detail: summaryDetail,
    tags: uniqueTargetTeams(source.tags || teams),
    status,
  };
}

function fallbackStatus({ relevant, officialish, rumourish }) {
  if (!relevant) return 'UPDATE';
  if (rumourish) return 'RUMOUR';
  if (officialish) return 'CONFIRMED';
  return 'UPDATE';
}

function fallbackClassify(post, aliases) {
  const teams = matchTeams(post.text, aliases);
  const relevant = teams.length > 0;
  const officialish = hasAny(post.text, OFFICIAL_KEYWORDS);
  const rumourish = hasAny(post.text, RUMOUR_KEYWORDS);
  const status = fallbackStatus({ relevant, officialish, rumourish });
  const snippet = textSnippet(post);

  return enforcePolicy({
    is_target_relevant: relevant,
    teams,
    decision: relevant ? 'review' : 'discard',
    confidence: relevant ? 0.55 : 0.9,
    entities: {
      players: [],
      clubs: teams,
      competitions: [],
      journalists: post.author_handle ? [post.author_handle] : [],
    },
    evidence: relevant ? ['OpenAI 키가 없어 alias 기반 규칙으로만 분류했습니다.'] : ['대상 6개 팀 alias와 일치하지 않았습니다.'],
    review_reason: relevant
      ? (isMediaHeavy(post) ? '사진/영상 중심이거나 텍스트가 짧아 검수가 필요합니다.' : 'OpenAI 키가 없어 자동 발행하지 않고 검수로 보냅니다.')
      : null,
    briefing: {
      title: relevant ? '검수 필요 EPL 업데이트' : '비대상 EPL 업데이트',
      summary_short: snippet || '원문 텍스트가 비어 있습니다.',
      summary_detail: snippet || '원문 텍스트가 비어 있습니다.',
      tags: teams,
      status,
    },
  }, post);
}

function enforcePolicy(result, post) {
  const teams = uniqueTargetTeams([...(result.teams || []), ...((result.briefing && result.briefing.tags) || [])]);
  const confidence = normalizeConfidence(result.confidence);
  const briefing = normalizeBriefing(result, teams, post);
  const evidence = Array.isArray(result.evidence) ? result.evidence.filter(Boolean).map(String) : [];
  const hasEvidence = evidence.length > 0;
  const mediaHeavy = isMediaHeavy(post);
  const reason = reviewReason(result.review_reason);
  const targetRelevant = Boolean(result.is_target_relevant) && teams.length > 0;
  let decision = normalizeDecision(result.decision);

  const cleanResult = {
    ...result,
    is_target_relevant: targetRelevant,
    teams: targetRelevant ? teams : [],
    decision,
    confidence,
    entities: {
      players: Array.isArray(result.entities?.players) ? result.entities.players : [],
      clubs: Array.isArray(result.entities?.clubs) ? result.entities.clubs : [],
      competitions: Array.isArray(result.entities?.competitions) ? result.entities.competitions : [],
      journalists: Array.isArray(result.entities?.journalists) ? result.entities.journalists : [],
    },
    evidence,
    review_reason: reason,
    briefing: {
      ...briefing,
      tags: targetRelevant ? teams : [],
    },
  };

  if (!targetRelevant) {
    return {
      ...cleanResult,
      is_target_relevant: false,
      teams: [],
      decision: 'discard',
      review_reason: null,
      briefing: {
        ...cleanResult.briefing,
        tags: [],
      },
    };
  }

  const canPublish =
    PUBLISHABLE_STATUSES.has(cleanResult.briefing.status) &&
    cleanResult.confidence >= 0.85 &&
    !cleanResult.review_reason &&
    hasEvidence &&
    !mediaHeavy;

  if (decision === 'publish' && !canPublish) {
    return {
      ...cleanResult,
      decision: 'review',
      review_reason: cleanResult.review_reason || '보수적 자동 발행 정책에 따라 검수가 필요합니다.',
    };
  }

  if (mediaHeavy) {
    return {
      ...cleanResult,
      decision: 'review',
      review_reason: cleanResult.review_reason || '사진/영상 중심이거나 텍스트가 짧아 검수가 필요합니다.',
    };
  }

  if (!PUBLISHABLE_STATUSES.has(cleanResult.briefing.status) && decision === 'publish') {
    return {
      ...cleanResult,
      decision: 'review',
      review_reason: cleanResult.review_reason || '루머/업데이트/부인 상태는 자동 발행할 수 없습니다.',
    };
  }

  return cleanResult;
}

async function classifyPost(post, aliases) {
  if (!process.env.OPENAI_API_KEY) return fallbackClassify(post, aliases);

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      input: [
        {
          role: 'system',
          content: [{
            type: 'input_text',
            text: [
              'You classify football X posts for a Korean EPL fan product.',
              'Only these target teams are in scope: MUN, MCI, LIV, ARS, TOT, CHE.',
              'Discard posts unrelated to those six teams.',
              'If a team is not named but a player/manager alias clearly links to one target team, tag that team. If the link is uncertain, choose review.',
              'All user-facing briefing fields must be written in Korean.',
              'Use only facts stated in the original X post. Do not add background context, fan sentiment, source credibility commentary, debate framing, opinion, or emotional wording.',
              'Do not use clickbait, exclamation marks, emojis, or exaggerated Korean words such as 충격, 초대형, 전격.',
              'Use speculative Korean reporting endings for unconfirmed information.',
              'Set briefing.status to OFFICIAL for club/player official announcements, CONFIRMED for definitive completed reports, UPDATE for progress, RUMOUR for interest/talks/possibility, and DENIED for denial/collapse/rejection.',
              'Only choose decision=publish when the post is target-relevant, text-supported, status is OFFICIAL or CONFIRMED, confidence is at least 0.85, evidence exists, and review_reason is null.',
              'Rumours, speculative wording, ambiguous posts, media-heavy posts, short captions, photos, and videos must go to review.',
            ].join('\n'),
          }],
        },
        {
          role: 'user',
          content: [{
            type: 'input_text',
            text: JSON.stringify({
              post,
              target_team_aliases: aliases,
            }),
          }],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'epl_x_classification',
          strict: true,
          schema: CLASSIFICATION_SCHEMA,
        },
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw Object.assign(new Error(payload.error?.message || 'OpenAI classification failed'), {
      statusCode: response.status >= 500 ? 502 : response.status,
      payload,
    });
  }

  const outputText = parseOutputText(payload);
  if (!outputText) {
    throw Object.assign(new Error('OpenAI response did not include output text'), { statusCode: 502, payload });
  }

  return enforcePolicy(JSON.parse(outputText), post);
}

module.exports = {
  classifyPost,
  enforcePolicy,
  legacyNewsTypeFromBriefingStatus,
};
