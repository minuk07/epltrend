import { useState } from 'react'
import { Ico } from '../components/Icons'
import BottomTabBar from '../components/BottomTabBar'
import { FRIEND_FEED } from '../data/mock'
import { formatDate } from '../utils/date'

function FeedPost({ post }) {
  const [liked, setLiked] = useState(false)
  const count = liked ? post.likeCount + 1 : post.likeCount

  return (
    <article style={{ borderBottom: '1px solid rgba(61,46,31,0.07)' }}>
      {/* Author row */}
      <div className="flex items-center gap-2.5 px-4 py-3">
        <img src={post.avatar} alt="" className="w-9 h-9 rounded-full flex-shrink-0"
             style={{ filter: 'sepia(0.15)' }}/>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold leading-tight" style={{ color: 'var(--sepia)' }}>
            {post.friendName}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--sepia-mute)' }}>
            {post.location} · {formatDate(post.date)}
          </p>
        </div>
      </div>

      {/* Polaroid photo */}
      <div className="px-4 pb-3">
        <div className="relative overflow-hidden rounded-2xl"
             style={{ background: 'var(--paper)', padding: '8px 8px 32px 8px',
                      boxShadow: '0 2px 12px -4px rgba(61,46,31,0.2), inset 0 0 0 1px rgba(61,46,31,0.04)' }}>
          <div className="w-full rounded-[4px] overflow-hidden" style={{ aspectRatio: '4/3', background: '#d9cdb8' }}>
            <img src={post.photo} alt="" className="w-full h-full object-cover"
                 style={{ filter: 'sepia(0.3) saturate(0.82) contrast(0.93) brightness(0.97)' }}/>
          </div>
          {/* handwritten date on polaroid bottom */}
          <p className="hand text-center mt-1.5 text-[13px]" style={{ color: 'var(--sepia-soft)' }}>
            {post.location.split('·')[0].trim()}
          </p>
        </div>
      </div>

      {/* Memo */}
      <div className="px-4 pb-2">
        <p className="serif-kr text-[13.5px] leading-[1.75]" style={{ color: 'var(--sepia)' }}>
          {post.memo}
        </p>
      </div>

      {/* Music */}
      <div className="mx-4 mb-3 px-3 py-2 rounded-xl flex items-center gap-2.5"
           style={{ background: 'var(--cream-deep)' }}>
        <img src={post.music.album} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0"
             style={{ filter: 'sepia(0.2)' }}/>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium truncate" style={{ color: 'var(--sepia)' }}>
            {post.music.title}
          </p>
          <p className="text-[10.5px] truncate" style={{ color: 'var(--sepia-mute)' }}>
            {post.music.artist}
          </p>
        </div>
        <Ico.music width="14" height="14" style={{ color: 'var(--terra)', flexShrink: 0 }}/>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 pb-4">
        <button onClick={() => setLiked(l => !l)}
                className="tappable flex items-center gap-1.5 text-[12.5px]"
                style={{ color: liked ? '#C44A2E' : 'var(--sepia-mute)' }}>
          <Ico.heart width="18" height="18"
                     style={{ fill: liked ? '#C44A2E' : 'none', stroke: liked ? '#C44A2E' : 'currentColor' }}/>
          {count}
        </button>
        <p className="text-[11px] ml-auto" style={{ color: 'var(--sepia-mute)' }}>
          {post.friendName}이가 남긴 추억
        </p>
      </div>
    </article>
  )
}

export default function FriendFeed({ go, goRoot }) {
  return (
    <div className="page-enter relative h-full flex flex-col" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-2 flex-shrink-0">
        <p className="serif-en text-[20px]" style={{ color: 'var(--terra)' }}>피드</p>
        <p className="text-[12px]" style={{ color: 'var(--sepia-mute)' }}>친구 추억</p>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ background: 'var(--paper)' }}>
        {FRIEND_FEED.map(post => (
          <FeedPost key={post.id} post={post} />
        ))}
        <div className="h-6"/>
      </div>

      <BottomTabBar active="feed" go={go} goRoot={goRoot}/>
    </div>
  )
}
