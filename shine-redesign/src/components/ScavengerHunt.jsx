import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  TrophyIcon, CloseIcon, CheckIcon, CameraIcon,
  ArrowRightIcon,
} from './Icons'
import {
  MISSIONS, BADGES, MOCK_LEADERBOARD, MOCK_GROUP_LEADERBOARD,
  HUNT_TYPE_CONFIG, DIFFICULTY_POINTS, computePoints, getDistance,
} from '../data/missions'
import { api } from '../lib/api'
import ScavengerMatch from './ScavengerMatch'

// ── Constants ────────────────────────────────────────────────────────────────
const HUNT_PRIMARY = '#1B8757'
const HUNT_GRADIENT = 'linear-gradient(135deg, #2ECC87, #1B8757)'
const HUNT_LIGHT = '#E8F8F0'
const STORAGE_KEY = 'shine_hunt_v1'

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'location', label: '📍 Location' },
  { id: 'resource', label: '🔧 Resource' },
  { id: 'social', label: '👥 Social' },
  { id: 'academic', label: '🎓 Academic' },
  { id: 'life', label: '🌿 Life' },
  { id: 'event', label: '🎪 Event' },
  { id: 'reflection', label: '💭 Reflect' },
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
function CompletionSheet({ mission, onClose, onComplete }) {
  const cfg = HUNT_TYPE_CONFIG[mission.type]
  const [gpsStatus, setGpsStatus] = useState('idle')
  const [gpsMsg, setGpsMsg] = useState('')
  const [photoUrl, setPhotoUrl] = useState(null)
  const [shareToFeed, setShareToFeed] = useState(false)
  const [qrConfirmed, setQrConfirmed] = useState(false)
  const [textAnswer, setTextAnswer] = useState('')
  const [groupSize, setGroupSize] = useState(1)
  const [hasDiversity, setHasDiversity] = useState(false)
  const [result, setResult] = useState(null)
  const fileRef = useRef(null)

  const gpsOk = !mission.requiresGPS || gpsStatus === 'passed' || gpsStatus === 'warning'
  const photoOk = !mission.requiresPhoto || photoUrl !== null
  const canSubmit = gpsOk && photoOk

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

  const handleSubmit = () => {
    const pts = computePoints(mission, { groupSize, hasDiversity, shareToFeed, isTimeLimited: mission.timing !== 'evergreen' })
    setResult({ pts, shareToFeed })
    onComplete({ mission, pts, photoUrl, shareToFeed })
  }

  if (result) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 2100, background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div className="slide-up" style={{ background: '#fff', borderRadius: '22px 22px 0 0', padding: '28px 24px 48px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Mission Complete!</div>
          <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>{mission.title}</div>
          <div style={{ background: HUNT_LIGHT, borderRadius: 18, padding: '20px 24px', marginBottom: 20 }}>
            <div style={{ fontSize: 42, fontWeight: 900, color: HUNT_PRIMARY }}>{result.pts.total}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>points earned</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 10, background: '#F0F0F0', color: '#1A1A1A' }}>Base: +{result.pts.base}</span>
              {result.pts.bonus > 0 && <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 10, background: HUNT_LIGHT, color: HUNT_PRIMARY }}>Bonuses: +{result.pts.bonus}</span>}
            </div>
          </div>
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
                <button onClick={handleGPS} style={{ padding: '9px 16px', borderRadius: 10, border: `1.5px solid ${cfg.color}44`, background: cfg.light, color: cfg.color, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  📍 Check my location
                </button>
              )}
              {gpsStatus === 'checking' && <div style={{ color: '#9A9A9A', fontSize: 13 }}>Locating you...</div>}
              {gpsStatus === 'passed' && <div style={{ color: HUNT_PRIMARY, fontWeight: 700, fontSize: 13 }}>✅ You are in range!</div>}
              {gpsStatus === 'warning' && (
                <div>
                  <div style={{ fontSize: 13, color: '#D97706', fontWeight: 600, marginBottom: 8 }}>⚠️ {gpsMsg}</div>
                  <button onClick={() => setGpsStatus('passed')} style={{ padding: '9px 16px', borderRadius: 10, border: '1.5px solid #D9770644', background: '#FFFBEB', color: '#D97706', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    I am at the location ✓
                  </button>
                </div>
              )}
            </StepBlock>
          )}

          {/* Photo */}
          {mission.requiresPhoto && (
            <StepBlock num={nextStep()} title="Upload Photo" done={photoOk} desc="Take or upload a photo to complete this mission.">
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
                <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#6B7280' }}>
                  🔲
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#6B7280' }}>QR / NFC Verification</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#fff', background: '#9A9A9A', padding: '2px 8px', borderRadius: 8 }}>Future Feature</span>
              </div>
              <div style={{ padding: '2px 14px 14px' }}>
                <p style={{ fontSize: 12, color: '#9A9A9A', margin: 0 }}>
                  QR code and NFC tag scanning will be available in a future update. This step is automatically skipped for now.
                </p>
              </div>
            </div>
          )}

          {/* Text Answer */}
          {mission.allowTextAnswer && (
            <StepBlock num="✍️" title="Your Answer" done={textAnswer.trim().length > 3} desc={mission.textPrompt || 'Write your answer below.'} optional>
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
            <div style={{ fontSize: 12, fontWeight: 800, color: '#92400E', marginBottom: 12, letterSpacing: '0.3px' }}>⭐ BONUS POINTS</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>👥 Group size</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ val: 1, label: 'Just me', bonus: '+0' }, { val: 2, label: '2–3 people', bonus: '+3' }, { val: 4, label: '4–6 people', bonus: '+5' }].map(o => (
                  <button key={o.val} onClick={() => setGroupSize(o.val)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', background: groupSize === o.val ? '#F59E0B' : '#FEF3C7', color: groupSize === o.val ? '#fff' : '#92400E', fontSize: 11, fontWeight: 700, lineHeight: 1.4 }}>
                    {o.label}<br /><span style={{ opacity: 0.8 }}>{o.bonus}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setHasDiversity(v => !v)}>
              <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: hasDiversity ? '#F59E0B' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                {hasDiversity && <CheckIcon size={13} color="#fff" />}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>3+ countries represented <span style={{ fontWeight: 800 }}>(+3 pts)</span></span>
            </div>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={!canSubmit} style={{ width: '100%', marginTop: 18, padding: 14, borderRadius: 14, border: 'none', background: canSubmit ? HUNT_GRADIENT : '#E5E7EB', color: canSubmit ? '#fff' : '#9A9A9A', fontSize: 16, fontWeight: 800, cursor: canSubmit ? 'pointer' : 'default', boxShadow: canSubmit ? '0 4px 16px rgba(27,135,87,0.35)' : 'none', transition: 'all 0.2s' }}>
            {canSubmit ? 'Submit & Claim Points 🏆' : 'Complete required steps above'}
          </button>
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
            <div style={{ width: 60, height: 60, borderRadius: 16, background: cfg.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
              {isCompleted ? '✅' : mission.emoji}
            </div>
            <button onClick={onClose} style={iconBtn}><CloseIcon size={20} color="#9A9A9A" /></button>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.light, padding: '3px 10px', borderRadius: 10 }}>{cfg.icon} {cfg.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: mission.difficulty === 'easy' ? '#16A34A' : mission.difficulty === 'medium' ? '#D97706' : '#DC2626', padding: '3px 10px', borderRadius: 10 }}>
              {mission.difficulty.toUpperCase()}
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, color: HUNT_PRIMARY, background: HUNT_LIGHT, padding: '3px 10px', borderRadius: 10 }}>+{pts}+ pts</span>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 10, lineHeight: 1.3 }}>{mission.title}</h2>
          <p style={{ fontSize: 14, color: '#4A4A4A', lineHeight: 1.7, marginBottom: 18 }}>{mission.desc}</p>

          <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 10, letterSpacing: '0.3px' }}>WHAT YOU NEED</div>
            {[
              mission.requiresGPS && '📍 GPS location check',
              mission.requiresPhoto && '📷 Upload a photo',
              mission.requiresQR && '🔲 QR/NFC scan at location (coming soon)',
              mission.allowTextAnswer && ('✍️ ' + (mission.textPrompt || 'Short answer')),
            ].filter(Boolean).map((item, i) => (
              <div key={i} style={{ fontSize: 13, color: '#374151', fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: HUNT_PRIMARY, fontWeight: 800 }}>→</span> {item}
              </div>
            ))}
          </div>

          <div style={{ background: '#FFFBEB', borderRadius: 14, padding: '12px 16px', marginBottom: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#92400E', marginBottom: 6, letterSpacing: '0.3px' }}>EARN BONUS POINTS</div>
            <div style={{ fontSize: 13, color: '#78350F', lineHeight: 1.6 }}>
              +3 with 2–3 friends · +5 with 4–6 friends · +3 for 3+ countries · +2 for sharing to feed
              {mission.timing !== 'evergreen' && ' · +5 time-limited bonus'}
            </div>
          </div>

          {isCompleted ? (
            <div style={{ textAlign: 'center', padding: '13px', background: HUNT_LIGHT, borderRadius: 14, color: HUNT_PRIMARY, fontWeight: 700, fontSize: 14 }}>
              ✅ You already completed this mission!
            </div>
          ) : (
            <button onClick={onStart} style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: HUNT_GRADIENT, color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(27,135,87,0.35)' }}>
              Start Mission <ArrowRightIcon size={18} color="#fff" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Mission Card ──────────────────────────────────────────────────────────────
function MissionCard({ mission, isCompleted, onTap }) {
  const cfg = HUNT_TYPE_CONFIG[mission.type]
  const pts = DIFFICULTY_POINTS[mission.difficulty]
  return (
    <div onClick={onTap} style={{ background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow)', marginBottom: 10, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start', opacity: isCompleted ? 0.7 : 1, cursor: 'pointer', border: isCompleted ? `1.5px solid ${HUNT_PRIMARY}44` : '1.5px solid transparent' }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, background: isCompleted ? HUNT_LIGHT : cfg.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
        {isCompleted ? '✅' : mission.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.light, padding: '2px 7px', borderRadius: 8 }}>{cfg.label}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: mission.difficulty === 'easy' ? '#F0FDF4' : mission.difficulty === 'medium' ? '#FFFBEB' : '#FEF2F2', color: mission.difficulty === 'easy' ? '#16A34A' : mission.difficulty === 'medium' ? '#D97706' : '#DC2626' }}>
            {mission.difficulty}
          </span>
          <span style={{ fontSize: 11, fontWeight: 800, color: HUNT_PRIMARY, marginLeft: 'auto' }}>+{pts} pts</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.35, marginBottom: 5 }}>{mission.title}</div>
        <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {mission.desc}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {mission.requiresGPS && <span style={verifyBadge}>📍 GPS</span>}
          {mission.requiresPhoto && <span style={verifyBadge}>📷 Photo</span>}
          {mission.requiresQR && <span style={{ ...verifyBadge, opacity: 0.5, color: '#9A9A9A' }}>🔲 QR/NFC (Soon)</span>}
          {mission.allowTextAnswer && <span style={verifyBadge}>✍️ Answer</span>}
        </div>
      </div>
    </div>
  )
}

