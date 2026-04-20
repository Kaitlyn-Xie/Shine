import { GridIcon, ChatIcon, UserIcon, SunIcon, TrophyIcon } from './Icons'

export default function BottomNav({ active, onChange, isOnCampus }) {
  const handleHuntClick = () => {
    if (!isOnCampus) return
    onChange('hunt')
  }

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: '#fff', borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      height: 68, paddingBottom: 8,
      boxShadow: '0 -2px 20px rgba(0,0,0,0.07)',
      zIndex: 100,
    }}>
      {/* Post */}
      <NavItem id="post" active={active} label="Post" onChange={onChange}>
        <GridIcon size={22} color={active === 'post' ? 'var(--orange)' : '#9A9A9A'} />
      </NavItem>

      {/* Chat */}
      <NavItem id="chat" active={active} label="Chat" onChange={onChange}>
        <ChatIcon size={22} color={active === 'chat' ? 'var(--orange)' : '#9A9A9A'} />
      </NavItem>

      {/* Shine — centre FAB */}
      <button
        onClick={() => onChange('map')}
        style={{
          width: 54, height: 54, borderRadius: '50%',
          background: active === 'map'
            ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)'
            : 'linear-gradient(135deg, #FFE8A0, #FFC94A)',
          border: 'none', cursor: 'pointer',
          boxShadow: active === 'map'
            ? '0 4px 18px rgba(255,154,60,0.55)'
            : '0 2px 10px rgba(255,154,60,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: -18, flexShrink: 0,
          transform: active === 'map' ? 'scale(1.08)' : 'scale(1)',
          transition: 'all 0.2s ease',
        }}
      >
        <SunIcon size={24} color={active === 'map' ? '#fff' : '#B86A00'} />
      </button>

      {/* Hunt — greyed if pre-arrival */}
      <button
        onClick={handleHuntClick}
        title={isOnCampus ? 'Scavenger Hunt' : 'Switch to On Campus mode in your Profile to unlock'}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 3, background: 'none', border: 'none',
          cursor: isOnCampus ? 'pointer' : 'not-allowed',
          flex: 1, padding: '6px 0',
          opacity: isOnCampus ? 1 : 0.38,
        }}
      >
        <div style={{ position: 'relative' }}>
          <TrophyIcon size={22} color={active === 'hunt' && isOnCampus ? '#1B8757' : '#9A9A9A'} />
          {!isOnCampus && (
            <span style={{ position: 'absolute', top: -4, right: -6, fontSize: 10, lineHeight: 1 }}>🔒</span>
          )}
        </div>
        <span style={{
          fontSize: 10, fontWeight: active === 'hunt' ? 700 : 500,
          color: active === 'hunt' && isOnCampus ? '#1B8757' : '#9A9A9A',
          letterSpacing: '0.2px',
        }}>
          Hunt
        </span>
      </button>

      {/* Profile */}
      <NavItem id="profile" active={active} label="Profile" onChange={onChange}>
        <UserIcon size={22} color={active === 'profile' ? 'var(--orange)' : '#9A9A9A'} />
      </NavItem>
    </nav>
  )
}

function NavItem({ id, active, label, onChange, children }) {
  const isActive = active === id
  return (
    <button
      onClick={() => onChange(id)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 3, background: 'none', border: 'none',
        cursor: 'pointer', flex: 1, padding: '6px 0',
      }}
    >
      {children}
      <span style={{
        fontSize: 10, fontWeight: isActive ? 700 : 500,
        color: isActive ? 'var(--orange)' : '#9A9A9A',
        letterSpacing: '0.2px',
      }}>
        {label}
      </span>
    </button>
  )
}
