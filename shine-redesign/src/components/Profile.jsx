import { useState } from 'react'
import { CloseIcon, PlusIcon, GlobeIcon, CheckIcon } from './Icons'
import { TYPE_CONFIG } from '../data'

const CONCENTRATIONS = [
  'African and African American Studies', 'Anthropology', 'Applied Mathematics',
  'Art, Film, and Visual Studies', 'Astrophysics', 'Biomedical Engineering',
  'Chemical and Physical Biology', 'Chemistry', 'Chemistry and Physics',
  'Classical Studies', 'Classics', 'Comparative Literature',
  'Comparative Study of Religion', 'Computer Science', 'Earth and Planetary Sciences',
  'East Asian Studies', 'Economics', 'Electrical Engineering', 'Engineering Sciences',
  'English', 'Environmental Science and Public Policy', 'Folklore and Mythology',
  'Germanic Languages and Literatures', 'Government', 'History',
  'History and Literature', 'History and Science', 'History of Art and Architecture',
  'Human Developmental and Regenerative Biology', 'Human Evolutionary Biology',
  'Integrative Biology', 'Linguistics', 'Mathematics', 'Mechanical Engineering',
  'Medieval Studies', 'Molecular and Cellular Biology', 'Music',
  'Near Eastern Languages and Civilizations', 'Neuroscience', 'Philosophy',
  'Physics', 'Psychology', 'Romance Languages and Literatures',
  'Slavic Languages and Literatures', 'Sociology', 'South Asian Studies',
  'Special Concentrations', 'Statistics', 'Theater, Dance, and Media',
  'Women, Gender, and Sexuality', 'Undecided / Exploring',
]
const HOUSES = [
  'Apley Court', 'Canaday Hall', 'Grays Hall', 'Greenough Hall',
  'Hollis Hall', 'Holworthy Hall', 'Hurlbut Hall', 'Lionel Hall',
  'Massachusetts Hall', 'Matthews Hall', 'Mower Hall', 'Pennypacker Hall',
  'Stoughton Hall', 'Straus Hall', 'Thayer Hall', 'Weld Hall',
  'Wigglesworth Hall',
]
const YEARS = ['2028', '2027', '2026', '2025']
const INTERESTS = [
  '🔬 Research', '⚽ Athletics', '🎵 Music', '🎨 Arts',
  '💻 Coding', '🍳 Cooking', '✈️ Travel', '📚 Reading',
  '🎬 Film', '🌐 Languages', '🚀 Entrepreneurship', '🤝 Community Service',
  '💃 Dance', '🎮 Gaming', '🏛️ Politics', '🌱 Sustainability',
]

const GRAD_COLORS = [
  ['#FFE8A0', '#FFC94A'],
  ['#C8F0DC', '#3CB87A'],
  ['#C6DAFF', '#5599EE'],
  ['#FFD6DC', '#E8415A'],
  ['#EDD9FF', '#9966EE'],
]

