import { ChevronLeftIcon, MessageIcon, PlusIcon, GlobeIcon, UserIcon, MapIcon, SunIcon, Avatar } from './Icons'

const POSTS = [
  { id: 1, bg: 'linear-gradient(160deg, #FFE8A0, #FFC94A)', text: 'First day on campus! So beautiful.', likes: 42 },
  { id: 2, bg: 'linear-gradient(160deg, #C8F0D8, #5BC88A)', text: 'Found the best coffee spot.', likes: 28 },
  { id: 3, bg: 'linear-gradient(160deg, #B8D8FF, #5599EE)', text: 'Spring vibes at Harvard Yard.', likes: 67 },
]

export default function Profile({ onBack, mapUnlocked, onToggleMap }) {
  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 20px 12px', background: '#fff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={onBack} style={iconBtn}>
          <ChevronLeftIcon size={22} color="#4A4A4A" />
        </button>
        <span style={{ fontSize: 19, fontWeight: 800 }}>Profile</span>
      </div>

      {/* Cover + Avatar */}
      <div style={{ background: '#fff', marginBottom: 10 }}>
        <div style={{ height: 110, background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)' }} />
        <div style={{ padding: '0 20px 20px', position: 'relative' }}>
          <div style={{
            width: 76, height: 76, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFE8A0, #FFC94A)',
            border: '4px solid #fff', marginTop: -38,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow)',
          }}>
            <UserIcon size={34} color="#B86A00" />
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, fontSize: 20 }}>Your Name</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
              <GlobeIcon size={13} color="var(--text-secondary)" />
              Your Country · Class of 2028
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {['Computer Science', 'International Student', 'Coffee'].map(tag => (
                <span key={tag} style={{
                  fontSize: 12, padding: '5px 12px',
                  background: '#FFFBF0', borderRadius: 20,
                  border: '1.5px solid var(--yellow)',
                  fontWeight: 600, color: 'var(--orange)',
                }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', marginTop: 18, background: 'var(--bg)', borderRadius: 14, overflow: 'hidden' }}>
            {[{ label: 'Posts', value: '12' }, { label: 'Following', value: '48' }, { label: 'Followers', value: '73' }].map((s, i) => (
              <div key={s.label} style={{
                flex: 1, padding: '12px 0', textAlign: 'center',
                borderRight: i < 2 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <button style={{
            width: '100%', marginTop: 16, padding: 13,
            background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
            border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 14px rgba(255,154,60,0.3)',
          }}>
            <MessageIcon size={17} color="#1A1A1A" /> Message
          </button>
        </div>
      </div>

      {/* Campus Arrival Toggle */}
      <div style={{
        background: '#fff', margin: '0 0 10px',
        padding: '18px 20px',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: mapUnlocked ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : '#F0F0F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.3s',
            }}>
              <MapIcon size={20} color={mapUnlocked ? '#fff' : '#9A9A9A'} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Arrived on Campus</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {mapUnlocked ? 'Campus map is unlocked' : 'Toggle when you arrive to unlock the map'}
              </div>
            </div>
          </div>

          {/* Toggle switch */}
          <div
            onClick={() => onToggleMap(!mapUnlocked)}
            style={{
              width: 50, height: 28, borderRadius: 14, cursor: 'pointer',
              background: mapUnlocked ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : '#D0D0D0',
              position: 'relative', transition: 'background 0.3s',
              flexShrink: 0,
            }}>
            <div style={{
              position: 'absolute',
              top: 3, left: mapUnlocked ? 24 : 3,
              width: 22, height: 22, borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              transition: 'left 0.25s ease',
            }} />
          </div>
        </div>

        {mapUnlocked && (
          <div className="slide-up" style={{
            marginTop: 14, padding: '10px 14px',
            background: '#FFFBF0', borderRadius: 10,
            border: '1.5px solid var(--yellow)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <SunIcon size={16} color="var(--orange)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--orange)' }}>
              Welcome to Harvard! The campus map is now available.
            </span>
          </div>
        )}
      </div>

      {/* Recent Posts */}
      <div style={{ padding: '4px 12px 28px' }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, paddingLeft: 2 }}>Recent Posts</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {POSTS.map(post => (
            <div key={post.id} style={{ background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              <div style={{ height: 90, background: post.bg }} />
              <div style={{ padding: '10px 12px' }}>
                <p style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 5 }}>{post.text}</p>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ color: '#E8415A', fontSize: 11 }}>♥</span> {post.likes}
                </div>
              </div>
            </div>
          ))}
          <div style={{
            background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 130, border: '2px dashed var(--border)', cursor: 'pointer',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', background: 'var(--bg)',
                margin: '0 auto 7px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <PlusIcon size={16} color="#AAAAAA" />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>New Post</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
