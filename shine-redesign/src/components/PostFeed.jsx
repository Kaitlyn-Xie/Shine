import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../lib/api'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  SearchIcon, ChevronDownIcon, ThumbsUpIcon,
  MessageIcon, PinIcon, HeartIcon, Avatar, UserIcon, CloseIcon,
  EditIcon, CameraIcon, MapIcon, ZapIcon, UsersIcon,
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
  { id: 'demo-1', username: 'Mei Lin',  initials: 'ML', avatarBg: 'linear-gradient(135deg, #FFD6B0, #FF9A3C)', img: 'https://picsum.photos/seed/harvard1/400/320', imgH: 200, text: 'Just arrived at Harvard! The campus is absolutely beautiful.', likes: 42 },
  { id: 'demo-2', username: 'Lucas M.', initials: 'LM', avatarBg: 'linear-gradient(135deg, #B8FFD0, #3CB87A)', img: 'https://picsum.photos/seed/coffee2/400/420',  imgH: 260, text: 'Best coffee on campus is at the Science Center. Trust me.', likes: 87 },
  { id: 'demo-3', username: 'Priya S.', initials: 'PS', avatarBg: 'linear-gradient(135deg, #B8D8FF, #5599EE)', img: 'https://picsum.photos/seed/student3/400/290', imgH: 180, text: 'Got my student ID and bank account sorted! DM me if you need help.', likes: 134 },
  { id: 'demo-4', username: 'Ji-ho P.', initials: 'JP', avatarBg: 'linear-gradient(135deg, #F0C8FF, #CC66FF)', img: 'https://picsum.photos/seed/campus4/400/370', imgH: 230, text: 'Harvard Yard at sunrise — found the perfect quiet spot.', likes: 56 },
  { id: 'demo-5', username: 'Omar K.',  initials: 'OK', avatarBg: 'linear-gradient(135deg, #FFE0B0, #FF8C00)', img: 'https://picsum.photos/seed/yard5/400/340',   imgH: 210, text: 'Harvard Yard in the morning light is something else entirely.', likes: 203 },
  { id: 'demo-6', username: 'Sofia R.', initials: 'SR', avatarBg: 'linear-gradient(135deg, #FFB8C8, #EE4466)', img: 'https://picsum.photos/seed/group6/400/270',  imgH: 170, text: 'Found the European Students group — so nice to meet everyone!', likes: 78 },
]

// ── Root ─────────────────────────────────────────────────────────────────────

