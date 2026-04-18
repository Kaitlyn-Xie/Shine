import { useState } from 'react'
import { SunIcon, SearchIcon, HeartIcon, BookmarkIcon, PlusIcon, CloseIcon, CameraIcon, VideoIcon, PinIcon, ChatIcon, ThumbsUpIcon, MessageIcon, Avatar } from '@/components/Icons'
import { useGetMe } from '@workspace/api-client-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Post {
  id: number
  username: string
  country: string
  initials: string
  avatarBg: string
  img: string
  imgH: number
  text: string
  tags: string[]
  likes: number
}

interface Question {
  id: number
  username: string
  country?: string
  initials: string
  avatarBg?: string
  anonymous: boolean
  time: string
  text: string
  answers: number
  helpful: number
}

interface FAQ {
  id: number
  q: string
  a: string
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_POSTS: Post[] = [
  {
    id: 1, username: 'Mei Lin', country: 'China', initials: 'ML',
    avatarBg: 'linear-gradient(135deg, #FFD6B0, #FF9A3C)',
    img: 'https://picsum.photos/seed/harvard1/400/320', imgH: 200,
    text: "Just arrived at Harvard! The campus is absolutely beautiful. Can't wait to explore everything.",
    tags: ['arrival', 'harvard', 'excited'], likes: 42,
  },
  {
    id: 2, username: 'Lucas M.', country: 'Brazil', initials: 'LM',
    avatarBg: 'linear-gradient(135deg, #B8FFD0, #3CB87A)',
    img: 'https://picsum.photos/seed/coffee2/400/420', imgH: 260,
    text: 'Best coffee on campus is at the Science Center café. Trust me on this one.',
    tags: ['tips', 'food', 'studylife'], likes: 87,
  },
  {
    id: 3, username: 'Priya S.', country: 'India', initials: 'PS',
    avatarBg: 'linear-gradient(135deg, #B8D8FF, #5599EE)',
    img: 'https://picsum.photos/seed/student3/400/290', imgH: 180,
    text: 'Got my student ID and bank account sorted in one day! DM me if you need help navigating the admin stuff.',
    tags: ['admin', 'banking', 'studentid'], likes: 134,
  },
  {
    id: 4, username: 'Ji-ho P.', country: 'South Korea', initials: 'JP',
    avatarBg: 'linear-gradient(135deg, #F0C8FF, #CC66FF)',
    img: 'https://picsum.photos/seed/campus4/400/370', imgH: 230,
    text: 'The scavenger hunt was incredible. Our team found every hidden spot on campus!',
    tags: ['scavengerhunt', 'team', 'campus'], likes: 56,
  },
  {
    id: 5, username: 'Omar K.', country: 'Egypt', initials: 'OK',
    avatarBg: 'linear-gradient(135deg, #FFE0B0, #FF8C00)',
    img: 'https://picsum.photos/seed/yard5/400/340', imgH: 210,
    text: 'Harvard Yard in the morning light is something else entirely. 6am walks are now a ritual.',
    tags: ['harvardyard', 'morning', 'vibes'], likes: 203,
  },
  {
    id: 6, username: 'Sofia R.', country: 'Germany', initials: 'SR',
    avatarBg: 'linear-gradient(135deg, #FFB8C8, #EE4466)',
    img: 'https://picsum.photos/seed/group6/400/270', imgH: 170,
    text: 'Found the European Students group — so nice to meet everyone from home regions!',
    tags: ['europeans', 'community', 'friends'], likes: 78,
  },
]

const SEED_QUESTIONS: Question[] = [
  { id: 1, username: 'Anonymous', initials: 'A', anonymous: true, time: '2h ago', text: 'Does anyone know if the dining halls have halal options?', answers: 12, helpful: 34 },
  { id: 2, username: 'Kenji T.', country: 'Japan', initials: 'KT', avatarBg: 'linear-gradient(135deg, #FFD6B0, #FF9A3C)', anonymous: false, time: '5h ago', text: 'Best way to travel from Harvard to downtown Boston on weekends?', answers: 8, helpful: 21 },
  { id: 3, username: 'Sofia R.', country: 'Germany', initials: 'SR', avatarBg: 'linear-gradient(135deg, #FFB8C8, #EE4466)', anonymous: false, time: '1d ago', text: 'Is there a community for European students? Looking to connect!', answers: 6, helpful: 19 },
  { id: 4, username: 'Anonymous', initials: 'A', anonymous: true, time: '2d ago', text: 'Any advice for managing culture shock in the first few weeks?', answers: 23, helpful: 67 },
  { id: 5, username: 'Mei Lin', country: 'China', initials: 'ML', avatarBg: 'linear-gradient(135deg, #FFD6B0, #FF9A3C)', anonymous: false, time: '3d ago', text: 'How do I set up a US bank account as an international student?', answers: 15, helpful: 44 },
]

const SEED_FAQS: FAQ[] = [
  { id: 1, q: 'Do I need a US bank account?', a: 'Yes — most on-campus transactions, scholarships, and stipends are deposited to a US account. Bank of America and Citizens Bank both have branches near Harvard Square and offer student accounts.' },
  { id: 2, q: 'How do I get my Harvard ID?', a: 'Visit the Harvard ID Services office in Holyoke Center (Smith Campus Center, 1350 Massachusetts Ave) with your passport and admission letter. Usually takes 15 minutes.' },
  { id: 3, q: 'Is there a shuttle between dorms and campus?', a: 'Yes! The Harvard Shuttle (Crimson Cruiser) runs between major dorms and the main campus. Download the TransLoc app to track real-time shuttle locations.' },
  { id: 4, q: 'Can I work on campus as an international student?', a: 'F-1 visa holders may work on-campus up to 20 hours/week during the semester. Check with the Harvard International Office (HIO) for specific eligibility and restrictions.' },
  { id: 5, q: 'What health insurance do I need?', a: 'Harvard requires all students to have health insurance. Most international students use the Harvard Student Health Insurance Plan (SHIP) automatically. You can waive it if you have comparable coverage.' },
  { id: 6, q: 'How do I get a US phone number?', a: "T-Mobile and AT&T offer prepaid SIM cards without a US credit history. The Harvard Coop also sells SIM cards. Google Fi is popular with international students for its international features." },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
      <img src={post.img} alt="" style={{ width: '100%', height: post.imgH, objectFit: 'cover', display: 'block' }} />
      <div style={{ padding: '14px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Avatar name={post.username} size={36} bg={post.avatarBg} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{post.username}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>🌍 {post.country}</div>
          </div>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)', marginBottom: 10 }}>{post.text}</p>
        {post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {post.tags.map(tag => (
              <span key={tag} style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600 }}>#{tag}</span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => { setLiked(!liked); setLikeCount(c => liked ? c - 1 : c + 1) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <HeartIcon size={18} color={liked ? '#EE4466' : '#9A9A9A'} filled={liked} />
            <span style={{ fontSize: 13, color: liked ? '#EE4466' : 'var(--text-secondary)', fontWeight: liked ? 700 : 400 }}>{likeCount}</span>
          </button>
          <button onClick={() => setSaved(!saved)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <BookmarkIcon size={18} color={saved ? '#FFC94A' : '#9A9A9A'} filled={saved} />
          </button>
        </div>
      </div>
    </div>
  )
}

function QuestionCard({ q }: { q: Question }) {
  const [helpful, setHelpful] = useState(q.helpful)
  const [voted, setVoted] = useState(false)

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        {q.anonymous ? (
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        ) : (
          <Avatar name={q.username} size={38} bg={q.avatarBg} />
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{q.username}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {q.country ? `${q.country} · ` : ''}{q.time}
          </div>
        </div>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text)', marginBottom: 12 }}>{q.text}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <MessageIcon size={14} color="var(--text-secondary)" />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{q.answers} answers</span>
        </div>
        <button
          onClick={() => { if (!voted) { setHelpful(h => h + 1); setVoted(true) } }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: voted ? 'default' : 'pointer', padding: 0 }}
        >
          <ThumbsUpIcon size={14} color={voted ? 'var(--orange)' : 'var(--text-secondary)'} />
          <span style={{ fontSize: 12, color: voted ? 'var(--orange)' : 'var(--text-secondary)', fontWeight: voted ? 700 : 400 }}>{helpful} helpful</span>
        </button>
      </div>
    </div>
  )
}

function FAQCard({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: 10 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4, paddingRight: 12 }}>{faq.q}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {faq.a}
        </p>
      )}
    </div>
  )
}

