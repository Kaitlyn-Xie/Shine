import { useState } from 'react'
import BottomNav from './components/BottomNav'
import MapHome from './components/MapHome'
import PostFeed from './components/PostFeed'
import Chat from './components/Chat'
import Profile from './components/Profile'
import CreateContent from './components/CreateContent'
import ScavengerHunt from './components/ScavengerHunt'
import Login from './components/Login'
import Onboarding from './components/Onboarding'
import { MessageIcon, HeartIcon } from './components/Icons'

// ── Post sub-menu options ────────────────────────────────────────────────────
const POST_OPTIONS = [
  { id: 'cq',   Icon: MessageIcon, label: 'Community Questions', desc: 'Ask & answer the community',      color: '#5599EE' },
  { id: 'feed', Icon: HeartIcon,   label: 'Community Feed',      desc: 'Photos & stories from students',  color: '#3CB87A' },
]

function loadUser() {
  try { return JSON.parse(localStorage.getItem('shine_user') || 'null') } catch { return null }
}

export default function App() {
  const [user, setUser] = useState(loadUser)
  const [tab, setTab] = useState('map')
  const [postView, setPostView] = useState('feed')
  const [showPostMenu, setShowPostMenu] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [communityPosts, setCommunityPosts] = useState([])
  const [sunlightPosts, setSunlightPosts] = useState([])

  // ── Auth gates ──────────────────────────────────────────────────────────────
  if (!user) {
    return <Login onLogin={u => setUser(u)} />
  }
  if (!user.onboarded) {
    return <Onboarding user={user} onComplete={u => setUser(u)} />
  }

  // ── Main app ─────────────────────────────────────────────────────────────────
  const handleTabChange = (id) => {
    if (id === 'post') {
      setShowPostMenu(v => !v)
      setTab('post')
      return
    }
    setShowPostMenu(false)
    setTab(id)
  }

  const selectPostView = (viewId) => {
    setPostView(viewId)
    setShowPostMenu(false)
  }

  const isMap = tab === 'map'

  const handleNewPost = (post) => setCommunityPosts(prev => [post, ...prev])
  const handleNewSunlightPost = (post) => setSunlightPosts(prev => [post, ...prev])
  const handleEditPost = (updated) => setCommunityPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
  const handleEditSunlightPost = (updated) => setSunlightPosts(prev => prev.map(p => p.id === updated.id ? updated : p))

  const handleUpdateUser = (updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem('shine_user', JSON.stringify(updated))
    setUser(updated)
  }

  const renderScreen = () => {
    switch (tab) {
      case 'map':     return <MapHome onSunlight={() => setShowCreate(true)} communityPosts={communityPosts} sunlightPosts={sunlightPosts} onEditSunlightPost={handleEditSunlightPost} />
      case 'post':    return <PostFeed view={postView} onShowFAQ={() => selectPostView('faq')} userPosts={communityPosts} onNewPost={handleNewPost} onEditPost={handleEditPost} user={user} />
      case 'chat':    return <Chat />
      case 'profile': return <Profile user={user} onUpdate={handleUpdateUser} userPosts={communityPosts} userSunlightPosts={sunlightPosts} onSignOut={() => { localStorage.removeItem('shine_user'); setUser(null); setTab('map') }} />
      case 'hunt':    return <ScavengerHunt user={user} />
      default:        return <MapHome communityPosts={communityPosts} />
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>

      <div style={{ flex: 1, overflowY: isMap ? 'hidden' : 'auto', paddingBottom: isMap ? 0 : 72 }}>
        {renderScreen()}
      </div>

      {/* Post sub-menu popup */}
      {showPostMenu && (
        <>
          <div onClick={() => setShowPostMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 110 }} />
          <div className="slide-up" style={{
            position: 'fixed', bottom: 76,
            left: 'max(12px, calc(50vw - 203px))',
            right: 'max(12px, calc(50vw - 203px))',
            zIndex: 120, background: '#fff', borderRadius: 20,
            boxShadow: '0 -4px 32px rgba(0,0,0,0.18)', overflow: 'hidden',
          }}>
            {POST_OPTIONS.map((opt, i) => (
              <button key={opt.id} onClick={() => selectPostView(opt.id)}
                style={{
                  width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                  padding: '14px 16px',
                  borderBottom: i < POST_OPTIONS.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: postView === opt.id ? '#FFFBF0' : 'transparent',
                }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: opt.color + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <opt.Icon size={20} color={opt.color} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{opt.desc}</div>
                </div>
                {postView === opt.id && (
                  <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      <BottomNav active={tab} onChange={handleTabChange} isOnCampus={!!user?.isOnCampus} />

      {showCreate && (
        <CreateContent
          onClose={() => setShowCreate(false)}
          onSubmit={(post) => { handleNewSunlightPost(post); setShowCreate(false) }}
        />
      )}
    </div>
  )
}