// ── Badges Section ────────────────────────────────────────────────────────────
function BadgesSection({ earnedIds }) {
  return (
    <div style={{ margin: '0 16px 14px' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', marginBottom: 10 }}>🏅 Badges</div>
      <div style={{ display: 'flex', gap: 10 }}>
        {BADGES.map(badge => {
          const earned = earnedIds.includes(badge.id)
          return (
            <div key={badge.id} style={{ flex: 1, padding: '10px 8px', borderRadius: 14, textAlign: 'center', background: earned ? HUNT_LIGHT : '#F9FAFB', border: `1.5px solid ${earned ? HUNT_PRIMARY + '55' : '#E5E7EB'}`, opacity: earned ? 1 : 0.55 }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{earned ? badge.emoji : '🔒'}</div>
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
function LeaderboardTab({ huntData, user }) {
  const [mode, setMode] = useState('individual')
  const totalPts = huntData.completions.reduce((s, c) => s + (c.pts?.total ?? 0), 0)
  const badgePts = huntData.badges.reduce((s, id) => { const b = BADGES.find(b => b.id === id); return s + (b?.points ?? 0) }, 0)
  const myTotal = totalPts + badgePts
  const myEntry = { name: user?.name || 'You', country: '🌟', house: user?.house || 'Your House', points: myTotal, completed: huntData.completions.length, isMe: true }
  const allIndividual = [...MOCK_LEADERBOARD, myEntry].sort((a, b) => b.points - a.points)
  const myRank = allIndividual.findIndex(e => e.isMe) + 1
  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ display: 'flex', gap: 0, margin: '16px 16px 14px', background: '#F3F4F6', borderRadius: 12, padding: 4 }}>
        {['individual', 'group'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer', background: mode === m ? '#fff' : 'transparent', color: mode === m ? '#1A1A1A' : '#6B7280', fontWeight: mode === m ? 700 : 500, fontSize: 13, boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
            {m === 'individual' ? '👤 Individual' : '🏠 By House'}
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
        {mode === 'individual' ? allIndividual.map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, marginBottom: 8, background: entry.isMe ? HUNT_LIGHT : '#fff', border: entry.isMe ? `1.5px solid ${HUNT_PRIMARY}44` : '1.5px solid var(--border)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: i < 3 ? '#1A1A1A' : '#6B7280' }}>
              {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: entry.isMe ? HUNT_PRIMARY : '#1A1A1A' }}>{entry.name}{entry.isMe ? ' (You)' : ''}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{entry.country} · {entry.completed} missions</div>
            </div>
            <div style={{ fontWeight: 900, fontSize: 17, color: entry.isMe ? HUNT_PRIMARY : '#1A1A1A' }}>{entry.points}</div>
          </div>
        )) : MOCK_GROUP_LEADERBOARD.map((group, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, marginBottom: 8, background: '#fff', border: '1.5px solid var(--border)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>
              {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
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
      <span style={{ fontSize: 26 }}>{badge.emoji}</span>
      <div>
        <div style={{ fontSize: 11, color: '#9A9A9A', fontWeight: 600 }}>Badge Unlocked!</div>
        <div style={{ fontSize: 14, color: '#fff', fontWeight: 800 }}>{badge.name}</div>
        <div style={{ fontSize: 12, color: '#2ECC87', fontWeight: 700 }}>+{badge.points} bonus points</div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ScavengerHunt({ user }) {
  const [huntData, setHuntData] = useState(loadHunt)
  const [activeTab, setActiveTab] = useState('missions')
  const [typeFilter, setTypeFilter] = useState('all')
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
  const totalPts = huntData.completions.reduce((s, c) => s + (c.pts?.total ?? 0), 0)
  const badgePts = huntData.badges.reduce((s, id) => { const b = BADGES.find(b => b.id === id); return s + (b?.points ?? 0) }, 0)
  const grandTotal = totalPts + badgePts
  const pct = Math.round((completedIds.size / MISSIONS.length) * 100)
  const filtered = typeFilter === 'all' ? MISSIONS : MISSIONS.filter(m => m.type === typeFilter)
  const completed = filtered.filter(m => completedIds.has(m.id))
  const remaining = filtered.filter(m => !completedIds.has(m.id))

  const handleComplete = ({ mission, pts, photoUrl, shareToFeed }) => {
    const completion = { missionId: mission.id, timestamp: Date.now(), pts, photoUrl: null, shareToFeed }
    const newCompletions = [...huntData.completions, completion]
    const newBadges = checkNewBadges(newCompletions, huntData.badges)
    const newBadgeIds = [...huntData.badges, ...newBadges.map(b => b.id)]
    const feedItem = shareToFeed && photoUrl ? { photoUrl, missionTitle: mission.title, time: 'Just now' } : null
    const updated = { completions: newCompletions, badges: newBadgeIds, feedItems: feedItem ? [...huntData.feedItems, feedItem] : huntData.feedItems }
    setHuntData(updated); saveHunt(updated)
    if (newBadges.length > 0) setNewBadge(newBadges[0])

    // Persist to API in background
    api.completeHuntMission({
      missionId: mission.id,
      missionTitle: mission.title,
      ptsTotal: pts?.total ?? 0,
      photoUrl: photoUrl ?? null,
      shareToFeed: shareToFeed ?? false,
    }).catch(e => console.error('API hunt save failed:', e))
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
        {[{ id: 'missions', label: '🗺️ Missions' }, { id: 'match', label: '🤝 Match' }, { id: 'leaderboard', label: '🏆 Board' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500, color: activeTab === t.id ? HUNT_PRIMARY : '#6B7280', borderBottom: activeTab === t.id ? `2.5px solid ${HUNT_PRIMARY}` : '2.5px solid transparent', transition: 'all 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Missions Tab ── */}
      {activeTab === 'missions' && (
        <div>
          <div style={{ paddingTop: 14 }}>
            <BadgesSection earnedIds={huntData.badges} />
          </div>
          {/* Filter chips */}
          <div style={{ overflowX: 'auto', display: 'flex', gap: 8, padding: '0 16px 14px', scrollbarWidth: 'none' }}>
            {CATEGORY_FILTERS.map(f => (
              <button key={f.id} onClick={() => setTypeFilter(f.id)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', background: typeFilter === f.id ? HUNT_PRIMARY : '#fff', color: typeFilter === f.id ? '#fff' : '#4A4A4A', fontSize: 13, fontWeight: typeFilter === f.id ? 700 : 500, boxShadow: 'var(--shadow)', transition: 'all 0.15s' }}>
                {f.label}
              </button>
            ))}
          </div>
          {/* Mission list — remaining first, then completed */}
          <div style={{ padding: '0 16px 24px' }}>
            <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 10 }}>
              {completed.length} of {filtered.length} completed
            </div>
            {remaining.map(m => <MissionCard key={m.id} mission={m} isCompleted={false} onTap={() => setSelectedMission(m)} />)}
            {completed.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: HUNT_PRIMARY, margin: '16px 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckIcon size={14} color={HUNT_PRIMARY} /> Completed ({completed.length})
                </div>
                {completed.map(m => <MissionCard key={m.id} mission={m} isCompleted={true} onTap={() => setSelectedMission(m)} />)}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'match' && <ScavengerMatch user={user} />}

      {activeTab === 'leaderboard' && <LeaderboardTab huntData={huntData} user={user} />}

      {/* ── Mission Detail — portal to escape scroll container ── */}
      {selectedMission && !completing && createPortal(
        <MissionDetailSheet
          mission={selectedMission}
          isCompleted={completedIds.has(selectedMission.id)}
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
