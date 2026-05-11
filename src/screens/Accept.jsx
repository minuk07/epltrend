import { useState } from 'react'
import Polaroid from '../components/Polaroid'
import { Ico } from '../components/Icons'
import BottomTabBar from '../components/BottomTabBar'
import { IMG, LOCATIONS } from '../data/mock'
import { formatDate } from '../utils/date'

function InfoRow({ icon, main, sub, album }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {album ? (
        <img src={album} alt="" className="w-9 h-9 rounded-md object-cover" style={{ filter: 'sepia(0.25)' }}/>
      ) : (
        <span className="text-[16px] w-9 text-center">{icon}</span>
      )}
      <div className="flex-1">
        <p className="text-[13.5px] font-medium" style={{ color: 'var(--sepia)' }}>{main}</p>
        <p className="text-[11.5px]" style={{ color: 'var(--sepia-mute)' }}>{sub}</p>
      </div>
    </div>
  )
}

// Collect all pending friend memories across all locations
const pendingItems = LOCATIONS.flatMap(loc =>
  loc.friendMemories
    .filter(f => f.status === 'pending')
    .map(f => ({ ...f, locationName: loc.name, district: loc.district, locationId: loc.id }))
)

export default function Accept({ go, goBack, goRoot }) {
  const [accepted, setAccepted] = useState({})

  return (
    <div className="page-enter relative h-full flex flex-col" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-3 flex-shrink-0">
        <p className="serif-kr text-[17px] font-bold" style={{ color: 'var(--sepia)' }}>알림</p>
        {pendingItems.length > 0 && (
          <span className="text-[11px] px-2 py-1 rounded-full"
                style={{ background: 'rgba(212,130,74,0.12)', color: 'var(--terra-deep)' }}>
            수락 대기 {pendingItems.length}개
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-3 pb-4">
        {pendingItems.map(item => (
          <div key={item.id} className="rounded-2xl overflow-hidden"
               style={{ background: 'var(--paper)', boxShadow: 'inset 0 0 0 1px rgba(61,46,31,0.08)' }}>
            {/* Sender row */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
              <img src={item.avatar} alt="" className="w-10 h-10 rounded-full flex-shrink-0"
                   style={{ filter: 'sepia(0.18)' }}/>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px]" style={{ color: 'var(--sepia)' }}>
                  <span className="serif-kr font-bold">{item.friendName}</span>이가 추억을 공유했어요
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--sepia-mute)' }}>
                  {item.district} · {item.locationName} · {formatDate(item.date)}
                </p>
              </div>
            </div>

            {/* Photo */}
            <div className="flex justify-center pb-1 px-4">
              <div style={{ background: 'var(--paper)', padding: '7px 7px 26px 7px',
                            boxShadow: '0 2px 10px -4px rgba(61,46,31,0.2)',
                            transform: 'rotate(-1.5deg)', borderRadius: 2, width: 200 }}>
                <div className="rounded-[2px] overflow-hidden"
                     style={{ width: 186, height: 200, background: '#d9cdb8' }}>
                  <img src={item.photo} alt="" className="w-full h-full object-cover"
                       style={{ filter: 'sepia(0.28) saturate(0.85) contrast(0.95)' }}/>
                </div>
              </div>
            </div>

            <p className="hand text-center py-2 text-[16px]" style={{ color: 'var(--sepia)' }}>
              {item.memo}
            </p>

            {/* Notice */}
            <div className="mx-4 mb-3 rounded-xl px-3 py-2.5 text-[11.5px] leading-relaxed text-center"
                 style={{ background: 'var(--cream-deep)', color: 'var(--sepia-soft)' }}>
              수락하면 <span style={{ color: 'var(--terra-deep)', fontWeight: 600 }}>두 사람 모두의 추억</span>이 됩니다.
            </div>

            {/* Buttons */}
            {accepted[item.id] ? (
              <div className="px-4 pb-4">
                <div className="py-3 rounded-full text-center text-[13px]"
                     style={{ background: 'var(--cream-deep)', color: 'var(--sepia-mute)' }}>
                  함께한 추억으로 저장됐어요 ✓
                </div>
              </div>
            ) : (
              <div className="flex gap-2 px-4 pb-4">
                <button
                  onClick={() => go('friendMemory', {
                    memory: item,
                    locationName: `${item.district} · ${item.locationName}`,
                  })}
                  className="tappable flex-1 py-3 rounded-full text-[13px] font-medium"
                  style={{ background: 'var(--cream-deep)', color: 'var(--sepia)' }}>
                  자세히 보기
                </button>
                <button
                  onClick={() => setAccepted(a => ({ ...a, [item.id]: true }))}
                  className="tappable flex-1 py-3 rounded-full text-[13px] font-semibold"
                  style={{ background: 'var(--terra)', color: 'var(--paper)',
                           boxShadow: '0 6px 14px -6px rgba(212,130,74,0.5)' }}>
                  맞아, 우리 그랬었지
                </button>
              </div>
            )}
          </div>
        ))}

        {pendingItems.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <p className="text-[38px] mb-4">🌿</p>
            <p className="serif-kr text-[15px]" style={{ color: 'var(--sepia-soft)' }}>새 알림이 없어요</p>
          </div>
        )}
      </div>

      <BottomTabBar active="accept" go={go} goRoot={goRoot}/>
    </div>
  )
}
