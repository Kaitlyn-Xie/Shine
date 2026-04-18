import { useState } from 'react'
import BottomNav from './components/BottomNav'
import MapHome from './components/MapHome'
import PostFeed from './components/PostFeed'
import Chat from './components/Chat'
import Profile from './components/Profile'
import CreateContent from './components/CreateContent'
import { PinIcon, MessageIcon, HeartIcon } from './components/Icons'

// ── Post sub-menu options ────────────────────────────────────────────────────
const POST_OPTIONS = [
  { id: 'faq',  Icon: PinIcon,     label: 'Common Questions',   desc: 'FAQs for international students', color: '#FF9A3C' },
  { id: 'cq',   Icon: MessageIcon, label: 'Community Questions', desc: 'Ask & answer the community',      color: '#5599EE' },
  { id: 'feed', Icon: HeartIcon,   label: 'Community Feed',      desc: 'Photos & stories from students',  color: '#3CB87A' },
]

export default function App() {
  const [tab, setTab] = useState('map')
  const [postView, setPostView] = useState('faq')   // active post sub-page
  const [showPostMenu, setShowPostMenu] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const handleTabChange = (id) => {
    if (id === 'profile') { setShowProfile(true); return }
    if (id === 'post') {
      setShowPostMenu(v => !v)   // toggle: tap again to close
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

  const isMap = !showProfile && tab === 'map'

  const renderScreen = () => {
    if (showProfile) return <Profile onBack={() => setShowProfile(false)} />
    switch (tab) {
      case 'map':  return <MapHome onSunlight={() => setShowCreate(true)} />
      case 'post': return <PostFeed view={postView} />
      case 'chat': return <Chat />
      default:     return <MapHome />
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>

      {/* Main screen */}
      <div style={{ flex: 1, overflowY: isMap ? 'hidden' : 'auto', paddingBottom: isMap ? 0 : 72 }}>
        {renderScreen()}
      </div>


      {/* Post sub-menu popup */}
      {showPostMenu && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowPostMenu(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 110 }}
          />
          {/* Card */}
          <div className="slide-up" style={{
            position: 'fixed',
            bottom: 76,
            left: 'max(12px, calc(50vw - 203px))',
            right: 'max(12px, calc(50vw - 203px))',
            zIndex: 120,
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 -4px 32px rgba(0,0,0,0.18)',
            overflow: 'hidden',
          }}>
            {POST_OPTIONS.map((opt, i) => (
              <button
                key={opt.id}
                onClick={() => selectPostView(opt.id)}
                style={{
                  width: '100%', textAlign: 'left', background: 'none',
                  border: 'none', cursor: 'pointer',
                  padding: '14px 16px',
                  borderBottom: i < POST_OPTIONS.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: postView === opt.id ? '#FFFBF0' : 'transparent',
                }}
              >
                {/* Icon badge */}
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: opt.color + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <opt.Icon size={20} color={opt.color} />
                </div>
                {/* Text */}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{opt.desc}</div>
                </div>
                {/* Active indicator */}
                {postView === opt.id && (
                  <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Bottom nav */}
      {!showProfile && (
        <BottomNav active={tab} onChange={handleTabChange} />
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateContent onClose={() => setShowCreate(false)} onSubmit={() => setShowCreate(false)} />
      )}
    </div>
  )
}
