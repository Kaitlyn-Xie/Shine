import { useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  SearchIcon, ChevronDownIcon, ThumbsUpIcon,
  MessageIcon, PinIcon, HeartIcon, Avatar, UserIcon, CloseIcon
} from './Icons'

// ── Static data ──────────────────────────────────────────────────────────────

const FAQS = [
  { q: 'How to open a bank account?', a: 'Visit any local Bank of America or Citizens Bank branch with your Harvard ID, passport, and I-20. Most accounts can be opened same-day with no minimum balance for students.' },
  { q: 'Where to get a SIM card?', a: 'T-Mobile and AT&T stores near Harvard Square offer student plans. You can also get a prepaid SIM at CVS or Walgreens with your passport.' },
  { q: 'How to register for classes?', a: 'Log into my.harvard.edu, navigate to Academics > Course Registration. Add/drop period runs the first two weeks of each semester.' },
  { q: 'How do I get a Harvard ID?', a: 'Visit the Harvard ID Office in the Smith Campus Center (1350 Mass Ave) with your acceptance letter and passport. Takes about 15 minutes.' },
  { q: 'Where is the international students office?', a: 'The Harvard International Office (HIO) is at 1350 Massachusetts Ave, Holyoke Center 800. They handle all visa and immigration matters.' },
]

const INIT_COMMUNITY_QS = [
  { id: 1, username: 'Anonymous', anon: true, question: 'Does anyone know if the dining halls have halal options?', answers: 12, helpful: 34, time: '2h ago' },
  { id: 2, username: 'Kenji T.', anon: false, initials: 'KT', country: 'Japan', question: 'Best way to travel from Harvard to downtown Boston on weekends?', answers: 8, helpful: 21, time: '5h ago' },
  { id: 3, username: 'Sofia R.', anon: false, initials: 'SR', country: 'Germany', question: 'Is there a community for European students? Looking to connect!', answers: 6, helpful: 19, time: '1d ago' },
  { id: 4, username: 'Anonymous', anon: true, question: 'Any advice for managing culture shock in the first few weeks?', answers: 23, helpful: 67, time: '2d ago' },
]

const INIT_POSTS = [
  { id: 1, username: 'Mei Lin',  initials: 'ML', avatarBg: 'linear-gradient(135deg, #FFD6B0, #FF9A3C)', img: 'https://picsum.photos/seed/harvard1/400/320', imgH: 200, text: 'Just arrived at Harvard! The campus is absolutely beautiful.', likes: 42 },
  { id: 2, username: 'Lucas M.', initials: 'LM', avatarBg: 'linear-gradient(135deg, #B8FFD0, #3CB87A)', img: 'https://picsum.photos/seed/coffee2/400/420',  imgH: 260, text: 'Best coffee on campus is at the Science Center. Trust me.', likes: 87 },
  { id: 3, username: 'Priya S.', initials: 'PS', avatarBg: 'linear-gradient(135deg, #B8D8FF, #5599EE)', img: 'https://picsum.photos/seed/student3/400/290', imgH: 180, text: 'Got my student ID and bank account sorted! DM me if you need help.', likes: 134 },
  { id: 4, username: 'Ji-ho P.', initials: 'JP', avatarBg: 'linear-gradient(135deg, #F0C8FF, #CC66FF)', img: 'https://picsum.photos/seed/campus4/400/370', imgH: 230, text: 'Harvard Yard at sunrise — found the perfect quiet spot.', likes: 56 },
  { id: 5, username: 'Omar K.',  initials: 'OK', avatarBg: 'linear-gradient(135deg, #FFE0B0, #FF8C00)', img: 'https://picsum.photos/seed/yard5/400/340',   imgH: 210, text: 'Harvard Yard in the morning light is something else entirely.', likes: 203 },
  { id: 6, username: 'Sofia R.', initials: 'SR', avatarBg: 'linear-gradient(135deg, #FFB8C8, #EE4466)', img: 'https://picsum.photos/seed/group6/400/270',  imgH: 170, text: 'Found the European Students group — so nice to meet everyone!', likes: 78 },
]

// ── Root ─────────────────────────────────────────────────────────────────────

