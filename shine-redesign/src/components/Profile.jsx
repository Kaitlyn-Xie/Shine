import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  CloseIcon, PlusIcon, GlobeIcon, CheckIcon, TrophyIcon, StarIcon,
  BookIcon, LockIcon, EditIcon, SearchIcon, LandmarkIcon, PlaneIcon,
  ImageIcon, FilmIcon, MessageIcon, MicIcon,
  ICON_MAP,
} from './Icons'
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

// ── Community Activity Badges ─────────────────────────────────────────────────
// Points earned per action
const PTS = { photo: 15, text: 10, tip: 20, question: 10, answer: 25 }

// Badge definitions — fun names with unlock conditions
const COMMUNITY_BADGES = [
  // First-post milestones
  { id: 'first_light',    iconKey: 'sun',      name: 'First Light',       desc: 'Share your first post',           pts: 10,  check: s => s.totalPosts >= 1 },
  { id: 'snap_happy',     iconKey: 'camera',   name: 'Snap Happy',        desc: 'Post your first photo',           pts: 10,  check: s => s.photoPosts >= 1 },
  { id: 'wordsmith',      iconKey: 'edit',     name: 'Wordsmith',         desc: 'Write your first text post',      pts: 10,  check: s => s.textPosts >= 1 },
  // Photography
  { id: 'gallery_star',   iconKey: 'image',    name: 'Gallery Star',      desc: 'Share 5 photos',                  pts: 25,  check: s => s.photoPosts >= 5 },
  { id: 'chronicler',     iconKey: 'grid',     name: 'Harvard Chronicler',desc: 'Share 15 photos',                 pts: 50,  check: s => s.photoPosts >= 15 },
  // Tips
  { id: 'wise_owl',       iconKey: 'book',     name: 'Wise Owl',          desc: 'Share your first tip',            pts: 15,  check: s => s.tips >= 1 },
  { id: 'campus_sage',    iconKey: 'compass',  name: 'Campus Sage',       desc: 'Share 5 tips',                    pts: 40,  check: s => s.tips >= 5 },
  { id: 'life_compass',   iconKey: 'compass',  name: 'Life Compass',      desc: 'Share 10 tips',                   pts: 75,  check: s => s.tips >= 10 },
  // Questions
  { id: 'curious_cat',    iconKey: 'search',   name: 'Curious Cat',       desc: 'Ask your first question',         pts: 10,  check: s => s.questions >= 1 },
  { id: 'the_seeker',     iconKey: 'search',   name: 'The Seeker',        desc: 'Ask 5 questions',                 pts: 30,  check: s => s.questions >= 5 },
  // Answers
  { id: 'voice_yard',     iconKey: 'mic',      name: 'Voice of the Yard', desc: 'Answer your first question',      pts: 20,  check: s => s.answers >= 1 },
  { id: 'convo_starter',  iconKey: 'message',  name: 'Convo Starter',     desc: 'Answer 3 questions',              pts: 40,  check: s => s.answers >= 3 },
  { id: 'dear_advisor',   iconKey: 'gradcap',  name: 'Dear Advisor',      desc: 'Answer 10 questions',             pts: 80,  check: s => s.answers >= 10 },
  // Point milestones (no bonus pts, just recognition)
  { id: 'on_fire',        iconKey: 'zap',      name: 'On Fire',           desc: '50+ community points',            pts: 0,   check: (_, total) => total >= 50 },
  { id: 'rising_star',    iconKey: 'star',     name: 'Rising Star',       desc: '100+ community points',           pts: 0,   check: (_, total) => total >= 100 },
  { id: 'shine_diamond',  iconKey: 'diamond',  name: 'Shine Diamond',     desc: '200+ community points',           pts: 0,   check: (_, total) => total >= 200 },
  { id: 'campus_legend',  iconKey: 'crown',    name: 'Campus Legend',     desc: '400+ community points',           pts: 0,   check: (_, total) => total >= 400 },
]

function computeCommunityPoints(stats) {
  return (
    stats.photoPosts * PTS.photo +
    stats.textPosts * PTS.text +
    stats.tips * PTS.tip +
    stats.questions * PTS.question +
    stats.answers * PTS.answer
  )
}

