import { useState, useEffect, Component } from 'react'
import BottomNav from './components/BottomNav'
import MapHome from './components/MapHome'
import PostFeed from './components/PostFeed'
import Chat from './components/Chat'
import Profile from './components/Profile'
import CreateContent from './components/CreateContent'
import ScavengerHunt from './components/ScavengerHunt'
import Login from './components/Login'
import Onboarding from './components/Onboarding'
import UserProfileSheet from './components/UserProfileSheet'
import { MessageIcon, HeartIcon } from './components/Icons'
import { api } from './lib/api'

const POST_OPTIONS = [
  { id: 'cq',   Icon: MessageIcon, label: 'Community Questions', desc: 'Ask & answer the community',      color: '#5599EE' },
  { id: 'feed', Icon: HeartIcon,   label: 'Community Feed',      desc: 'Photos & stories from students',  color: '#3CB87A' },
]

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch() {}
  render() {
    if (this.state.error) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 32, background: '#FFFBF0', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF9A3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#1A1A1A', marginBottom: 8 }}>Something went wrong</div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>Please refresh the page to continue.</div>
          <button onClick={() => { this.setState({ error: null }); window.location.reload() }}
            style={{ background: '#FF9A3C', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Refresh
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function loadUser() {
  try { return JSON.parse(localStorage.getItem('shine_user') || 'null') } catch { return null }
}

function AppInner() {
  const [user, setUser] = useState(loadUser)
  const [tab, setTab] = useState('map')
  const [postView, setPostView] = useState('feed')
  const [showPostMenu, setShowPostMenu] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [communityPosts, setCommunityPosts] = useState([])
  const [sunlightPosts, setSunlightPosts] = useState([])
  const [viewingUserId, setViewingUserId] = useState(null)

  const handleUserClick = (userId) => {
    if (!userId) return
    setViewingUserId(userId)
  }

  // Validate session on startup — if the stored token is stale, force re-login
  useEffect(() => {
    if (!user) return
    const tok = localStorage.getItem('shine_session')
    if (!tok) {
      // No session token at all — clear stale user and go to login
      localStorage.removeItem('shine_user')
      setUser(null)
      return
    }
    api.getMe()
      .then(fresh => {
        // Keep user state up to date with server data
        const merged = { ...fresh, onboarded: fresh.onboarded ?? user.onboarded }
        localStorage.setItem('shine_user', JSON.stringify(merged))
        setUser(merged)
      })
      .catch(() => {
        // Session token is invalid — force re-login
        localStorage.removeItem('shine_user')
        localStorage.removeItem('shine_session')
        setUser(null)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load posts from the API when user is logged in
  useEffect(() => {
    if (!user) return
    api.getFeedPosts()
      .then(posts => Array.isArray(posts) && setCommunityPosts(posts))
      .catch(() => {})
    api.getSunlightPosts()
      .then(posts => Array.isArray(posts) && setSunlightPosts(posts))
      .catch(() => {})
  }, [user?.email])

  // Close the post menu when tapping anywhere outside it — without blocking scroll
  // NOTE: must be declared before any early returns to satisfy the Rules of Hooks
  useEffect(() => {
    if (!showPostMenu) return
    const close = () => setShowPostMenu(false)
    const id = setTimeout(() => document.addEventListener('click', close, { once: true }), 0)
    return () => { clearTimeout(id); document.removeEventListener('click', close) }
  }, [showPostMenu])

  // ── Auth gates ──────────────────────────────────────────────────────────────
  if (!user) {
    return <Login onLogin={u => setUser(u)} />
  }
  if (!user.onboarded) {
    return <Onboarding user={user} onComplete={async (profile) => {
      try {
        await api.updateMe({
          name: profile.name,
          country: profile.country,
          year: profile.year,
          concentration: profile.concentration,
          house: profile.house,
          interests: profile.interests,
          onboarded: true,
          readinessOverall:    profile.readinessOverall,
          readinessBelonging:  profile.readinessBelonging,
          readinessDailyLife:  profile.readinessDailyLife,
          readinessClassroom:  profile.readinessClassroom,
          readinessAcademic:   profile.readinessAcademic,
          readinessProfessors: profile.readinessProfessors,
          readinessFriendship: profile.readinessFriendship,
          readinessCulture:    profile.readinessCulture,
          readinessWellbeing:  profile.readinessWellbeing,
          readinessCampusHelp: profile.readinessCampusHelp,
        })
      } catch (e) {
        console.error('Failed to save profile to API:', e)
      }
      localStorage.setItem('shine_user', JSON.stringify(profile))
      setUser(profile)
    }} />
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

  const handleNewPost = async (post) => {
    const postWithUser = { ...post, username: user.name || post.username, userId: user.id }
    setCommunityPosts(prev => [postWithUser, ...prev])
    try {
      const saved = await api.createFeedPost({
        text: postWithUser.text || '',
        img: postWithUser.img || null,
        mediaType: postWithUser.mediaType || null,
        textContent: postWithUser.textContent || null,
        gradientIdx: postWithUser.gradientIdx ?? null,
        locationName: postWithUser.location?.name || null,
        locationLat: postWithUser.location?.lat || null,
        locationLng: postWithUser.location?.lng || null,
      })
      setCommunityPosts(prev => prev.map(p => p.id === post.id ? { ...saved, id: saved.id } : p))
    } catch (e) {
      console.error('Failed to save post:', e.message || e)
      setCommunityPosts(prev => prev.filter(p => p.id !== post.id))
      alert('Could not save your post — please check your connection and try again.')
    }
  }

  const handleNewSunlightPost = async (post) => {
    const realName = user.name || 'You'
    const displayName = post.isAnonymous ? 'Anonymous' : realName
    const postWithUser = {
      ...post,
      username: displayName,
      isAnonymous: post.isAnonymous || false,
      initials: post.isAnonymous ? null : (realName).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      avatarBg: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
      time: 'Just now',
    }
    setSunlightPosts(prev => [postWithUser, ...prev])
    try {
      const saved = await api.createSunlightPost({
        type: post.type,
        title: post.title,
        body: post.body,
        isAnonymous: post.isAnonymous || false,
        locationLat: post.location?.lat || null,
        locationLng: post.location?.lng || null,
        locationLabel: post.location?.label || post.location?.name || null,
      })
      setSunlightPosts(prev => prev.map(p => p.id === postWithUser.id ? saved : p))
    } catch (e) {
      console.error('Failed to save sunlight post:', e.message || e)
      setSunlightPosts(prev => prev.filter(p => p.id !== postWithUser.id))
      alert('Could not save your post — please check your connection and try again.')
    }
  }

  const handleEditPost = (updated) => setCommunityPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
  const handleDeletePost = (id) => setCommunityPosts(prev => prev.filter(p => p.id !== id))
  const handleEditSunlightPost = (updated) => setSunlightPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
  const handleDeleteSunlightPost = (id) => setSunlightPosts(prev => prev.filter(p => p.id !== id))

  const handleUpdateUser = async (updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem('shine_user', JSON.stringify(updated))
    setUser(updated)
    try {
      await api.updateMe(updates)
    } catch (e) {
      console.error('Failed to update user:', e)
    }
  }

  const renderScreen = () => {
    switch (tab) {
      case 'map':     return <MapHome onSunlight={() => setShowCreate(true)} communityPosts={communityPosts} sunlightPosts={sunlightPosts} onEditSunlightPost={handleEditSunlightPost} onUserClick={handleUserClick} />
      case 'post':    return <PostFeed view={postView} onShowFAQ={() => selectPostView('faq')} userPosts={communityPosts} onNewPost={handleNewPost} onEditPost={handleEditPost} onDeletePost={handleDeletePost} user={user} sunlightPosts={sunlightPosts} onNewSunlightPost={handleNewSunlightPost} onEditSunlightPost={handleEditSunlightPost} onDeleteSunlightPost={handleDeleteSunlightPost} onUserClick={handleUserClick} />
      case 'chat':    return <Chat onUserClick={handleUserClick} />
      case 'profile': return <Profile user={user} onUpdate={handleUpdateUser} userPosts={communityPosts} userSunlightPosts={sunlightPosts} onEditSunlightPost={handleEditSunlightPost} onDeleteSunlightPost={handleDeleteSunlightPost} onUserClick={handleUserClick} onSignOut={() => { localStorage.removeItem('shine_user'); localStorage.removeItem('shine_session'); setUser(null); setTab('map') }} />
      case 'hunt':    return <ScavengerHunt user={user} onUserClick={handleUserClick} />
      default:        return <MapHome communityPosts={communityPosts} onUserClick={handleUserClick} />
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>

      <div style={{ flex: 1, overflowY: isMap ? 'hidden' : 'auto', paddingBottom: isMap ? 0 : 72 }}>
        {renderScreen()}
      </div>

      {/* Post sub-menu popup */}
      {showPostMenu && (
          <div className="slide-up" onClick={e => e.stopPropagation()} style={{
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
      )}

      <BottomNav active={tab} onChange={handleTabChange} isOnCampus={!!user?.isOnCampus} />

      {showCreate && (
        <CreateContent
          onClose={() => setShowCreate(false)}
          onSubmit={(post) => { handleNewSunlightPost(post); setShowCreate(false) }}
        />
      )}

      {viewingUserId && (
        <UserProfileSheet
          userId={viewingUserId}
          currentUser={user}
          onClose={() => setViewingUserId(null)}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  )
}
