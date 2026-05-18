import { useState, useRef, useEffect, useCallback } from 'react';
import { POSTS } from './data';
import ReactionPanel from './ReactionPanel';

function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return String(n);
}

const TICKER_ITEMS = [
  '● LIVE  진짜 보내면 안되지',
  '@jenna_94  드디어 ㅠㅠ 너무 좋다',
  '@manu_fan  캐릭은 진짜 레전드임',
  '@spurs_kr  손흥민 제발 남아줘',
  '@epl_korea  오늘 발표 크다',
  '@redcafe  팬으로서 행복하다',
  '@lfc_kr  살라 계약 드디어',
  '@city_kr  홀란드 빨리 낫길',
];

function TopBar({ current, total }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 shrink-0">
      <div className="flex items-center gap-2">
        <span className="font-black text-white" style={{ fontSize: '22px', letterSpacing: '-0.5px' }}>Reax</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded"
          style={{ background: '#1a1a2a', color: '#8b8fa8', border: '1px solid #2a2a3a' }}>
          EPL
        </span>
      </div>
      <span className="text-sm font-mono tabular-nums" style={{ color: '#3a3a5a' }}>
        {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
}

function LiveTicker() {
  const text = TICKER_ITEMS.map((t, i) => (i > 0 ? `  —  ${t}` : t)).join('');
  const doubled = text + '    —    ' + text;
  return (
    <div className="overflow-hidden shrink-0 py-1.5" style={{ borderBottom: '1px solid #141420' }}>
      <div className="live-ticker text-xs" style={{ color: '#4a4a6a' }}>{doubled}</div>
    </div>
  );
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
  MUN: { bg: '#3a0000', color: '#ff7070', label: 'MUN' },
  TOT: { bg: '#001228', color: '#7eb8f7', label: 'TOT' },
  CHE: { bg: '#001035', color: '#5b9bd5', label: 'CHE' },
  LIV: { bg: '#3a0000', color: '#ff7070', label: 'LIV' },
  MCI: { bg: '#002038', color: '#6dc1e7', label: 'MCI' },
  ARS: { bg: '#3a0000', color: '#ff7070', label: 'ARS' },
};

function Badge({ type, value }) {
  if (type === 'status') {
    const c = STATUS_CFG[value] || STATUS_CFG.Rumour;
    return (
      <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg"
        style={{ background: c.bg, color: c.color }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
        {value.toUpperCase()}
      </span>
    );
  }
  const c = CLUB_CFG[value] || { bg: '#141420', color: '#9ca3af', label: value };
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
      style={{ background: c.bg, color: c.color }}>
      ⬛ {c.label}
    </span>
  );
}

function TweetEmbed({ tweet }) {
  return (
    <div className="rounded-2xl px-4 py-3 mt-2"
      style={{ background: '#0e0e1a', border: '1px solid #1e1e2a' }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: '#1e1e2e', color: '#f4a100' }}>
          {tweet.initials}
        </div>
        <span className="text-sm font-semibold text-white">{tweet.author}</span>
        <span className="text-xs font-bold px-1.5 py-0.5 rounded"
          style={{ background: '#2a1f00', color: '#f4a100' }}>T{tweet.tier}</span>
        <span className="text-xs ml-auto shrink-0" style={{ color: '#3a3a5a' }}>{tweet.timeAgo}</span>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: '#6b6f88', fontFamily: 'ui-monospace, monospace' }}>
        {tweet.text}
      </p>
    </div>
  );
}

function ActionBar({ post, onOpen }) {
  const items = [
    { icon: '♡', val: post.reactions },
    { icon: '💬', val: post.comments, onClick: onOpen },
    { icon: '🔖', val: post.bookmarks },
    { icon: '↑', val: post.shares },
  ];
  return (
    <div className="absolute right-4 z-10 flex flex-col items-center gap-5"
      style={{ bottom: '116px' }}>
      {items.map(({ icon, val, onClick }) => (
        <button key={icon} onClick={onClick}
          className="flex flex-col items-center gap-1">
          <span className="text-2xl leading-none">{icon}</span>
          <span className="text-xs font-medium tabular-nums" style={{ color: '#6b6f88' }}>{fmt(val)}</span>
        </button>
      ))}
    </div>
  );
}

function DebateBadge({ post }) {
  const isToday = post.type === 'today_debate';
  const accent = isToday ? '#fbbf24' : '#e63946';
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
        style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}>
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent }} />
        <span className="text-xs font-black tracking-widest" style={{ color: accent }}>{post.badge}</span>
      </div>
      <span className="text-xs" style={{ color: '#4a4a6a' }}>{fmt(post.participants)} 참여중</span>
    </div>
  );
}

function VoteBarMini({ post }) {
  return (
    <div className="mt-3 mb-1">
      <div className="flex h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: '#1a1a2a' }}>
        <div style={{ width: `${post.voteFor}%`, background: 'linear-gradient(90deg,#2563eb,#3b82f6)' }} />
        <div style={{ width: `${post.voteAgainst}%`, background: 'linear-gradient(90deg,#dc2626,#e63946)' }} />
      </div>
      <div className="flex justify-between">
        <span className="text-xs font-semibold" style={{ color: '#3b82f6' }}>
          {post.voteForLabel} {post.voteFor}%
        </span>
        <span className="text-xs font-semibold" style={{ color: '#e63946' }}>
          {post.voteAgainst}% {post.voteAgainstLabel}
        </span>
      </div>
    </div>
  );
}

