import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  TrophyIcon, CloseIcon, CheckIcon, CameraIcon,
  ArrowRightIcon, AlertIcon, PinIcon, LockIcon,
  MapIcon, UsersIcon, MedalIcon, UserIcon, LandmarkIcon,
  EditIcon, StarIcon, ZapIcon, GridIcon, ICON_MAP,
} from './Icons'
import {
  MISSIONS, BADGES, SECTIONS, MOCK_LEADERBOARD, MOCK_GROUP_LEADERBOARD,
  HUNT_TYPE_CONFIG, DIFFICULTY_POINTS, computePoints, getDistance, MATCH_GROUP_BONUS,
} from '../data/missions'
import { api } from '../lib/api'
import ScavengerMatch from './ScavengerMatch'

// ── Constants ────────────────────────────────────────────────────────────────
const HUNT_PRIMARY = '#1B8757'
const HUNT_GRADIENT = 'linear-gradient(135deg, #2ECC87, #1B8757)'
const HUNT_LIGHT = '#E8F8F0'
const STORAGE_KEY = 'shine_hunt_v1'

const SECTION_FILTERS = [
  { id: 'all',        label: 'All' },
  { id: 'featured',   label: '⭐ Demo' },
  { id: 'landmarks',  label: 'Landmarks' },
  { id: 'resources',  label: 'Resources' },
  { id: 'social',     label: 'Social' },
  { id: 'academic',   label: 'Academic' },
  { id: 'daily',      label: 'Daily Life' },
  { id: 'events',     label: 'Events' },
  { id: 'reflection', label: 'Reflect' },
]

