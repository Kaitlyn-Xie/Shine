import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../lib/api'
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

export default function PostFeed({ view = 'feed', onShowFAQ, userPosts = [], onNewPost, user = {}, sunlightPosts = [], onNewSunlightPost, onEditSunlightPost }) {
  const questionPosts = sunlightPosts.filter(p => p.type === 'question')
  return (
    <div className="fade-in">
      {view === 'faq'  && <FAQView />}
      {view === 'cq'   && <CommunityQView onShowFAQ={onShowFAQ} questionPosts={questionPosts} onNewQuestion={onNewSunlightPost} onEditSunlightPost={onEditSunlightPost} user={user} />}
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

// ── Ask Question Sheet ────────────────────────────────────────────────────────

const QC = '#5599EE'
const QL = '#EEF4FF'

function AskQuestionSheet({ onClose, onSubmit }) {
  const [anon, setAnon] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [location, setLocation] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const canPost = title.trim().length > 2

  const handleSubmit = () => {
    if (!canPost) return
    onSubmit({ title: title.trim(), body: body.trim(), location, isAnonymous: anon })
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 300 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="slide-up" style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Drag handle */}
        <div style={{ width: 40, height: 4, background: '#E0E0E0', borderRadius: 2, margin: '12px auto 0' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 17, fontWeight: 800 }}>Ask a Question</span>
          <button onClick={onClose} style={iconBtn}><CloseIcon size={20} color="#4A4A4A" /></button>
        </div>

        {/* Anonymous toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', background: anon ? '#F8F8F8' : '#fff' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>Ask anonymously</div>
            <div style={{ fontSize: 12, color: '#AAAAAA' }}>Your name won't be visible to others</div>
          </div>
          <button
            onClick={() => setAnon(v => !v)}
            style={{
              width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
              background: anon ? QC : '#D0D0D0', transition: 'background 0.2s', position: 'relative', flexShrink: 0,
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3, left: anon ? 23 : 3, transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px 32px' }}>
          <textarea
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What would you like to know?"
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

          {/* Location picker */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4A4A4A', marginBottom: 8 }}>
              📍 Tag a location <span style={{ fontWeight: 400, color: '#AAAAAA' }}>(optional — shows on map)</span>
            </div>
            {location && !showMap && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: QL, border: `1.5px solid ${QC}30`, borderRadius: 10, padding: '8px 12px', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: QC, flex: 1 }}>📍 {location.name}</span>
                <button onClick={() => setLocation(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#AAAAAA', padding: 0 }}>✕</button>
              </div>
            )}
            {showMap
              ? <InlineMapPicker onConfirm={loc => { setLocation(loc); setShowMap(false) }} onCancel={() => setShowMap(false)} />
              : (
                <button
                  onClick={() => setShowMap(true)}
                  style={{ width: '100%', padding: '10px 14px', background: '#F8F8F8', border: '1.5px dashed #D0D0D0', borderRadius: 12, fontSize: 13, color: '#888', cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box' }}
                >
                  {location ? '📍 Change location' : '🗺 Drop a pin on the map'}
                </button>
              )
            }
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canPost}
            style={{
              width: '100%', padding: 14, border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: canPost ? 'pointer' : 'default',
              background: canPost ? `linear-gradient(135deg, ${QC}, #3377CC)` : 'var(--border)', color: canPost ? '#fff' : '#AAAAAA',
            }}
          >
            Post Question
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Question Card ─────────────────────────────────────────────────────────────

function EditQuestionSheet({ q, onClose, onSave }) {
  const [title, setTitle] = useState(q.title || '')
  const [body, setBody] = useState(q.body || '')
  const [anon, setAnon] = useState(q.isAnonymous || false)
  const [saving, setSaving] = useState(false)
  const canSave = title.trim().length > 2

  const handleSave = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      await onSave({ title: title.trim(), body: body.trim(), isAnonymous: anon })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 300 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="slide-up" style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 40, height: 4, background: '#E0E0E0', borderRadius: 2, margin: '12px auto 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 17, fontWeight: 800 }}>Edit Question</span>
          <button onClick={onClose} style={iconBtn}><CloseIcon size={20} color="#4A4A4A" /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', background: anon ? '#F8F8F8' : '#fff' }}>
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

function QuestionCard({ q, liked, onLike, expanded, onToggle, answers, answerDraft, onDraftChange, onAnswer, answerAnon, onAnswerAnonChange, onEdit }) {
  return (
    <div className="fade-in" style={{ background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow)', marginBottom: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 14px 0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {q.isAnonymous
          ? <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFEFEF', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserIcon size={17} color="#AAAAAA" /></div>
          : <Avatar name={q.username} size={36} bg="linear-gradient(135deg, #B8D4FF, #5599EE)" />
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{q.username}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{q.time}</div>
        </div>
        {q.location && (
          <span style={{ fontSize: 10, color: QC, background: QL, padding: '3px 8px', borderRadius: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
            📍 {q.location.label || q.location.name}
          </span>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              background: '#EEF4FF', border: 'none', cursor: 'pointer',
              padding: '4px 10px', borderRadius: 8, flexShrink: 0,
              fontSize: 11, fontWeight: 700, color: QC,
            }}
          >
            Edit
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '10px 14px 0' }}>
        <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.55, margin: '0 0 4px' }}>{q.title || q.question}</p>
        {q.body && <p style={{ fontSize: 13, color: '#555', lineHeight: 1.55, margin: 0 }}>{q.body}</p>}
      </div>

      {/* Action row */}
      <div style={{ padding: '10px 14px 14px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <button
          onClick={onLike}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? '#E8415A' : 'none'} stroke={liked ? '#E8415A' : '#BBBBBB'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span style={{ fontSize: 12, color: liked ? '#E8415A' : '#AAAAAA', fontWeight: liked ? 700 : 400 }}>
            {(q.likes ?? 0) + (liked ? 1 : 0)}
          </span>
        </button>

        <button
          onClick={onToggle}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <MessageIcon size={15} color={expanded ? QC : '#BBBBBB'} />
          <span style={{ fontSize: 12, color: expanded ? QC : '#AAAAAA', fontWeight: expanded ? 700 : 400 }}>
            {answers.length > 0 ? `${answers.length} answer${answers.length !== 1 ? 's' : ''}` : 'Answer'}
          </span>
        </button>
      </div>

      {/* Expanded answers */}
      {expanded && (
        <div style={{ background: QL, borderTop: `1px solid ${QC}22`, padding: '14px' }}>
          {answers.length === 0 && (
            <div style={{ textAlign: 'center', color: '#AAAAAA', fontSize: 13, paddingBottom: 10 }}>
              No answers yet. Be the first!
            </div>
          )}
          {answers.map(a => (
            <div key={a.id} style={{ marginBottom: 10, padding: '10px 12px', background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                {a.isAnonymous
                  ? <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#EFEFEF', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserIcon size={12} color="#AAAAAA" /></div>
                  : <Avatar name={a.username} size={26} bg="linear-gradient(135deg, #B8D4FF, #5599EE)" />
                }
                <span style={{ fontWeight: 700, fontSize: 12 }}>{a.username}</span>
                <span style={{ fontSize: 11, color: '#AAAAAA', marginLeft: 'auto' }}>{a.time}</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.55, margin: 0, color: '#333' }}>{a.body}</p>
            </div>
          ))}

          {/* Anonymous answer toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <button
              onClick={() => onAnswerAnonChange(!answerAnon)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
                cursor: 'pointer', padding: 0, fontSize: 11, color: answerAnon ? QC : '#AAAAAA', fontWeight: answerAnon ? 700 : 400,
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                border: `2px solid ${answerAnon ? QC : '#CCCCCC'}`,
                background: answerAnon ? QC : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {answerAnon && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
              </div>
              Reply anonymously
            </button>
          </div>

          {/* Answer input */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={answerDraft}
              onChange={e => onDraftChange(e.target.value)}
              placeholder="Write your answer…"
              style={{ flex: 1, padding: '10px 12px', border: `1.5px solid ${QC}44`, borderRadius: 12, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff' }}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), onAnswer())}
            />
            <button
              onClick={onAnswer}
              disabled={!answerDraft.trim()}
              style={{
                padding: '10px 14px', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: answerDraft.trim() ? 'pointer' : 'default',
                background: answerDraft.trim() ? QC : '#E0E0E0', color: answerDraft.trim() ? '#fff' : '#AAAAAA',
              }}
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-view: Community Questions ────────────────────────────────────────────

function CommunityQView({ onShowFAQ, questionPosts = [], onNewQuestion, onEditSunlightPost, user = {} }) {
  const [search, setSearch] = useState('')
  const [showAsk, setShowAsk] = useState(false)
  const [liked, setLiked] = useState(new Set())
  const [expanded, setExpanded] = useState(null)
  const [answers, setAnswers] = useState({})
  const [answerDrafts, setAnswerDrafts] = useState({})
  const [answerAnons, setAnswerAnons] = useState({})
  const [editingQ, setEditingQ] = useState(null)

  // Normalise static seed questions
  const staticQuestions = INIT_COMMUNITY_QS.map(q => ({
    id: `static-${q.id}`,
    username: q.anon ? 'Anonymous' : q.username,
    isAnonymous: q.anon,
    title: q.question,
    body: null,
    location: null,
    likes: q.helpful,
    time: q.time,
    isStatic: true,
  }))

  // Normalise API-backed questions (newest first)
  const apiQuestions = [...questionPosts].reverse().map(p => ({
    id: p.id,
    dbId: p.dbId,
    userId: p.userId,
    username: p.username,
    isAnonymous: p.isAnonymous,
    title: p.title,
    body: p.body || null,
    location: p.location || null,
    likes: p.likes,
    time: p.time,
    isStatic: false,
  }))

  const allQuestions = [...apiQuestions, ...staticQuestions]
  const filtered = allQuestions.filter(q =>
    !search || (q.title || '').toLowerCase().includes(search.toLowerCase())
  )

  const loadAnswers = async (dbId) => {
    if (answers[dbId] !== undefined) return
    setAnswers(prev => ({ ...prev, [dbId]: [] }))
    try {
      const rows = await api.getQuestionAnswers(dbId)
      setAnswers(prev => ({ ...prev, [dbId]: Array.isArray(rows) ? rows : [] }))
    } catch { /* ignore */ }
  }

  const toggleExpand = (q) => {
    const isOpen = expanded === q.id
    setExpanded(isOpen ? null : q.id)
    if (!isOpen && q.dbId) loadAnswers(q.dbId)
  }

  const toggleLike = async (q) => {
    setLiked(prev => {
      const s = new Set(prev)
      s.has(q.id) ? s.delete(q.id) : s.add(q.id)
      return s
    })
    if (q.dbId) {
      try { await api.likeSunlightPost(q.dbId) } catch { /* ignore */ }
    }
  }

  const submitAnswer = async (q) => {
    const text = (answerDrafts[q.id] || '').trim()
    if (!text) return
    const isAnon = !!answerAnons[q.id]
    const qKey = q.dbId ?? q.id
    const optimistic = {
      id: `opt-${Date.now()}`,
      username: isAnon ? 'Anonymous' : (user.name || 'You'),
      isAnonymous: isAnon,
      body: text,
      likes: 0,
      time: 'Just now',
    }
    setAnswers(prev => ({ ...prev, [qKey]: [...(prev[qKey] ?? []), optimistic] }))
    setAnswerDrafts(prev => ({ ...prev, [q.id]: '' }))
    if (q.dbId) {
      try {
        const saved = await api.postQuestionAnswer(q.dbId, text, isAnon)
        setAnswers(prev => ({
          ...prev,
          [qKey]: (prev[qKey] ?? []).map(a => a.id === optimistic.id ? saved : a),
        }))
      } catch { /* ignore */ }
    }
  }

  const handleAsk = async (data) => {
    if (onNewQuestion) {
      await onNewQuestion({
        type: 'question',
        title: data.title,
        body: data.body || data.title,
        isAnonymous: data.isAnonymous,
        location: data.location
          ? { lat: data.location.lat, lng: data.location.lng, label: data.location.name, name: data.location.name }
          : null,
      })
    }
    setShowAsk(false)
  }

  const handleEditSave = async (data) => {
    if (!editingQ?.dbId) return
    const updated = await api.updateSunlightPost(editingQ.dbId, data)
    if (onEditSunlightPost) onEditSunlightPost(updated)
    setEditingQ(null)
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
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: '#FF9A3C22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

      <SearchBar value={search} onChange={setSearch} placeholder="Search questions…" />

      <div style={{ padding: '12px 12px 100px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#AAAAAA', fontSize: 14 }}>
            No questions match your search.
          </div>
        )}
        {filtered.map(q => (
          <QuestionCard
            key={q.id}
            q={q}
            liked={liked.has(q.id)}
            onLike={() => toggleLike(q)}
            expanded={expanded === q.id}
            onToggle={() => toggleExpand(q)}
            answers={answers[q.dbId ?? q.id] ?? (q.isStatic ? [] : [])}
            answerDraft={answerDrafts[q.id] ?? ''}
            onDraftChange={text => setAnswerDrafts(prev => ({ ...prev, [q.id]: text }))}
            onAnswer={() => submitAnswer(q)}
            answerAnon={!!answerAnons[q.id]}
            onAnswerAnonChange={v => setAnswerAnons(prev => ({ ...prev, [q.id]: v }))}
            onEdit={!q.isStatic && user?.id && q.userId === user.id ? () => setEditingQ(q) : null}
          />
        ))}
      </div>

      {showAsk && createPortal(<AskQuestionSheet onClose={() => setShowAsk(false)} onSubmit={handleAsk} />, document.body)}
      {editingQ && createPortal(<EditQuestionSheet q={editingQ} onClose={() => setEditingQ(null)} onSave={handleEditSave} />, document.body)}
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

function InlineMapPicker({ initialPin, onConfirm, onCancel }) {
  const defaultCenter = [42.3755, -71.1175]
  const [pin, setPin] = useState(initialPin ?? defaultCenter)
  const [locationName, setLocationName] = useState('')
  const markerRef = useRef(null)

  const handleDragEnd = () => {
    const latlng = markerRef.current?.getLatLng()
    if (latlng) setPin([latlng.lat, latlng.lng])
  }

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1.5px solid var(--border)', marginBottom: 12 }}>
      {/* Map — fixed pixel height so Leaflet renders correctly */}
      <div style={{ position: 'relative', height: 220 }}>
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
      </div>

      {/* Controls below the map */}
      <div style={{ background: '#FFFBF0', padding: '12px 14px' }}>
        <div style={{ fontSize: 11, color: '#AAAAAA', marginBottom: 10, textAlign: 'center' }}>
          Tap the map or drag the pin to your exact spot
        </div>

        {/* Name input */}
        <input
          value={locationName}
          onChange={e => setLocationName(e.target.value)}
          placeholder="Name this location (e.g. Widener Library)…"
          style={{
            width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)',
            borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none',
            background: '#fff', marginBottom: 10, boxSizing: 'border-box',
          }}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px 0', border: '1.5px solid var(--border)', borderRadius: 12,
              background: '#fff', fontSize: 13, fontWeight: 700, color: '#4A4A4A', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ lat: pin[0], lng: pin[1], name: locationName.trim() || 'My location' })}
            style={{
              flex: 2, padding: '10px 0', border: 'none', borderRadius: 12,
              background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
              fontSize: 13, fontWeight: 800, color: '#fff', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(255,154,60,0.35)',
            }}
          >
            Use this location ✓
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Weekly Prompts ────────────────────────────────────────────────────────────

const PRE_ARRIVAL_PROMPTS = [
  { category: 'Hometown & Everyday Life', prompt: '"This is home" — Share a photo of a place that feels like home to you (your street, favourite café, room, park) and tell us why it\'s special.' },
  { category: 'Hometown & Everyday Life', prompt: '"Your daily view" — Share a photo taken right outside your window.' },
  { category: 'Hometown & Everyday Life', prompt: '"Local flavor" — Share a photo or recipe of your favourite local dish.' },
  { category: 'Hometown & Everyday Life', prompt: 'Hidden gem — A place in your hometown that isn\'t well-known but you love.' },
  { category: 'Culture & Traditions', prompt: 'Celebration moment — Share a photo from a local celebration or your country\'s public holiday.' },
  { category: 'Culture & Traditions', prompt: 'Casual dress & style — Share a photo of your everyday style.' },
  { category: 'Culture & Traditions', prompt: 'Language — Share a short greeting in your language and teach us how to say it!' },
  { category: 'Culture & Traditions', prompt: 'Story of my name — Explain your name and its origins. How do you pronounce it?' },
  { category: 'Preparing to Say Goodbye', prompt: 'What are you most nervous about before you leave?' },
  { category: 'Preparing to Say Goodbye', prompt: 'What are you most excited about for your time at Harvard?' },
  { category: 'Preparing to Say Goodbye', prompt: 'Bucket list of "lasts" — What do you want to do before you depart?' },
  { category: 'Preparing to Say Goodbye', prompt: 'What expectations or questions do you have about your new experience?' },
  { category: 'Preparing to Say Goodbye', prompt: 'Farewell experience — How are you saying goodbye, and did you receive any special farewell gifts?' },
  { category: 'Preparing to Say Goodbye', prompt: '"What are you bringing from home?" — Share a photo of something that will remind you of home.' },
  { category: 'Preparation Tips', prompt: 'Packing hacks — What\'s the one packing tip you\'d share with everyone?' },
  { category: 'Preparation Tips', prompt: 'Information you\'re checking — What resources are you using to prepare?' },
  { category: 'Preparation Tips', prompt: 'Budgeting & finance — How are you planning your finances for this big move?' },
  { category: 'Preparation Tips', prompt: 'Advice for your future self — What do you wish you could tell yourself once you arrive?' },
  { category: 'Preparation Tips', prompt: 'Support network — What will you do to stay connected and supported while abroad?' },
  { category: 'Journey to Campus', prompt: '"How I got to campus" — Share a photo of the modes of transportation you took to get here.' },
]

const ON_CAMPUS_PROMPTS = [
  { category: 'First Impressions', prompt: 'First day on campus — What was the very first thing you noticed?' },
  { category: 'First Impressions', prompt: 'First meal in the US — What did you eat, and what did you think?' },
  { category: 'First Impressions', prompt: 'Your dorm — Show us your new home!' },
  { category: 'First Impressions', prompt: 'Something that surprised you about campus life.' },
  { category: 'First Impressions', prompt: 'Campus landmark — Share your first visit to a Harvard landmark.' },
  { category: 'First Impressions', prompt: 'An interesting local experience you\'ve had since arriving.' },
  { category: 'New Learning Experiences', prompt: 'Class — Share something interesting from your first week of classes.' },
  { category: 'New Learning Experiences', prompt: 'Study spot — Where do you study best on (or off) campus?' },
  { category: 'New Learning Experiences', prompt: 'Classroom culture — Share something about the teaching style that surprised you.' },
  { category: 'New Learning Experiences', prompt: 'A new subject you\'re learning about that you never studied before.' },
  { category: 'New Learning Experiences', prompt: 'Academic tips — What advice would you give yourself or a future student?' },
  { category: 'New Learning Experiences', prompt: 'Words of encouragement for your fellow international students.' },
  { category: 'Adjusting to American Culture', prompt: 'Your culture shock moment — What caught you most off guard?' },
  { category: 'Adjusting to American Culture', prompt: 'Something familiar you found here that felt like home.' },
  { category: 'Adjusting to American Culture', prompt: 'Something strange about American daily life you\'ve noticed.' },
  { category: 'Adjusting to American Culture', prompt: 'An American habit you\'ve observed.' },
  { category: 'Adjusting to American Culture', prompt: 'A habit of yours that others have noticed or commented on.' },
  { category: 'Adjusting to American Culture', prompt: 'A new or surprising way you\'ve heard a particular English word used.' },
  { category: 'Everyday Moments', prompt: 'Connecting with friends back home — How do you stay in touch?' },
  { category: 'Everyday Moments', prompt: 'Your new daily view — Out your dorm window or on your walk to class.' },
  { category: 'Everyday Moments', prompt: 'Favourite on-campus spot.' },
  { category: 'Everyday Moments', prompt: 'Favourite off-campus spot.' },
  { category: 'Everyday Moments', prompt: 'What you\'re up to on the weekends.' },
  { category: 'Everyday Moments', prompt: 'New food adventures — What have you tried that you\'d never had before?' },
  { category: 'Everyday Moments', prompt: 'Your new routine — What does a typical weekday look like for you now?' },
  { category: 'Reflections & Tips', prompt: 'What you wish you had known before coming to Harvard.' },
  { category: 'Reflections & Tips', prompt: 'Best packing advice — What would you tell someone packing for the first time?' },
  { category: 'Reflections & Tips', prompt: 'Budgeting reality — How is the financial side going so far?' },
  { category: 'Reflections & Tips', prompt: 'Stress & self-care — Share a resource, habit, or tip that helps you.' },
  { category: 'Reflections & Tips', prompt: 'What are you most proud of since arriving?' },
  { category: 'Reflections & Tips', prompt: 'Advice for future incoming international students — what would you say?' },
]

function WeeklyPromptBanner({ user, onRespond }) {
  const prompts = user.isOnCampus ? ON_CAMPUS_PROMPTS : PRE_ARRIVAL_PROMPTS
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
  const { category, prompt } = prompts[weekNum % prompts.length]
  const modeLabel = user.isOnCampus ? 'On Campus' : 'Pre-Arrival'
  const modeColor = user.isOnCampus ? '#A84B00' : '#555'
  const modeBg   = user.isOnCampus ? '#FFE8C0' : '#EEEEEE'

  return (
    <div style={{
      margin: '0 14px 12px',
      background: 'linear-gradient(135deg, #FFF8E8 0%, #FFF0D0 100%)',
      border: '1.5px solid #FFD87A',
      borderRadius: 18,
      padding: '14px 16px',
      boxShadow: '0 2px 12px rgba(255,180,60,0.13)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 17 }}>✨</span>
        <span style={{ fontWeight: 800, fontSize: 13, color: '#B86A00', flex: 1 }}>Weekly Prompt</span>
        <span style={{
          fontSize: 10, fontWeight: 700, color: modeColor,
          background: modeBg, borderRadius: 20, padding: '3px 9px',
        }}>{modeLabel}</span>
      </div>
      <div style={{
        fontSize: 11, fontWeight: 700, color: '#AAAAAA',
        letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6,
      }}>{category}</div>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: '#2A2A2A', margin: '0 0 12px', fontWeight: 500 }}>
        {prompt}
      </p>
      <button
        onClick={onRespond}
        style={{
          width: '100%', padding: '10px 0', border: 'none', borderRadius: 12,
          background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
          fontSize: 13, fontWeight: 800, color: '#fff', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(255,154,60,0.3)',
        }}
      >
        ✍️ Respond to this prompt
      </button>
    </div>
  )
}

// ── Hunt Feed helpers ─────────────────────────────────────────────────────────

const HUNT_GREEN = '#1B8757'
const HUNT_LIGHT = '#E8F8F0'

function HuntPostCard({ item, index }) {
  return (
    <div
      className="fade-in"
      style={{
        background: '#fff',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(27,135,87,0.13)',
        border: `2px solid ${HUNT_GREEN}`,
        animationDelay: `${index * 0.07}s`,
        position: 'relative',
      }}
    >
      {/* Badges row */}
      <div style={{ position: 'absolute', top: 8, left: 8, right: 8, zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'none' }}>
        <div style={{ background: HUNT_GREEN, color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 8, letterSpacing: '0.3px' }}>
          🗺️ HUNT
        </div>
        <div style={{ background: 'rgba(124,58,237,0.85)', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 8 }}>
          🤖 AI Match
        </div>
      </div>

      {item.img || item.photoUrl ? (
        <img src={item.img || item.photoUrl} alt="" style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block', background: HUNT_LIGHT }} />
      ) : (
        <div style={{ width: '100%', height: 100, background: HUNT_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
          🗺️
        </div>
      )}

      <div style={{ padding: '9px 10px 10px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4A4A4A', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#2ECC87,#1B8757)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 900, flexShrink: 0 }}>
            {(item.username || 'U')[0].toUpperCase()}
          </span>
          {item.username}
        </div>
        {item.text && (
          <p style={{ fontSize: 11, lineHeight: 1.5, color: '#1A1A1A', fontWeight: 500, marginBottom: 5 }}>
            {item.text.length > 70 ? item.text.slice(0, 70) + '…' : item.text}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: HUNT_GREEN, fontWeight: 700 }}>{item.time}</span>
          {item.location?.name && (
            <span style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
              📍 {item.location.name}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-view: Community Feed ──────────────────────────────────────────────────

function FeedView({ userPosts = [], onNewPost, onEditPost, user = {} }) {
  const [liked, setLiked] = useState(new Set())
  const [localLikes, setLocalLikes] = useState({})
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [feedFilter, setFeedFilter] = useState('community') // 'community' | 'hunt'

  const userPostIds = new Set(userPosts.filter(p => user?.id && p.userId === user.id).map(p => p.id))
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

  // Hunt feed items — all API posts flagged as scavenger hunt completions
  const huntItems = userPosts.filter(p => p.isHunt)
  const huntLeft  = huntItems.filter((_, i) => i % 2 === 0)
  const huntRight = huntItems.filter((_, i) => i % 2 === 1)

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Community Feed"
        icon={<HeartIcon size={18} color="var(--orange)" />}
        action={feedFilter === 'community' ? <button style={smallBtn} onClick={() => setShowCreate(true)}>+ Post</button> : null}
      />

      {/* Create post sheet */}
      {showCreate && (
        <CreatePostSheet
          user={user}
          onClose={() => setShowCreate(false)}
          onSubmit={(post) => { onNewPost && onNewPost(post); setShowCreate(false) }}
        />
      )}

      {/* Edit post sheet */}
      {editingPost && (
        <CreatePostSheet
          user={user}
          editPost={editingPost}
          onClose={() => setEditingPost(null)}
          onSubmit={(updated) => { onEditPost && onEditPost(updated); setEditingPost(null) }}
        />
      )}

      {/* Filter toggle */}
      <div style={{
        display: 'flex', gap: 8, padding: '10px 12px 8px',
        background: '#fff', borderBottom: '1px solid var(--border)',
      }}>
        {[
          { id: 'community', label: '💬 Community Feed' },
          { id: 'hunt',      label: '🗺️ Scavenger Hunt' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFeedFilter(f.id)}
            style={{
              flex: 1, padding: '8px 0', border: 'none', borderRadius: 10, cursor: 'pointer',
              fontSize: 12, fontWeight: 700,
              background: feedFilter === f.id
                ? (f.id === 'hunt' ? HUNT_GREEN : 'var(--orange)')
                : '#F3F4F6',
              color: feedFilter === f.id ? '#fff' : '#6B7280',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {feedFilter === 'community' && (
        <>
          {/* Weekly Prompt */}
          <WeeklyPromptBanner user={user} onRespond={() => setShowCreate(true)} />

          {/* Search bar */}
          <SearchBar value={search} onChange={setSearch} placeholder="Search posts…" />

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#AAAAAA', fontSize: 14 }}>
              No posts match your search.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 10px 100px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {left.map((p, i)  => <PostCard key={p.id} post={p} liked={liked.has(p.id)} onLike={toggleLike} delay={i * 0.07} extraLikes={localLikes[p.id] ?? 0} onEdit={userPostIds.has(p.id) ? () => setEditingPost(p) : null} />)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
              {right.map((p, i) => <PostCard key={p.id} post={p} liked={liked.has(p.id)} onLike={toggleLike} delay={i * 0.07 + 0.04} extraLikes={localLikes[p.id] ?? 0} onEdit={userPostIds.has(p.id) ? () => setEditingPost(p) : null} />)}
            </div>
          </div>
        </>
      )}

      {feedFilter === 'hunt' && (
        <div style={{ padding: '12px 10px 100px' }}>
          {huntItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: '#AAAAAA' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: '#4A4A4A' }}>No hunt photos yet</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                Complete scavenger hunt missions and choose "Share to feed" to see photos here.
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {huntLeft.map((item, i)  => <HuntPostCard key={i} item={item} index={i} />)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
                {huntRight.map((item, i) => <HuntPostCard key={i} item={item} index={i} />)}
              </div>
            </div>
          )}
        </div>
      )}
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

function PostCard({ post, liked, onLike, delay, extraLikes = 0, onEdit }) {
  const displayLikes = (post.likes ?? 0) + extraLikes
  return (
    <div className="fade-in" style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', animationDelay: `${delay}s`, position: 'relative' }}>
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
          {onEdit && (
            <button
              onClick={onEdit}
              style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', marginRight: 2, fontSize: 13 }}
              title="Edit post"
            >✏️</button>
          )}
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

function CreatePostSheet({ user, onClose, onSubmit, editPost = null }) {
  const isEditing = editPost !== null
  const [mode, setMode] = useState(editPost?.mediaType ?? 'photo')
  const [photoPreview, setPhotoPreview] = useState(editPost?.img ?? null)
  const [textContent, setTextContent] = useState(editPost?.textContent ?? '')
  const [gradientIdx, setGradientIdx] = useState(editPost?.gradientIdx ?? 0)
  const [caption, setCaption] = useState(editPost?.text ?? '')
  const [pinData, setPinData] = useState(editPost?.location ?? null)
  const [showInlineMap, setShowInlineMap] = useState(false)
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
      ...(isEditing ? editPost : {}),
      id: isEditing ? editPost.id : Date.now(),
      username: editPost?.username ?? user.name ?? 'You',
      avatarBg: editPost?.avatarBg ?? '#FFC94A',
      text: caption.trim(),
      likes: editPost?.likes ?? 0,
      time: isEditing ? editPost.time : 'just now',
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
            <span style={{ fontSize: 17, fontWeight: 800 }}>{isEditing ? '✏️ Edit Post' : 'Create Post'}</span>
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

            {/* Inline map picker */}
            {showInlineMap && (
              <InlineMapPicker
                initialPin={pinData ? [pinData.lat, pinData.lng] : null}
                onCancel={() => setShowInlineMap(false)}
                onConfirm={(data) => { setPinData(data); setShowInlineMap(false) }}
              />
            )}

            {/* Show "pick" button when map is not open */}
            {!showInlineMap && (
              <button
                onClick={() => setShowInlineMap(true)}
                style={{
                  width: '100%', padding: '12px 14px',
                  border: `1.5px solid ${pinData ? 'var(--orange)' : 'var(--border)'}`,
                  borderRadius: 12, fontSize: 14, fontFamily: 'inherit',
                  background: pinData ? '#FFFBF0' : '#fff',
                  cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                  boxSizing: 'border-box', color: pinData ? '#7A4600' : '#AAAAAA',
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{pinData ? '📍' : '🗺️'}</span>
                <span style={{ flex: 1, fontWeight: pinData ? 600 : 400 }}>
                  {pinData ? pinData.name : 'Tap to place a pin on the map…'}
                </span>
                {pinData
                  ? <span onClick={e => { e.stopPropagation(); setPinData(null) }} style={{ fontSize: 12, color: '#AAAAAA', flexShrink: 0, padding: '2px 6px', cursor: 'pointer' }}>✕</span>
                  : <span style={{ fontSize: 12, color: '#AAAAAA', flexShrink: 0 }}>›</span>
                }
              </button>
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
            {submitting ? (isEditing ? 'Saving…' : 'Posting…') : (isEditing ? 'Save changes' : 'Share Post')}
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}

const iconBtn  = { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }
const smallBtn = { fontSize: 12, fontWeight: 700, color: 'var(--orange)', background: '#FFFBF0', border: '1.5px solid var(--yellow)', borderRadius: 20, padding: '5px 12px', cursor: 'pointer' }