export default function PostFeed({ view = 'feed', onShowFAQ, userPosts = [], onNewPost, onEditPost, onDeletePost, user = {}, sunlightPosts = [], onNewSunlightPost, onEditSunlightPost, onDeleteSunlightPost, onUserClick }) {
  const questionPosts = sunlightPosts.filter(p => p.type === 'question')
  return (
    <div className="fade-in">
      {view === 'faq'  && <FAQView />}
      {view === 'cq'   && <CommunityQView onShowFAQ={onShowFAQ} questionPosts={questionPosts} onNewQuestion={onNewSunlightPost} onEditSunlightPost={onEditSunlightPost} onDeleteSunlightPost={onDeleteSunlightPost} user={user} onUserClick={onUserClick} />}
      {view === 'feed' && <FeedView userPosts={userPosts} onNewPost={onNewPost} onEditPost={onEditPost} onDeletePost={onDeletePost} user={user} onUserClick={onUserClick} />}
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
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4A4A4A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <PinIcon size={13} color="#4A4A4A" /> Tag a location <span style={{ fontWeight: 400, color: '#AAAAAA' }}>(optional — shows on map)</span>
            </div>
            {location && !showMap && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: QL, border: `1.5px solid ${QC}30`, borderRadius: 10, padding: '8px 12px', marginBottom: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: QC, flex: 1 }}><PinIcon size={12} color={QC} /> {location.name}</span>
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
                  {location ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><PinIcon size={13} color="#888" /> Change location</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><MapIcon size={13} color="#888" /> Drop a pin on the map</span>}
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

function EditQuestionSheet({ q, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(q.title || '')
  const [body, setBody] = useState(q.body || '')
  const [anon, setAnon] = useState(q.isAnonymous || false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const canSave = title.trim().length > 2

  const handleSave = async () => {
    if (!canSave || saving || deleting) return
    setSaving(true)
    setSaveError(null)
    try {
      await onSave({ title: title.trim(), body: body.trim(), isAnonymous: anon })
    } catch (e) {
      setSaveError(e.message || 'Could not save. Please try again.')
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    setDeleting(true)
    try { await onDelete() } catch { setDeleting(false) }
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
          {saveError && (
            <div style={{ marginBottom: 10, padding: '10px 14px', background: '#FEF2F2', borderRadius: 10, color: '#DC2626', fontSize: 13, fontWeight: 600 }}>
              {saveError}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={!canSave || saving || deleting}
            style={{
              width: '100%', padding: 14, border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700,
              cursor: canSave && !saving && !deleting ? 'pointer' : 'default',
              background: canSave && !saving && !deleting ? `linear-gradient(135deg, ${QC}, #3377CC)` : 'var(--border)',
              color: canSave && !saving && !deleting ? '#fff' : '#AAAAAA',
              marginBottom: 10,
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting || saving}
              style={{
                width: '100%', padding: 12, border: '1.5px solid #FCA5A5', borderRadius: 14, fontSize: 14, fontWeight: 700,
                cursor: deleting || saving ? 'default' : 'pointer',
                background: '#FFF',
                color: '#DC2626',
              }}
            >
              {deleting ? 'Deleting…' : 'Delete Post'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function QuestionCard({ q, liked, onLike, expanded, onToggle, answers, answerDraft, onDraftChange, onAnswer, answerAnon, onAnswerAnonChange, onEdit, onUserClick }) {
  return (
    <div className="fade-in" style={{ background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow)', marginBottom: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 14px 0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div
          onClick={() => !q.isAnonymous && q.userId && onUserClick?.(q.userId)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: !q.isAnonymous && q.userId ? 'pointer' : 'default', flex: 1, minWidth: 0 }}
        >
          {q.isAnonymous
            ? <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFEFEF', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserIcon size={17} color="#AAAAAA" /></div>
            : <Avatar name={q.username} size={36} bg="linear-gradient(135deg, #B8D4FF, #5599EE)" />
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{q.username}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{q.time}</div>
          </div>
        </div>
        {q.location && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: QC, background: QL, padding: '3px 8px', borderRadius: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
            <PinIcon size={10} color={QC} /> {q.location.label || q.location.name}
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

function CommunityQView({ onShowFAQ, questionPosts = [], onNewQuestion, onEditSunlightPost, onDeleteSunlightPost, user = {}, onUserClick }) {
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

  const handleDeleteQ = async () => {
    if (!editingQ?.dbId) return
    await api.deleteSunlightPost(editingQ.dbId)
    if (onDeleteSunlightPost) onDeleteSunlightPost(editingQ.id)
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
            onUserClick={onUserClick}
          />
        ))}
      </div>

      {showAsk && createPortal(<AskQuestionSheet onClose={() => setShowAsk(false)} onSubmit={handleAsk} />, document.body)}
      {editingQ && createPortal(<EditQuestionSheet q={editingQ} onClose={() => setEditingQ(null)} onSave={handleEditSave} onDelete={handleDeleteQ} />, document.body)}
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
  "><svg viewBox="0 0 24 24" fill="white" width="16" height="16"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg></div>`,
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
  // Your World in Frame
  { category: 'Your World in Frame', prompt: '📷 Share a photo of the view from your window right now. What does it say about where you come from? Tell us one thing a stranger would never notice in that scene.' },
  { category: 'Your World in Frame', prompt: '📷 Step outside your front door and photograph what you see. What story does this corner of the world tell about everyday life where you\'re from?' },
  { category: 'Your World in Frame', prompt: '📷 Capture your neighborhood at the time of day you love most. Share the photo and describe what makes that particular hour feel like yours.' },
  { category: 'Your World in Frame', prompt: '📷 Find a detail most people walk past — a worn tile, a faded sign, a familiar texture. Photograph it and tell us why it matters to you.' },
  // Who I Am
  { category: 'Who I Am', prompt: '📷 Share a photo of the most important memento you\'re bringing to Harvard. What does it represent, and why couldn\'t you leave without it?' },
  { category: 'Who I Am', prompt: '📷 Photograph something that belongs to a family member you deeply admire. What did they teach you, and how does that shape who you are now?' },
  { category: 'Who I Am', prompt: '📷 Show us something in your home that would be hard to explain to someone who didn\'t grow up where you did. Walk us through it.' },
  { category: 'Who I Am', prompt: 'What\'s one part of your identity you\'re proud of but rarely get to explain to people outside your community? Share the story — and a photo if you can.' },
  // What Shapes Me
  { category: 'What Shapes Me', prompt: '📷 Share a photo from a celebration, ritual, or tradition that\'s central to your culture. What would be lost if it disappeared?' },
  { category: 'What Shapes Me', prompt: '📷 Photograph something from your daily routine that\'s deeply tied to where you\'re from — a meal, a ritual, a sound you\'ll miss. What does it mean to carry this with you?' },
  { category: 'What Shapes Me', prompt: '📷 Share a photo of a dish that tastes like home. What memory or feeling does it carry? Is there a story behind how you first learned to love it?' },
  { category: 'What Shapes Me', prompt: 'What\'s a value your community or family holds that you hope to carry with you to Harvard — even if no one there would recognize it by name?' },
  // The Space Between
  { category: 'The Space Between', prompt: '📷 Capture one of your "lasts" before you leave — a final walk, a last meal, a familiar face. Share the photo and what that moment felt like.' },
  { category: 'The Space Between', prompt: '📷 Show us something you couldn\'t leave behind. What does it mean to bring a piece of home across the world to a new life?' },
  { category: 'The Space Between', prompt: 'What are you most afraid to lose by leaving? What are you most hopeful to find? Be as honest as you can.' },
  { category: 'The Space Between', prompt: 'If you could leave one piece of advice for someone who will grow up in your hometown after you\'re gone, what would it be?' },
  // Hopes & Fears
  { category: 'Hopes & Fears', prompt: '📷 Share a photo of somewhere you feel most like yourself. Can you carry that feeling to Cambridge? How will you recreate it?' },
  { category: 'Hopes & Fears', prompt: 'What assumption do people from other countries often make about your home that you\'d most want to correct? Share a photo that tells a truer story.' },
  { category: 'Hopes & Fears', prompt: 'What question do you most want answered when you arrive at Harvard? What\'s driving it?' },
  { category: 'Journey to Campus', prompt: '📷 Share a photo from your journey to campus — a layover, a first glimpse of a new skyline, the moment you landed. What were you feeling?' },
]

// ── This week's pinned pre-arrival prompt ─────────────────────────────────────
const PINNED_PRE_ARRIVAL_PROMPT = {
  category: 'Your World in Frame',
  prompt: '📷 Step outside and photograph the view from your front door or window — wherever you\'re calling home right now. What does your corner of the world look like? Share the photo and pin your home location on the map so we can see where the Shine community is spread across the globe.',
}

const ON_CAMPUS_PROMPTS = [
  // First Frames
  { category: 'First Frames', prompt: '📷 Share the very first photo you took at Harvard — whatever it captured, wherever you were. What were you feeling in that moment?' },
  { category: 'First Frames', prompt: '📷 Photograph your room right now. What did you bring that makes it feel like yours? What\'s still missing?' },
  { category: 'First Frames', prompt: '📷 Share a photo of your first meal in Cambridge. Was it familiar or completely new? What did it make you think of?' },
  { category: 'First Frames', prompt: '📷 Capture something from your first week that genuinely surprised you. What does that image reveal about where you are — and where you\'re from?' },
  { category: 'First Frames', prompt: '📷 Share a photo of a Harvard landmark seen through your eyes. What does this place look like to someone arriving from your world?' },
  // Identity Here
  { category: 'Identity Here', prompt: '📷 Share a photo of a moment when you felt most like yourself here. What made it feel real and true to who you are?' },
  { category: 'Identity Here', prompt: '📷 Find something at Harvard that connects to where you come from. Photograph it and tell us what bridge it builds.' },
  { category: 'Identity Here', prompt: 'What part of your identity feels more visible here than it ever did at home? What part feels less visible? Share a photo that captures how you\'re holding both.' },
  { category: 'Identity Here', prompt: 'How has being far from home changed how you see yourself? Has anything surprised you about who you\'re becoming?' },
  // Bridging Worlds
  { category: 'Bridging Worlds', prompt: '📷 Find something in Cambridge that reminds you of home — a street, a smell, a sound, a face. Share a photo and the memory it unlocks.' },
  { category: 'Bridging Worlds', prompt: '📷 Photograph a local shop, dish, or place that has a parallel back home. What\'s the same? What\'s different? What does that gap tell you?' },
  { category: 'Bridging Worlds', prompt: 'What\'s something from your home culture you wish you could hand to every classmate here — a food, a phrase, a way of being together? Tell the story.' },
  { category: 'Bridging Worlds', prompt: '📷 Share a photo of a conversation or gathering happening around you. What kinds of human stories can you imagine unfolding in it?' },
  // Empathy in Action
  { category: 'Empathy in Action', prompt: '📷 Photograph a place on campus where many kinds of people come together. What does it feel like to be part of that — as an outsider, as a newcomer, as yourself?' },
  { category: 'Empathy in Action', prompt: 'Share a moment when someone here helped you feel less alone. What did they do, and what did it teach you about how small acts cross borders?' },
  { category: 'Empathy in Action', prompt: '📷 Photograph something that looks completely ordinary to locals here but was entirely new to you. Why does that gap matter?' },
  { category: 'Empathy in Action', prompt: 'When have you had to explain something about your background that you\'d never thought twice about? What did that moment teach you about perspective?' },
  { category: 'Empathy in Action', prompt: '📷 Find a piece of public art, a mural, or a memorial on or near campus. Photograph it — whose story is it telling, and what does it stir in you?' },
  // Everyday Human
  { category: 'Everyday Human', prompt: '📷 Capture your morning routine here. What does the start of your day look like now — and how is it different from home?' },
  { category: 'Everyday Human', prompt: '📷 Share a photo of your study spot. What does this place say about how you work and what you need to feel settled?' },
  { category: 'Everyday Human', prompt: '📷 Document a small, ordinary kindness you witnessed today — a held door, a shared umbrella, a smile across a dining table. Why does it matter?' },
  { category: 'Everyday Human', prompt: 'What\'s the most universal human experience you\'ve noticed at Harvard — something that seems to cross every culture, background, and language?' },
  { category: 'Everyday Human', prompt: '📷 Share a photo of your dorm window view. How does it compare to the view you left behind? What do you notice now that you didn\'t expect?' },
  // Reflections
  { category: 'Reflections', prompt: '📷 Share a photo of a moment from this week that you want to remember. What made it worth keeping?' },
  { category: 'Reflections', prompt: 'What do you wish someone had told you before you arrived — not a practical tip, but something true about how this would feel?' },
  { category: 'Reflections', prompt: 'What are you most proud of since arriving? It doesn\'t have to be academic. It can be as quiet as making it through a hard day.' },
  { category: 'Reflections', prompt: '📷 Take a self-portrait — not posed, just real. What does the person in the photo carry that you\'d want others here to understand?' },
  { category: 'Reflections', prompt: 'If you could send one message to every international student arriving next year, what would you say — in your own words, from your own experience?' },
]

function WeeklyPromptBanner({ user, onRespond }) {
  const isPreArrival = !user.isOnCampus
  let category, prompt
  if (isPreArrival) {
    ;({ category, prompt } = PINNED_PRE_ARRIVAL_PROMPT)
  } else {
    const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
    ;({ category, prompt } = ON_CAMPUS_PROMPTS[weekNum % ON_CAMPUS_PROMPTS.length])
  }
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
        <ZapIcon size={17} color="#FF9A3C" />
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
        onClick={() => onRespond(prompt)}
        style={{
          width: '100%', padding: '10px 0', border: 'none', borderRadius: 12,
          background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
          fontSize: 13, fontWeight: 800, color: '#fff', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(255,154,60,0.3)',
        }}
      >
        {isPreArrival ? 'Share your view + Pin on map' : 'Share a photo + respond'}
      </button>
    </div>
  )
}

// ── Hunt Feed helpers ─────────────────────────────────────────────────────────

const HUNT_GREEN = '#1B8757'
const HUNT_LIGHT = '#E8F8F0'

function HuntPostCard({ item, index, onUserClick }) {
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
        <div style={{ background: HUNT_GREEN, color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 8, letterSpacing: '0.3px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
          HUNT
        </div>
        <div style={{ background: 'rgba(124,58,237,0.85)', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <UsersIcon size={8} color="#fff" /> Get Matched
        </div>
      </div>

      {item.img || item.photoUrl ? (
        <img src={item.img || item.photoUrl} alt="" style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block', background: HUNT_LIGHT }} />
      ) : (
        <div style={{ width: '100%', height: 100, background: HUNT_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MapIcon size={28} color="#1B8757" />
        </div>
      )}

      <div style={{ padding: '9px 10px 10px' }}>
        <div
          onClick={() => item.userId && onUserClick?.(item.userId)}
          style={{ fontSize: 11, fontWeight: 700, color: '#4A4A4A', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4, cursor: item.userId ? 'pointer' : 'default' }}
        >
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

function FeedView({ userPosts = [], onNewPost, onEditPost, onDeletePost, user = {}, onUserClick }) {
  const [liked, setLiked] = useState(new Set())
  const [localLikes, setLocalLikes] = useState({})
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [promptPrefill, setPromptPrefill] = useState('')
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
          prefillCaption={promptPrefill}
          onClose={() => { setShowCreate(false); setPromptPrefill('') }}
          onSubmit={(post) => { onNewPost && onNewPost(post); setShowCreate(false); setPromptPrefill('') }}
        />
      )}

      {/* Edit post sheet */}
      {editingPost && (
        <CreatePostSheet
          user={user}
          editPost={editingPost}
          onClose={() => setEditingPost(null)}
          onSubmit={(updated) => { onEditPost && onEditPost(updated); setEditingPost(null) }}
          onDelete={async () => {
            if (!editingPost?.id) return
            await api.deleteFeedPost(editingPost.id)
            if (onDeletePost) onDeletePost(editingPost.id)
            setEditingPost(null)
          }}
        />
      )}

      {/* Filter toggle */}
      <div style={{
        display: 'flex', gap: 8, padding: '10px 12px 8px',
        background: '#fff', borderBottom: '1px solid var(--border)',
      }}>
        {[
          { id: 'community', label: 'Community Feed' },
          { id: 'hunt',      label: 'Scavenger Hunt' },
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
          <WeeklyPromptBanner user={user} onRespond={(promptText) => { setPromptPrefill(promptText || ''); setShowCreate(true) }} />

          {/* Search bar */}
          <SearchBar value={search} onChange={setSearch} placeholder="Search posts…" />

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#AAAAAA', fontSize: 14 }}>
              No posts match your search.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 10px 100px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {left.map((p, i)  => <PostCard key={p.id} post={p} liked={liked.has(p.id)} onLike={toggleLike} delay={i * 0.07} extraLikes={localLikes[p.id] ?? 0} onEdit={userPostIds.has(p.id) ? () => setEditingPost(p) : null} onUserClick={onUserClick} />)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
              {right.map((p, i) => <PostCard key={p.id} post={p} liked={liked.has(p.id)} onLike={toggleLike} delay={i * 0.07 + 0.04} extraLikes={localLikes[p.id] ?? 0} onEdit={userPostIds.has(p.id) ? () => setEditingPost(p) : null} onUserClick={onUserClick} />)}
            </div>
          </div>
        </>
      )}

      {feedFilter === 'hunt' && (
        <div style={{ padding: '12px 10px 100px' }}>
          {huntItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: '#AAAAAA' }}>
              <div style={{ marginBottom: 12 }}><MapIcon size={40} color="#9CA3AF" /></div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: '#4A4A4A' }}>No hunt photos yet</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                Complete scavenger hunt missions and choose "Share to feed" to see photos here.
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {huntLeft.map((item, i)  => <HuntPostCard key={i} item={item} index={i} onUserClick={onUserClick} />)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
                {huntRight.map((item, i) => <HuntPostCard key={i} item={item} index={i} onUserClick={onUserClick} />)}
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

function PostCard({ post, liked, onLike, delay, extraLikes = 0, onEdit, onUserClick }) {
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
          <div
            onClick={() => !post.isAnonymous && post.userId && onUserClick?.(post.userId)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, cursor: !post.isAnonymous && post.userId ? 'pointer' : 'default' }}
          >
            <Avatar name={post.username} size={20} bg={post.avatarBg} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{post.username}</span>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', marginRight: 2 }}
              title="Edit post"
            ><EditIcon size={13} color="#6B7280" /></button>
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

function CreatePostSheet({ user, onClose, onSubmit, onDelete, editPost = null, prefillCaption = '' }) {
  const isEditing = editPost !== null
  const [mode, setMode] = useState(editPost?.mediaType ?? 'photo')
  const [photoPreview, setPhotoPreview] = useState(editPost?.img ?? null)
  const [textContent, setTextContent] = useState(editPost?.textContent ?? '')
  const [gradientIdx, setGradientIdx] = useState(editPost?.gradientIdx ?? 0)
  const [caption, setCaption] = useState(editPost?.text ?? prefillCaption)
  const [pinData, setPinData] = useState(editPost?.location ?? null)
  const [showInlineMap, setShowInlineMap] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const fileRef = useRef(null)

  const canSubmit = (mode === 'photo'
    ? photoPreview && caption.trim()
    : textContent.trim() && caption.trim()) && !submitting && !deleting

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setSaveError(null)
    const localPost = {
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
    try {
      if (isEditing && editPost?.id) {
        const saved = await api.updateFeedPost(editPost.id, {
          text: caption.trim(),
          img: mode === 'photo' ? photoPreview : null,
          mediaType: mode,
          textContent: mode === 'textcard' ? textContent.trim() : null,
          gradientIdx,
          locationName: pinData?.name ?? null,
          locationLat: pinData?.lat ?? null,
          locationLng: pinData?.lng ?? null,
        })
        onSubmit(saved ?? localPost)
      } else {
        onSubmit(localPost)
      }
    } catch (e) {
      setSaveError(e.message || 'Could not save. Please try again.')
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    setDeleting(true)
    try { await onDelete?.() } catch { setDeleting(false) }
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
            <span style={{ fontSize: 17, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {isEditing && <EditIcon size={15} color="#1A1A1A" />}
              {isEditing ? 'Edit Post' : 'Create Post'}
            </span>
            <button onClick={onClose} style={iconBtn}><CloseIcon size={20} color="#4A4A4A" /></button>
          </div>

          {/* Mode toggle */}
          <div style={{ display: 'flex', margin: '0 20px 16px', background: 'var(--bg)', borderRadius: 12, padding: 4 }}>
            {[['photo', 'Photo'], ['textcard', 'Text Card']].map(([m, label]) => (
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
                <span style={{ flexShrink: 0 }}>{pinData ? <PinIcon size={16} color="#7A4600" /> : <MapIcon size={16} color="#AAAAAA" />}</span>
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

          {/* Error */}
          {saveError && (
            <div style={{ marginBottom: 10, padding: '10px 14px', background: '#FEF2F2', borderRadius: 10, color: '#DC2626', fontSize: 13, fontWeight: 600 }}>
              {saveError}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              width: '100%', padding: 15, border: 'none', borderRadius: 16,
              background: canSubmit ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : '#F0F0F0',
              color: canSubmit ? '#fff' : '#AAAAAA',
              fontSize: 15, fontWeight: 800, cursor: canSubmit ? 'pointer' : 'default',
              boxShadow: canSubmit ? '0 4px 16px rgba(255,154,60,0.4)' : 'none',
              transition: 'all 0.2s',
              marginBottom: isEditing && onDelete ? 10 : 0,
            }}
          >
            {submitting ? (isEditing ? 'Saving…' : 'Posting…') : (isEditing ? 'Save changes' : 'Share Post')}
          </button>

          {/* Delete (editing only) */}
          {isEditing && onDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting || submitting}
              style={{
                width: '100%', padding: 12, border: '1.5px solid #FCA5A5', borderRadius: 16,
                background: '#fff', color: '#DC2626',
                fontSize: 14, fontWeight: 700,
                cursor: deleting || submitting ? 'default' : 'pointer',
              }}
            >
              {deleting ? 'Deleting…' : 'Delete Post'}
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

const iconBtn  = { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }
const smallBtn = { fontSize: 12, fontWeight: 700, color: 'var(--orange)', background: '#FFFBF0', border: '1.5px solid var(--yellow)', borderRadius: 20, padding: '5px 12px', cursor: 'pointer' }
