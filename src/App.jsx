import { useState, useRef, useCallback } from 'react'
import StatusBar, { HomeIndicator } from './components/StatusBar'
import Onboarding from './screens/Onboarding'
import MapHome from './screens/MapHome'
import LocationDetail from './screens/LocationDetail'
import FriendMemoryView from './screens/FriendMemoryView'
import FriendFeed from './screens/FriendFeed'
import MyProfile from './screens/MyProfile'
import NearbyMemories from './screens/NearbyMemories'
import Capture from './screens/Capture'
import Discover from './screens/Discover'
import Accept from './screens/Accept'

const SCREENS = {
  onboarding:     Onboarding,
  home:           MapHome,
  locationDetail: LocationDetail,
  friendMemory:   FriendMemoryView,
  feed:           FriendFeed,
  profile:        MyProfile,
  nearby:         NearbyMemories,
  capture:        Capture,
  discover:       Discover,
  accept:         Accept,
}

export default function App() {
  const [stack, setStack] = useState([{ screen: 'onboarding', params: {}, key: 0 }])
  const keyRef = useRef(1)

  const go = useCallback((screen, params = {}) => {
    setStack(s => [...s, { screen, params, key: keyRef.current++ }])
  }, [])

  const goBack = useCallback(() => {
    setStack(s => s.length > 1 ? s.slice(0, -1) : s)
  }, [])

  const goRoot = useCallback((screen, params = {}) => {
    setStack([{ screen, params, key: keyRef.current++ }])
  }, [])

  const current = stack[stack.length - 1]
  const Screen = SCREENS[current.screen]

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-6 px-4">
      <div className="relative" style={{ width: 393, height: 852 }}>
        {/* Bezel */}
        <div className="absolute -inset-[10px] rounded-[58px]" style={{
          background: 'linear-gradient(160deg, #2a2520, #14110d)',
          boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05)'
        }}/>
        <div className="absolute inset-0 rounded-[48px] overflow-hidden" style={{ background: 'var(--cream)' }}>
          <StatusBar/>
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[110px] h-[32px] rounded-full z-30"
               style={{ background: '#000' }}/>
          <div className="absolute inset-x-0 top-[34px] bottom-[18px] flex flex-col" key={current.key}>
            <Screen go={go} goBack={goBack} goRoot={goRoot} params={current.params}/>
          </div>
          <div className="absolute inset-x-0 bottom-0">
            <HomeIndicator/>
          </div>
        </div>
      </div>
    </div>
  )
}
