import { useState } from 'react'
import Polaroid from '../components/Polaroid'
import { Ico } from '../components/Icons'
import { LOCATIONS } from '../data/mock'
import { formatDate, formatDateFull } from '../utils/date'

function MemoryCard({ mem }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <button
      onClick={() => setExpanded(e => !e)}
      className="tappable w-full text-left rounded-2xl overflow-hidden"
      style={{ background: 'var(--paper)', boxShadow: 'inset 0 0 0 1px rgba(61,46,31,0.07)' }}
    >
      {/* Date header */}
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-2.5"
           style={{ borderBottom: '1px solid rgba(61,46,31,0.06)' }}>
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--terra)' }}/>
        <p className="text-[12px] font-semibold" style={{ color: 'var(--sepia)' }}>
          {formatDateFull(mem.date)}
        </p>
        <Ico.back width="14" height="14" className="ml-auto flex-shrink-0"
                  style={{ color: 'var(--sepia-mute)', transform: expanded ? 'rotate(90deg)' : 'rotate(-90deg)',
                           transition: 'transform 200ms ease' }}/>
      </div>

      {/* Content row */}
      <div className="flex gap-3 px-4 py-3">
        {/* Small polaroid */}
        <div className="flex-shrink-0"
             style={{ background: 'var(--paper)', padding: '5px 5px 18px 5px',
                      borderRadius: 2, boxShadow: '0 2px 8px -3px rgba(61,46,31,0.25)',
                      transform: 'rotate(-2deg)', width: 76 }}>
          <div className="rounded-[2px] overflow-hidden" style={{ width: 66, height: 72, background: '#d9cdb8' }}>
            <img src={mem.photo} alt="" className="w-full h-full object-cover"
                 style={{ filter: 'sepia(0.3) saturate(0.85) contrast(0.95)' }}/>
          </div>
        </div>

        {/* Text info */}
        <div className="flex-1 min-w-0 py-0.5">
          <p className="serif-kr text-[13px] leading-[1.7]"
             style={{ color: 'var(--sepia)',
                      display: '-webkit-box', WebkitLineClamp: expanded ? 99 : 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {mem.memo}
          </p>

          {/* Music */}
          <div className="flex items-center gap-1.5 mt-2">
            <img src={mem.music.album} alt="" className="w-5 h-5 rounded flex-shrink-0 object-cover"
                 style={{ filter: 'sepia(0.2)' }}/>
            <p className="text-[11px] truncate" style={{ color: 'var(--sepia-mute)' }}>
              {mem.music.title} · {mem.music.artist}
            </p>
          </div>

          {/* With */}
          {mem.with.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              {mem.with.map(name => (
                <span key={name} className="text-[10.5px] px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--cream-deep)', color: 'var(--sepia-soft)' }}>
                  @{name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expanded: full polaroid */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 flex justify-center"
             style={{ borderTop: '1px solid rgba(61,46,31,0.06)' }}>
          <Polaroid src={mem.photo} rotate={-2} w={220} h={246}/>
        </div>
      )}
    </button>
  )
}

function MineTab({ location }) {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-3 pb-8">
      <p className="text-[11.5px] px-1 pt-1" style={{ color: 'var(--sepia-mute)' }}>
        {location.myMemories.length}개의 추억 · 최신순
      </p>
      {location.myMemories
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(mem => <MemoryCard key={mem.id} mem={mem}/>)
      }
    </div>
  )
}

function FriendsTab({ location, go }) {
  if (location.friendMemories.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <p className="text-[38px] mb-4">🌿</p>
        <p className="serif-kr text-[15px]" style={{ color: 'var(--sepia-soft)' }}>
          아직 친구의 추억이 없어요
        </p>
        <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: 'var(--sepia-mute)' }}>
          친구가 이 장소에서 추억을 남기면<br/>여기에 나타납니다
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-3 pb-8">
      <p className="text-[11.5px] px-1 pt-1" style={{ color: 'var(--sepia-mute)' }}>
        {location.friendMemories.length}명의 친구 추억
      </p>
      {location.friendMemories.map(fm => (
        <button
          key={fm.id}
          onClick={() => go('friendMemory', {
            memory: fm,
            locationName: `${location.district} · ${location.name}`,
          })}
          className="tappable w-full text-left rounded-2xl overflow-hidden"
          style={{ background: 'var(--paper)', boxShadow: 'inset 0 0 0 1px rgba(61,46,31,0.08)' }}
        >
          <div className="flex gap-3 p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2.5">
                <img src={fm.avatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0"
                     style={{ filter: 'sepia(0.18)' }}/>
                <div className="min-w-0">
                  <p className="text-[13px] leading-tight" style={{ color: 'var(--sepia)' }}>
                    <span className="serif-kr font-bold">{fm.friendName}</span>이가 남긴 추억
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-[11px]" style={{ color: 'var(--sepia-mute)' }}>
                      {formatDate(fm.date)}
                    </p>
                    {fm.status === 'pending' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(212,130,74,0.15)', color: 'var(--terra-deep)' }}>
                        수락 대기중
                      </span>
                    )}
                    {fm.status === 'accepted' && (
                      <span className="text-[10px]" style={{ color: 'var(--sepia-mute)' }}>
                        · 함께한 추억
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-[12.5px] leading-relaxed"
                 style={{ color: 'var(--sepia-soft)', display: '-webkit-box',
                          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                "{fm.memo}"
              </p>
            </div>
            <div className="flex-shrink-0 w-[58px] h-[58px] rounded-xl overflow-hidden"
                 style={{ background: '#d9cdb8' }}>
              <img src={fm.photo} alt="" className="w-full h-full object-cover"
                   style={{ filter: 'sepia(0.3) saturate(0.85) contrast(0.95)' }}/>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

export default function LocationDetail({ params, go, goBack }) {
  const location = LOCATIONS.find(l => l.id === params.locationId)
  const [tab, setTab] = useState('mine')

  if (!location) return null

  const pendingCount = location.friendMemories.filter(f => f.status === 'pending').length

  return (
    <div className="page-enter relative h-full flex flex-col" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-2 pb-3 flex-shrink-0">
        <button onClick={goBack} className="tappable w-9 h-9 flex items-center justify-center flex-shrink-0"
                style={{ color: 'var(--sepia)' }}>
          <Ico.back width="22" height="22"/>
        </button>
        <div className="flex-1 min-w-0">
          <p className="serif-kr text-[16px] font-bold leading-tight truncate" style={{ color: 'var(--sepia)' }}>
            {location.name}
          </p>
          <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--sepia-mute)' }}>
            {location.district} · {location.address}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mb-4 flex-shrink-0">
        {[
          { key: 'mine', label: '내 추억', count: location.myMemories.length, badge: 0 },
          { key: 'friends', label: '친구 추억', count: location.friendMemories.length, badge: pendingCount },
        ].map(({ key, label, count, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="tappable flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium"
            style={{
              background: tab === key ? 'var(--terra)' : 'var(--paper)',
              color: tab === key ? 'var(--paper)' : 'var(--sepia-soft)',
              boxShadow: tab === key
                ? '0 4px 12px -4px rgba(212,130,74,0.5)'
                : 'inset 0 0 0 1px rgba(61,46,31,0.1)',
            }}
          >
            {label}
            <span className="text-[11px] opacity-80">{count}</span>
            {badge > 0 && (
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ background: tab === key ? 'rgba(255,255,255,0.35)' : 'var(--terra)', color: 'white' }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'mine'
        ? <MineTab location={location}/>
        : <FriendsTab location={location} go={go}/>
      }
    </div>
  )
}
