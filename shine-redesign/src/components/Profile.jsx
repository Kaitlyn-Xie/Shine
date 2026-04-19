import { useState } from 'react'
import { ChevronLeftIcon, MessageIcon, PlusIcon, GlobeIcon } from './Icons'
import { CONTENT_ITEMS, TYPE_CONFIG } from '../data'

// Show a small selection of content from the shared data as "my posts"
const MY_POSTS = CONTENT_ITEMS.filter(item => ['Mei Lin', 'Lucas M.', 'Ji-ho P.', 'Omar K.'].includes(item.username)).slice(0, 4)

export default function Profile({ user = {}, onBack, onSignOut }) {
  const [activeType, setActiveType] = useState('all')

  const displayName = user.name || 'Your Name'
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const interestTags = (user.interests || []).slice(0, 5)

  const displayPosts = activeType === 'all'
    ? MY_POSTS
    : MY_POSTS.filter(p => p.type === activeType)

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 12px', background: '#fff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={onBack} style={iconBtn}>
          <ChevronLeftIcon size={22} color="#4A4A4A" />
        </button>
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
            <MessageIcon size={17} color="#1A1A1A" /> Edit Profile
          </button>
        </div>
      </div>

      {/* Type filter tabs */}
      <div style={{
        background: '#fff', padding: '12px 12px 0',
        borderBottom: '1px solid var(--border)', marginBottom: 10,
      }}>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[{ id: 'all', label: 'All Posts' }, { id: 'tip', label: 'Tips' }, { id: 'story', label: 'Stories' }, { id: 'question', label: 'Questions' }].map(t => {
            const isActive = activeType === t.id
            return (
              <button
                key={t.id}
                onClick={() => setActiveType(t.id)}
                style={{
                  flexShrink: 0, padding: '8px 16px 12px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--orange)' : 'var(--text-secondary)',
                  borderBottom: isActive ? '2px solid var(--orange)' : '2px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Posts grid */}
      <div style={{ padding: '4px 12px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {displayPosts.map(post => {
            const cfg = TYPE_CONFIG[post.type]
            return (
              <div key={post.id} style={{ background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                <div style={{ height: 80, background: cfg.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, letterSpacing: '0.5px',
                    color: cfg.color, padding: '3px 8px',
                    background: '#fff', borderRadius: 10, opacity: 0.9,
                  }}>
                    {cfg.label.toUpperCase()}
                  </span>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.4, marginBottom: 5, color: '#1A1A1A' }}>
                    {post.title}
                  </p>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ color: '#E8415A' }}>♥</span> {post.likes}
                    <span style={{ marginLeft: 6, color: '#AAAAAA' }}>· {post.time}</span>
                  </div>
                </div>
              </div>
            )
          })}

          {/* New Post card */}
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