function CreatePostSheet({ onClose, onSubmit }: { onClose: () => void; onSubmit: (p: Post) => void }) {
  const [text, setText] = useState('')
  const [tags, setTags] = useState('')

  const handleSubmit = () => {
    if (!text.trim()) return
    const seed = Date.now()
    onSubmit({
      id: seed, username: 'You', country: 'Your Country', initials: 'ME',
      avatarBg: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
      img: `https://picsum.photos/seed/${seed}/400/320`, imgH: 200,
      text: text.trim(),
      tags: tags.split(' ').filter(t => t.startsWith('#')).map(t => t.slice(1)),
      likes: 0,
    })
  }

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }}>
      <div className="slide-up" style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430, padding: 24, paddingBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800 }}>Share with the community</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <CloseIcon size={20} color="#4A4A4A" />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <Avatar name="Me" size={38} />
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Share something with the community..."
            autoFocus
            style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: 15, lineHeight: 1.6, color: 'var(--text)', background: 'transparent', minHeight: 100, fontFamily: 'inherit' }} />
        </div>
        <div style={{ border: '1.5px solid var(--border)', borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', padding: 0 }}>
              <CameraIcon size={18} color="var(--text-secondary)" /> Photo
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', padding: 0 }}>
              <VideoIcon size={18} color="var(--text-secondary)" /> Video
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', padding: 0 }}>
              <PinIcon size={18} color="var(--text-secondary)" /> Location
            </button>
          </div>
        </div>
        <input value={tags} onChange={e => setTags(e.target.value)}
          placeholder="Add tags, e.g. #harvard #tips #arrival"
          style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 12, padding: '10px 14px', fontSize: 14, color: 'var(--text)', background: 'transparent', outline: 'none', marginBottom: 20, boxSizing: 'border-box' }} />
        <button onClick={handleSubmit}
          style={{ width: '100%', background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)', border: 'none', borderRadius: 14, padding: '14px 0', fontSize: 16, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,154,60,0.35)' }}>
          Post
        </button>
      </div>
    </div>
  )
}