function FeedCard({ post, index, onOpen }) {
  const isDebate = post.type === 'debate' || post.type === 'today_debate';
  const isToday = post.type === 'today_debate';
  const isSentimental = post.type === 'sentimental';
  const accent = isToday ? '#fbbf24' : '#e63946';

  const bgGradient = isSentimental
    ? `linear-gradient(170deg, ${post.gradientFrom}88 0%, #080810 55%)`
    : isDebate
    ? `radial-gradient(ellipse at 50% 0%, ${accent}10 0%, transparent 55%)`
    : 'radial-gradient(ellipse at 50% 0%, #1a1a3a14 0%, transparent 50%)';

  return (
    <div className="h-full relative overflow-hidden" style={{ background: '#080810' }}>
      {/* Atmospheric bg */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: bgGradient }} />

      {/* Subtle top accent line for debate */}
      {isDebate && (
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }} />
      )}

      {/* Right action bar */}
      <ActionBar post={post} onOpen={onOpen} />

      {/* Vertical tick marks (decorative) */}
      <div className="absolute right-3 z-0 flex flex-col items-center gap-1 pointer-events-none"
        style={{ top: '38%', transform: 'translateY(-50%)' }}>
        <div className="w-px h-10 rounded-full" style={{ background: '#1e1e2e' }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#2e2e4e' }} />
        <div className="w-px h-6 rounded-full" style={{ background: '#1e1e2e' }} />
      </div>

      {/* Content block — bottom-anchored, leaves room for action bar */}
      <div className="absolute bottom-0 left-0 px-5 pb-3 z-10" style={{ right: '68px' }}>
        {/* Badges */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {post.status && <Badge type="status" value={post.status} />}
          {post.club && <Badge type="club" value={post.club} />}
        </div>

        {/* HOT DEBATE */}
        {isDebate && <DebateBadge post={post} />}

        {/* Title */}
        <h2 className="font-black text-white leading-tight mb-1.5 whitespace-pre-line"
          style={{ fontSize: '26px', letterSpacing: '-0.4px' }}>
          {post.title}
        </h2>

        {/* Summary */}
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {post.summary}
        </p>

        {/* Debate vote bar */}
        {isDebate && <VoteBarMini post={post} />}

        {/* Tweet embed (not for sentimental) */}
        {post.tweet && <TweetEmbed tweet={post.tweet} />}

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            {(post.hashtags || []).slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={onOpen}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-transform active:scale-95"
            style={{ background: '#fff', color: '#000' }}>
            팬 반응 {fmt(post.comments)} →
          </button>
        </div>

        {/* Swipe hint */}
        <p className="text-center text-xs mt-2.5 mb-1" style={{ color: 'rgba(255,255,255,0.15)' }}>
          ↑ 위로 스와이프 · 다음 이슈
        </p>
      </div>
    </div>
  );
}

function BottomNav() {
  const items = [
    { icon: '☰', label: '피드', active: true },
    { icon: '◎', label: 'Today', active: false },
    { icon: '⌕', label: '검색', active: false },
    { icon: '◐', label: '내 클럽', active: false },
  ];
  return (
    <div className="flex items-center justify-around px-2 py-2 shrink-0"
      style={{ background: '#050508', borderTop: '1px solid #141420' }}>
      {items.map((item) => (
        <button key={item.label} className="flex flex-col items-center gap-0.5 px-4 py-1">
          <span className="text-xl leading-none" style={{ color: item.active ? '#fff' : '#3a3a5a' }}>
            {item.icon}
          </span>
          <span className="text-xs" style={{ color: item.active ? '#fff' : '#3a3a5a' }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function EPLFeed() {
  const [panelPost, setPanelPost] = useState(null);
  const [votes, setVotes] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  // Scroll to top on mount
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  // Track current card index
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const h = el.clientHeight;
      if (h > 0) setCurrentIndex(Math.min(Math.round(el.scrollTop / h), POSTS.length - 1));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const handleVote = useCallback((postId, stance) => {
    setVotes((v) => ({ ...v, [postId]: stance }));
  }, []);

  return (
    <div className="relative h-full flex flex-col" style={{ background: '#080810' }}>
      <TopBar current={currentIndex} total={POSTS.length} />
      <LiveTicker />

      <div className="flex-1 relative overflow-hidden">
        <div
          ref={scrollRef}
          className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {POSTS.map((post, i) => (
            <div key={post.id} className="snap-start" style={{ height: '100%' }}>
              <FeedCard post={post} index={i} onOpen={() => setPanelPost(post)} />
            </div>
          ))}
        </div>

        {panelPost && (
          <ReactionPanel
            post={panelPost}
            vote={votes[panelPost.id]}
            onVote={(stance) => handleVote(panelPost.id, stance)}
            onClose={() => setPanelPost(null)}
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
