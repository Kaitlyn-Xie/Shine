import { QuestionIcon, ChatIcon, SunIcon, MapIcon, LockIcon } from './Icons'

export default function BottomNav({ active, onChange, mapUnlocked }) {
  const tabs = [
    { id: 'qa',   Icon: QuestionIcon, label: 'Q&A' },
    { id: 'chat', Icon: ChatIcon,      label: 'Chat' },
    { id: 'home', isHome: true,        label: 'Home' },
    { id: 'map',  Icon: MapIcon,       label: 'Map', locked: !mapUnlocked },
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: '#fff',
      borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      height: 68, paddingBottom: 8,
      boxShadow: '0 -2px 20px rgba(0,0,0,0.07)',
      zIndex: 100,
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => (!tab.locked) && onChange(tab.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, background: 'none', border: 'none',
              cursor: tab.locked ? 'default' : 'pointer',
              flex: 1, padding: '6px 0',
              opacity: tab.locked ? 0.35 : 1,
            }}
          >
            {tab.isHome ? (
              <div style={{
                width: 48, height: 48,
                background: isActive
                  ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)'
                  : 'linear-gradient(135deg, #FFE8A0, #FFC94A)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isActive
                  ? '0 4px 16px rgba(255,154,60,0.5)'
                  : '0 2px 8px rgba(255,154,60,0.2)',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.2s ease',
                marginTop: -16,
              }}>
                <SunIcon size={22} color={isActive ? '#fff' : '#B86A00'} />
              </div>
            ) : (
              <>
                <div style={{ position: 'relative' }}>
                  <tab.Icon size={22} color={isActive ? 'var(--orange)' : '#9A9A9A'} />
                  {tab.locked && (
                    <div style={{ position: 'absolute', top: -4, right: -6 }}>
                      <LockIcon size={10} color="#9A9A9A" />
                    </div>
                  )}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--orange)' : '#9A9A9A',
                  letterSpacing: '0.2px',
                }}>
                  {tab.label}
                </span>
              </>
            )}
          </button>
        )
      })}
    </nav>
  )
}
