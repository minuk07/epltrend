import { useState, useEffect, useRef, useMemo } from 'react';
import { POSTS, TEAMS } from './data';

function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return String(n);
}

function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

const STATUS_CFG = {
  Official: { bg: '#052818', color: '#34d399', dot: '#22c55e' },
  Advanced:  { bg: '#2d1000', color: '#fb923c', dot: '#f97316' },
  Talks:     { bg: '#291e00', color: '#fbbf24', dot: '#eab308' },
  Interest:  { bg: '#0d2240', color: '#60a5fa', dot: '#3b82f6' },
  Rumour:    { bg: '#141420', color: '#9ca3af', dot: '#6b7280' },
  Opinion:   { bg: '#14123a', color: '#818cf8', dot: '#6366f1' },
  Memory:    { bg: '#1a0a2e', color: '#c084fc', dot: '#a855f7' },
};

const CLUB_CFG = {
  MUN: { bg: '#3a0000', color: '#ff7070' },
  TOT: { bg: '#001228', color: '#7eb8f7' },
  CHE: { bg: '#001035', color: '#5b9bd5' },
  LIV: { bg: '#3a0000', color: '#ff7070' },
  MCI: { bg: '#002038', color: '#6dc1e7' },
  ARS: { bg: '#3a0000', color: '#ff7070' },
};

const ALL_STATUSES = ['Official', 'Advanced', 'Talks', 'Interest', 'Rumour'];

function applyFilters(posts, filters) {
  return posts.filter(post => {
    if (filters.clubs.length > 0 && !filters.clubs.includes(post.club)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(post.status)) return false;
    if (filters.tiers.length > 0 && post.tweet && !filters.tiers.includes(post.tweet.tier)) return false;
    return true;
  });
}