// ── Persistence ───────────────────────────────────────────────────────────────
function loadHunt() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || { completions: [], badges: [], feedItems: [] }
  } catch { return { completions: [], badges: [], feedItems: [] } }
}
function saveHunt(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

// ── Badge checker ─────────────────────────────────────────────────────────────
function checkNewBadges(completions, existingIds) {
  return BADGES.filter(b => !existingIds.includes(b.id) && b.check(completions))
}

// ── Haversine check ───────────────────────────────────────────────────────────
function inGeofence(lat, lng, fence) {
  if (!fence) return true
  return getDistance(lat, lng, fence.lat, fence.lng) <= fence.radius
}

// ── StepBlock ─────────────────────────────────────────────────────────────────
function StepBlock({ num, title, done, desc, children, optional }) {
  return (
    <div style={{ marginBottom: 14, borderRadius: 14, border: `1.5px solid ${done ? '#10B981' : '#E5E7EB'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px 6px' }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
          background: done ? '#10B981' : '#E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: done ? '#fff' : '#6B7280',
          transition: 'background 0.2s',
        }}>
          {done ? '✓' : num}
        </div>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
        {optional && <span style={{ fontSize: 11, color: '#9A9A9A', marginLeft: 'auto' }}>optional</span>}
      </div>
      <div style={{ padding: '2px 14px 14px' }}>
        <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 10px' }}>{desc}</p>
        {children}
      </div>
    </div>
  )
}

// ── CompletionSheet ───────────────────────────────────────────────────────────
function FriendAvatar({ name }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2ECC87, #1B8757)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function CompletionSheet({ mission, onClose, onComplete }) {
  const cfg = HUNT_TYPE_CONFIG[mission.type]
  const [gpsStatus, setGpsStatus] = useState('idle')
  const [gpsMsg, setGpsMsg] = useState('')
  const [photoUrl, setPhotoUrl] = useState(null)
  const [shareToFeed, setShareToFeed] = useState(false)
  const [textAnswer, setTextAnswer] = useState('')
  const [hasDiversity, setHasDiversity] = useState(false)
  const [isMatchGroup, setIsMatchGroup] = useState(false)
  const [taggedFriends, setTaggedFriends] = useState([])
  const [friendSearch, setFriendSearch] = useState('')
  const [friendResults, setFriendResults] = useState([])
  const [friendSearchLoading, setFriendSearchLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [result, setResult] = useState(null)
  const fileRef = useRef(null)
  const searchTimerRef = useRef(null)

  const groupSize = taggedFriends.length + 1
  const effectiveGroupSize = isMatchGroup ? Math.max(groupSize, 4) : groupSize

  const gpsOk = !mission.requiresGPS || gpsStatus === 'passed' || gpsStatus === 'warning'
  const photoOk = !mission.requiresPhoto || photoUrl !== null
  const canSubmit = gpsOk && photoOk && !submitting

  useEffect(() => {
    clearTimeout(searchTimerRef.current)
    const q = friendSearch.trim()
    if (!q) { setFriendResults([]); return }
    setFriendSearchLoading(true)
    searchTimerRef.current = setTimeout(async () => {
      try {
        const r = await api.searchUsers(q)
        const tagged = new Set(taggedFriends.map(f => f.id))
        setFriendResults((r.users ?? []).filter(u => !tagged.has(u.id)))
      } catch { setFriendResults([]) }
      setFriendSearchLoading(false)
    }, 350)
    return () => clearTimeout(searchTimerRef.current)
  }, [friendSearch, taggedFriends])

  const addFriend = (u) => {
    setTaggedFriends(prev => prev.find(f => f.id === u.id) ? prev : [...prev, u])
    setFriendSearch('')
    setFriendResults([])
  }
  const removeFriend = (id) => setTaggedFriends(prev => prev.filter(f => f.id !== id))

  const handleGPS = () => {
    setGpsStatus('checking')
    if (!navigator.geolocation) {
      setGpsStatus('warning')
      setGpsMsg("Location unavailable in your browser — confirm you're at the site.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        if (inGeofence(latitude, longitude, mission.geofence)) {
          setGpsStatus('passed'); setGpsMsg("You're in range!")
        } else {
          const dist = mission.geofence ? Math.round(getDistance(latitude, longitude, mission.geofence.lat, mission.geofence.lng)) : 0
          setGpsStatus('warning'); setGpsMsg(`You appear to be ~${dist}m away. Confirm you're at the location.`)
        }
      },
      () => { setGpsStatus('warning'); setGpsMsg("Location access denied — confirm you're at the mission site.") },
      { timeout: 8000 }
    )
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoUrl(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)
    const pts = computePoints(mission, { groupSize: effectiveGroupSize, hasDiversity, shareToFeed, isTimeLimited: mission.timing !== 'evergreen', isMatchGroup })
    try {
      const apiResult = await api.completeHuntMission({
        missionId: mission.id,
        missionTitle: mission.title,
        missionDesc: mission.desc,
        ptsTotal: pts.total,
        photoUrl: photoUrl ?? null,
        shareToFeed: shareToFeed ?? false,
        taggedUserIds: taggedFriends.map(f => f.id),
      })
      onComplete({ mission, pts, photoUrl, shareToFeed, isMatchGroup })
      setSubmitting(false)
      setResult({ pts, shareToFeed, isMatchGroup, taggedUsers: apiResult?.taggedUsers ?? [], aiVerified: apiResult?.aiVerified, aiNote: apiResult?.aiNote ?? '' })
    } catch (e) {
      const reason = e.message || 'Submission failed. Please try again.'
      setSubmitError(reason)
      setSubmitting(false)
    }
  }

  if (submitting && !submitError) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 2100, background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div className="slide-up" style={{ background: '#fff', borderRadius: '22px 22px 0 0', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginLeft: 'auto', marginRight: 'auto' }}>
            <ZapIcon size={26} color="#3B82F6" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#1A1A1A' }}>AI is reviewing your photo…</div>
          <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.5 }}>
            Checking your group and verifying<br />the mission objectives. Just a moment!
          </div>
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 6 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: HUNT_PRIMARY, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 2100, background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div className="slide-up" style={{ background: '#fff', borderRadius: '22px 22px 0 0', padding: '28px 24px 48px', textAlign: 'center', maxHeight: '90vh', overflowY: 'auto' }}>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}><TrophyIcon size={56} color="#1B8757" /></div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Mission Complete!</div>
          <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>{mission.title}</div>

          <div style={{ background: HUNT_LIGHT, borderRadius: 18, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ fontSize: 42, fontWeight: 900, color: HUNT_PRIMARY }}>{result.pts.total}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>points earned · everyone in your group</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 10, background: '#F0F0F0', color: '#1A1A1A' }}>Base: +{result.pts.base}</span>
              {result.pts.bonus > 0 && <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 10, background: HUNT_LIGHT, color: HUNT_PRIMARY }}>Bonuses: +{result.pts.bonus}</span>}
              {result.isMatchGroup && <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 10, background: '#EDE9FE', color: '#7C3AED', display: 'inline-flex', alignItems: 'center', gap: 4 }}><UsersIcon size={11} color="#7C3AED" /> Match Bonus: +{MATCH_GROUP_BONUS}</span>}
            </div>
          </div>

          {result.taggedUsers?.length > 0 && (
            <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '12px 16px', marginBottom: 14, textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 10 }}>POINTS AWARDED TO</div>
              {result.taggedUsers.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <FriendAvatar name={u.name} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>{u.name}</span>
                    {u.alreadyDone && <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 6 }}>(already completed)</span>}
                  </div>
                  {!u.alreadyDone && <span style={{ fontSize: 12, fontWeight: 700, color: HUNT_PRIMARY }}>+{result.pts.total} pts</span>}
                </div>
              ))}
            </div>
          )}

          {result.aiNote && (
            <div style={{ background: result.aiVerified === false ? '#FEF2F2' : '#F0FDF4', borderRadius: 12, padding: '10px 14px', marginBottom: 16, textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: result.aiVerified === false ? '#EF4444' : '#16A34A', marginBottom: 4 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  {result.aiVerified === false ? <AlertIcon size={12} color="#EF4444" /> : <CheckIcon size={12} color="#16A34A" />}
                  {result.aiVerified === false ? 'AI NOTE' : 'AI VERIFIED'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#374151' }}>{result.aiNote}</div>
            </div>
          )}

          <button onClick={onClose} style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: HUNT_GRADIENT, color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(27,135,87,0.35)' }}>
            Keep exploring!
          </button>
        </div>
      </div>
    )
  }

  let stepNum = 0
  const nextStep = () => ++stepNum

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2100, background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div className="slide-up" style={{ background: '#fff', borderRadius: '22px 22px 0 0', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.5px', color: cfg.color, marginBottom: 3 }}>
              {cfg.icon} {cfg.label.toUpperCase()} · {mission.difficulty.toUpperCase()} · {DIFFICULTY_POINTS[mission.difficulty]}+ PTS
            </div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{mission.title}</div>
          </div>
          <button onClick={onClose} style={iconBtn}><CloseIcon size={20} color="#9A9A9A" /></button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '18px 20px 32px' }}>
          <p style={{ fontSize: 14, color: '#4A4A4A', lineHeight: 1.65, marginBottom: 18, padding: '12px 14px', background: '#F9FAFB', borderRadius: 12 }}>
            {mission.desc}
          </p>

          {/* GPS */}
          {mission.requiresGPS && (
            <StepBlock num={nextStep()} title="Location Check" done={gpsOk}
              desc={gpsStatus === 'idle' ? 'Tap to verify you are at the mission location.' : gpsMsg}>
              {gpsStatus === 'idle' && (
                <button onClick={handleGPS} style={{ padding: '9px 16px', borderRadius: 10, border: `1.5px solid ${cfg.color}44`, background: cfg.light, color: cfg.color, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <PinIcon size={13} color={cfg.color} /> Check my location
                </button>
              )}
              {gpsStatus === 'checking' && <div style={{ color: '#9A9A9A', fontSize: 13 }}>Locating you...</div>}
              {gpsStatus === 'passed' && <div style={{ color: HUNT_PRIMARY, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><CheckIcon size={14} color={HUNT_PRIMARY} /> You are in range!</div>}
              {gpsStatus === 'warning' && (
                <div>
                  <div style={{ fontSize: 13, color: '#D97706', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><AlertIcon size={14} color="#D97706" /> {gpsMsg}</div>
                  <button onClick={() => setGpsStatus('passed')} style={{ padding: '9px 16px', borderRadius: 10, border: '1.5px solid #D9770644', background: '#FFFBEB', color: '#D97706', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    I am at the location ✓
                  </button>
                </div>
              )}
            </StepBlock>
          )}

          {/* Photo */}
          {mission.requiresPhoto && (
            <StepBlock num={nextStep()} title="Upload Photo" done={photoOk} desc="Take or upload a photo — AI will verify it matches the mission.">
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
              {photoUrl ? (
                <div>
                  <img src={photoUrl} alt="preview" style={{ width: '100%', borderRadius: 12, maxHeight: 180, objectFit: 'cover', marginBottom: 10 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => setPhotoUrl(null)} style={{ padding: '7px 12px', borderRadius: 10, border: '1.5px solid #EF444444', background: '#FEF2F2', color: '#EF4444', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      Remove
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1 }} onClick={() => setShareToFeed(v => !v)}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: shareToFeed ? HUNT_PRIMARY : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                        {shareToFeed && <CheckIcon size={12} color="#fff" />}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Share to feed <span style={{ color: HUNT_PRIMARY }}>(+2 pts)</span></span>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '16px', borderRadius: 12, border: `2px dashed ${cfg.color}88`, background: cfg.light, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <CameraIcon size={18} color={cfg.color} /> Tap to add photo
                </button>
              )}
            </StepBlock>
          )}

          {/* QR — Future Feature (greyed out) */}
          {mission.requiresQR && (
            <div style={{ marginBottom: 14, borderRadius: 14, border: '1.5px solid #E5E7EB', overflow: 'hidden', opacity: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px 6px' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GridIcon size={13} color="#6B7280" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#6B7280' }}>QR / NFC Verification</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#fff', background: '#9A9A9A', padding: '2px 8px', borderRadius: 8 }}>Future Feature</span>
              </div>
              <div style={{ padding: '2px 14px 14px' }}>
                <p style={{ fontSize: 12, color: '#9A9A9A', margin: 0 }}>QR code scanning will be available in a future update.</p>
              </div>
            </div>
          )}

          {/* Text Answer */}
          {mission.allowTextAnswer && (
            <StepBlock num={<EditIcon size={12} color="#6B7280" />} title="Your Answer" done={textAnswer.trim().length > 3} desc={mission.textPrompt || 'Write your answer below.'} optional>
              <textarea
                value={textAnswer} onChange={e => setTextAnswer(e.target.value)}
                placeholder={mission.textPrompt || 'Write here...'}
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 14, resize: 'none', fontFamily: 'inherit', outline: 'none', background: 'var(--bg)', boxSizing: 'border-box' }}
              />
            </StepBlock>
          )}

          {/* Bonus Options */}
          <div style={{ background: '#FFFBEB', borderRadius: 14, padding: '14px 16px', marginTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#92400E', marginBottom: 12, letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: 5 }}><StarIcon size={12} color="#92400E" /> BONUS POINTS</div>

            {/* Match Group Bonus */}
            <div
              onClick={() => setIsMatchGroup(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 14, padding: '10px 12px', borderRadius: 12, background: isMatchGroup ? '#EDE9FE' : '#F5F3FF', border: `1.5px solid ${isMatchGroup ? '#7C3AED44' : '#DDD6FE'}`, transition: 'all 0.15s' }}
            >
              <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: isMatchGroup ? '#7C3AED' : '#DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                {isMatchGroup && <CheckIcon size={13} color="#fff" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#5B21B6', display: 'flex', alignItems: 'center', gap: 5 }}><UsersIcon size={13} color="#5B21B6" /> Completed with matched group <span style={{ fontWeight: 900 }}>(+{MATCH_GROUP_BONUS} pts)</span></div>
                <div style={{ fontSize: 11, color: '#7C3AED', marginTop: 1 }}>From the Match tab · also unlocks 4-person group tier</div>
              </div>
            </div>

            {/* Tag friends */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                <UsersIcon size={13} color="#1A1A1A" /> Tag friends in your group
                <span style={{ fontWeight: 600, color: '#92400E', marginLeft: 6 }}>
                  {effectiveGroupSize === 1 ? '(solo · +0 pts)' : effectiveGroupSize < 4 ? `(${effectiveGroupSize} people · +3 pts)` : `(${effectiveGroupSize} people · +5 pts)`}
                  {isMatchGroup && effectiveGroupSize < 4 && <span style={{ color: '#7C3AED' }}> · match auto-upgrades to 4+</span>}
                </span>
              </div>
              {taggedFriends.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                  {taggedFriends.map(f => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: '#F0FDF4', borderRadius: 10, border: '1.5px solid #86EFAC' }}>
                      <FriendAvatar name={f.name} />
                      <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>{f.name}</span>
                      {f.country && <span style={{ fontSize: 12, color: '#6B7280' }}>{f.country}</span>}
                      <button onClick={() => removeFriend(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontWeight: 800, fontSize: 16, padding: '0 4px' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <input
                type="text"
                placeholder="Search for a friend to tag…"
                value={friendSearch}
                onChange={e => setFriendSearch(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 13, outline: 'none', background: '#F9FAFB', boxSizing: 'border-box' }}
              />
              {friendSearchLoading && <div style={{ fontSize: 12, color: '#9CA3AF', paddingTop: 6 }}>Searching…</div>}
              {friendResults.length > 0 && (
                <div style={{ marginTop: 4, border: '1.5px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                  {friendResults.slice(0, 5).map(u => (
                    <button
                      key={u.id}
                      onClick={() => addFriend(u)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'none', border: 'none', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <FriendAvatar name={u.name} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>{u.name}</div>
                        {u.country && <div style={{ fontSize: 11, color: '#6B7280' }}>{u.country}</div>}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: HUNT_PRIMARY }}>+ Tag</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setHasDiversity(v => !v)}>
              <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: hasDiversity ? '#F59E0B' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                {hasDiversity && <CheckIcon size={13} color="#fff" />}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>3+ countries represented <span style={{ fontWeight: 800 }}>(+3 pts)</span></span>
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 12, background: '#FEF2F2', border: '1.5px solid #FECACA' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}><AlertIcon size={13} color="#DC2626" /> Photo not accepted</div>
              <div style={{ fontSize: 13, color: '#374151' }}>{submitError}</div>
              <button onClick={() => { setPhotoUrl(null); setSubmitError(null) }} style={{ marginTop: 10, padding: '7px 14px', borderRadius: 8, border: 'none', background: '#DC2626', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Try a different photo
              </button>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={!canSubmit} style={{ width: '100%', marginTop: 18, padding: 14, borderRadius: 14, border: 'none', background: canSubmit ? HUNT_GRADIENT : '#E5E7EB', color: canSubmit ? '#fff' : '#9A9A9A', fontSize: 16, fontWeight: 800, cursor: canSubmit ? 'pointer' : 'default', boxShadow: canSubmit ? '0 4px 16px rgba(27,135,87,0.35)' : 'none', transition: 'all 0.2s' }}>
            {canSubmit ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><TrophyIcon size={16} color="#fff" /> Submit &amp; Claim Points</span> : 'Complete required steps above'}
          </button>
          {mission.requiresPhoto && canSubmit && (
            <div style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>AI will verify your photo before awarding points</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Mission Detail Sheet ──────────────────────────────────────────────────────
function MissionDetailSheet({ mission, isCompleted, onClose, onStart }) {
  const cfg = HUNT_TYPE_CONFIG[mission.type]
  const pts = DIFFICULTY_POINTS[mission.difficulty]
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div className="slide-up" style={{ background: '#fff', borderRadius: '22px 22px 0 0', maxHeight: '78vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, background: '#E0E0E0', borderRadius: 2 }} />
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: isCompleted ? HUNT_LIGHT : cfg.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isCompleted ? <CheckIcon size={28} color={HUNT_PRIMARY} /> : (() => { const Ic = ICON_MAP[cfg.iconKey]; return Ic ? <Ic size={26} color={cfg.color} /> : null })()}
            </div>
            <button onClick={onClose} style={iconBtn}><CloseIcon size={20} color="#9A9A9A" /></button>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.light, padding: '3px 10px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {(() => { const Ic = ICON_MAP[cfg.iconKey]; return Ic ? <Ic size={11} color={cfg.color} /> : null })()}
              {cfg.label}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: mission.difficulty === 'easy' ? '#16A34A' : mission.difficulty === 'medium' ? '#D97706' : '#DC2626', padding: '3px 10px', borderRadius: 10 }}>
              {mission.difficulty.toUpperCase()}
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, color: HUNT_PRIMARY, background: HUNT_LIGHT, padding: '3px 10px', borderRadius: 10 }}>+{pts}+ pts</span>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 10, lineHeight: 1.3 }}>{mission.title}</h2>
          <p style={{ fontSize: 14, color: '#4A4A4A', lineHeight: 1.7, marginBottom: 18 }}>{mission.desc}</p>

          {/* Repeatable banner */}
          {mission.repeatable && (
            <div style={{ background: 'linear-gradient(135deg, #FEF3C7, #FFF8E7)', border: '1.5px solid #F59E0B', borderRadius: 14, padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#92400E', marginBottom: 4 }}>🔁 REPEATABLE — DEMO CHALLENGE</div>
              <div style={{ fontSize: 13, color: '#78350F', lineHeight: 1.6 }}>{mission.repeatableNote}</div>
            </div>
          )}

          {/* Step-by-step instructions (for missions with custom steps) */}
          {mission.instructions && (
            <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 10, letterSpacing: '0.3px' }}>HOW TO PLAY</div>
              {mission.instructions.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#F59E0B', color: '#fff', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{step}</span>
                </div>
              ))}
            </div>
          )}

          {/* Standard requirements (for missions without custom steps) */}
          {!mission.instructions && (
            <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 10, letterSpacing: '0.3px' }}>WHAT YOU NEED</div>
              {[
                mission.requiresGPS && { icon: <PinIcon size={13} color={HUNT_PRIMARY} />, text: 'GPS location check' },
                mission.requiresPhoto && { icon: <CameraIcon size={13} color={HUNT_PRIMARY} />, text: 'Upload a photo' },
                mission.requiresQR && { icon: <LockIcon size={13} color="#9A9A9A" />, text: 'QR/NFC scan at location (coming soon)', muted: true },
                mission.allowTextAnswer && { icon: <CheckIcon size={13} color={HUNT_PRIMARY} />, text: mission.textPrompt || 'Short answer' },
              ].filter(Boolean).map((item, i) => (
                <div key={i} style={{ fontSize: 13, color: item.muted ? '#9A9A9A' : '#374151', fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          )}

          <div style={{ background: '#FFFBEB', borderRadius: 14, padding: '12px 16px', marginBottom: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#92400E', marginBottom: 6, letterSpacing: '0.3px' }}>EARN BONUS POINTS</div>
            <div style={{ fontSize: 13, color: '#78350F', lineHeight: 1.7 }}>
              {mission.bonusNote
                ? mission.bonusNote
                : `+3 with 2–3 friends · +5 with 4–6 friends · +3 for 3+ countries · +2 for sharing to feed${mission.timing !== 'evergreen' ? ' · +5 time-limited bonus' : ''}`}
            </div>
            {!mission.bonusNote && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px', background: '#EDE9FE', borderRadius: 10 }}>
                <UsersIcon size={14} color="#5B21B6" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#5B21B6' }}>+{MATCH_GROUP_BONUS} pts for completing with a matched group</span>
              </div>
            )}
          </div>

          {isCompleted && !mission.repeatable ? (
            <div style={{ textAlign: 'center', padding: '13px', background: HUNT_LIGHT, borderRadius: 14, color: HUNT_PRIMARY, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <CheckIcon size={16} color={HUNT_PRIMARY} /> You already completed this mission!
            </div>
          ) : (
            <button onClick={onStart} style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: mission.repeatable ? 'linear-gradient(135deg, #F59E0B, #D97706)' : HUNT_GRADIENT, color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: mission.repeatable ? '0 4px 16px rgba(245,158,11,0.4)' : '0 4px 16px rgba(27,135,87,0.35)' }}>
              {isCompleted && mission.repeatable ? <>📸 Submit Another Photo <ArrowRightIcon size={18} color="#fff" /></> : <>Start Mission <ArrowRightIcon size={18} color="#fff" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Mission Card ──────────────────────────────────────────────────────────────
function MissionCard({ mission, isCompleted, completionCount, onTap }) {
  const cfg = HUNT_TYPE_CONFIG[mission.type]
  const pts = DIFFICULTY_POINTS[mission.difficulty]
  const isRepeatable = mission.repeatable
  const timesCompleted = completionCount ?? 0
  const showDone = !isRepeatable && isCompleted
  const isFeatured = mission.section === 'featured'
  return (
    <div onClick={onTap} style={{ background: isFeatured ? 'linear-gradient(135deg, #FFF8E7, #FFF3F8)' : '#fff', borderRadius: 16, boxShadow: 'var(--shadow)', marginBottom: 10, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start', opacity: showDone ? 0.7 : 1, cursor: 'pointer', border: isFeatured ? '2px solid #F59E0B' : showDone ? `1.5px solid ${HUNT_PRIMARY}44` : '1.5px solid transparent' }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, background: showDone ? HUNT_LIGHT : cfg.light, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {(() => { const Ic = showDone ? CheckIcon : ICON_MAP[cfg.iconKey]; return Ic ? <Ic size={22} color={showDone ? HUNT_PRIMARY : cfg.color} /> : null })()}
        {isRepeatable && timesCompleted > 0 && (
          <div style={{ position: 'absolute', top: -6, right: -6, background: '#F59E0B', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 9, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>×{timesCompleted}</div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
          {isFeatured && <span style={{ fontSize: 11, fontWeight: 800, color: '#92400E', background: '#FEF3C7', padding: '2px 7px', borderRadius: 8 }}>⭐ DEMO</span>}
          {!isFeatured && <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.light, padding: '2px 7px', borderRadius: 8 }}>{cfg.label}</span>}
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: mission.difficulty === 'easy' ? '#F0FDF4' : mission.difficulty === 'medium' ? '#FFFBEB' : '#FEF2F2', color: mission.difficulty === 'easy' ? '#16A34A' : mission.difficulty === 'medium' ? '#D97706' : '#DC2626' }}>
            {mission.difficulty}
          </span>
          <span style={{ fontSize: 11, fontWeight: 800, color: HUNT_PRIMARY, marginLeft: 'auto' }}>+{pts} pts</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.35, marginBottom: 5 }}>{mission.title}</div>
        <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {mission.desc}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {mission.requiresGPS && <span style={{ ...verifyBadge, display: 'inline-flex', alignItems: 'center', gap: 3 }}><PinIcon size={9} color="#6B7280" /> GPS</span>}
          {mission.requiresPhoto && <span style={{ ...verifyBadge, display: 'inline-flex', alignItems: 'center', gap: 3 }}><CameraIcon size={9} color="#6B7280" /> Photo</span>}
          {mission.requiresQR && <span style={{ ...verifyBadge, opacity: 0.5, color: '#9A9A9A', display: 'inline-flex', alignItems: 'center', gap: 3 }}><LockIcon size={9} color="#9A9A9A" /> QR (Soon)</span>}
          {mission.allowTextAnswer && <span style={{ ...verifyBadge, display: 'inline-flex', alignItems: 'center', gap: 3 }}><CheckIcon size={9} color="#6B7280" /> Answer</span>}
          {isRepeatable && <span style={{ fontSize: 10, fontWeight: 800, color: '#F59E0B', background: '#FFFBEB', padding: '2px 7px', borderRadius: 8 }}>🔁 Repeatable</span>}
        </div>
      </div>
    </div>
  )
}

// ── Badges Section ────────────────────────────────────────────────────────────
function BadgesSection({ earnedIds }) {
  return (
    <div style={{ margin: '0 16px 14px' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <MedalIcon size={14} color="#B8860B" /> Badges
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {BADGES.map(badge => {
          const earned = earnedIds.includes(badge.id)
          const BadgeIc = ICON_MAP[badge.iconKey]
          return (
            <div key={badge.id} style={{ flex: 1, padding: '10px 8px', borderRadius: 14, textAlign: 'center', background: earned ? HUNT_LIGHT : '#F9FAFB', border: `1.5px solid ${earned ? HUNT_PRIMARY + '55' : '#E5E7EB'}`, opacity: earned ? 1 : 0.55, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', background: earned ? '#B2E8D044' : '#E5E7EB' }}>
                {earned && BadgeIc ? <BadgeIc size={16} color={HUNT_PRIMARY} /> : <LockIcon size={14} color="#9A9A9A" />}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: earned ? HUNT_PRIMARY : '#9A9A9A', lineHeight: 1.3 }}>{badge.name}</div>
              {earned && <div style={{ fontSize: 10, color: HUNT_PRIMARY, fontWeight: 800, marginTop: 2 }}>+{badge.points}</div>}
              {!earned && <div style={{ fontSize: 9, color: '#9A9A9A', marginTop: 2 }}>{badge.desc}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Leaderboard Tab ───────────────────────────────────────────────────────────
function LeaderboardTab({ huntData, user, onUserClick }) {
  const [mode, setMode] = useState('individual')
  const [apiBoard, setApiBoard] = useState(null)
  const [boardLoading, setBoardLoading] = useState(true)
  const totalPts = huntData.completions.reduce((s, c) => s + (c.pts?.total ?? 0), 0)
  const badgePts = huntData.badges.reduce((s, id) => { const b = BADGES.find(b => b.id === id); return s + (b?.points ?? 0) }, 0)
  const myTotal = totalPts + badgePts

  useEffect(() => {
    api.getLeaderboard()
      .then(data => { setApiBoard(data); setBoardLoading(false) })
      .catch(() => setBoardLoading(false))
  }, [])

  // Build individual list from API data; highlight current user by userId
  const allIndividual = apiBoard
    ? apiBoard.map(entry => ({
        ...entry,
        points: entry.pts,
        completed: entry.missions,
        isMe: user && entry.userId === user.id,
      }))
    : []
  const myRank = allIndividual.findIndex(e => e.isMe) + 1
  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ display: 'flex', gap: 0, margin: '16px 16px 14px', background: '#F3F4F6', borderRadius: 12, padding: 4 }}>
        {['individual', 'group'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer', background: mode === m ? '#fff' : 'transparent', color: mode === m ? '#1A1A1A' : '#6B7280', fontWeight: mode === m ? 700 : 500, fontSize: 13, boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            {m === 'individual' ? <><UserIcon size={13} color={mode === m ? '#1A1A1A' : '#6B7280'} /> Individual</> : <><LandmarkIcon size={13} color={mode === m ? '#1A1A1A' : '#6B7280'} /> By Dorm</>}
          </button>
        ))}
      </div>
      {mode === 'individual' && (
        <div style={{ margin: '0 16px 14px', background: HUNT_GRADIENT, borderRadius: 14, padding: '14px 16px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 600 }}>Your ranking</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>#{myRank}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{myTotal}</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>points total</div>
          </div>
        </div>
      )}
      <div style={{ padding: '0 16px' }}>
        {mode === 'individual' ? (
          boardLoading ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF', fontSize: 14 }}>Loading leaderboard…</div>
          ) : allIndividual.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF', fontSize: 14 }}>No users yet</div>
          ) : allIndividual.map((entry, i) => (
            <div
              key={entry.userId ?? i}
              onClick={() => !entry.isMe && entry.userId && onUserClick?.(entry.userId)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, marginBottom: 8, background: entry.isMe ? HUNT_LIGHT : '#fff', border: entry.isMe ? `1.5px solid ${HUNT_PRIMARY}44` : '1.5px solid var(--border)', cursor: !entry.isMe && entry.userId ? 'pointer' : 'default' }}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: i < 3 ? '#1A1A1A' : '#6B7280' }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: entry.isMe ? HUNT_PRIMARY : '#1A1A1A' }}>{entry.name}{entry.isMe ? ' (You)' : ''}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  {[entry.country, entry.dorm, `${entry.completed} mission${entry.completed !== 1 ? 's' : ''}`].filter(Boolean).join(' · ')}
                </div>
              </div>
              <div style={{ fontWeight: 900, fontSize: 17, color: entry.isMe ? HUNT_PRIMARY : '#1A1A1A' }}>{entry.points}</div>
            </div>
          ))
        ) : MOCK_GROUP_LEADERBOARD.map((group, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, marginBottom: 8, background: '#fff', border: '1.5px solid var(--border)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: i < 3 ? '#1A1A1A' : '#6B7280' }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{group.name}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{group.members} members · {group.leader}</div>
            </div>
            <div style={{ fontWeight: 900, fontSize: 17 }}>{group.points.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Badge Toast ───────────────────────────────────────────────────────────────
function BadgeToast({ badge, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t) }, [onDone])
  return (
    <div style={{ position: 'fixed', top: 64, left: '50%', transform: 'translateX(-50%)', zIndex: 3000, background: '#1A1A1A', borderRadius: 16, padding: '14px 22px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2ECC87', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {(() => { const Ic = ICON_MAP[badge.iconKey]; return Ic ? <Ic size={20} color="#fff" /> : <TrophyIcon size={20} color="#fff" /> })()}
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#9A9A9A', fontWeight: 600 }}>Badge Unlocked!</div>
        <div style={{ fontSize: 14, color: '#fff', fontWeight: 800 }}>{badge.name}</div>
        <div style={{ fontSize: 12, color: '#2ECC87', fontWeight: 700 }}>+{badge.points} bonus points</div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ScavengerHunt({ user, onUserClick }) {
  const [huntData, setHuntData] = useState(loadHunt)
  const [activeTab, setActiveTab] = useState('missions')
  const [sectionFilter, setSectionFilter] = useState('all')
  const [selectedMission, setSelectedMission] = useState(null)
  const [completing, setCompleting] = useState(null)
  const [newBadge, setNewBadge] = useState(null)

  // Load hunt state from API on mount
  useEffect(() => {
    api.getHuntStats()
      .then(stats => {
        const completions = stats.completions.map(c => ({
          missionId: c.missionId,
          timestamp: new Date(c.createdAt).getTime(),
          pts: { total: c.ptsTotal, base: c.ptsTotal, bonus: 0 },
          photoUrl: c.photoUrl,
          shareToFeed: c.shareToFeed,
        }))
        const earnedBadgeIds = BADGES.filter(b => b.check(completions)).map(b => b.id)
        const feedItems = stats.completions
          .filter(c => c.shareToFeed && c.photoUrl)
          .map(c => ({ photoUrl: c.photoUrl, missionTitle: c.missionTitle, time: c.time }))
        const updated = { completions, badges: earnedBadgeIds, feedItems }
        setHuntData(updated)
        saveHunt(updated)
      })
      .catch(() => {})
  }, [])

  const completedIds = new Set(huntData.completions.map(c => c.missionId))
  // Count completions per mission (for repeatable display)
  const completionCounts = {}
  huntData.completions.forEach(c => { completionCounts[c.missionId] = (completionCounts[c.missionId] ?? 0) + 1 })

  const totalPts = huntData.completions.reduce((s, c) => s + (c.pts?.total ?? 0), 0)
  const badgePts = huntData.badges.reduce((s, id) => { const b = BADGES.find(b => b.id === id); return s + (b?.points ?? 0) }, 0)
  const grandTotal = totalPts + badgePts
  const nonRepeatableMissions = MISSIONS.filter(m => !m.repeatable)
  const pct = nonRepeatableMissions.length > 0 ? Math.round(([...completedIds].filter(id => nonRepeatableMissions.some(m => m.id === id)).length / nonRepeatableMissions.length) * 100) : 0
  const filtered = sectionFilter === 'all' ? MISSIONS : MISSIONS.filter(m => m.section === sectionFilter)
  // Repeatable missions always stay in "remaining" so they can be re-done
  const completed = filtered.filter(m => !m.repeatable && completedIds.has(m.id))
  const remaining = filtered.filter(m => m.repeatable || !completedIds.has(m.id))

  // Group missions by section for the "All" view
  const missionsBySectionAll = SECTIONS.map(sec => ({
    ...sec,
    missions: MISSIONS.filter(m => m.section === sec.id),
  }))

  const handleComplete = ({ mission, pts, photoUrl, shareToFeed }) => {
    const completion = { missionId: mission.id, timestamp: Date.now(), pts, photoUrl: null, shareToFeed }
    const newCompletions = [...huntData.completions, completion]
    const newBadges = checkNewBadges(newCompletions, huntData.badges)
    const newBadgeIds = [...huntData.badges, ...newBadges.map(b => b.id)]
    const feedItem = shareToFeed && photoUrl ? { photoUrl, missionTitle: mission.title, time: 'Just now' } : null
    const updated = { completions: newCompletions, badges: newBadgeIds, feedItems: feedItem ? [...huntData.feedItems, feedItem] : huntData.feedItems }
    setHuntData(updated); saveHunt(updated)
    if (newBadges.length > 0) setNewBadge(newBadges[0])
  }

  return (
    <div className="fade-in" style={{ background: 'var(--bg)', minHeight: '100%' }}>
      {/* ── Hero Banner ── */}
      <div style={{ background: HUNT_GRADIENT, padding: '20px 20px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <TrophyIcon size={22} color="#FFD700" />
          <span style={{ fontSize: 19, fontWeight: 900, color: '#fff' }}>Scavenger Hunt</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* Circular progress ring */}
          <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
            <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="6" />
              <circle cx="36" cy="36" r="28" fill="none" stroke="#FFD700" strokeWidth="6"
                strokeDasharray={String(2 * Math.PI * 28)}
                strokeDashoffset={String(2 * Math.PI * 28 * (1 - pct / 100))}
                strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 900, fontSize: 14, color: '#fff' }}>{pct}%</span>
            </div>
          </div>
          <div style={{ color: '#fff' }}>
            <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1 }}>{grandTotal} <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.8 }}>pts</span></div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{completedIds.size}/{MISSIONS.length} missions done</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{huntData.badges.length} badge{huntData.badges.length !== 1 ? 's' : ''} earned</div>
          </div>
        </div>
      </div>

      {/* ── Inner Tabs ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', flexShrink: 0 }}>
        {[
          { id: 'missions',     Icon: MapIcon,     label: 'Missions',    sub: 'Go solo or with friends',    color: HUNT_PRIMARY },
          { id: 'match',        Icon: UsersIcon,   label: 'Get Matched', sub: 'Find your group',            color: '#7C3AED'    },
          { id: 'leaderboard',  Icon: TrophyIcon,  label: 'Board',       sub: 'Individual & Dorm rankings', color: '#F59E0B'    },
        ].map(t => {
          const active = activeTab === t.id
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              flex: 1, padding: '10px 4px 8px', background: active ? `${t.color}0D` : 'none',
              border: 'none', cursor: 'pointer', borderBottom: active ? `2.5px solid ${t.color}` : '2.5px solid transparent',
              transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              <t.Icon size={16} color={active ? t.color : '#6B7280'} />
              <span style={{ fontSize: 12, fontWeight: active ? 800 : 600, color: active ? t.color : '#6B7280', transition: 'color 0.15s' }}>{t.label}</span>
              <span style={{ fontSize: 9.5, fontWeight: 500, color: active ? t.color : '#9CA3AF', letterSpacing: '0.1px', lineHeight: 1.2, transition: 'color 0.15s' }}>{t.sub}</span>
            </button>
          )
        })}
      </div>

      {/* ── Missions Tab ── */}
      {activeTab === 'missions' && (
        <div>
          <div style={{ paddingTop: 14 }}>
            <BadgesSection earnedIds={huntData.badges} />
          </div>
          {/* Section filter chips */}
          <div style={{ overflowX: 'auto', display: 'flex', gap: 8, padding: '0 16px 14px', scrollbarWidth: 'none' }}>
            {SECTION_FILTERS.map(f => (
              <button key={f.id} onClick={() => setSectionFilter(f.id)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', background: sectionFilter === f.id ? HUNT_PRIMARY : '#fff', color: sectionFilter === f.id ? '#fff' : '#4A4A4A', fontSize: 13, fontWeight: sectionFilter === f.id ? 700 : 500, boxShadow: 'var(--shadow)', transition: 'all 0.15s' }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* ── All view: grouped by section ── */}
          {sectionFilter === 'all' ? (
            <div style={{ padding: '0 16px 24px' }}>
              <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 14 }}>
                {completedIds.size} of {MISSIONS.length} missions completed
              </div>
              {missionsBySectionAll.map(sec => {
                const secRemaining = sec.missions.filter(m => m.repeatable || !completedIds.has(m.id))
                const secCompleted = sec.missions.filter(m => !m.repeatable && completedIds.has(m.id))
                if (sec.missions.length === 0) return null
                return (
                  <div key={sec.id} style={{ marginBottom: 24 }}>
                    {/* Section header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      {(() => { const Ic = ICON_MAP[sec.iconKey]; return Ic ? <Ic size={15} color="#4A4A4A" /> : null })()}
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>{sec.label}</span>
                      {sec.id !== 'featured' && (
                        <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: HUNT_PRIMARY, background: HUNT_LIGHT, padding: '2px 8px', borderRadius: 8 }}>
                          {secCompleted.length}/{sec.missions.filter(m => !m.repeatable).length}
                        </span>
                      )}
                    </div>
                    {secRemaining.map(m => <MissionCard key={m.id} mission={m} isCompleted={completedIds.has(m.id)} completionCount={completionCounts[m.id]} onTap={() => setSelectedMission(m)} />)}
                    {secCompleted.map(m => <MissionCard key={m.id} mission={m} isCompleted={true} completionCount={completionCounts[m.id]} onTap={() => setSelectedMission(m)} />)}
                  </div>
                )
              })}
            </div>
          ) : (
            /* ── Filtered section view: flat list ── */
            <div style={{ padding: '0 16px 24px' }}>
              {(() => {
                const sec = SECTIONS.find(s => s.id === sectionFilter)
                return sec ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    {(() => { const Ic = ICON_MAP[sec.iconKey]; return Ic ? <Ic size={16} color="#4A4A4A" /> : null })()}
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#1A1A1A' }}>{sec.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: HUNT_PRIMARY, background: HUNT_LIGHT, padding: '2px 8px', borderRadius: 8 }}>
                      {completed.length}/{filtered.length} done
                    </span>
                  </div>
                ) : null
              })()}
              {remaining.map(m => <MissionCard key={m.id} mission={m} isCompleted={completedIds.has(m.id)} completionCount={completionCounts[m.id]} onTap={() => setSelectedMission(m)} />)}
              {completed.length > 0 && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: HUNT_PRIMARY, margin: '16px 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckIcon size={14} color={HUNT_PRIMARY} /> Completed ({completed.length})
                  </div>
                  {completed.map(m => <MissionCard key={m.id} mission={m} isCompleted={true} completionCount={completionCounts[m.id]} onTap={() => setSelectedMission(m)} />)}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'match' && <ScavengerMatch user={user} onUserClick={onUserClick} />}

      {activeTab === 'leaderboard' && <LeaderboardTab huntData={huntData} user={user} onUserClick={onUserClick} />}

      {/* ── Mission Detail — portal to escape scroll container ── */}
      {selectedMission && !completing && createPortal(
        <MissionDetailSheet
          mission={selectedMission}
          isCompleted={!selectedMission.repeatable && completedIds.has(selectedMission.id)}
          onClose={() => setSelectedMission(null)}
          onStart={() => setCompleting(selectedMission)}
        />,
        document.body
      )}

      {/* ── Completion Flow — portal to escape scroll container ── */}
      {completing && createPortal(
        <CompletionSheet
          mission={completing}
          onClose={() => { setCompleting(null); setSelectedMission(null) }}
          onComplete={handleComplete}
        />,
        document.body
      )}

      {newBadge && createPortal(
        <BadgeToast badge={newBadge} onDone={() => setNewBadge(null)} />,
        document.body
      )}
    </div>
  )
}

const iconBtn = { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }
const verifyBadge = { fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: '#F3F4F6', color: '#6B7280' }
