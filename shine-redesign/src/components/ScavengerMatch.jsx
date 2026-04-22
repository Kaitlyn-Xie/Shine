import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../lib/api'
import { CloseIcon, CheckIcon } from './Icons'
import { MISSIONS, computePoints, MATCH_GROUP_BONUS } from '../data/missions'

const PRIMARY = '#1B8757'
const GRADIENT = 'linear-gradient(135deg, #2ECC87, #1B8757)'
const LIGHT = '#E8F8F0'
const PURPLE = '#7C3AED'
const PURPLE_LIGHT = '#EDE9FE'

// ── Helpers ────────────────────────────────────────────────────────────────────
function countryFlag(country) {
  const map = { 'China': '🇨🇳', 'India': '🇮🇳', 'South Korea': '🇰🇷', 'Canada': '🇨🇦',
    'United Kingdom': '🇬🇧', 'Germany': '🇩🇪', 'France': '🇫🇷', 'Japan': '🇯🇵',
    'Brazil': '🇧🇷', 'Mexico': '🇲🇽', 'Australia': '🇦🇺', 'Singapore': '🇸🇬',
    'Nigeria': '🇳🇬', 'Ghana': '🇬🇭', 'South Africa': '🇿🇦', 'Italy': '🇮🇹',
    'Spain': '🇪🇸', 'Indonesia': '🇮🇩', 'Pakistan': '🇵🇰', 'Turkey': '🇹🇷' }
  return map[country] ?? '🌏'
}

function Avatar({ name, size = 36, color = GRADIENT }) {
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: color, color: '#fff', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.36, fontWeight: 800,
    }}>
      {initials}
    </div>
  )
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