// ── Edit Profile bottom sheet ─────────────────────────────────────────────────
function EditProfileSheet({ user, onClose, onSave }) {
  const [name, setName] = useState(user.name || '')
  const [country, setCountry] = useState(user.country || '')
  const [year, setYear] = useState(user.year || '')
  const [concentration, setConcentration] = useState(user.concentration || '')
  const [house, setHouse] = useState(user.house || '')
  const [interests, setInterests] = useState(user.interests || [])

  const toggleInterest = (tag) =>
    setInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])

  const handleSave = () => {
    onSave({ name: name.trim(), country: country.trim(), year, concentration, house, interests })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1500, display: 'flex', flexDirection: 'column' }}>
      <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} />
      <div style={{
        background: '#fff', borderRadius: '22px 22px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Sheet header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>✏️ Edit Profile</span>
          <button onClick={onClose} style={iconBtn}>
            <CloseIcon size={20} color="#4A4A4A" />
          </button>
        </div>

        {/* Scrollable fields */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '18px 20px 0' }}>
          {[
            { label: 'Display Name', value: name, onChange: setName, placeholder: 'Your name' },
            { label: 'Home Country', value: country, onChange: setCountry, placeholder: 'e.g. South Korea' },
          ].map(({ label, value, onChange, placeholder }) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{label}</label>
              <input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 12,
                  border: '1.5px solid var(--border)', fontSize: 14, fontWeight: 500,
                  outline: 'none', boxSizing: 'border-box', background: 'var(--bg)',
                }}
              />
            </div>
          ))}

          {/* Class Year */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Class Year</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {YEARS.map(y => (
                <button key={y} onClick={() => setYear(y)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
                  background: year === y ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : 'var(--bg)',
                  color: year === y ? '#fff' : '#4A4A4A',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  boxShadow: year === y ? '0 2px 8px rgba(255,154,60,0.35)' : 'none',
                }}>
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Concentration */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Concentration</label>
            <select
              value={concentration}
              onChange={e => setConcentration(e.target.value)}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 12,
                border: '1.5px solid var(--border)', fontSize: 14, fontWeight: 500,
                background: 'var(--bg)', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">Select concentration...</option>
              {CONCENTRATIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* House */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Dorm</label>
            <select
              value={house}
              onChange={e => setHouse(e.target.value)}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 12,
                border: '1.5px solid var(--border)', fontSize: 14, fontWeight: 500,
                background: 'var(--bg)', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">Select dorm...</option>
              {HOUSES.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          {/* Interests */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Interests</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {INTERESTS.map(tag => {
                const active = interests.includes(tag)
                return (
                  <button key={tag} onClick={() => toggleInterest(tag)} style={{
                    padding: '7px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontWeight: 600,
                    background: active ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : 'var(--bg)',
                    color: active ? '#fff' : '#4A4A4A',
                    border: `1.5px solid ${active ? 'transparent' : 'var(--border)'}`,
                    boxShadow: active ? '0 2px 8px rgba(255,154,60,0.3)' : 'none',
                  }}>
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Save button */}
        <div style={{ padding: '16px 20px 32px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleSave}
            style={{
              width: '100%', padding: 14, borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
              color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(255,154,60,0.35)',
            }}
          >
            <CheckIcon size={18} color="#fff" /> Save changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Post card for user's posts grid ─────────────────────────────────────────
function UserPostCard({ post }) {
  const isSunlight = !!TYPE_CONFIG[post.type]
  const cfg = isSunlight ? TYPE_CONFIG[post.type] : null
  const gradIdx = (post.gradientIdx ?? 0) % GRAD_COLORS.length
  const [c1, c2] = cfg ? [cfg.light, cfg.light] : GRAD_COLORS[gradIdx]

  return (
    <div style={{ background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
      <div style={{
        height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isSunlight ? cfg.light : `linear-gradient(135deg, ${c1}, ${c2})`,
      }}>
        {isSunlight ? (
          <span style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '0.5px',
            color: cfg.color, padding: '3px 8px',
            background: '#fff', borderRadius: 10, opacity: 0.9,
          }}>
            {cfg.label.toUpperCase()}
          </span>
        ) : (
          <span style={{ fontSize: 22 }}>
            {post.mediaType === 'photo' ? '🖼️' : post.mediaType === 'video' ? '🎬' : '💬'}
          </span>
        )}
      </div>
      <div style={{ padding: '10px 12px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.4, marginBottom: 5, color: '#1A1A1A',
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {isSunlight ? post.title : (post.textContent || post.text || 'Community post')}
        </p>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ color: '#E8415A' }}>♥</span> {post.likes ?? 0}
          <span style={{ marginLeft: 6, color: '#AAAAAA' }}>· {post.time}</span>
        </div>
      </div>
    </div>
  )
}

// ── Main Profile ─────────────────────────────────────────────────────────────
export default function Profile({ user = {}, onBack, onSignOut, onUpdate, userPosts = [], userSunlightPosts = [] }) {
  const [activeTab, setActiveTab] = useState('all')
  const [showEdit, setShowEdit] = useState(false)

  const toggleOnCampus = () => onUpdate?.({ isOnCampus: !user.isOnCampus })

  const displayName = user.name || 'Your Name'
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const interestTags = (user.interests || []).slice(0, 5)

  const allPosts = [...userSunlightPosts, ...userPosts]
  const displayPosts =
    activeTab === 'community' ? userPosts
    : activeTab === 'sunlight' ? userSunlightPosts
    : allPosts

  const handleSaveProfile = (updates) => onUpdate?.(updates)

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 12px', background: '#fff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <span style={{ width: 40 }} />
        <span style={{ fontSize: 19, fontWeight: 800 }}>Profile</span>
        <button onClick={onSignOut} style={{ ...iconBtn, fontSize: 12, color: '#AAAAAA', fontWeight: 600 }}>
          Sign Out
        </button>
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
            <span style={{ fontWeight: 900, fontSize: 24, color: '#B86A00' }}>{initials}</span>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, fontSize: 20 }}>{displayName}</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
              <GlobeIcon size={13} color="var(--text-secondary)" />
              {[user.country, user.year ? `Class of ${user.year}` : '', user.house].filter(Boolean).join(' · ')}
            </div>
            {user.concentration && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, paddingLeft: 18 }}>
                📚 {user.concentration}
              </div>
            )}
            {interestTags.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {interestTags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 12, padding: '5px 12px',
                    background: '#FFFBF0', borderRadius: 20,
                    border: '1.5px solid var(--yellow)',
                    fontWeight: 600, color: 'var(--orange)',
                  }}>{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* On Campus Toggle */}
          <div onClick={toggleOnCampus} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 16, padding: '13px 16px',
            background: user.isOnCampus ? '#FFFBF0' : '#F7F7F7',
            borderRadius: 14,
            border: `1.5px solid ${user.isOnCampus ? 'var(--yellow)' : 'var(--border)'}`,
            cursor: 'pointer',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: user.isOnCampus ? 'var(--orange)' : '#4A4A4A' }}>
                {user.isOnCampus ? "🏛️  I'm on campus" : '✈️  Pre-arrival'}
              </div>
              <div style={{ fontSize: 12, color: '#AAAAAA', marginTop: 2 }}>
                {user.isOnCampus ? 'Tap to switch to pre-arrival mode' : 'Tap when you arrive at Harvard'}
              </div>
            </div>
            <div style={{
              width: 44, height: 26, borderRadius: 13, flexShrink: 0,
              background: user.isOnCampus ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : '#DDDDDD',
              position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 3,
                left: user.isOnCampus ? 21 : 3,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                transition: 'left 0.2s',
              }} />
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', marginTop: 18, background: 'var(--bg)', borderRadius: 14, overflow: 'hidden' }}>
            {[
              { label: 'Posts', value: allPosts.length },
              { label: 'Following', value: '48' },
              { label: 'Followers', value: '73' },
            ].map((s, i) => (
              <div key={s.label} style={{
                flex: 1, padding: '12px 0', textAlign: 'center',
                borderRight: i < 2 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Edit Profile button */}
          <button
            onClick={() => setShowEdit(true)}
            style={{
              width: '100%', marginTop: 16, padding: 13,
              background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
              border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(255,154,60,0.3)',
            }}
          >
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{
        background: '#fff', padding: '12px 12px 0',
        borderBottom: '1px solid var(--border)', marginBottom: 10,
      }}>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { id: 'all', label: 'All Posts' },
            { id: 'community', label: 'Community' },
            { id: 'sunlight', label: 'Sunlight' },
          ].map(t => {
            const isActive = activeTab === t.id
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                flexShrink: 0, padding: '8px 16px 12px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--orange)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--orange)' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}>
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Posts grid */}
      <div style={{ padding: '4px 12px 28px' }}>
        {displayPosts.length === 0 && activeTab !== 'all' ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No {activeTab} posts yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Your posts will appear here</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {displayPosts.map(post => (
              <UserPostCard key={post.id} post={post} />
            ))}
            {activeTab === 'all' && (
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
            )}
          </div>
        )}
      </div>

      {/* Edit Profile sheet */}
      {showEdit && (
        <EditProfileSheet
          user={user}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  )
}

const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
