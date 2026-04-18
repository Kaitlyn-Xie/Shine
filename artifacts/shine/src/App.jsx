import { useState } from 'react'
import BottomNav from './components/BottomNav'
import Home from './components/Home'
import QA from './components/QA'
import Chat from './components/Chat'
import MapScreen from './components/MapScreen'
import Profile from './components/Profile'
import CreatePost from './components/CreatePost'
import { PlusIcon } from './components/Icons'

export default function App() {
  const [tab, setTab] = useState('home')
  const [showProfile, setShowProfile] = useState(false)
  const [mapUnlocked, setMapUnlocked] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [posts, setPosts] = useState([])

  const addPost = (post) => {
    const seed = Date.now()
    setPosts(prev => [{
      ...post, id: seed, likes: 0,
      img: `https://picsum.photos/seed/${seed}/400/320`,
      imgH: 200,
    }, ...prev])
    setShowCreate(false)
  }

  const renderScreen = () => {
    if (showProfile) return (
      <Profile
        onBack={() => setShowProfile(false)}
        mapUnlocked={mapUnlocked}
        onToggleMap={setMapUnlocked}
      />
    )
    switch (tab) {
      case 'qa':   return <QA />
      case 'chat': return <Chat />
      case 'home': return <Home onProfileClick={() => setShowProfile(true)} extraPosts={posts} />
      case 'map':  return <MapScreen unlocked={mapUnlocked} />
      default:     return <Home onProfileClick={() => setShowProfile(true)} extraPosts={posts} />
    }
  }

  const showFab = !showProfile && tab === 'home'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 72 }}>
        {renderScreen()}
      </div>

      {/* FAB — outside scrollable area, always fixed to viewport */}
      {showFab && (
        <button
          onClick={() => setShowCreate(true)}
          style={{
            position: 'fixed',
            bottom: 88,
            right: 16,
            width: 46, height: 46, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(255,154,60,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200,
          }}>
          <PlusIcon size={20} color="#fff" />
        </button>
      )}

      {!showProfile && (
        <BottomNav active={tab} onChange={setTab} mapUnlocked={mapUnlocked} />
      )}

      {showCreate && <CreatePost onClose={() => setShowCreate(false)} onSubmit={addPost} />}
    </div>
  )
}