function AskQuestionSheet({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState('')
  const [anon, setAnon] = useState(false)
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }}>
      <div className="slide-up" style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430, padding: 24, paddingBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800 }}>Ask the community</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <CloseIcon size={20} color="#4A4A4A" />
          </button>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="What would you like to ask?"
          autoFocus
          style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 14, padding: '12px 14px', fontSize: 15, lineHeight: 1.6, color: 'var(--text)', background: 'transparent', outline: 'none', resize: 'none', minHeight: 120, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 16 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, cursor: 'pointer' }}>
          <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--orange)' }} />
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Post anonymously</span>
        </label>
        <button
          style={{ width: '100%', background: text.trim() ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : '#E8E8E8', border: 'none', borderRadius: 14, padding: '14px 0', fontSize: 16, fontWeight: 700, color: text.trim() ? '#fff' : '#9A9A9A', cursor: text.trim() ? 'pointer' : 'default', transition: 'all 0.2s' }}
          onClick={() => text.trim() && onClose()}
        >
          Ask
        </button>
      </div>
    </div>
  )
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type Tab = 'feed' | 'questions' | 'faqs'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'feed',      label: 'Community Feed',      icon: '💚' },
  { id: 'questions', label: 'Community Questions',  icon: '💬' },
  { id: 'faqs',      label: 'Common Questions',     icon: '📌' },
]

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Home() {
  const { data: user } = useGetMe({ query: { retry: false } })
  const [tab, setTab] = useState<Tab>('feed')
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS)
  const [showCreate, setShowCreate] = useState(false)
  const [showAsk, setShowAsk] = useState(false)
  const [search, setSearch] = useState('')

  const addPost = (post: Post) => { setPosts(prev => [post, ...prev]); setShowCreate(false) }

  const filteredQuestions = SEED_QUESTIONS.filter(q =>
    !search || q.text.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fade-in" style={{ background: 'var(--bg)', minHeight: '100%' }}>

      {/* ── Sticky header ── */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="sun-pulse"><SunIcon size={22} color="#FFC94A" /></div>
            <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>SHINE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <SearchIcon size={20} color="#4A4A4A" />
            </button>
            {user && <Avatar name={user.displayName || 'U'} size={32} />}
          </div>
        </div>

        {/* Tab row */}
        <div style={{ display: 'flex', gap: 0, padding: '10px 16px 0', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSearch('') }}
              style={{
                flexShrink: 0,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 14px',
                fontSize: 13, fontWeight: tab === t.id ? 800 : 500,
                color: tab === t.id ? 'var(--orange)' : 'var(--text-secondary)',
                borderBottom: tab === t.id ? '2.5px solid var(--orange)' : '2.5px solid transparent',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Community Feed ── */}
      {tab === 'feed' && (
        <>
          {user && (
            <div style={{ padding: '12px 20px 4px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #FFF9ED, #FFF3D4)', border: '1.5px solid #FFE8A0', borderRadius: 20, padding: '6px 14px' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange)' }}>Welcome, {user.displayName}! 👋</span>
              </div>
            </div>
          )}
          <div style={{ padding: '14px 16px 80px' }}>
            {posts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
          <button onClick={() => setShowCreate(true)}
            style={{ position: 'fixed', bottom: 88, right: 16, width: 48, height: 48, background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(255,154,60,0.45)', zIndex: 100 }}>
            <PlusIcon size={22} color="#fff" />
          </button>
          {showCreate && <CreatePostSheet onClose={() => setShowCreate(false)} onSubmit={addPost} />}
        </>
      )}

      {/* ── Community Questions ── */}
      {tab === 'questions' && (
        <div style={{ padding: '16px 16px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ChatIcon size={20} color="var(--orange)" />
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>Community Questions</span>
            </div>
            <button onClick={() => setShowAsk(true)}
              style={{ background: 'none', border: '1.5px solid var(--orange)', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 700, color: 'var(--orange)', cursor: 'pointer' }}>
              + Ask
            </button>
          </div>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <SearchIcon size={16} color="#9A9A9A" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search questions..."
              style={{ width: '100%', background: '#F5F5F5', border: 'none', borderRadius: 12, padding: '11px 14px 11px 38px', fontSize: 14, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {filteredQuestions.map(q => <QuestionCard key={q.id} q={q} />)}
          {showAsk && <AskQuestionSheet onClose={() => setShowAsk(false)} />}
        </div>
      )}

      {/* ── Common Questions (FAQs) ── */}
      {tab === 'faqs' && (
        <div style={{ padding: '16px 16px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <PinIcon size={20} color="var(--orange)" />
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>Common Questions</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>FAQs for international students — tap to expand.</p>
          {SEED_FAQS.map(faq => <FAQCard key={faq.id} faq={faq} />)}
        </div>
      )}

    </div>
  )
}
