import { useState } from 'react'
import { Ico } from '../components/Icons'
import BottomTabBar from '../components/BottomTabBar'
import { FRIEND_FEED } from '../data/mock'
import { formatDate } from '../utils/date'

function distLabel(d) {
  return d < 1000 ? `${d}m` : `${(d / 1000).toFixed(1)}km`
}

function Viewer({ posts, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx)
  const [liked, setLiked] = useState({})
  const post = posts[idx]
  const count = liked[post.id] ? post.likeCount + 1 : post.likeCount

  return (
    <div className="absolute inset-0 z-50 flex flex-col overflow-hidden slow-fade"
         style={{ background: '#1a1410' }}>
      {/* Blurred background */}
      <div className="absolute inset-0">
        <img src={post.photo} alt="" className="w-full h-full object-cover"
             style={{ filter: 'blur(24px) brightness(0.25) saturate(0.4)', transform: 'scale(1.15)' }}/>
      </div>

      {/* Progress bars */}
      <div className="relative z-10 flex gap-1 px-4 pt-3.5 pb-1">
        {posts.map((_, i) => (
          <div key={i} className="flex-1 rounded-full" style={{ height: 2,
               background: i < idx ? 'rgba(250,246,240,0.85)' : i === idx ? 'rgba(250,246,240,0.9)' : 'rgba(250,246,240,0.25)' }}/>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-2.5 px-4 pt-2 pb-1">
        <img src={post.avatar} alt="" className="w-9 h-9 rounded-full flex-shrink-0"
             style={{ filter: 'sepia(0.1)', boxShadow: '0 0 0 1.5px rgba(250,246,240,0.3)' }}/>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold leading-tight"
             style={{ color: 'rgba(250,246,240,0.95)' }}>
            {post.friendName}이가 남긴 순간
          </p>
          <p className="text-[10.5px] mt-0.5"
             style={{ color: 'rgba(250,246,240,0.5)' }}>
            {post.district} · {post.locationName} · {distLabel(post.distance)}
          </p>
        </div>
        <button onClick={onClose}
                className="tappable w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: 'rgba(250,246,240,0.12)', color: 'rgba(250,246,240,0.8)' }}>
          <Ico.close width="18" height="18"/>
        </button>
      </div>

      {/* Tap zones */}
      <div className="absolute inset-0 z-20 flex" style={{ top: 80, bottom: 180 }}>
        <button className="flex-1 h-full" onClick={() => setIdx(i => Math.max(0, i - 1))}/>
        <button className="flex-1 h-full" onClick={() => setIdx(i => Math.min(posts.length - 1, i + 1))}/>
      </div>

      {/* Photo + memo */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
        {/* Film photo */}
        <div style={{ background: '#f5f0e8', padding: '6px', borderRadius: 2,
                      boxShadow: '0 12px 40px rgba(0,0,0,0.55)', transform: 'rotate(-1.5deg)' }}>
          <div className="overflow-hidden" style={{ width: 230, height: 242, background: '#d9cdb8' }}>
            <img src={post.photo} alt="" className="w-full h-full object-cover"
                 style={{ filter: 'sepia(0.3) saturate(0.82) contrast(0.93) brightness(0.97)' }}/>
          </div>
        </div>
        <p className="hand text-center mt-5 px-8 leading-[1.7]" style={{ fontSize: 15,
             color: 'rgba(250,246,240,0.9)' }}>
          {post.memo}
        </p>
        <p className="text-[11px] mt-2" style={{ color: 'rgba(250,246,240,0.4)' }}>
          {formatDate(post.date)}
        </p>
      </div>

      {/* Music */}
      <div className="relative z-30 mx-4 mb-3 px-3 py-2.5 rounded-2xl flex items-center gap-3"
           style={{ background: 'rgba(250,246,240,0.1)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(250,246,240,0.08)' }}>
        <img src={post.music.album} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
             style={{ filter: 'sepia(0.2)' }}/>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium truncate" style={{ color: 'rgba(250,246,240,0.9)' }}>
            {post.music.title}
          </p>
          <p className="text-[10.5px] truncate" style={{ color: 'rgba(250,246,240,0.5)' }}>
            {post.music.artist}
          </p>
        </div>
        <div className="flex items-end h-5 gap-[2px]">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="wave-bar"
                  style={{ animationDelay: `${i * 90}ms`, background: 'rgba(212,130,74,0.8)' }}/>
          ))}
        </div>
      </div>

      {/* Interactions */}
      <div className="relative z-30 px-5 pb-6 flex items-center gap-5">
        <button
          onClick={() => setLiked(l => ({ ...l, [post.id]: !l[post.id] }))}
          className="tappable flex items-center gap-1.5">
          <Ico.heart width="22" height="22"
                     style={{ fill: liked[post.id] ? '#e87c6b' : 'none',
                              stroke: liked[post.id] ? '#e87c6b' : 'rgba(250,246,240,0.7)',
                              color: liked[post.id] ? '#e87c6b' : 'rgba(250,246,240,0.7)' }}/>
          <span className="text-[13px]" style={{ color: 'rgba(250,246,240,0.7)' }}>{count}</span>
        </button>
        <button className="tappable flex items-center gap-1.5">
          <Ico.chat width="21" height="21" style={{ color: 'rgba(250,246,240,0.7)' }}/>
          <span className="text-[13px]" style={{ color: 'rgba(250,246,240,0.7)' }}>
            {post.comments?.length || 0}
          </span>
        </button>
        <button className="tappable">
          <Ico.send width="20" height="20" style={{ color: 'rgba(250,246,240,0.7)' }}/>
        </button>

        {/* First comment preview */}
        {post.comments?.length > 0 && (
          <p className="ml-auto text-[11px] leading-snug" style={{ color: 'rgba(250,246,240,0.5)', maxWidth: 140 }}>
            <span style={{ color: 'rgba(250,246,240,0.75)', fontWeight: 600 }}>
              {post.comments[0].user}
            </span>{' '}{post.comments[0].text}
          </p>
        )}
      </div>
    </div>
  )
}

function StoryBubble({ post, onTap }) {
  return (
    <button onClick={onTap} className="tappable flex flex-col items-center gap-1 flex-shrink-0" style={{ width: 60 }}>
      <div className="w-[52px] h-[52px] rounded-full p-[2.5px]"
           style={{ background: 'linear-gradient(135deg, var(--terra), #e8a46b)' }}>
        <div className="w-full h-full rounded-full overflow-hidden"
             style={{ border: '2px solid var(--cream)' }}>
          <img src={post.avatar} alt="" className="w-full h-full object-cover"
               style={{ filter: 'sepia(0.12)' }}/>
        </div>
      </div>
      <p className="text-[9.5px] font-medium truncate w-full text-center" style={{ color: 'var(--sepia)' }}>
        {post.friendName}
      </p>
      <p className="text-[9px] -mt-0.5" style={{ color: 'var(--terra)' }}>{distLabel(post.distance)}</p>
    </button>
  )
}

function FeedCard({ post, onTap }) {
  return (
    <button onClick={onTap} className="tappable w-full text-left rounded-2xl overflow-hidden"
            style={{ background: 'var(--paper)', boxShadow: 'inset 0 0 0 1px rgba(61,46,31,0.07)' }}>
      <div className="flex gap-3 p-3.5">
        <img src={post.avatar} alt="" className="w-10 h-10 rounded-full flex-shrink-0"
             style={{ filter: 'sepia(0.15)' }}/>
        <div className="flex-1 min-w-0">
          <p className="text-[13px]" style={{ color: 'var(--sepia)' }}>
            <span className="serif-kr font-bold">{post.friendName}</span>이가 남긴 순간
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--sepia-mute)' }}>
            {post.district} · {post.locationName} · {distLabel(post.distance)}
          </p>
          <p className="text-[12px] mt-1.5 leading-snug"
             style={{ color: 'var(--sepia-soft)', display: '-webkit-box',
                      WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            "{post.memo}"
          </p>
        </div>
        <div className="w-[58px] h-[58px] rounded-xl overflow-hidden flex-shrink-0" style={{ background: '#d9cdb8' }}>
          <img src={post.photo} alt="" className="w-full h-full object-cover"
               style={{ filter: 'sepia(0.3) saturate(0.85) contrast(0.95)' }}/>
        </div>
      </div>
      {/* Like/comment row */}
      <div className="flex items-center gap-3 px-3.5 pb-3 pt-0.5"
           style={{ borderTop: '1px solid rgba(61,46,31,0.05)' }}>
        <Ico.heart width="14" height="14" style={{ color: 'var(--sepia-mute)' }}/>
        <span className="text-[11px]" style={{ color: 'var(--sepia-mute)' }}>{post.likeCount}</span>
        <Ico.chat width="14" height="14" style={{ color: 'var(--sepia-mute)', marginLeft: 4 }}/>
        <span className="text-[11px]" style={{ color: 'var(--sepia-mute)' }}>{post.comments?.length || 0}</span>
        <span className="text-[10.5px] ml-auto" style={{ color: 'var(--sepia-mute)' }}>
          {formatDate(post.date)}
        </span>
      </div>
    </button>
  )
}

export default function FriendFeed({ go, goRoot }) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIdx, setViewerIdx] = useState(0)

  function openViewer(idx) {
    setViewerIdx(idx)
    setViewerOpen(true)
  }

  return (
    <div className="page-enter relative h-full flex flex-col" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <div className="px-5 pt-2 pb-3 flex-shrink-0">
        <p className="serif-kr text-[20px] font-bold" style={{ color: 'var(--sepia)' }}>발자국</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#3b6fb3' }}/>
          <p className="text-[11px]" style={{ color: '#3b6fb3' }}>지금 내 위치 1km 이내 · 친구들의 순간</p>
        </div>
      </div>

      {/* Story bubbles */}
      <div className="flex gap-2 px-4 pb-3 flex-shrink-0 overflow-x-auto no-scrollbar">
        {FRIEND_FEED.map((post, i) => (
          <StoryBubble key={post.id} post={post} onTap={() => openViewer(i)}/>
        ))}
      </div>

      <div className="mx-4 mb-3 flex-shrink-0" style={{ height: 1, background: 'rgba(61,46,31,0.07)' }}/>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-3 pb-4">
        {FRIEND_FEED.map((post, i) => (
          <FeedCard key={post.id} post={post} onTap={() => openViewer(i)}/>
        ))}
      </div>

      <BottomTabBar active="feed" go={go} goRoot={goRoot}/>

      {viewerOpen && (
        <Viewer posts={FRIEND_FEED} startIdx={viewerIdx} onClose={() => setViewerOpen(false)}/>
      )}
    </div>
  )
}
