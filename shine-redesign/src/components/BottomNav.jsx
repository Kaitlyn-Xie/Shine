import { GridIcon, ChatIcon, UserIcon, SunIcon } from './Icons'

const TABS = [
  { id: 'post',    Icon: GridIcon,  label: 'Post'    },
  { id: 'chat',    Icon: ChatIcon,  label: 'Chat'    },
  { id: 'map',     isShine: true                     },
  { id: 'profile', Icon: UserIcon,  label: 'Profile' },
]

export default function BottomNav({ active, onChange }) {
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
      {TABS.map(tab => {
        if (tab.isShine) {
          const isActive = active === 'map'
          return (
            <button
              key="map"
              onClick={() => onChange('map')}
              style={{
                width: 54, height: 54, borderRadius: '50%',
                background: isActive
                  ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)'
                  : 'linear-gradient(135deg, #FFE8A0, #FFC94A)',
                border: 'none', cursor: 'pointer',
                boxShadow: isActive
                  ? '0 4px 18px rgba(255,154,60,0.55)'
                  : '0 2px 10px rgba(255,154,60,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: -18, flexShrink: 0,
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
            >
              <SunIcon size={24} color={isActive ? '#fff' : '#B86A00'} />
            </button>
          )
        }
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, background: 'none', border: 'none',
              cursor: 'pointer', flex: 1, padding: '6px 0',
            }}
          >
            <tab.Icon size={22} color={isActive ? 'var(--orange)' : '#9A9A9A'} />
            <span style={{
              fontSize: 10, fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--orange)' : '#9A9A9A',
              letterSpacing: '0.2px',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