// ── Mission Chooser Sheet ──────────────────────────────────────────────────────
function MissionChooserSheet({ groupId, onChosen, onClose }) {
  const [loading, setLoading] = useState(false)
  const [chosen, setChosen] = useState(null)

  // Use the top-level MISSIONS from the game data
  const available = MISSIONS.filter(m => m.type === 'location' || m.type === 'creative' || m.type === 'social').slice(0, 12)

  async function handleChoose(mission) {
    setChosen(mission.id)
    setLoading(true)
    try {
      await api.chooseGroupMission(groupId, mission.id, mission.title)
      onChosen({ missionId: mission.id, missionTitle: mission.title })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 2200, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div className="slide-up" style={{ background: '#fff', borderRadius: '22px 22px 0 0', maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, background: '#E0E0E0', borderRadius: 2 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px 14px', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>Choose Your Mission</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Pick one for your whole group to do together</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <CloseIcon size={20} color="#9A9A9A" />
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px 32px' }}>
          {available.map(m => (
            <div
              key={m.id}
              onClick={() => !loading && handleChoose(m)}
              style={{
                background: chosen === m.id ? LIGHT : '#F9FAFB',
                borderRadius: 16, padding: '14px 16px', marginBottom: 10,
                border: `1.5px solid ${chosen === m.id ? PRIMARY + '55' : '#F0F0F0'}`,
                cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                opacity: loading && chosen !== m.id ? 0.5 : 1, transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 28, width: 42, height: 42, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>{m.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{m.title}</div>
                <div style={{ fontSize: 12, color: '#6B7280', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.desc}</div>
              </div>
              {chosen === m.id && loading ? (
                <div style={{ fontSize: 18 }}>⏳</div>
              ) : (
                <div style={{ color: chosen === m.id ? PRIMARY : '#D1D5DB', fontSize: 20, fontWeight: 900 }}>›</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Group Mission Completion Sheet ────────────────────────────────────────────
function GroupMissionCompletionSheet({ group, onClose, onComplete }) {
  const mission = MISSIONS.find(m => String(m.id) === String(group.chosenMissionId))
  const difficulty = mission?.difficulty ?? 'medium'
  const [photoUrl, setPhotoUrl] = useState(null)
  const [caption, setCaption] = useState('')
  const [shareToFeed, setShareToFeed] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const fileRef = useRef(null)

  const pts = computePoints(
    { difficulty },
    { groupSize: group.members.length, hasDiversity: false, shareToFeed, isTimeLimited: false, isMatchGroup: true }
  )

  function handlePhoto(e) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhotoUrl(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    if (!photoUrl || submitting) return
    setSubmitting(true)
    try {
      await api.completeGroupMission(group.id, { photoUrl, caption, shareToFeed, ptsTotal: pts.total })
      setResult({ pts, shared: shareToFeed })
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 2200, background: 'rgba(0,0,0,0.65)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div className="slide-up" style={{ background: '#fff', borderRadius: '22px 22px 0 0', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {result ? (
          /* ── Success state ── */
          <div style={{ padding: '36px 24px 48px', textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Mission Complete!</div>
            <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>{group.chosenMissionTitle}</div>
            <div style={{ background: LIGHT, borderRadius: 20, padding: '20px 24px', marginBottom: 20 }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: PRIMARY }}>{result.pts.total}</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>points earned — for every group member</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 10, background: '#F0F0F0', color: '#1A1A1A' }}>Base: +{result.pts.base}</span>
                {result.pts.bonus > 0 && <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 10, background: LIGHT, color: PRIMARY }}>Bonuses: +{result.pts.bonus}</span>}
                <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 10, background: '#EDE9FE', color: PURPLE }}>🤖 AI Match: +{MATCH_GROUP_BONUS}</span>
              </div>
            </div>
            {result.shared && (
              <div style={{ background: '#F0FDF4', borderRadius: 14, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: PRIMARY, fontWeight: 600 }}>
                📸 Your group photo was posted to the community feed!
              </div>
            )}
            <button onClick={() => onComplete(result)} style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: GRADIENT, color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(27,135,87,0.35)' }}>
              Amazing! Keep exploring 🌟
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px', flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, background: '#E0E0E0', borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px 14px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>Complete Mission</div>
                  <span style={{ fontSize: 10, fontWeight: 800, background: '#EDE9FE', color: PURPLE, padding: '3px 8px', borderRadius: 8 }}>🤖 AI Match</span>
                </div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>{group.chosenMissionTitle}</div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <CloseIcon size={20} color="#9A9A9A" />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px 32px' }}>

              {/* Points Preview */}
              <div style={{ background: LIGHT, borderRadius: 16, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: PRIMARY, marginBottom: 2 }}>POINTS EACH MEMBER EARNS</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: '#fff', color: '#6B7280' }}>Base +{pts.base}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: '#EDE9FE', color: PURPLE }}>🤖 Match +{MATCH_GROUP_BONUS}</span>
                    {shareToFeed && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: '#FEF3C7', color: '#B45309' }}>📸 Share +2</span>}
                  </div>
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: PRIMARY }}>{pts.total}</div>
              </div>

              {/* Group Photo Upload */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Group photo proof <span style={{ color: '#EF4444' }}>*</span></div>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
                {photoUrl ? (
                  <div style={{ position: 'relative' }}>
                    <img src={photoUrl} alt="Group photo" style={{ width: '100%', borderRadius: 16, maxHeight: 220, objectFit: 'cover' }} />
                    <button onClick={() => { setPhotoUrl(null); fileRef.current.value = '' }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CloseIcon size={14} color="#fff" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current.click()} style={{ width: '100%', padding: '28px 0', borderRadius: 16, border: '2px dashed #D1D5DB', background: '#F9FAFB', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 36 }}>📸</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#6B7280' }}>Take or upload your group photo</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>Proof of mission completion</div>
                  </button>
                )}
              </div>

              {/* Caption */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Caption <span style={{ fontWeight: 500, color: '#9CA3AF' }}>(optional)</span></div>
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Share a moment from your mission…"
                  rows={2}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1.5px solid var(--border)', fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
                />
              </div>

              {/* Share to feed toggle */}
              <div
                onClick={() => setShareToFeed(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: shareToFeed ? LIGHT : '#F9FAFB', border: `1.5px solid ${shareToFeed ? PRIMARY + '55' : '#E5E7EB'}`, cursor: 'pointer', marginBottom: 20, transition: 'all 0.15s' }}
              >
                <div style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, background: shareToFeed ? PRIMARY : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                  {shareToFeed && <CheckIcon size={13} color="#fff" />}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Post to community feed</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Share your group photo with the SHINE community · +2 pts</div>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!photoUrl || submitting}
                style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: photoUrl ? GRADIENT : '#E5E7EB', color: photoUrl ? '#fff' : '#AAAAAA', fontWeight: 800, fontSize: 15, cursor: photoUrl ? 'pointer' : 'default', boxShadow: photoUrl ? '0 4px 16px rgba(27,135,87,0.3)' : 'none', transition: 'all 0.2s' }}
              >
                {submitting ? '⏳ Submitting…' : `🎯 Submit & Claim ${pts.total} Points`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}

// ── Group Chat View ────────────────────────────────────────────────────────────
function GroupChat({ group: initialGroup, currentUser, onBack, onMissionChosen }) {
  const [group, setGroup] = useState(initialGroup)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [showMissions, setShowMissions] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [loadingChat, setLoadingChat] = useState(true)
  const bottomRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    loadChat()
    pollRef.current = setInterval(loadChat, 6000)
    return () => clearInterval(pollRef.current)
  }, [group.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadChat() {
    try {
      const msgs = await api.getGroupChat(group.id)
      setMessages(msgs || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingChat(false)
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    const content = text.trim()
    setText('')
    setSending(true)
    try {
      const { message } = await api.sendGroupMessage(group.id, content)
      setMessages(prev => [...prev, message])
    } catch (e) {
      setText(content)
    } finally {
      setSending(false)
    }
  }

  function handleMissionChosen(chosen) {
    setShowMissions(false)
    setGroup(prev => ({ ...prev, chosenMissionId: chosen.missionId, chosenMissionTitle: chosen.missionTitle, status: 'mission_chosen' }))
    onMissionChosen(chosen)
  }

  function handleCompletionDone(result) {
    setShowCompletion(false)
    setGroup(prev => ({ ...prev, status: 'completed' }))
    loadChat()
  }

  const memberNames = group.members.map(m => m.name.split(' ')[0]).join(', ')
  const hasMission = !!group.chosenMissionId
  const isCompleted = group.status === 'completed'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F9FAFB' }}>
      {/* Chat Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: '2px 6px', color: PRIMARY }}>←</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Your Match Group</div>
            <div style={{ fontSize: 12, color: '#6B7280', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {memberNames}
            </div>
          </div>
          <div style={{ display: 'flex', gap: -6 }}>
            {group.members.slice(0, 4).map((m, i) => (
              <div key={m.id} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i }}>
                <Avatar name={m.name} size={28} />
              </div>
            ))}
          </div>
        </div>
        {/* Chosen mission banner */}
        {hasMission && (
          <div style={{ background: LIGHT, borderTop: `1px solid ${PRIMARY}22`, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🗺️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: PRIMARY, letterSpacing: '0.3px' }}>CHOSEN MISSION</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{group.chosenMissionTitle}</div>
            </div>
            <button
              onClick={() => setShowMissions(true)}
              style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, background: 'none', border: `1px solid ${PRIMARY}55`, borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}
            >
              Change
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loadingChat ? (
          <div style={{ textAlign: 'center', color: '#9A9A9A', padding: 24, fontSize: 13 }}>Loading chat…</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9A9A9A', padding: 24, fontSize: 13 }}>No messages yet. Say hi!</div>
        ) : messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Bottom CTA */}
      {!hasMission && (
        <div style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '12px 16px', flexShrink: 0 }}>
          <button onClick={() => setShowMissions(true)} style={{ width: '100%', padding: '12px', borderRadius: 14, border: 'none', background: GRADIENT, color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(27,135,87,0.3)' }}>
            🗺️ Choose Your Group Mission
          </button>
        </div>
      )}
      {hasMission && !isCompleted && (
        <div style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '12px 16px', flexShrink: 0 }}>
          <button
            onClick={() => setShowCompletion(true)}
            style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(124,58,237,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <span>🎯</span>
            <span>Complete Mission — Earn {computePoints({ difficulty: MISSIONS.find(m => String(m.id) === String(group.chosenMissionId))?.difficulty ?? 'medium' }, { groupSize: group.members.length, isMatchGroup: true, shareToFeed: true }).total} pts each</span>
          </button>
        </div>
      )}
      {isCompleted && (
        <div style={{ background: '#F0FDF4', borderTop: `1px solid ${PRIMARY}33`, padding: '12px 16px', flexShrink: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: PRIMARY }}>✅ Mission completed! Check your profile for points.</div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSend} style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '10px 12px', display: 'flex', gap: 8, flexShrink: 0, paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Message your group…"
          style={{ flex: 1, padding: '10px 14px', borderRadius: 22, border: '1.5px solid var(--border)', fontSize: 14, outline: 'none', background: '#F9FAFB', fontFamily: 'inherit' }}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          style={{ width: 42, height: 42, borderRadius: '50%', border: 'none', background: text.trim() ? GRADIENT : '#E5E7EB', color: '#fff', cursor: text.trim() ? 'pointer' : 'default', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}
        >
          ↑
        </button>
      </form>

      {showMissions && (
        <MissionChooserSheet groupId={group.id} onChosen={handleMissionChosen} onClose={() => setShowMissions(false)} />
      )}
      {showCompletion && (
        <GroupMissionCompletionSheet group={group} onClose={() => setShowCompletion(false)} onComplete={handleCompletionDone} />
      )}
    </div>
  )
}

function MessageBubble({ msg }) {
  const isSystem = msg.messageType === 'system'
  const isMe = msg.isMe

  if (isSystem) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
        <div style={{ background: PURPLE_LIGHT, borderRadius: 14, padding: '10px 14px', maxWidth: '88%', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: PURPLE, marginBottom: 4, letterSpacing: '0.3px' }}>✨ SHINE</div>
          <div style={{ fontSize: 13, color: '#4B2997', lineHeight: 1.6, fontWeight: 500 }}>
            {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
          </div>
          <div style={{ fontSize: 10, color: '#9A9A9A', marginTop: 4 }}>{timeAgo(msg.createdAt)}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
      {!isMe && (
        <Avatar name={msg.senderName} size={28} />
      )}
      <div style={{ maxWidth: '72%' }}>
        {!isMe && <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 3, marginLeft: 4 }}>{msg.senderName}</div>}
        <div style={{
          background: isMe ? PRIMARY : '#fff',
          color: isMe ? '#fff' : '#1A1A1A',
          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '9px 14px', fontSize: 14, lineHeight: 1.5,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          {msg.content}
        </div>
        <div style={{ fontSize: 10, color: '#9A9A9A', marginTop: 3, textAlign: isMe ? 'right' : 'left', paddingLeft: isMe ? 0 : 4 }}>
          {timeAgo(msg.createdAt)}
        </div>
      </div>
    </div>
  )
}

// ── Main ScavengerMatch Component ──────────────────────────────────────────────
export default function ScavengerMatch({ user }) {
  const [isOptIn, setIsOptIn] = useState(user?.isScavengerOptIn ?? false)
  const [optInLoading, setOptInLoading] = useState(false)
  const [inQueue, setInQueue] = useState(false)
  const [queueSize, setQueueSize] = useState(0)
  const [myGroups, setMyGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [runningMatch, setRunningMatch] = useState(false)
  const [matchResult, setMatchResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasActiveGroup, setHasActiveGroup] = useState(false)
  const [activeGroupId, setActiveGroupId] = useState(null)
  const [activeGroupMissionTitle, setActiveGroupMissionTitle] = useState(null)

  useEffect(() => { loadAll() }, [])

  function applyParticipation(p) {
    setIsOptIn(p?.isScavengerOptIn ?? false)
    setInQueue(p?.inQueue ?? false)
    setQueueSize(p?.queueSize ?? 0)
    setHasActiveGroup(p?.hasActiveGroup ?? false)
    setActiveGroupId(p?.activeGroupId ?? null)
    setActiveGroupMissionTitle(p?.activeGroupMissionTitle ?? null)
  }

  async function loadAll() {
    setLoading(true)
    try {
      const [participation, groups] = await Promise.all([
        api.getMyParticipation(),
        api.getMyGroups(),
      ])
      applyParticipation(participation)
      setMyGroups(groups || [])
    } catch (e) {
      console.error('ScavengerMatch load error', e)
    } finally {
      setLoading(false)
    }
  }

  async function toggleOptIn() {
    setOptInLoading(true)
    try {
      const newVal = !isOptIn
      await api.setScavengerOptIn(newVal)
      setIsOptIn(newVal)
      if (!newVal && inQueue) {
        await api.leaveMatchQueue()
        setInQueue(false)
      }
    } finally {
      setOptInLoading(false)
    }
  }

  async function handleJoinQueue() {
    try {
      const result = await api.joinMatchQueue()
      setInQueue(true)
      setQueueSize(result?.queueSize ?? queueSize + 1)
    } catch (e) {
      // If blocked because of active group, refresh participation to show correct state
      if (e?.status === 409 || e?.message?.includes('409')) {
        const participation = await api.getMyParticipation()
        applyParticipation(participation)
      } else {
        console.error(e)
      }
    }
  }

  async function handleLeaveQueue() {
    try {
      await api.leaveMatchQueue()
      setInQueue(false)
      setQueueSize(prev => Math.max(0, prev - 1))
    } catch (e) {
      console.error(e)
    }
  }

  async function handleRunMatch() {
    setRunningMatch(true)
    setMatchResult(null)
    try {
      const result = await api.runMatching()
      setMatchResult(result)
      if (result.groupsCreated > 0) {
        const [groups, participation] = await Promise.all([api.getMyGroups(), api.getMyParticipation()])
        setMyGroups(groups || [])
        applyParticipation(participation)
      }
    } catch (e) {
      setMatchResult({ error: e.message })
    } finally {
      setRunningMatch(false)
    }
  }

  function handleMissionChosen(chosen) {
    setMyGroups(prev => prev.map(g =>
      g.id === selectedGroup.id
        ? { ...g, chosenMissionId: chosen.missionId, chosenMissionTitle: chosen.missionTitle, status: 'mission_chosen' }
        : g
    ))
    setSelectedGroup(prev => prev ? { ...prev, chosenMissionId: chosen.missionId, chosenMissionTitle: chosen.missionTitle, status: 'mission_chosen' } : null)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <div style={{ color: PRIMARY, fontWeight: 700 }}>Loading…</div>
      </div>
    )
  }

  // ── Group Chat View ──
  if (selectedGroup) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', minHeight: 400 }}>
        <GroupChat
          group={selectedGroup}
          currentUser={user}
          onBack={() => { setSelectedGroup(null); loadAll() }}
          onMissionChosen={handleMissionChosen}
        />
      </div>
    )
  }

  // ── Main List View ──
  return (
    <div style={{ paddingBottom: 32 }}>

      {/* ── Opt-In Toggle ── */}
      <div style={{ margin: '0 16px 16px', background: isOptIn ? LIGHT : '#F9FAFB', borderRadius: 20, padding: '18px 20px', border: `1.5px solid ${isOptIn ? PRIMARY + '44' : '#E5E7EB'}`, transition: 'all 0.3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: isOptIn ? PRIMARY : '#1A1A1A', marginBottom: 4 }}>
              {isOptIn ? '✅ Matching enabled' : '🤝 Find Your Match Group'}
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
              {isOptIn
                ? 'AI will match you with students who share your interests. Join the queue below.'
                : 'Let AI match you with other Harvard international students based on your interests and hidden journal.'}
            </div>
          </div>
          <button
            onClick={toggleOptIn}
            disabled={optInLoading}
            style={{ flexShrink: 0, width: 52, height: 30, borderRadius: 15, border: 'none', background: isOptIn ? PRIMARY : '#D1D5DB', cursor: optInLoading ? 'default' : 'pointer', position: 'relative', transition: 'background 0.2s', opacity: optInLoading ? 0.7 : 1 }}
          >
            <div style={{ position: 'absolute', top: 3, left: isOptIn ? 25 : 3, width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
          </button>
        </div>
      </div>

      {/* ── Queue Section ── */}
      {isOptIn && (
        <div style={{ margin: '0 16px 20px' }}>
          {inQueue ? (
            <div style={{ background: PURPLE_LIGHT, borderRadius: 18, padding: '16px 18px', border: `1.5px solid ${PURPLE}33` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 24 }}>⏳</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: PURPLE }}>You're in the queue!</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{queueSize} student{queueSize !== 1 ? 's' : ''} waiting · AI matches daily</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleRunMatch}
                  disabled={runningMatch}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', background: PURPLE, color: '#fff', fontWeight: 800, fontSize: 13, cursor: runningMatch ? 'default' : 'pointer', opacity: runningMatch ? 0.7 : 1 }}
                >
                  {runningMatch ? '⏳ Matching…' : '🤖 Run AI Matching Now'}
                </button>
                <button
                  onClick={handleLeaveQueue}
                  style={{ padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${PURPLE}44`, background: '#fff', color: PURPLE, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Leave
                </button>
              </div>
              {matchResult && (
                <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 12, background: matchResult.error ? '#FEF2F2' : LIGHT, color: matchResult.error ? '#DC2626' : PRIMARY, fontSize: 13, fontWeight: 600 }}>
                  {matchResult.error ? `Error: ${matchResult.error}` : `✅ ${matchResult.message}`}
                </div>
              )}
            </div>
          ) : hasActiveGroup ? (
            /* ── Locked: active group mission in progress ── */
            <div style={{ background: '#FFFBEB', borderRadius: 18, padding: '16px 18px', border: '1.5px solid #FCD34D' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>🔒</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#B45309', marginBottom: 3 }}>Mission in progress</div>
                  <div style={{ fontSize: 13, color: '#92400E', lineHeight: 1.55 }}>
                    You can only be in one AI match group at a time.{activeGroupMissionTitle ? ` Complete "${activeGroupMissionTitle}" with your current group first.` : ' Complete your current group mission first.'}
                  </div>
                </div>
              </div>
              {activeGroupId && (
                <button
                  onClick={() => {
                    const g = myGroups.find(x => x.id === activeGroupId)
                    if (g) setSelectedGroup(g)
                  }}
                  style={{ width: '100%', padding: '11px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #D97706, #B45309)', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                >
                  Go to my active group →
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleJoinQueue}
              style={{ width: '100%', padding: '16px', borderRadius: 18, border: 'none', background: GRADIENT, color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 16px rgba(27,135,87,0.3)' }}
            >
              🙋 Join Matching Queue
            </button>
          )}
        </div>
      )}

      {/* ── My Groups ── */}
      {myGroups.length > 0 && (
        <div style={{ margin: '0 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', marginBottom: 12 }}>🤝 My Match Groups</div>
          {myGroups.map(g => (
            <GroupCard key={g.id} group={g} onOpen={() => setSelectedGroup(g)} />
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!isOptIn && myGroups.length === 0 && (
        <div style={{ margin: '0 16px', textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🌟</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#1A1A1A', marginBottom: 8 }}>Get matched with your group</div>
          <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>
            Turn on matching, join the queue, and AI will group you with Harvard international students who share your interests. Once matched, your group picks a mission together!
          </div>
        </div>
      )}

      {isOptIn && !inQueue && myGroups.length === 0 && (
        <div style={{ margin: '0 16px', textAlign: 'center', padding: '24px 20px' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>👆</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>Join the queue above</div>
          <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
            Once enough students join, AI will match you into a group based on shared interests — then you'll get a group chat to pick your mission together.
          </div>
        </div>
      )}
    </div>
  )
}

// ── Group Card (list item) ─────────────────────────────────────────────────────
function GroupCard({ group, onOpen }) {
  const unread = !group.chosenMissionId && group.latestMessage

  return (
    <div
      onClick={onOpen}
      style={{
        background: '#fff', borderRadius: 18, padding: '14px 16px', marginBottom: 12,
        boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
        border: `1.5px solid ${unread ? PRIMARY + '44' : '#F0F0F0'}`,
        cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center',
      }}
    >
      {/* Avatars stack */}
      <div style={{ display: 'flex', flexShrink: 0 }}>
        {group.members.slice(0, 3).map((m, i) => (
          <div key={m.id} style={{ marginLeft: i > 0 ? -10 : 0, zIndex: 3 - i }}>
            <Avatar name={m.name} size={38} />
          </div>
        ))}
        {group.members.length > 3 && (
          <div style={{ marginLeft: -10, zIndex: 0, width: 38, height: 38, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#6B7280', border: '2px solid #fff' }}>
            +{group.members.length - 3}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#1A1A1A' }}>
            {group.members.map(m => m.name.split(' ')[0]).join(', ')}
          </div>
          {group.chosenMissionId && (
            <span style={{ fontSize: 10, fontWeight: 800, background: LIGHT, color: PRIMARY, padding: '2px 7px', borderRadius: 8 }}>🗺️ Mission chosen</span>
          )}
        </div>
        {group.latestMessage ? (
          <div style={{ fontSize: 13, color: '#6B7280', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {group.latestMessage.messageType === 'system' ? '✨ ' : `${group.latestMessage.senderName}: `}
            {group.latestMessage.content.replace(/\*\*(.*?)\*\*/g, '$1').slice(0, 60)}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#9A9A9A' }}>No messages yet</div>
        )}
      </div>
      <div style={{ color: '#C0C0C0', fontSize: 20 }}>›</div>
    </div>
  )
}
