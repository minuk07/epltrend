import { useState, useRef } from 'react'
import { Ico } from '../components/Icons'
import BottomTabBar from '../components/BottomTabBar'
import { FRIEND_FEED } from '../data/mock'
import { formatDate } from '../utils/date'

function distLabel(d) {
  return d < 1000 ? `${d}m` : `${(d / 1000).toFixed(1)}km`
}

export default function FriendFeed({ go, goRoot, params = {} }) {
  const [currentIdx, setCurrentIdx] = useState(params.startIdx ?? 0)
  const [direction, setDirection] = useState(null)
  const [liked, setLiked] = useState({})
  const [showComments, setShowComments] = useState(false)
  const [playing, setPlaying] = useState(true)

  const touchStartY = useRef(null)
  const [dragOffset, setDragOffset] = useState(0)

  const post = FRIEND_FEED[currentIdx]
  const likeCount = liked[post.id] ? post.likeCount + 1 : post.likeCount

  function navigate(dir) {
    const next = currentIdx + (dir === 'up' ? 1 : -1)
    if (next < 0 || next >= FRIEND_FEED.length) return
    setDirection(dir)
    setCurrentIdx(next)
    setShowComments(false)
    setTimeout(() => setDirection(null), 400)
  }

  function onTouchStart(e) {
    touchStartY.current = e.touches[0].clientY
  }

  function onTouchMove(e) {
    if (touchStartY.current === null) return
    const delta = e.touches[0].clientY - touchStartY.current
    setDragOffset(delta)
  }

  function onTouchEnd() {
    if (Math.abs(dragOffset) > 60) {
      navigate(dragOffset < 0 ? 'up' : 'down')
    }
    setDragOffset(0)
    touchStartY.current = null
  }

  const cardClass = direction === 'up'
    ? 'card-enter-up'
    : direction === 'down'
    ? 'card-enter-down'
    : ''

  return (
    <div className="page-enter relative h-full flex flex-col"
         style={{ background: 'radial-gradient(ellipse at 50% 20%, #F8EAD3, #ECDDC2 60%, #DDCBA8 100%)' }}>

      {/* Top bar */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 z-10 relative">
        {/* Progress segments */}
        <div className="flex gap-1 mb-2.5">
          {FRIEND_FEED.map((_, i) => (
            <div key={i} className="flex-1 rounded-full transition-all duration-300"
                 style={{ height: 2.5,
                          background: i < currentIdx
                            ? 'rgba(61,46,31,0.55)'
                            : i === currentIdx
                            ? 'var(--terra)'
                            : 'rgba(61,46,31,0.15)' }}/>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#3b6fb3' }}/>
            <p className="text-[11px]" style={{ color: '#3b6fb3' }}>
              지금 내 위치 근처 · {FRIEND_FEED.length}개의 순간
            </p>
          </div>
          <p className="text-[10.5px]" style={{ color: 'var(--sepia-mute)' }}>
            {currentIdx + 1} / {FRIEND_FEED.length}
          </p>
        </div>
      </div>

      {/* Swipeable card area */}
      <div
        className="flex-1 flex flex-col min-h-0"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transform: `translateY(${dragOffset * 0.3}px)`, transition: dragOffset === 0 ? 'transform 0.2s' : 'none' }}
      >
        <div key={currentIdx} className={`flex-1 flex flex-col min-h-0 ${cardClass}`}>

          {/* Photo + memo block */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-2 grain">

            {/* Friend info */}
            <div className="flex items-center gap-2 mb-4 self-start w-full px-2">
              <img src={post.avatar} alt="" className="w-9 h-9 rounded-full flex-shrink-0"
                   style={{ filter: 'sepia(0.15)', boxShadow: '0 0 0 2px rgba(61,46,31,0.12)' }}/>
              <div>
                <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--sepia)' }}>
                  {post.friendName}이가 남긴 순간
                </p>
                <p className="text-[10.5px] mt-0.5" style={{ color: 'var(--sepia-mute)' }}>
                  {post.district} · {post.locationName} · {distLabel(post.distance)}
                </p>
              </div>
            </div>

            {/* Film photo */}
            <div style={{ background: '#f5f0e8', padding: '6px', borderRadius: 4,
                          boxShadow: '0 8px 32px rgba(61,46,31,0.22)', transform: 'rotate(-0.5deg)' }}>
              <div className="overflow-hidden" style={{ width: 260, height: 280, background: '#d9cdb8' }}>
                <img src={post.photo} alt="" className="w-full h-full object-cover"
                     style={{ filter: 'sepia(0.25) saturate(0.88) contrast(0.95)' }}/>
              </div>
            </div>

            {/* Memo */}
            <p className="hand text-center mt-5 px-4 leading-[1.75]"
               style={{ fontSize: 15.5, color: 'var(--sepia)', maxWidth: 280 }}>
              {post.memo}
            </p>
            <p className="text-[11px] mt-2" style={{ color: 'var(--sepia-mute)' }}>
              {formatDate(post.date)}
            </p>
          </div>

          {/* Music player */}
          <div className="mx-4 mb-2 px-3 py-2.5 rounded-2xl flex items-center gap-3"
               style={{ background: 'rgba(255,253,247,0.7)', backdropFilter: 'blur(8px)',
                        boxShadow: 'inset 0 0 0 1px rgba(61,46,31,0.08)' }}>
            <img src={post.music.album} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                 style={{ filter: 'sepia(0.2)' }}/>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: 'var(--sepia)' }}>
                {post.music.title}
              </p>
              <p className="text-[10.5px] truncate" style={{ color: 'var(--sepia-mute)' }}>
                {post.music.artist}
              </p>
            </div>
            <div className="flex items-end h-5 gap-[2px]">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="wave-bar"
                      style={{ animationDelay: `${i * 90}ms`,
                               background: 'var(--terra)',
                               animationPlayState: playing ? 'running' : 'paused' }}/>
              ))}
            </div>
            <button onClick={() => setPlaying(p => !p)} className="tappable ml-1"
                    style={{ color: 'var(--sepia-soft)' }}>
              {playing
                ? <Ico.pause width="18" height="18"/>
                : <Ico.play width="18" height="18"/>}
            </button>
          </div>

          {/* Interactions */}
          <div className="px-5 pb-3 flex items-center gap-5">
            <button
              onClick={() => setLiked(l => ({ ...l, [post.id]: !l[post.id] }))}
              className="tappable flex items-center gap-1.5">
              <Ico.heart width="22" height="22"
                         style={{ fill: liked[post.id] ? '#e87c6b' : 'none',
                                  stroke: liked[post.id] ? '#e87c6b' : 'var(--sepia-soft)',
                                  color: liked[post.id] ? '#e87c6b' : 'var(--sepia-soft)' }}/>
              <span className="text-[13px]" style={{ color: 'var(--sepia-soft)' }}>{likeCount}</span>
            </button>

            <button
              onClick={() => setShowComments(v => !v)}
              className="tappable flex items-center gap-1.5">
              <Ico.chat width="21" height="21" style={{ color: 'var(--sepia-soft)' }}/>
              <span className="text-[13px]" style={{ color: 'var(--sepia-soft)' }}>
                {post.comments?.length || 0}
              </span>
            </button>

            <button className="tappable">
              <Ico.send width="20" height="20" style={{ color: 'var(--sepia-soft)' }}/>
            </button>

            {post.comments?.length > 0 && (
              <p className="ml-auto text-[11px] leading-snug" style={{ color: 'var(--sepia-mute)', maxWidth: 140 }}>
                <span style={{ color: 'var(--sepia)', fontWeight: 600 }}>
                  {post.comments[0].user}
                </span>{' '}{post.comments[0].text}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Swipe hint arrows */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2 pointer-events-none">
        {currentIdx > 0 && (
          <div style={{ color: 'rgba(61,46,31,0.2)' }}>
            <Ico.chevronUp width="16" height="16"/>
          </div>
        )}
        {currentIdx < FRIEND_FEED.length - 1 && (
          <div style={{ color: 'rgba(61,46,31,0.2)' }}>
            <Ico.chevronDown width="16" height="16"/>
          </div>
        )}
      </div>

      <BottomTabBar active="feed" go={go} goRoot={goRoot}/>

      {/* Comment sheet */}
      {showComments && (
        <>
          <div className="absolute inset-0 z-40" style={{ background: 'rgba(0,0,0,0.35)' }}
               onClick={() => setShowComments(false)}/>
          <div className="absolute bottom-0 left-0 right-0 z-50 rounded-t-2xl pt-1 pb-24"
               style={{ background: 'var(--paper)', boxShadow: '0 -4px 24px rgba(61,46,31,0.15)' }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-3"
                 style={{ background: 'rgba(61,46,31,0.15)' }}/>
            <p className="text-[13px] font-semibold px-5 mb-3" style={{ color: 'var(--sepia)' }}>
              댓글
            </p>
            {post.comments?.length > 0 ? (
              <div className="space-y-3 px-5">
                {post.comments.map((c, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px]"
                         style={{ background: 'var(--cream-deep)', color: 'var(--sepia)' }}>
                      {c.user[0]}
                    </div>
                    <div>
                      <span className="text-[12px] font-semibold" style={{ color: 'var(--sepia)' }}>{c.user}</span>
                      <span className="text-[12px] ml-1.5" style={{ color: 'var(--sepia-soft)' }}>{c.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[13px] py-6" style={{ color: 'var(--sepia-mute)' }}>
                첫 댓글을 남겨보세요
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
