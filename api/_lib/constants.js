const TARGET_TEAMS = [
  {
    code: 'MUN',
    name: 'Manchester United',
    aliases: ['manchester united', 'man utd', 'man united', 'manutd', 'utd', 'red devils', '맨유', '맨체스터 유나이티드'],
  },
  {
    code: 'MCI',
    name: 'Manchester City',
    aliases: ['manchester city', 'man city', 'mancity', 'city', 'mcfc', '맨시티', '맨체스터 시티'],
  },
  {
    code: 'LIV',
    name: 'Liverpool',
    aliases: ['liverpool', 'lfc', 'reds', '리버풀'],
  },
  {
    code: 'ARS',
    name: 'Arsenal',
    aliases: ['arsenal', 'afc', 'gunners', '아스날', '아스널'],
  },
  {
    code: 'TOT',
    name: 'Tottenham Hotspur',
    aliases: ['tottenham', 'spurs', 'thfc', 'tottenham hotspur', '토트넘', '스퍼스'],
  },
  {
    code: 'CHE',
    name: 'Chelsea',
    aliases: ['chelsea', 'cfc', 'blues', '첼시'],
  },
];

const OFFICIAL_KEYWORDS = [
  'official',
  'officially',
  'announced',
  'confirmed',
  'statement',
  'club statement',
  'signed',
  'contract signed',
  'completed',
  'here we go',
  'done deal',
  '공식',
  '발표',
  '확정',
  '계약 완료',
];

const RUMOUR_KEYWORDS = [
  'rumour',
  'rumor',
  'talks',
  'interest',
  'interested',
  'monitoring',
  'considering',
  'could',
  'expected to',
  'set to',
  'advanced talks',
  'negotiations',
  'proposal',
  'bid',
  'target',
  '루머',
  '관심',
  '협상',
  '가능성',
  '검토',
];

function normalizeText(text) {
  return String(text || '').toLowerCase();
}

function matchTeams(text, aliases = []) {
  const normalized = normalizeText(text);
  const matches = new Set();

  for (const team of TARGET_TEAMS) {
    for (const alias of team.aliases) {
      if (normalized.includes(alias.toLowerCase())) matches.add(team.code);
    }
  }

  for (const row of aliases) {
    const alias = row.alias || row.label;
    const teamCode = row.team_code || row.teamCode;
    if (alias && teamCode && normalized.includes(String(alias).toLowerCase())) {
      matches.add(teamCode);
    }
  }

  return [...matches].filter(code => TARGET_TEAMS.some(team => team.code === code));
}

function hasAny(text, keywords) {
  const normalized = normalizeText(text);
  return keywords.some(keyword => normalized.includes(keyword));
}

module.exports = {
  OFFICIAL_KEYWORDS,
  RUMOUR_KEYWORDS,
  TARGET_TEAMS,
  hasAny,
  matchTeams,
};
