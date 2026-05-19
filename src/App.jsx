import { useState } from 'react'
import StatusBar, { HomeIndicator } from './components/StatusBar'
import EPLFeed from './epl/EPLFeed'
import Onboarding from './epl/Onboarding'

export default function App() {
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem('reax_onboarded') === '1'
  )

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-6 px-4"
      style={{ background: '#070710' }}>
      <div className="relative" style={{ width: 393, height: 852 }}>
        {/* Bezel */}
        <div className="absolute -inset-[10px] rounded-[58px]" style={{
          background: 'linear-gradient(160deg, #2a2520, #14110d)',
          boxShadow: '0 30px 60px -20px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)'
        }} />
        <div className="absolute inset-0 rounded-[48px] overflow-hidden"
          style={{ background: '#0a0a10', '--sepia': 'rgba(255,255,255,0.75)' }}>
          <StatusBar />
          {/* Camera pill */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[110px] h-[32px] rounded-full z-30"
            style={{ background: '#000' }} />
          {/* Screen area */}
          <div className="absolute inset-x-0 top-[34px] bottom-[18px] flex flex-col">
            {onboarded
              ? <EPLFeed />
              : <Onboarding onComplete={() => setOnboarded(true)} />
            }
          </div>
          <div className="absolute inset-x-0 bottom-0">
            <HomeIndicator />
          </div>
        </div>
      </div>
    </div>
  )
}