export default function PostFeed({ view = 'feed', onShowFAQ, userPosts = [], onNewPost, user = {} }) {
  return (
    <div className="fade-in">
      {view === 'faq'  && <FAQView />}
      {view === 'cq'   && <CommunityQView onShowFAQ={onShowFAQ} />}
      {view === 'feed' && <FeedView userPosts={userPosts} onNewPost={onNewPost} user={user} />}
    </div>
  )
}

// ── Sub-view: Common Questions (FAQ) ─────────────────────────────────────────

function FAQView() {
  const [expanded, setExpanded] = useState(null)
  return (
    <>
      <PageHeader
        title="Common Questions"
        icon={<PinIcon size={18} color="var(--orange)" />}
      />
      <div style={{ padding: '14px 12px 100px' }}>
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                style={{
                  width: '100%', textAlign: 'left', padding: '15px 16px',
                  background: expanded === i ? '#FFFBF0' : 'none',
                  border: 'none', cursor: 'pointer',
                  borderBottom: i < FAQS.length - 1 || expanded === i ? '1px solid var(--border)' : 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{faq.q}</span>
                <div style={{ transition: 'transform 0.2s', transform: expanded === i ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
                  <ChevronDownIcon size={15} color="var(--orange)" />
                </div>
              </button>
              {expanded === i && (
                <div style={{
                  padding: '4px 16px 14px', fontSize: 13, color: 'var(--text-secondary)',
                  lineHeight: 1.7, background: '#FFFBF0',
                  borderBottom: i < FAQS.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Sub-view: Community Questions ────────────────────────────────────────────

function CommunityQView({ onShowFAQ }) {
  const [questions, setQuestions] = useState(INIT_COMMUNITY_QS)
  const [search, setSearch] = useState('')
  const [showAsk, setShowAsk] = useState(false)
  const [draft, setDraft] = useState('')

  const filtered = questions.filter(q =>
    !search || q.question.toLowerCase().includes(search.toLowerCase())
  )

  const submit = () => {
    if (!draft.trim()) return
    setQuestions(prev => [{
      id: Date.now(), username: 'You', anon: false, initials: 'ME', country: '',
      question: draft.trim(), answers: 0, helpful: 0, time: 'Just now',
    }, ...prev])
    setDraft('')
    setShowAsk(false)
  }

  return (
    <>
      <PageHeader
        title="Community Questions"
        icon={<MessageIcon size={18} color="var(--orange)" />}
        action={<button onClick={() => setShowAsk(true)} style={smallBtn}>+ Ask</button>}
      />

      {/* Common Questions shortcut */}
      {onShowFAQ && (
        <div style={{ padding: '10px 12px 0' }}>
          <button
            onClick={onShowFAQ}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              background: 'linear-gradient(135deg, #FFF8ED, #FFF0D4)',
              border: '1.5px solid #FFE0A0', borderRadius: 14,
              padding: '12px 16px', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: '#FF9A3C22', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PinIcon size={18} color="#FF9A3C" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>Common Questions</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>FAQs & resources for international students</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9A3C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}

      {/* Search bar */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search questions…"
      />

      <div style={{ padding: '12px 12px 100px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#AAAAAA', fontSize: 14 }}>
            No questions match your search.
          </div>
        )}
        {filtered.map((q, i) => (
          <div key={q.id} className="fade-in" style={{
            background: '#fff', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)', padding: 16, marginBottom: 12,
            animationDelay: `${i * 0.05}s`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              {q.anon
                ? <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#EFEFEF', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserIcon size={17} color="#AAAAAA" />
                  </div>
                : <Avatar name={q.username} size={34} bg="linear-gradient(135deg, #FFC94A, #FF9A3C)" />
              }
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{q.username}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {q.country ? `${q.country} · ` : ''}{q.time}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{q.question}</p>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MessageIcon size={14} color="#BBBBBB" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{q.answers} answers</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <ThumbsUpIcon size={14} color="#BBBBBB" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{q.helpful} helpful</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {showAsk && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 300 }}
          onClick={e => e.target === e.currentTarget && setShowAsk(false)}
        >
          <div className="slide-up" style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430, padding: 24, paddingBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 17, fontWeight: 800 }}>Ask a Question</span>
              <button onClick={() => setShowAsk(false)} style={iconBtn}><CloseIcon size={20} color="#4A4A4A" /></button>
            </div>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="What would you like to know?"
              style={{ width: '100%', minHeight: 120, padding: 14, border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 15, lineHeight: 1.6, outline: 'none', fontFamily: 'inherit', resize: 'none', marginBottom: 16 }}
            />
            <button
              onClick={submit}
              disabled={!draft.trim()}
              style={{ width: '100%', padding: 14, background: draft.trim() ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : 'var(--border)', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: draft.trim() ? 'pointer' : 'default' }}
            >
              Post Question
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Harvard locations for tagging ────────────────────────────────────────────
const HARVARD_LOCATIONS = [
  { name: 'Harvard Yard',                   lat: 42.3770,  lng: -71.1167 },
  { name: 'Widener Library',                lat: 42.3768,  lng: -71.1165 },
  { name: 'Science Center',                 lat: 42.3783,  lng: -71.1163 },
  { name: 'Smith Campus Center',            lat: 42.3750,  lng: -71.1190 },
  { name: 'Memorial Church',                lat: 42.3773,  lng: -71.1161 },
  { name: 'Annenberg Hall',                 lat: 42.3772,  lng: -71.1162 },
  { name: 'Harvard Square',                 lat: 42.3732,  lng: -71.1201 },
  { name: 'Charles River',                  lat: 42.3685,  lng: -71.1244 },
  { name: 'Lamont Library',                 lat: 42.3765,  lng: -71.1168 },
  { name: 'Harvard Museum of Natural History', lat: 42.3787, lng: -71.1155 },
  { name: 'Adams House',                    lat: 42.3740,  lng: -71.1178 },
  { name: 'Quincy House',                   lat: 42.3729,  lng: -71.1192 },
  { name: 'Winthrop House',                 lat: 42.3724,  lng: -71.1198 },
  { name: 'Eliot House',                    lat: 42.3721,  lng: -71.1224 },
  { name: 'Kirkland House',                 lat: 42.3714,  lng: -71.1218 },
  { name: 'Dunster House',                  lat: 42.3701,  lng: -71.1215 },
  { name: 'Mather House',                   lat: 42.3682,  lng: -71.1205 },
  { name: 'Cabot House',                    lat: 42.3847,  lng: -71.1183 },
  { name: 'Harvard Stadium',                lat: 42.3660,  lng: -71.1265 },
]

// ── Location helpers ─────────────────────────────────────────────────────────
function nearestLocationName(lat, lng) {
  let best = null, bestDist = Infinity
  for (const loc of HARVARD_LOCATIONS) {
    const d = Math.hypot(loc.lat - lat, loc.lng - lng)
    if (d < bestDist) { bestDist = d; best = loc }
  }
  return bestDist < 0.003 ? best.name : 'Custom location'
}

const pickerIcon = L.divIcon({
  html: `<div style="
    width:32px;height:32px;border-radius:50%;
    background:linear-gradient(135deg,#FFC94A,#FF9A3C);
    border:3px solid #fff;
    box-shadow:0 3px 14px rgba(255,154,60,0.6);
    display:flex;align-items:center;justify-content:center;
    font-size:16px;
  ">📍</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

function MapTapHandler({ onTap }) {
  useMapEvents({ click: (e) => onTap([e.latlng.lat, e.latlng.lng]) })
  return null
}

function LocationPickerModal({ initialPin, onConfirm, onClose }) {
  const defaultCenter = [42.3755, -71.1175]
  const [pin, setPin] = useState(initialPin ?? defaultCenter)
  const markerRef = useRef(null)

  const handleDragEnd = () => {
    const latlng = markerRef.current?.getLatLng()
    if (latlng) setPin([latlng.lat, latlng.lng])
  }

  const confirm = () => {
    onConfirm({ lat: pin[0], lng: pin[1], name: nearestLocationName(pin[0], pin[1]) })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600 }}>
      {/* Map fills the full screen */}
      <MapContainer
        center={defaultCenter}
        zoom={15}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapTapHandler onTap={setPin} />
        <Marker
          position={pin}
          icon={pickerIcon}
          draggable
          ref={markerRef}
          eventHandlers={{ dragend: handleDragEnd }}
        />
      </MapContainer>

      {/* ── Top bar (absolute over map) ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
      }}>
        <button
          onClick={onClose}
          style={{
            background: '#F0F0F0', border: 'none', borderRadius: 20,
            padding: '8px 14px', fontSize: 13, fontWeight: 700,
            color: '#4A4A4A', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          ← Back
        </button>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#1A1A1A' }}>Tag a Location</span>
        <button
          onClick={confirm}
          style={{
            background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)', border: 'none',
            borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 800,
            color: '#fff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(255,154,60,0.45)',
          }}
        >
          Confirm ✓
        </button>
      </div>

      {/* ── Current location label (absolute, below top bar) ── */}
      <div style={{
        position: 'absolute', top: 64, left: 12, right: 12, zIndex: 1000,
        background: 'rgba(255,251,240,0.95)', backdropFilter: 'blur(6px)',
        borderRadius: 12, padding: '9px 14px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 14 }}>📍</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#7A4600', flex: 1 }}>
          {nearestLocationName(pin[0], pin[1])}
        </span>
        <span style={{ fontSize: 10, color: '#AAAAAA' }}>
          {pin[0].toFixed(4)}, {pin[1].toFixed(4)}
        </span>
      </div>

      {/* ── Hint pill (absolute, bottom) ── */}
      <div style={{
        position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000, pointerEvents: 'none',
        background: 'rgba(26,26,26,0.75)', backdropFilter: 'blur(4px)',
        borderRadius: 20, padding: '8px 18px',
        color: '#fff', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
      }}>
        Tap the map or drag the pin to place it
      </div>
    </div>
  )
}

// ── Sub-view: Community Feed ──────────────────────────────────────────────────

function FeedView({ userPosts = [], onNewPost, user = {} }) {
  const [liked, setLiked] = useState(new Set())
  const [localLikes, setLocalLikes] = useState({})
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const allPosts = [...userPosts, ...INIT_POSTS]

  const toggleLike = (id) => {
    setLiked(prev => {
      const s = new Set(prev)
      const wasLiked = s.has(id)
      wasLiked ? s.delete(id) : s.add(id)
      setLocalLikes(lk => ({ ...lk, [id]: (lk[id] ?? 0) + (wasLiked ? -1 : 1) }))
      return s
    })
  }

  const filtered = allPosts.filter(p =>
    !search || p.text.toLowerCase().includes(search.toLowerCase()) || p.username.toLowerCase().includes(search.toLowerCase())
  )

  const left  = filtered.filter((_, i) => i % 2 === 0)
  const right = filtered.filter((_, i) => i % 2 === 1)

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Community Feed"
        icon={<HeartIcon size={18} color="var(--orange)" />}
        action={<button style={smallBtn} onClick={() => setShowCreate(true)}>+ Post</button>}
      />

      {/* Create post sheet */}
      {showCreate && (
        <CreatePostSheet
          user={user}
          onClose={() => setShowCreate(false)}
          onSubmit={(post) => { onNewPost && onNewPost(post); setShowCreate(false) }}
        />
      )}

      {/* Search bar */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search posts…"
      />

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#AAAAAA', fontSize: 14 }}>
          No posts match your search.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 10px 100px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {left.map((p, i)  => <PostCard key={p.id} post={p} liked={liked.has(p.id)} onLike={toggleLike} delay={i * 0.07} extraLikes={localLikes[p.id] ?? 0} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
          {right.map((p, i) => <PostCard key={p.id} post={p} liked={liked.has(p.id)} onLike={toggleLike} delay={i * 0.07 + 0.04} extraLikes={localLikes[p.id] ?? 0} />)}
        </div>
      </div>
    </>
  )
}

// ── Shared components ─────────────────────────────────────────────────────────

function PageHeader({ title, icon, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px 12px',
      background: '#fff', borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <span style={{ fontSize: 18, fontWeight: 800 }}>{title}</span>
      </div>
      {action}
    </div>
  )
}

function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div style={{
      padding: '10px 12px 8px',
      background: '#fff', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--bg)', borderRadius: 12, padding: '9px 12px',
      }}>
        <SearchIcon size={15} color="#AAAAAA" />
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', fontFamily: 'inherit', color: '#1A1A1A' }}
        />
        {value && (
          <button onClick={() => onChange('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <CloseIcon size={14} color="#AAAAAA" />
          </button>
        )}
      </div>
    </div>
  )
}

function PostCard({ post, liked, onLike, delay, extraLikes = 0 }) {
  const displayLikes = (post.likes ?? 0) + extraLikes
  return (
    <div className="fade-in" style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', animationDelay: `${delay}s` }}>
      {/* Media area */}
      {post.mediaType === 'textcard' ? (
        <div style={{
          width: '100%', minHeight: 100, padding: '14px 10px',
          background: 'linear-gradient(135deg, #FFC94A22, #FF9A3C33)',
          borderBottom: '1px solid #FFE5C0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#7A4600', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
            {post.textContent}
          </p>
        </div>
      ) : post.img ? (
        <img src={post.img} alt="" style={{ width: '100%', height: post.imgH ?? 140, objectFit: 'cover', display: 'block', background: '#F0F0F0' }} loading="lazy" />
      ) : null}
      <div style={{ padding: '9px 10px 10px' }}>
        {post.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: 'var(--orange)', fontWeight: 600 }}>📍 {post.location.name}</span>
          </div>
        )}
        <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text)', marginBottom: 8 }}>{post.text}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Avatar name={post.username} size={20} bg={post.avatarBg} />
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1, fontWeight: 500 }}>{post.username}</span>
          <button onClick={() => onLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <HeartIcon size={14} color={liked ? '#E8415A' : '#BBBBBB'} filled={liked} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{displayLikes}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Create Post Sheet ─────────────────────────────────────────────────────────
const TEXT_CARD_GRADIENTS = [
  'linear-gradient(135deg, #FFC94A, #FF9A3C)',
  'linear-gradient(135deg, #8EC5FC, #E0C3FC)',
  'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
  'linear-gradient(135deg, #f6d365, #fda085)',
  'linear-gradient(135deg, #84fab0, #8fd3f4)',
]

function CreatePostSheet({ user, onClose, onSubmit }) {
  const [mode, setMode] = useState('photo') // 'photo' | 'textcard'
  const [photoPreview, setPhotoPreview] = useState(null)
  const [textContent, setTextContent] = useState('')
  const [gradientIdx, setGradientIdx] = useState(0)
  const [caption, setCaption] = useState('')
  const [pinData, setPinData] = useState(null)   // { lat, lng, name } | null
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef(null)

  const canSubmit = mode === 'photo'
    ? photoPreview && caption.trim()
    : textContent.trim() && caption.trim()

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    const post = {
      id: Date.now(),
      username: user.name ?? 'You',
      avatarBg: '#FFC94A',
      text: caption.trim(),
      likes: 0,
      time: 'just now',
      mediaType: mode,
      img: mode === 'photo' ? photoPreview : null,
      imgH: 140,
      textContent: mode === 'textcard' ? textContent.trim() : null,
      gradientIdx,
      location: pinData,
    }
    onSubmit(post)
  }

  return (
    <>
    {/* Map picker — rendered as sibling so z-index stacking works correctly */}
    {showMapPicker && (
      <LocationPickerModal
        initialPin={pinData ? [pinData.lat, pinData.lng] : null}
        onClose={() => setShowMapPicker(false)}
        onConfirm={(data) => { setPinData(data); setShowMapPicker(false) }}
      />
    )}
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 400 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="slide-up"
        style={{
          background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430,
          height: '88vh', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* ── Fixed header (non-scrolling) ── */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <div style={{ width: 36, height: 4, background: '#E0E0E0', borderRadius: 2 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 14px' }}>
            <span style={{ fontSize: 17, fontWeight: 800 }}>Create Post</span>
            <button onClick={onClose} style={iconBtn}><CloseIcon size={20} color="#4A4A4A" /></button>
          </div>

          {/* Mode toggle */}
          <div style={{ display: 'flex', margin: '0 20px 16px', background: 'var(--bg)', borderRadius: 12, padding: 4 }}>
            {[['photo', '📷  Photo'], ['textcard', '✍️  Text Card']].map(([m, label]) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '9px 0', border: 'none', borderRadius: 9, cursor: 'pointer',
                  background: mode === m ? '#fff' : 'transparent',
                  fontWeight: mode === m ? 800 : 500,
                  fontSize: 13,
                  color: mode === m ? 'var(--orange)' : 'var(--text-secondary)',
                  boxShadow: mode === m ? '0 1px 6px rgba(0,0,0,0.10)' : 'none',
                  transition: 'all 0.15s',
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* ── Scrollable content area ── */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 20px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}>
        <div style={{ paddingBottom: 32 }}>

          {/* ── Photo mode ── */}
          {mode === 'photo' && (
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: '100%', minHeight: 180, borderRadius: 16, marginBottom: 16,
                background: photoPreview ? 'transparent' : '#F5F5F5',
                border: photoPreview ? 'none' : '2px dashed #E0E0E0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden', position: 'relative',
              }}
            >
              {photoPreview
                ? <img src={photoPreview} alt="preview" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block', borderRadius: 14 }} />
                : (
                  <div style={{ textAlign: 'center', color: '#AAAAAA' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Tap to select photo</div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>or take one with your camera</div>
                  </div>
                )
              }
              {photoPreview && (
                <button
                  onClick={e => { e.stopPropagation(); setPhotoPreview(null) }}
                  style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <CloseIcon size={14} color="#fff" />
                </button>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFile} />

          {/* ── Text card mode ── */}
          {mode === 'textcard' && (
            <div style={{ marginBottom: 16 }}>
              {/* Gradient preview */}
              <div style={{
                borderRadius: 16, minHeight: 120, padding: 20, marginBottom: 10,
                background: TEXT_CARD_GRADIENTS[gradientIdx],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.5, textAlign: 'center', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
                  {textContent || 'Your text will appear here…'}
                </p>
              </div>
              {/* Gradient picker */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
                {TEXT_CARD_GRADIENTS.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setGradientIdx(i)}
                    style={{
                      width: 26, height: 26, borderRadius: '50%', background: g, border: 'none', cursor: 'pointer',
                      boxShadow: gradientIdx === i ? '0 0 0 3px var(--orange)' : '0 1px 4px rgba(0,0,0,0.2)',
                    }}
                  />
                ))}
              </div>
              <textarea
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                placeholder="Write something inspiring…"
                maxLength={200}
                style={{ width: '100%', minHeight: 80, padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 14, lineHeight: 1.6, outline: 'none', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {/* Caption */}
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Add a caption…"
            maxLength={300}
            style={{ width: '100%', minHeight: 72, padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 14, lineHeight: 1.6, outline: 'none', fontFamily: 'inherit', resize: 'none', marginBottom: 14, boxSizing: 'border-box' }}
          />

          {/* Location picker */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 15 }}>📍</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#4A4A4A' }}>Tag a location</span>
              <span style={{ fontSize: 11, color: '#AAAAAA', fontWeight: 400 }}>(shows on map)</span>
            </div>
            <button
              onClick={() => setShowMapPicker(true)}
              style={{
                width: '100%', padding: '12px 14px', border: `1.5px solid ${pinData ? 'var(--orange)' : 'var(--border)'}`,
                borderRadius: 12, fontSize: 14, fontFamily: 'inherit', background: pinData ? '#FFFBF0' : '#fff',
                cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                boxSizing: 'border-box', color: pinData ? '#7A4600' : '#AAAAAA',
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{pinData ? '📍' : '🗺️'}</span>
              <span style={{ flex: 1, fontWeight: pinData ? 600 : 400 }}>
                {pinData ? pinData.name : 'Tap to place a pin on the map…'}
              </span>
              {pinData
                ? (
                  <span
                    onClick={e => { e.stopPropagation(); setPinData(null) }}
                    style={{ fontSize: 12, color: '#AAAAAA', flexShrink: 0, padding: '2px 6px', cursor: 'pointer' }}
                  >✕</span>
                )
                : <span style={{ fontSize: 12, color: '#AAAAAA', flexShrink: 0 }}>›</span>
              }
            </button>
            {pinData && (
              <div style={{ marginTop: 4, fontSize: 11, color: '#AAAAAA', paddingLeft: 4 }}>
                {pinData.lat.toFixed(5)}, {pinData.lng.toFixed(5)}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            style={{
              width: '100%', padding: 15, border: 'none', borderRadius: 16,
              background: canSubmit ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : '#F0F0F0',
              color: canSubmit ? '#fff' : '#AAAAAA',
              fontSize: 15, fontWeight: 800, cursor: canSubmit ? 'pointer' : 'default',
              boxShadow: canSubmit ? '0 4px 16px rgba(255,154,60,0.4)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {submitting ? 'Posting…' : 'Share Post'}
          </button>
        </div>
        </div>
      </div>
    </div>
    </>
  )
}

const iconBtn  = { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }
const smallBtn = { fontSize: 12, fontWeight: 700, color: 'var(--orange)', background: '#FFFBF0', border: '1.5px solid var(--yellow)', borderRadius: 20, padding: '5px 12px', cursor: 'pointer' }
