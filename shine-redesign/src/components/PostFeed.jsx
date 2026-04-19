import { useState } from 'react'
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

export default function PostFeed({ view = 'feed', onShowFAQ }) {
  return (
    <div className="fade-in">
      {view === 'faq'  && <FAQView />}
      {view === 'cq'   && <CommunityQView onShowFAQ={onShowFAQ} />}
      {view === 'feed' && <FeedView />}
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
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>FAQs for international students</div>
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

// ── Sub-view: Community Feed ──────────────────────────────────────────────────

function FeedView({ onCreatePost }) {
  const [liked, setLiked] = useState(new Set())
  const [posts, setPosts] = useState(INIT_POSTS)
  const [search, setSearch] = useState('')

  const toggleLike = (id) => {
    const wasLiked = liked.has(id)
    setLiked(prev => { const s = new Set(prev); wasLiked ? s.delete(id) : s.add(id); return s })
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + (wasLiked ? -1 : 1) } : p))
  }

  const filtered = posts.filter(p =>
    !search || p.text.toLowerCase().includes(search.toLowerCase()) || p.username.toLowerCase().includes(search.toLowerCase())
  )

  const left  = filtered.filter((_, i) => i % 2 === 0)
  const right = filtered.filter((_, i) => i % 2 === 1)

  return (
    <>
      {/* Header — search icon replaced by +Post button */}
      <PageHeader
        title="Community Feed"
        icon={<HeartIcon size={18} color="var(--orange)" />}
        action={<button style={smallBtn}>+ Post</button>}
      />

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
          {left.map((p, i)  => <PostCard key={p.id} post={p} liked={liked.has(p.id)} onLike={toggleLike} delay={i * 0.07} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
          {right.map((p, i) => <PostCard key={p.id} post={p} liked={liked.has(p.id)} onLike={toggleLike} delay={i * 0.07 + 0.04} />)}
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

function PostCard({ post, liked, onLike, delay }) {
  return (
    <div className="fade-in" style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', animationDelay: `${delay}s` }}>
      <img src={post.img} alt="" style={{ width: '100%', height: post.imgH, objectFit: 'cover', display: 'block', background: '#F0F0F0' }} loading="lazy" />
      <div style={{ padding: '9px 10px 10px' }}>
        <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text)', marginBottom: 8 }}>{post.text}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Avatar name={post.username} size={20} bg={post.avatarBg} />
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1, fontWeight: 500 }}>{post.username}</span>
          <button onClick={() => onLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <HeartIcon size={14} color={liked ? '#E8415A' : '#BBBBBB'} filled={liked} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{post.likes}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const iconBtn  = { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }
const smallBtn = { fontSize: 12, fontWeight: 700, color: 'var(--orange)', background: '#FFFBF0', border: '1.5px solid var(--yellow)', borderRadius: 20, padding: '5px 12px', cursor: 'pointer' }