const COMM_BLUE = '#5599EE'
const COMM_LIGHT = '#EEF4FF'

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
  'Research', 'Athletics', 'Music', 'Arts',
  'Coding', 'Cooking', 'Travel', 'Reading',
  'Film', 'Languages', 'Entrepreneurship', 'Community Service',
  'Dance', 'Gaming', 'Politics', 'Sustainability',
  'Photography', 'Hiking', 'Yoga & Wellness', 'Fashion',
  'Theater', 'Debate', 'Journalism', 'Finance',
  'Pre-med', 'Architecture', 'Philosophy', 'Biking',
  'Volunteering', 'Podcasting', 'Public Speaking', 'Sports Fandom',
]

const GRAD_COLORS = [
  ['#FFE8A0', '#FFC94A'],
  ['#C8F0DC', '#3CB87A'],
  ['#C6DAFF', '#5599EE'],
  ['#FFD6DC', '#E8415A'],
  ['#EDD9FF', '#9966EE'],
]

// ── Interest Users bottom sheet ───────────────────────────────────────────────
function InterestUsersSheet({ interest, onClose, onUserClick }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getUsersByInterest(interest)
      .then(data => { setUsers(data.users ?? []); setLoading(false) })
      .catch(() => { setUsers([]); setLoading(false) })
  }, [interest])

  const GRAD_COLORS_LOCAL = [
    ['#FFE8A0', '#FFC94A'], ['#C8F0DC', '#3CB87A'], ['#C6DAFF', '#5599EE'],
    ['#FFD6DC', '#E8415A'], ['#EDD9FF', '#9966EE'],
  ]

  function avatarGrad(name) {
    const code = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return GRAD_COLORS_LOCAL[code % GRAD_COLORS_LOCAL.length]
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1600, display: 'flex', flexDirection: 'column' }}>
      <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{
        background: '#fff', borderRadius: '22px 22px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        maxHeight: '70vh', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, background: '#E0E0E0', borderRadius: 2 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 14px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>{interest}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
              {loading ? 'Loading…' : `${users.length} student${users.length !== 1 ? 's' : ''} share this interest`}
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#F0F0F0', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0 24px' }}>
          {loading && (
            <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 14, padding: '32px 0' }}>Loading…</div>
          )}
          {!loading && users.length === 0 && (
            <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 14, padding: '32px 20px', lineHeight: 1.6 }}>
              No other students have listed <strong>{interest}</strong> as an interest yet.<br />You might be the first!
            </div>
          )}
          {users.map(u => {
            const [from, to] = avatarGrad(u.name)
            const ini = (u.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
            return (
              <button
                key={u.id}
                onClick={() => { onUserClick?.(u.id); onClose() }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 20px', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                  borderBottom: '1px solid #F9FAFB',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${from}, ${to})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, fontWeight: 900, color: '#5A3A00',
                }}>
                  {ini}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                    {[u.country, u.year ? `Class of ${u.year}` : null].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Edit Profile bottom sheet ─────────────────────────────────────────────────
function EditProfileSheet({ user, onClose, onSave }) {
  const [name, setName] = useState(user.name || '')
  const [country, setCountry] = useState(user.country || '')
  const [year, setYear] = useState(user.year || '')
  const [concentration, setConcentration] = useState(user.concentration || '')
  const [house, setHouse] = useState(user.house || '')
  const [interests, setInterests] = useState(user.interests || [])
  const [customInput, setCustomInput] = useState('')

  const toggleInterest = (tag) =>
    setInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])

  const addCustomInterest = () => {
    const val = customInput.trim()
    if (!val || interests.includes(val)) { setCustomInput(''); return }
    setInterests(prev => [...prev, val])
    setCustomInput('')
  }

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
          <span style={{ fontSize: 18, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}><EditIcon size={16} color="#1A1A1A" /> Edit Profile</span>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
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
              {interests.filter(t => !INTERESTS.includes(t)).map(custom => (
                <button key={custom} onClick={() => toggleInterest(custom)} style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontWeight: 600,
                  background: 'linear-gradient(135deg, #F8EEFF, #EDD9FF)',
                  color: '#9933CC', border: '1.5px solid #CC66FF',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {custom} <span style={{ fontSize: 15 }}>×</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomInterest()}
                placeholder="Add your own interest…"
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 20, fontSize: 13,
                  border: '1.5px dashed #CCCCCC', outline: 'none', background: '#FAFAFA',
                  color: '#1A1A1A', fontFamily: 'inherit',
                }}
              />
              <button
                onClick={addCustomInterest}
                style={{
                  padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                  background: customInput.trim() ? 'linear-gradient(135deg, #CC66FF, #9933CC)' : '#E0E0E0',
                  color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0,
                }}>
                + Add
              </button>
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
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {post.mediaType === 'photo' ? <ImageIcon size={20} color="#9A9A9A" /> : post.mediaType === 'video' ? <FilmIcon size={20} color="#9A9A9A" /> : <MessageIcon size={20} color="#9A9A9A" />}
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><EditIcon size={12} color={QC} /> Edit</span>
        </button>
      )}
    </div>
  )
}

// ── Main Profile ─────────────────────────────────────────────────────────────
export default function Profile({ user = {}, onBack, onSignOut, onUpdate, userPosts = [], userSunlightPosts = [], onEditSunlightPost, onUserClick }) {
  const [activeTab, setActiveTab] = useState('all')
  const [showEdit, setShowEdit] = useState(false)
  const [viewingInterest, setViewingInterest] = useState(null)
  const [editingPost, setEditingPost] = useState(null)
  const [huntData, setHuntData] = useState(readHuntData)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  const [activityStats, setActivityStats] = useState({ photoPosts: 0, textPosts: 0, tips: 0, questions: 0, answers: 0, totalPosts: 0 })

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

    // Load community activity stats
    api.getActivityStats()
      .then(stats => stats && setActivityStats(stats))
      .catch(() => {})

    // Load hidden journal
    api.getHiddenJournal()
      .then(data => {
        setJournal(data.hiddenJournal ?? '')
        setJournalDraft(data.hiddenJournal ?? '')
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const q = searchQuery.trim()
    if (!q) { setSearchResults([]); return }
    setSearchLoading(true)
    const timer = setTimeout(() => {
      api.searchUsers(q)
        .then(r => { setSearchResults(r.users ?? []); setSearchLoading(false) })
        .catch(() => { setSearchResults([]); setSearchLoading(false) })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

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

  // Community badge computation
  const communityPoints = computeCommunityPoints(activityStats)
  const earnedCommunityBadges = COMMUNITY_BADGES.filter(b => b.check(activityStats, communityPoints))
  const lockedCommunityBadges = COMMUNITY_BADGES.filter(b => !b.check(activityStats, communityPoints))

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
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, paddingLeft: 18, display: 'flex', alignItems: 'center', gap: 5 }}>
                <BookIcon size={12} color="var(--text-secondary)" /> {user.concentration}
              </div>
            )}
            {interestTags.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {interestTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setViewingInterest(tag)}
                    style={{
                      fontSize: 12, padding: '5px 12px',
                      background: '#FFFBF0', borderRadius: 20,
                      border: '1.5px solid var(--yellow)',
                      fontWeight: 600, color: 'var(--orange)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    {tag}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                ))}
                {(user.interests || []).length > 5 && (
                  <button onClick={() => setShowEdit(true)} style={{
                    fontSize: 12, padding: '5px 12px', background: '#F5F5F5',
                    borderRadius: 20, border: '1.5px solid #E0E0E0',
                    fontWeight: 600, color: '#9CA3AF', cursor: 'pointer',
                  }}>
                    +{(user.interests || []).length - 5} more
                  </button>
                )}
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
              <div style={{ fontWeight: 700, fontSize: 14, color: user.isOnCampus ? 'var(--orange)' : '#4A4A4A', display: 'flex', alignItems: 'center', gap: 6 }}>
                {user.isOnCampus ? <LandmarkIcon size={14} color="var(--orange)" /> : <PlaneIcon size={14} color="#4A4A4A" />}
                {user.isOnCampus ? "I'm on campus" : 'Pre-arrival'}
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><EditIcon size={15} color="#1A1A1A" /> Edit Profile</span>
          </button>

          {/* Find Students */}
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <SearchIcon size={15} color="#1A1A1A" />
              <span style={{ fontWeight: 800, fontSize: 14, color: '#1A1A1A' }}>Find Students</span>
            </div>
            <input
              type="text"
              placeholder="Search by name, country, or interests…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 12, fontSize: 14,
                border: '1.5px solid #E5E7EB', outline: 'none', boxSizing: 'border-box',
                background: '#F9FAFB', color: '#1A1A1A',
              }}
            />
            {searchLoading && (
              <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, paddingTop: 12 }}>Searching…</div>
            )}
            {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
              <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, paddingTop: 12 }}>No students found</div>
            )}
            {searchResults.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column' }}>
                {searchResults.map(u => (
                  <button
                    key={u.id}
                    onClick={() => onUserClick?.(u.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', borderBottom: '1px solid #F3F4F6' }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 900, color: '#fff',
                    }}>
                      {(u.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>
                        {[u.country, u.year ? `Class of ${u.year}` : ''].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <span style={{ fontSize: 16, color: '#9CA3AF' }}>›</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scavenger Hunt Stats */}
      <div style={{ margin: '0 0 10px', background: '#fff', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <TrophyIcon size={16} color="#1A1A1A" />
          <span style={{ fontWeight: 800, fontSize: 15, color: '#1A1A1A' }}>Scavenger Hunt</span>
          {!user.isOnCampus && (
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#9A9A9A', background: '#F3F4F6', padding: '2px 8px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <LockIcon size={9} color="#9A9A9A" /> Unlocks on arrival
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
                {(() => { const Ic = ICON_MAP[b.iconKey]; return Ic ? <Ic size={16} color={HUNT_GREEN} /> : null })()}
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
            Complete missions to earn badges
          </div>
        )}
      </div>

      {/* ── Community Activity Badges ── */}
      <div style={{ margin: '0 0 10px', background: '#fff', padding: '16px 20px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <StarIcon size={16} color="#1A1A1A" />
          <span style={{ fontWeight: 800, fontSize: 15, color: '#1A1A1A' }}>Community Badges</span>
          <span style={{
            marginLeft: 'auto', fontSize: 11, fontWeight: 800, color: '#fff',
            background: 'linear-gradient(135deg, #5599EE, #3377CC)',
            padding: '3px 10px', borderRadius: 10,
          }}>
            {communityPoints} pts
          </span>
        </div>

        {/* Points breakdown bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Photos', count: activityStats.photoPosts, pts: PTS.photo, color: '#FF9A3C' },
            { label: 'Tips',   count: activityStats.tips,       pts: PTS.tip,   color: COMM_BLUE },
            { label: 'Q&A',    count: activityStats.questions + activityStats.answers, pts: null, color: '#1B8757' },
          ].map(item => (
            <div key={item.label} style={{
              flex: 1, background: COMM_LIGHT, borderRadius: 12, padding: '10px 0',
              textAlign: 'center', border: `1.5px solid #C9DAFF`,
            }}>
              <div style={{ fontWeight: 900, fontSize: 19, color: item.color }}>{item.count}</div>
              <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600, marginTop: 1 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Earned badges */}
        {earnedCommunityBadges.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 8, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              Earned · {earnedCommunityBadges.length}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {earnedCommunityBadges.map(b => (
                <div key={b.id} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: COMM_LIGHT, border: `1.5px solid #C9DAFF`,
                  borderRadius: 20, padding: '6px 12px',
                }}>
                  {(() => { const Ic = ICON_MAP[b.iconKey]; return Ic ? <Ic size={17} color={COMM_BLUE} /> : null })()}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: COMM_BLUE, lineHeight: 1.2 }}>{b.name}</div>
                    {b.pts > 0 && <div style={{ fontSize: 10, color: '#6B7280' }}>+{b.pts} pts</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next badges to unlock */}
        {lockedCommunityBadges.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#AAAAAA', marginBottom: 8, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              Next to unlock
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {lockedCommunityBadges.slice(0, 4).map(b => (
                <div key={b.id} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: '#F7F7F7', border: `1.5px solid #E5E7EB`,
                  borderRadius: 20, padding: '5px 11px', opacity: 0.75,
                }}>
                  {(() => { const Ic = ICON_MAP[b.iconKey]; return Ic ? <Ic size={15} color="#BBBBBB" /> : null })()}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', lineHeight: 1.2 }}>{b.name}</div>
                    <div style={{ fontSize: 10, color: '#BBBBBB' }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {earnedCommunityBadges.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4px 0 2px', color: '#AAAAAA', fontSize: 12 }}>
            Post, share tips, and answer questions to earn badges!
          </div>
        )}
      </div>

      {/* ── Hidden Journal — only visible to the logged-in user ── */}
      <div style={{ margin: '0 0 10px', background: '#fff', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <BookIcon size={16} color="#1A1A1A" />
          <span style={{ fontWeight: 800, fontSize: 15, color: '#1A1A1A' }}>My Hidden Journal</span>
          <span style={{
            marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#fff',
            background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
            padding: '2px 8px', borderRadius: 8,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}><LockIcon size={9} color="#fff" /> Private</span>
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
            <div style={{ marginBottom: 10, opacity: 0.35 }}><ImageIcon size={36} color="var(--text-secondary)" /></div>
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

      {/* Interest Users sheet */}
      {viewingInterest && createPortal(
        <InterestUsersSheet
          interest={viewingInterest}
          onClose={() => setViewingInterest(null)}
          onUserClick={onUserClick}
        />,
        document.body
      )}

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
