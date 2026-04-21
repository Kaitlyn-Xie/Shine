import { useState } from 'react'
import BottomNav from './components/BottomNav'
import MapHome from './components/MapHome'
import PostFeed from './components/PostFeed'
import Chat from './components/Chat'
import Profile from './components/Profile'
import CreateContent from './components/CreateContent'
import ActivityHub from './components/ActivityHub'
import { PinIcon, MessageIcon, HeartIcon, TargetIcon, CalendarIcon, FlagIcon } from './components/Icons'

// ── Sub-menu configs ──────────────────────────────────────────────────────────

const POST_OPTIONS = [
  { id: 'faq',  Icon: PinIcon,     label: 'Common Questions',   desc: 'FAQs for international students', color: '#FF9A3C' },
  { id: 'cq',   Icon: MessageIcon, label: 'Community Questions', desc: 'Ask & answer the community',      color: '#5599EE' },
  { id: 'feed', Icon: HeartIcon,   label: 'Community Feed',      desc: 'Photos & stories from students',  color: '#3CB87A' },
]

const ACTIVITY_OPTIONS = [
  { id: 'hunt',   Icon: TargetIcon,   label: 'Scavenger Hunt',  desc: 'Explore campus with your team',      color: '#FF9A3C' },
  { id: 'events', Icon: CalendarIcon, label: 'School Events',   desc: 'Official Harvard events & sessions', color: '#5599EE' },
  { id: 'clubs',  Icon: FlagIcon,     label: 'Club Activities', desc: 'Join student clubs & associations',  color: '#CC66FF' },
]

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState('map')

  const [postView, setPostView]         = useState('faq')
  const [showPostMenu, setShowPostMenu] = useState(false)

  const [activityView, setActivityView]         = useState('hunt')
  const [showActivityMenu, setShowActivityMenu] = useState(false)

  const [showProfile, setShowProfile] = useState(false)
  const [showCreate, setShowCreate]   = useState(false)

  const handleTabChange = (id) => {
    if (id === 'profile')  { setShowProfile(true); setShowPostMenu(false); setShowActivityMenu(false); return }
    if (id === 'post')     { setShowPostMenu(v => !v); setShowActivityMenu(false); setTab('post'); return }
    if (id === 'activity') { setShowActivityMenu(v => !v); setShowPostMenu(false); setTab('activity'); return }
    setShowPostMenu(false)
    setShowActivityMenu(false)
    setTab(id)
  }

  const isMap = !showProfile && tab === 'map'

  const renderScreen = () => {
    if (showProfile) return <Profile onBack={() => setShowProfile(false)} />
    switch (tab) {
      case 'map':      return <MapHome onSunlight={() => setShowCreate(true)} />
      case 'post':     return <PostFeed view={postView} />
      case 'chat':     return <Chat />
      case 'activity': return <ActivityHub view={activityView} />
      default:         return <MapHome onSunlight={() => setShowCreate(true)} />
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>

      {/* Main screen */}
      <div style={{ flex: 1, overflowY: isMap ? 'hidden' : 'auto', paddingBottom: isMap ? 0 : 72 }}>
        {renderScreen()}
      </div>

      {/* Post sub-menu */}
      {showPostMenu && (
        <SubMenu
          options={POST_OPTIONS}
          activeId={postView}
          onSelect={id => { setPostView(id); setShowPostMenu(false) }}
          onClose={() => setShowPostMenu(false)}
        />
      )}

      {/* Activity sub-menu */}
      {showActivityMenu && (
        <SubMenu
          options={ACTIVITY_OPTIONS}
          activeId={activityView}
          onSelect={id => { setActivityView(id); setShowActivityMenu(false) }}
          onClose={() => setShowActivityMenu(false)}
        />
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

// ── Reusable sub-menu popup ───────────────────────────────────────────────────

function SubMenu({ options, activeId, onSelect, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 110 }} />
      <div className="slide-up" style={{
        position: 'fixed', bottom: 76,
        left: 'max(12px, calc(50vw - 203px))',
        right: 'max(12px, calc(50vw - 203px))',
        zIndex: 120, background: '#fff', borderRadius: 20,
        boxShadow: '0 -4px 32px rgba(0,0,0,0.18)', overflow: 'hidden',
      }}>
        {options.map((opt, i) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            style={{
              width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
              padding: '14px 16px',
              borderBottom: i < options.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex', alignItems: 'center', gap: 14,
              background: activeId === opt.id ? '#FFFBF0' : 'transparent',
            }}
          >
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
            {activeId === opt.id && (
              <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
            )}
          </button>
        ))}
      </div>
    </>
  )
}
