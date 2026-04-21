import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon, PlusIcon, GlobeIcon, CheckIcon } from './Icons'
import { TYPE_CONFIG } from '../data'
import { BADGES } from '../data/missions'
import { api } from '../lib/api'

function readHuntData() {
  try {
    return JSON.parse(localStorage.getItem('shine_hunt_v1') || 'null') || { completions: [], badges: [], feedItems: [] }
  } catch { return { completions: [], badges: [], feedItems: [] } }
}

const HUNT_GREEN = '#1B8757'
const HUNT_LIGHT = '#E8F8F0'

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

// ── Edit post sheet (for question posts on profile) ──────────────────────────
const QC = '#5599EE'

function ProfileEditSheet({ post, onClose, onSave }) {
  const [title, setTitle] = useState(post.title || '')
  const [body, setBody] = useState(post.body || '')
  const [anon, setAnon] = useState(post.isAnonymous || false)
  const [saving, setSaving] = useState(false)
  const canSave = title.trim().length > 2

  const handleSave = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try { await onSave({ title: title.trim(), body: body.trim(), isAnonymous: anon }) }
    finally { setSaving(false) }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 500 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 40, height: 4, background: '#E0E0E0', borderRadius: 2, margin: '12px auto 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 17, fontWeight: 800 }}>Edit Question</span>
          <button onClick={onClose} style={iconBtn}><CloseIcon size={20} color="#4A4A4A" /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)', background: anon ? '#F8F8F8' : '#fff' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>Post anonymously</div>
            <div style={{ fontSize: 12, color: '#AAAAAA' }}>Your name won't be visible</div>
          </div>
          <button
            onClick={() => setAnon(v => !v)}
            style={{ width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', background: anon ? QC : '#D0D0D0', transition: 'background 0.2s', position: 'relative', flexShrink: 0 }}
          >
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: anon ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px 32px' }}>
          <textarea
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Your question…"
            maxLength={300}
            rows={3}
            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 15, lineHeight: 1.6, outline: 'none', fontFamily: 'inherit', resize: 'none', marginBottom: 12, boxSizing: 'border-box' }}
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Add more details (optional)…"
            maxLength={600}
            rows={3}
            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 14, lineHeight: 1.6, outline: 'none', fontFamily: 'inherit', resize: 'none', marginBottom: 16, boxSizing: 'border-box' }}
          />
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            style={{
              width: '100%', padding: 14, border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700,
              cursor: canSave && !saving ? 'pointer' : 'default',
              background: canSave && !saving ? `linear-gradient(135deg, ${QC}, #3377CC)` : 'var(--border)',
              color: canSave && !saving ? '#fff' : '#AAAAAA',
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Post card for user's posts grid ─────────────────────────────────────────
function UserPostCard({ post, onEdit }) {
  const isSunlight = !!TYPE_CONFIG[post.type]
  const cfg = isSunlight ? TYPE_CONFIG[post.type] : null
  const gradIdx = (post.gradientIdx ?? 0) % GRAD_COLORS.length
  const [c1, c2] = cfg ? [cfg.light, cfg.light] : GRAD_COLORS[gradIdx]

  return (
    <div style={{ background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isSunlight ? cfg.light : `linear-gradient(135deg, ${c1}, ${c2})`,
        position: 'relative',
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
      <div style={{ padding: '10px 12px', flex: 1 }}>
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
      {onEdit && (
        <button
          onClick={onEdit}
          style={{
            margin: '0 12px 12px', padding: '7px 0', borderRadius: 10, border: 'none',
            background: '#EEF4FF', color: QC, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          ✏️ Edit
        </button>
      )}
    </div>
  )
}

// ── Main Profile ─────────────────────────────────────────────────────────────
export default function Profile({ user = {}, onBack, onSignOut, onUpdate, userPosts = [], userSunlightPosts = [], onEditSunlightPost }) {
  const [activeTab, setActiveTab] = useState('all')
  const [showEdit, setShowEdit] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [huntData, setHuntData] = useState(readHuntData)

  // Hidden journal state — private to this user
  const [journal, setJournal] = useState('')
  const [journalDraft, setJournalDraft] = useState('')
  const [journalSaving, setJournalSaving] = useState(false)
  const [journalSaved, setJournalSaved] = useState(false)

  useEffect(() => {
    api.getHuntStats()
      .then(stats => {
        const completions = stats.completions.map(c => ({
          missionId: c.missionId,
          pts: { total: c.ptsTotal, base: c.ptsTotal, bonus: 0 },
          photoUrl: c.photoUrl,
          shareToFeed: c.shareToFeed,
        }))
        const earnedBadgeIds = BADGES.filter(b => b.check(completions)).map(b => b.id)
        setHuntData({ completions, badges: earnedBadgeIds, feedItems: [] })
      })
      .catch(() => {})

    // Load hidden journal
    api.getHiddenJournal()
      .then(data => {
        setJournal(data.hiddenJournal ?? '')
        setJournalDraft(data.hiddenJournal ?? '')
      })
      .catch(() => {})
  }, [])

  const toggleOnCampus = () => onUpdate?.({ isOnCampus: !user.isOnCampus })

  const displayName = user.name || 'Your Name'
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const interestTags = (user.interests || []).slice(0, 5)

  // Only show posts created by this user
  const myPosts = userPosts.filter(p => p.userId === user.id)
  const mySunlightPosts = userSunlightPosts.filter(p => p.userId === user.id)
  const allPosts = [...mySunlightPosts, ...myPosts]

  // Hunt stats
  const huntPoints = huntData.completions.reduce((sum, c) => sum + (c.pts?.total ?? c.pts ?? 0), 0)
  const huntMissions = huntData.completions.length
  const earnedBadges = BADGES.filter(b => huntData.badges.includes(b.id))
  const displayPosts =
    activeTab === 'community' ? myPosts
    : activeTab === 'sunlight' ? mySunlightPosts
    : allPosts

  const handleSaveProfile = (updates) => onUpdate?.(updates)

  const handleSaveJournal = async () => {
    if (journalDraft === journal) return
    setJournalSaving(true)
    try {
      await api.saveHiddenJournal(journalDraft)
      setJournal(journalDraft)
      setJournalSaved(true)
      setTimeout(() => setJournalSaved(false), 2500)
    } catch (e) {
      console.error('Failed to save journal', e)
    } finally {
      setJournalSaving(false)
    }
  }

  const handleSaveEdit = async (updates) => {
    if (!editingPost) return
    try {
      const updated = await api.updateSunlightPost(editingPost.dbId, updates)
      onEditSunlightPost?.(updated || { ...editingPost, ...updates })
    } catch (e) {
      onEditSunlightPost?.({ ...editingPost, ...updates })
    }
    setEditingPost(null)
  }

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

      {/* Scavenger Hunt Stats */}
      <div style={{ margin: '0 0 10px', background: '#fff', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 16 }}>🏆</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#1A1A1A' }}>Scavenger Hunt</span>
          {!user.isOnCampus && (
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#9A9A9A', background: '#F3F4F6', padding: '2px 8px', borderRadius: 8 }}>
              🔒 Unlocks on arrival
            </span>
          )}
        </div>

        {/* Points + Missions + Badges row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: earnedBadges.length > 0 ? 14 : 0 }}>
          <div style={{
            flex: 1, background: HUNT_LIGHT, borderRadius: 14, padding: '12px 0',
            textAlign: 'center', border: `1.5px solid ${user.isOnCampus ? '#B2E8D0' : '#E5E7EB'}`,
          }}>
            <div style={{ fontWeight: 900, fontSize: 22, color: user.isOnCampus ? HUNT_GREEN : '#AAAAAA' }}>
              {huntPoints}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, marginTop: 2 }}>Points</div>
          </div>
          <div style={{
            flex: 1, background: HUNT_LIGHT, borderRadius: 14, padding: '12px 0',
            textAlign: 'center', border: `1.5px solid ${user.isOnCampus ? '#B2E8D0' : '#E5E7EB'}`,
          }}>
            <div style={{ fontWeight: 900, fontSize: 22, color: user.isOnCampus ? HUNT_GREEN : '#AAAAAA' }}>
              {huntMissions}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, marginTop: 2 }}>Missions</div>
          </div>
          <div style={{
            flex: 1, background: HUNT_LIGHT, borderRadius: 14, padding: '12px 0',
            textAlign: 'center', border: `1.5px solid ${user.isOnCampus ? '#B2E8D0' : '#E5E7EB'}`,
          }}>
            <div style={{ fontWeight: 900, fontSize: 22, color: user.isOnCampus ? HUNT_GREEN : '#AAAAAA' }}>
              {earnedBadges.length}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, marginTop: 2 }}>Badges</div>
          </div>
        </div>

        {/* Earned badge chips */}
        {earnedBadges.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {earnedBadges.map(b => (
              <div key={b.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: HUNT_LIGHT, border: `1.5px solid #B2E8D0`,
                borderRadius: 20, padding: '5px 12px',
              }}>
                <span style={{ fontSize: 16 }}>{b.emoji}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: HUNT_GREEN }}>{b.name}</div>
                  <div style={{ fontSize: 10, color: '#6B7280' }}>+{b.points} pts</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Placeholder badges when none earned */}
        {user.isOnCampus && earnedBadges.length === 0 && huntMissions === 0 && (
          <div style={{ textAlign: 'center', padding: '8px 0 2px', color: '#AAAAAA', fontSize: 12 }}>
            Complete missions to earn badges 🎖️
          </div>
        )}
      </div>

      {/* ── Hidden Journal — only visible to the logged-in user ── */}
      <div style={{ margin: '0 0 10px', background: '#fff', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 16 }}>📓</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#1A1A1A' }}>My Hidden Journal</span>
          <span style={{
            marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#fff',
            background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
            padding: '2px 8px', borderRadius: 8,
          }}>🔒 Private</span>
        </div>
        <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6, margin: '0 0 12px' }}>
          This section is private to you and used by the scavenger-hunt matcher to better understand your needs, what you're looking to do with friends, how you're feeling, etc.
        </p>
        <textarea
          value={journalDraft}
          onChange={e => setJournalDraft(e.target.value)}
          placeholder="How are you feeling about your Harvard journey? What are you hoping to experience with new friends? What kinds of activities excite you?..."
          rows={5}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '12px 14px', borderRadius: 14, border: '1.5px solid #E5E7EB',
            fontSize: 14, lineHeight: 1.7, resize: 'vertical', fontFamily: 'inherit',
            color: '#1A1A1A', background: '#FAFAFA', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = '#7C3AED' }}
          onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
        />
        <button
          onClick={handleSaveJournal}
          disabled={journalSaving || journalDraft === journal}
          style={{
            marginTop: 10, padding: '10px 20px', borderRadius: 12, border: 'none',
            background: journalSaved ? '#10B981' : journalDraft !== journal ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' : '#E5E7EB',
            color: journalDraft !== journal || journalSaved ? '#fff' : '#9A9A9A',
            fontWeight: 700, fontSize: 14, cursor: journalDraft !== journal && !journalSaving ? 'pointer' : 'default',
            transition: 'all 0.2s',
          }}
        >
          {journalSaving ? '⏳ Saving…' : journalSaved ? '✓ Saved!' : 'Save Journal'}
        </button>
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
        {displayPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No posts yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Your posts will appear here</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {displayPosts.map(post => {
              const isEditableQuestion = post.type === 'question' && !post.isStatic && onEditSunlightPost
              return (
                <UserPostCard
                  key={post.id}
                  post={post}
                  onEdit={isEditableQuestion ? () => setEditingPost(post) : undefined}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Edit Profile sheet — portal to escape scroll container */}
      {showEdit && createPortal(
        <EditProfileSheet
          user={user}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveProfile}
        />,
        document.body
      )}

      {/* Edit Post sheet — portal to escape scroll container */}
      {editingPost && createPortal(
        <ProfileEditSheet
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleSaveEdit}
        />,
        document.body
      )}
    </div>
  )
}

const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