/* ─── Sidebar ─── */
function Sidebar({ selectedTeam, filters, onFiltersChange, collapsed }) {
  const tc = selectedTeam?.primaryColor || '#3b82f6';

  const toggleClub = (club) => {
    const clubs = filters.clubs.includes(club)
      ? filters.clubs.filter(c => c !== club)
      : [...filters.clubs, club];
    onFiltersChange({ ...filters, clubs });
  };
  const toggleStatus = (s) => {
    const statuses = filters.statuses.includes(s)
      ? filters.statuses.filter(x => x !== s)
      : [...filters.statuses, s];
    onFiltersChange({ ...filters, statuses });
  };
  const toggleTier = (t) => {
    const tiers = filters.tiers.includes(t)
      ? filters.tiers.filter(x => x !== t)
      : [...filters.tiers, t];
    onFiltersChange({ ...filters, tiers });
  };

  return (
    <div
      className="shrink-0 flex flex-col"
      style={{
        width: collapsed ? '56px' : '240px',
        borderRight: '1px solid #141420',
        background: '#07070f',
        position: 'sticky',
        top: 0,
        height: '100vh',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div className="px-4 py-5 shrink-0 flex items-center gap-2" style={{ borderBottom: '1px solid #141420', minHeight: '64px' }}>
        <span className="font-black text-white shrink-0" style={{ fontSize: '22px', letterSpacing: '-0.5px' }}>
          {collapsed ? 'R' : 'Reax'}
        </span>
        {!collapsed && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded shrink-0"
            style={{ background: '#1a1a2a', color: '#8b8fa8', border: '1px solid #2a2a3a' }}>
            EPL
          </span>
        )}
      </div>

      {/* My team */}
      {!collapsed && selectedTeam && (
        <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid #141420' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0"
              style={{ background: tc, color: '#fff' }}>
              {selectedTeam.shortName.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-xs" style={{ color: '#4a4a6a' }}>내 팀</div>
              <div className="text-sm font-bold text-white truncate">{selectedTeam.name}</div>
            </div>
          </div>
        </div>
      )}

      {/* Icon-only: team dots when collapsed */}
      {collapsed && selectedTeam && (
        <div className="flex justify-center py-3" style={{ borderBottom: '1px solid #141420' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs"
            style={{ background: tc, color: '#fff' }}>
            {selectedTeam.shortName.slice(0, 2)}
          </div>
        </div>
      )}

      {/* Filters */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5" style={{ scrollbarWidth: 'none' }}>

          {/* 클럽 필터 */}
          <div>
            <div className="text-xs font-bold mb-2.5" style={{ color: '#4a4a6a', letterSpacing: '0.06em' }}>
              클럽 필터
            </div>
            <div className="space-y-0.5">
              {TEAMS.map(team => {
                const active = filters.clubs.includes(team.shortName);
                return (
                  <button key={team.shortName} onClick={() => toggleClub(team.shortName)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left"
                    style={{
                      background: active ? `${team.primaryColor}18` : 'transparent',
                      border: `1px solid ${active ? team.primaryColor + '45' : 'transparent'}`,
                    }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: active ? team.primaryColor : '#1e1e2e', color: active ? '#fff' : '#6b6f88' }}>
                      {team.shortName.slice(0, 1)}
                    </div>
                    <span className="text-sm" style={{ color: active ? '#fff' : '#8b8fa8' }}>{team.shortName}</span>
                    {active && <span className="ml-auto text-xs" style={{ color: team.primaryColor }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 신뢰도 */}
          <div>
            <div className="text-xs font-bold mb-2.5" style={{ color: '#4a4a6a', letterSpacing: '0.06em' }}>
              소스 신뢰도
            </div>
            <div className="flex gap-2">
              {[1, 2].map(t => {
                const active = filters.tiers.includes(t);
                return (
                  <button key={t} onClick={() => toggleTier(t)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold"
                    style={{
                      background: active ? '#2a1f00' : '#111118',
                      color: active ? '#f4a100' : '#4a4a6a',
                      border: `1px solid ${active ? '#f4a10040' : '#1e1e2a'}`,
                    }}>
                    T{t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 진행 단계 */}
          <div>
            <div className="text-xs font-bold mb-2.5" style={{ color: '#4a4a6a', letterSpacing: '0.06em' }}>
              진행 단계
            </div>
            <div className="space-y-0.5">
              {ALL_STATUSES.map(status => {
                const cfg = STATUS_CFG[status] || STATUS_CFG.Rumour;
                const active = filters.statuses.includes(status);
                return (
                  <button key={status} onClick={() => toggleStatus(status)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left"
                    style={{
                      background: active ? cfg.bg : 'transparent',
                      border: `1px solid ${active ? cfg.color + '30' : 'transparent'}`,
                    }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
                    <span className="text-xs" style={{ color: active ? cfg.color : '#6b6f88' }}>
                      {status.toUpperCase()}
                    </span>
                    {active && <span className="ml-auto text-xs" style={{ color: cfg.color }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Collapsed: filter icons */}
      {collapsed && (
        <div className="flex-1 flex flex-col items-center gap-4 py-4">
          {filters.clubs.length > 0 && (
            <span className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} />
          )}
          {filters.statuses.length > 0 && (
            <span className="w-2 h-2 rounded-full" style={{ background: '#fbbf24' }} />
          )}
        </div>
      )}

      {/* Bottom: reset */}
      {!collapsed && (
        <div className="px-4 py-4 shrink-0" style={{ borderTop: '1px solid #141420' }}>
          <button
            onClick={() => onFiltersChange({ clubs: [], tiers: [], statuses: [] })}
            className="w-full py-2 rounded-lg text-xs font-semibold"
            style={{ background: '#111118', color: '#4a4a6a', border: '1px solid #1e1e2a' }}>
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Desktop feed card (가로형) ─── */
function DesktopFeedCard({ post, selected, onSelect, vote }) {
  const isDebate = post.type === 'debate' || post.type === 'today_debate' || post.type === 'hot_debate';
  const isToday = post.type === 'today_debate';
  const accent = isToday ? '#fbbf24' : '#e63946';
  const statusCfg = STATUS_CFG[post.status] || STATUS_CFG.Rumour;
  const clubCfg = CLUB_CFG[post.club] || { bg: '#141420', color: '#9ca3af' };

  return (
    <div onClick={onSelect}
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: '#0a0a14',
        border: selected
          ? `1.5px solid ${isDebate ? accent : '#3b82f6'}`
          : '1.5px solid #141420',
        boxShadow: selected
          ? `0 0 0 3px ${isDebate ? accent : '#3b82f6'}15`
          : 'none',
        minHeight: '180px',
      }}>
      {/* Debate top line */}
      {isDebate && (
        <div className="h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}90, transparent)` }} />
      )}

      {/* 가로 그리드: 텍스트 | 이미지 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px' }}>
        {/* 텍스트 영역 */}
        <div className="p-4 flex flex-col justify-between min-w-0">
          <div>
            {/* Badges */}
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              {isDebate && (
                <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full"
                  style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}35` }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
                  {post.badge}
                </span>
              )}
              {post.status && (
                <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg"
                  style={{ background: statusCfg.bg, color: statusCfg.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.dot }} />
                  {post.status.toUpperCase()}
                </span>
              )}
              {post.club && (
                <span className="text-xs font-bold px-2 py-1 rounded-lg"
                  style={{ background: clubCfg.bg, color: clubCfg.color }}>
                  {post.club}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-black text-white leading-tight mb-1.5 whitespace-pre-line"
              style={{ fontSize: '17px', letterSpacing: '-0.3px' }}>
              {post.title}
            </h3>

            {/* Summary — 최대 3줄 */}
            <p className="text-xs leading-relaxed mb-3"
              style={{
                color: 'rgba(255,255,255,0.45)',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
              {post.summary}
            </p>
          </div>

          {/* Tweet source */}
          {post.tweet && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: '#1e1e2e', color: '#f4a100' }}>
                {post.tweet.initials}
              </div>
              <span className="text-xs truncate" style={{ color: '#6b6f88' }}>{post.tweet.author}</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded shrink-0"
                style={{ background: '#2a1f00', color: '#f4a100' }}>
                T{post.tweet.tier}
              </span>
              <span className="text-xs ml-auto shrink-0" style={{ color: '#3a3a5a' }}>{post.tweet.timeAgo}</span>
            </div>
          )}
        </div>

        {/* 이미지 영역 */}
        <div className="relative overflow-hidden" style={{ minHeight: '160px' }}>
          {post.imageUrl ? (
            <img src={post.imageUrl} alt=""
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: 'cover', objectPosition: 'center top' }} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: '#111118' }}>
              <span style={{ fontSize: '28px', opacity: 0.15 }}>⚽</span>
            </div>
          )}
        </div>
      </div>

      {/* 하단 푸터 */}
      <div className="px-4 py-2.5 flex items-center gap-4"
        style={{ borderTop: '1px solid #141420' }}>
        {/* 투표 바 (debate만) */}
        {isDebate && (
          <div style={{ width: '140px', flexShrink: 0 }}>
            {vote ? (
              <>
                <div className="flex h-1 rounded-full overflow-hidden mb-0.5" style={{ background: '#1a1a2a' }}>
                  <div style={{ width: `${post.voteFor}%`, background: 'linear-gradient(90deg,#2563eb,#3b82f6)' }} />
                  <div style={{ width: `${post.voteAgainst}%`, background: 'linear-gradient(90deg,#dc2626,#e63946)' }} />
                </div>
                <div className="flex justify-between" style={{ fontSize: '10px' }}>
                  <span style={{ color: '#3b82f6' }}>{post.voteFor}%</span>
                  <span style={{ color: '#e63946' }}>{post.voteAgainst}%</span>
                </div>
              </>
            ) : (
              <div className="h-1 rounded-full"
                style={{ background: 'linear-gradient(90deg,#2563eb22 0%,#2563eb22 48%,#dc262622 48%,#dc262622 100%)' }} />
            )}
          </div>
        )}
        <span className="text-xs" style={{ color: '#2a2a4a' }}>♡ {fmt(post.reactions)}</span>
        <span className="text-xs" style={{ color: '#2a2a4a' }}>💬 {fmt(post.comments)}</span>
        <span className="text-xs" style={{ color: '#2a2a4a' }}>🔖 {fmt(post.bookmarks)}</span>
        {selected && (
          <span className="ml-auto text-xs font-semibold"
            style={{ color: isDebate ? accent : '#3b82f6' }}>
            토론 중 →
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Preview card (선택된 카드 인접, 흐릿한 한 줄 요약) ─── */
function PreviewCard({ post }) {
  const isDebate = post.type === 'debate' || post.type === 'today_debate' || post.type === 'hot_debate';
  const accent = post.type === 'today_debate' ? '#fbbf24' : '#e63946';
  const statusCfg = STATUS_CFG[post.status] || STATUS_CFG.Rumour;
  const clubCfg = CLUB_CFG[post.club] || { bg: '#141420', color: '#9ca3af' };

  return (
    <div className="rounded-xl px-4 py-2.5 flex items-center gap-2 min-w-0"
      style={{
        background: '#0a0a14',
        border: '1.5px solid #141420',
        opacity: 0.4,
        filter: 'blur(1.5px)',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
      {isDebate && (
        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0"
          style={{ background: `${accent}18`, color: accent }}>
          {post.badge}
        </span>
      )}
      {post.status && (
        <span className="flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded shrink-0"
          style={{ background: statusCfg.bg, color: statusCfg.color }}>
          <span className="w-1 h-1 rounded-full" style={{ background: statusCfg.dot }} />
          {post.status.toUpperCase()}
        </span>
      )}
      {post.club && (
        <span className="text-xs font-bold px-1.5 py-0.5 rounded shrink-0"
          style={{ background: clubCfg.bg, color: clubCfg.color }}>
          {post.club}
        </span>
      )}
      <span className="text-sm font-semibold text-white truncate flex-1">
        {post.title.replace('\n', ' ')}
      </span>
      {post.tweet && (
        <span className="text-xs shrink-0" style={{ color: '#3a3a5a' }}>{post.tweet.timeAgo}</span>
      )}
    </div>
  );
}

/* ─── Feed column ─── */
const TICKER_ITEMS = [
  '● LIVE  진짜 보내면 안되지', '@jenna_94  드디어 ㅠㅠ 너무 좋다',
  '@manu_fan  캐릭은 진짜 레전드임', '@spurs_kr  손흥민 제발 남아줘',
  '@epl_korea  오늘 발표 크다', '@redcafe  팬으로서 행복하다',
  '@lfc_kr  살라 계약 드디어', '@city_kr  홀란드 빨리 낫길',
];

function FeedColumn({ posts, selectedPost, onSelect, votes }) {
  const text = TICKER_ITEMS.map((t, i) => (i > 0 ? `  —  ${t}` : t)).join('');
  const doubled = text + '    —    ' + text;

  return (
    <div className="flex-1 flex flex-col min-w-0"
      style={{ overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#1e1e2a transparent' }}>
      {/* Header */}
      <div className="shrink-0 px-8 py-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid #141420', background: '#07070f', position: 'sticky', top: 0, zIndex: 10 }}>
        <span className="font-black text-white" style={{ fontSize: '18px' }}>피드</span>
        <span className="text-sm" style={{ color: '#3a3a5a' }}>{posts.length}개 이슈</span>
      </div>

      {/* Ticker */}
      <div className="overflow-hidden shrink-0 py-1.5"
        style={{ borderBottom: '1px solid #141420', background: '#07070f' }}>
        <div className="live-ticker text-xs" style={{ color: '#4a4a6a' }}>{doubled}</div>
      </div>

      {/* Cards */}
      <div className="py-6 px-8">
        <div className="mx-auto space-y-4" style={{ maxWidth: '680px' }}>
          {posts.length === 0 ? (
            <div className="text-center py-16" style={{ color: '#3a3a5a' }}>
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-sm">필터 조건에 맞는 이슈가 없습니다</div>
            </div>
          ) : (() => {
            const selectedIdx = posts.findIndex(p => p.id === selectedPost?.id);
            return posts.map((post, idx) => {
              const isSelected = idx === selectedIdx;
              const isAdjacent = selectedIdx !== -1 && Math.abs(idx - selectedIdx) === 1;
              if (isAdjacent) return <PreviewCard key={post.id} post={post} />;
              return (
                <DesktopFeedCard
                  key={post.id}
                  post={post}
                  selected={isSelected}
                  onSelect={() => onSelect(post)}
                  vote={votes[post.id]}
                />
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}

/* ─── Comment card ─── */
function CommentCard({ c }) {
  const dot = c.stance === 'for' ? '#3b82f6' : c.stance === 'against' ? '#e63946' : null;
  return (
    <div className="flex gap-3 px-4 py-3 mb-1.5 rounded-2xl mx-4"
      style={{ background: '#111118', border: '1px solid #1a1a2a' }}>
      {c.rank && (
        <span className="text-xs font-mono shrink-0 mt-0.5 w-5" style={{ color: '#3a3a5a' }}>{c.rank}</span>
      )}
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: '#1e1e2e', color: '#8b8fa8' }}>
        {c.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className="text-xs font-semibold text-white">{c.user}</span>
          {c.club && (
            <span className="text-xs px-1.5 py-0.5 rounded font-bold"
              style={{ background: '#1a1a2a', color: '#6b6f88' }}>{c.club}</span>
          )}
          <span className="text-xs" style={{ color: '#3a3a5a' }}>· {c.timeAgo}</span>
          {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />}
        </div>
        <p className="text-sm leading-relaxed mb-1.5" style={{ color: '#d0d4f0' }}>{c.text}</p>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-xs" style={{ color: '#6b6f88' }}>♡ {fmt(c.likes)}</button>
          <button className="text-xs" style={{ color: '#6b6f88' }}>↩ 답글</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Discussion panel ─── */
function DiscussionPanel({ post, vote, onVote }) {
  const [tab, setTab] = useState('best');
  const isDebate = post && (post.type === 'debate' || post.type === 'today_debate' || post.type === 'hot_debate');
  const isToday = post?.type === 'today_debate';
  const accent = isToday ? '#fbbf24' : '#e63946';
  const statusColor = post ? (STATUS_CFG[post.status]?.color || '#9ca3af') : '#9ca3af';
  const scrollRef = useRef(null);
  const tabsRef = useRef(null);

  // Reset tab when post changes
  useEffect(() => { setTab('best'); }, [post?.id]);

  // 투표 직후 탭/댓글 영역으로 자동 스크롤
  useEffect(() => {
    if (vote && tabsRef.current && scrollRef.current) {
      tabsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [vote]);

  if (!post) {
    return (
      <div className="shrink-0 flex items-center justify-center"
        style={{ width: '360px', borderLeft: '1px solid #141420', background: '#07070f' }}>
        <div className="text-center" style={{ color: '#2a2a4a' }}>
          <div className="text-4xl mb-3">💬</div>
          <div className="text-sm">카드를 클릭하면<br />토론이 여기에 표시됩니다</div>
        </div>
      </div>
    );
  }

  const tabs = isDebate ? ['best', 'live', 'args'] : ['best', 'live'];

  return (
    <div className="shrink-0 flex flex-col"
      style={{ width: '360px', borderLeft: '1px solid #141420', position: 'sticky', top: 0, height: '100vh', background: '#07070f' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3.5 shrink-0"
        style={{ borderBottom: '1px solid #141420', minHeight: '64px' }}>
        {post.club && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{ background: '#1a1a2a', color: '#d0d4f0' }}>
            ⬛ {post.club}
          </span>
        )}
        {post.status && (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
            style={{ background: '#1a1a2a', color: statusColor }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
            {post.status.toUpperCase()}
          </span>
        )}
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

        {isDebate ? (
          <div className="px-4 pt-4 pb-4 space-y-4">
            {/* Briefing */}
            {post.briefing && (
              <div className="rounded-2xl px-4 py-3"
                style={{ background: '#0e0e1a', border: '1px solid #1e1e2a' }}>
                {post.tweet && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: '#1e1e2e', color: '#f4a100' }}>
                      {post.tweet.initials}
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#8b8fa8' }}>
                      {post.tweet.author}
                    </span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ background: '#2a1f00', color: '#f4a100' }}>
                      T{post.tweet.tier}
                    </span>
                    <span className="text-xs ml-auto" style={{ color: '#3a3a5a' }}>{post.tweet.timeAgo}</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed" style={{ color: '#c8ccdf' }}>{post.briefing}</p>
              </div>
            )}

            {/* Debate label */}
            <div className="flex items-center gap-1.5">
              <span style={{ color: '#fbbf24', fontSize: '13px' }}>⚡</span>
              <span className="text-xs font-semibold" style={{ color: '#6b6f88' }}>이 소식에서 논쟁 생성됨</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ color: accent, background: `${accent}18`, border: `1px solid ${accent}30` }}>
                {post.badge}
              </span>
            </div>

            {/* Debate question */}
            <h2 className="text-xl font-black text-white leading-tight">{post.debateQuestion}</h2>
            {vote && post.aiNarrative && (
              <p className="text-sm leading-relaxed" style={{ color: '#8b8fa8' }}>{post.aiNarrative}</p>
            )}

            {/* Vote */}
            {vote ? (
              <>
                <div className="rounded-2xl p-4" style={{ background: '#111118', border: '1px solid #1e1e2a' }}>
                  <div className="flex items-end justify-between mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-black" style={{ color: '#3b82f6' }}>{post.voteFor}%</div>
                      <div className="text-xs font-semibold mt-0.5" style={{ color: '#3b82f6' }}>{post.voteForLabel}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs" style={{ color: '#4a4a6a' }}>{fmt(post.participants)} 참여</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black" style={{ color: '#e63946' }}>{post.voteAgainst}%</div>
                      <div className="text-xs font-semibold mt-0.5" style={{ color: '#e63946' }}>{post.voteAgainstLabel}</div>
                    </div>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden" style={{ background: '#1a1a2a' }}>
                    <div style={{ width: `${post.voteFor}%`, background: 'linear-gradient(90deg,#2563eb,#3b82f6)', transition: 'width .6s' }} />
                    <div style={{ width: `${post.voteAgainst}%`, background: 'linear-gradient(90deg,#dc2626,#e63946)', transition: 'width .6s' }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
                  style={{
                    background: vote === 'for' ? '#1e3a5f30' : '#3b0a0a30',
                    border: `1px solid ${vote === 'for' ? '#3b82f640' : '#e6394640'}`,
                  }}>
                  <span className="text-base">{vote === 'for' ? '👍' : '👎'}</span>
                  <span className="text-sm font-medium"
                    style={{ color: vote === 'for' ? '#60a5fa' : '#f87171' }}>
                    {vote === 'for' ? post.voteForLabel : post.voteAgainstLabel} 에 투표했습니다
                  </span>
                </div>
                {post.aiSummary && (
                  <div className="rounded-2xl p-4" style={{ background: '#0c0c18', border: '1px solid #2a2a4a' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ color: '#818cf8', background: '#1e1b4b' }}>
                        ✦ AI 여론 분석
                      </span>
                      <span className="text-xs" style={{ color: '#4a4a6a' }}>팬 의견 핵심 논점</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl p-3" style={{ background: '#0d1a2a', border: '1px solid #1e3a5f' }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#3b82f6' }} />
                          <span className="text-xs font-semibold" style={{ color: '#3b82f6' }}>{post.voteForLabel} 측</span>
                        </div>
                        {(post.aiSummary.for || []).map((t, i) => (
                          <p key={i} className="text-xs leading-relaxed mb-1" style={{ color: '#8ba8c8' }}>· {t}</p>
                        ))}
                      </div>
                      <div className="rounded-xl p-3" style={{ background: '#1a0a0a', border: '1px solid #3b1010' }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#e63946' }} />
                          <span className="text-xs font-semibold" style={{ color: '#e63946' }}>{post.voteAgainstLabel} 측</span>
                        </div>
                        {(post.aiSummary.against || []).map((t, i) => (
                          <p key={i} className="text-xs leading-relaxed mb-1" style={{ color: '#c48a8a' }}>· {t}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="rounded-2xl p-4 space-y-3"
                  style={{ background: '#111118', border: '1px solid #1e1e2a' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold" style={{ color: '#4a4a6a' }}>
                      {fmt(post.participants)} 참여중
                    </span>
                    <span className="text-xs font-semibold" style={{ color: accent }}>팬 의견이 갈리는 중</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 py-2.5 rounded-xl text-center text-sm font-bold"
                      style={{ background: '#0d1a2a', color: '#60a5fa' }}>
                      👍 {post.voteForLabel}
                    </div>
                    <span className="text-xs font-black" style={{ color: '#2a2a4a' }}>VS</span>
                    <div className="flex-1 py-2.5 rounded-xl text-center text-sm font-bold"
                      style={{ background: '#1a0a0a', color: '#f87171' }}>
                      {post.voteAgainstLabel} 👎
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1a1a2a' }}>
                    <div className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg,#2563eb33 0%,#2563eb33 48%,#dc262633 48%,#dc262633 100%)' }} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => onVote('for')}
                    className="flex-1 py-3 rounded-2xl font-black text-sm active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', boxShadow: '0 0 18px #3b82f640' }}>
                    👍 {post.voteForLabel}
                  </button>
                  <button onClick={() => onVote('against')}
                    className="flex-1 py-3 rounded-2xl font-black text-sm active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(135deg,#991b1b,#e63946)', color: '#fff', boxShadow: '0 0 18px #e6394640' }}>
                    👎 {post.voteAgainstLabel}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* General post */
          <div className="px-4 pt-4 pb-4">
            <h3 className="text-lg font-black text-white leading-snug mb-3">
              {post.title.replace('\n', ' ')}
            </h3>
            {post.briefing && (
              <div className="rounded-2xl px-4 py-3 mb-4"
                style={{ background: '#0e0e1a', border: '1px solid #1e1e2a' }}>
                {post.tweet && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: '#1e1e2e', color: '#f4a100' }}>
                      {post.tweet.initials}
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#8b8fa8' }}>{post.tweet.author}</span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ background: '#2a1f00', color: '#f4a100' }}>T{post.tweet.tier}</span>
                    <span className="text-xs ml-auto" style={{ color: '#3a3a5a' }}>{post.tweet.timeAgo}</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed" style={{ color: '#c8ccdf' }}>{post.briefing}</p>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div ref={tabsRef} className="flex gap-5 px-4 shrink-0" style={{ borderBottom: '1px solid #141420', borderTop: '1px solid #141420' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="text-sm font-semibold pb-2.5 pt-2"
              style={{
                color: tab === t ? '#fff' : '#4a4a6a',
                borderBottom: tab === t ? '2px solid #fff' : '2px solid transparent',
              }}>
              {t === 'best' ? '베스트' : t === 'live' ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#e63946' }} />
                  실시간
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  주요의견
                  <span className="text-xs font-bold px-1 py-0.5 rounded"
                    style={{ color: '#818cf8', background: '#1e1b4b', fontSize: '9px' }}>AI</span>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Comments */}
        <div className="pt-2 pb-20">
          {tab === 'args' && post.argumentPoints ? (
            <div className="pt-2 pb-6 space-y-2">
              {(post.argumentPoints || []).map(arg => {
                const isFor = arg.stance === 'for';
                const isNeutral = arg.stance === 'neutral';
                const dotColor = isNeutral ? '#9ca3af' : isFor ? '#3b82f6' : '#e63946';
                return (
                  <div key={arg.id} className="mx-4 rounded-2xl overflow-hidden"
                    style={{ background: '#111118', border: '1px solid #1a1a2a' }}>
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
                      <span className="flex-1 text-sm font-medium leading-snug" style={{ color: '#d0d4f0' }}>
                        {arg.text}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
                        style={{
                          color: dotColor,
                          background: isNeutral ? '#1a1a2a' : isFor ? '#1e3a5f' : '#3b0a0a',
                        }}>
                        💬 {arg.comments}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            (post.comments_data || []).map(c => <CommentCard key={c.id} c={c} />)
          )}
        </div>
      </div>

      {/* Comment input */}
      <div className="px-4 py-3 shrink-0 absolute bottom-0 left-0 right-0"
        style={{ borderTop: '1px solid #141420', background: '#07070f' }}>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-full"
          style={{
            background: '#141420',
            border: '1px solid #1e1e2a',
            opacity: isDebate && !vote ? 0.5 : 1,
          }}>
          <input
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: '#d0d4f0' }}
            placeholder={isDebate && !vote ? '투표 후 댓글을 남길 수 있어요' : '팬 반응 남기기...'}
            disabled={isDebate && !vote}
          />
          <button className="text-sm font-semibold"
            style={{ color: isDebate && !vote ? '#3a3a5a' : '#3b82f6' }}
            disabled={isDebate && !vote}>
            게시
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ─── */
export default function DesktopLayout({ selectedTeam }) {
  const width = useWindowWidth();
  const sidebarCollapsed = width < 1280;

  const defaultPost = POSTS.find(p => p.type === 'hot_debate') || POSTS[0];
  const [selectedPost, setSelectedPost] = useState(defaultPost);
  const [votes, setVotes] = useState({});
  const [filters, setFilters] = useState({ clubs: [], tiers: [], statuses: [] });

  const filteredPosts = useMemo(() => applyFilters(POSTS, filters), [filters]);

  const handleVote = (stance) => {
    if (!selectedPost) return;
    setVotes(v => ({ ...v, [selectedPost.id]: stance }));
  };

  return (
    <div className="flex" style={{ minHeight: '100vh', background: '#050508' }}>
      <Sidebar
        selectedTeam={selectedTeam}
        filters={filters}
        onFiltersChange={setFilters}
        collapsed={sidebarCollapsed}
      />
      <FeedColumn
        posts={filteredPosts}
        selectedPost={selectedPost}
        onSelect={setSelectedPost}
        votes={votes}
      />
      <DiscussionPanel
        post={selectedPost}
        vote={votes[selectedPost?.id]}
        onVote={handleVote}
      />
    </div>
  );
}
