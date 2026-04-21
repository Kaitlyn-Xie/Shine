import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../lib/api'
import { CloseIcon, CheckIcon } from './Icons'

const PRIMARY = '#1B8757'
const GRADIENT = 'linear-gradient(135deg, #2ECC87, #1B8757)'
const LIGHT = '#E8F8F0'

const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 6,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

// ── Country flag helper ────────────────────────────────────────────────────────
function countryInitials(country) {
  if (!country) return '🌍'
  const map = { 'China': '🇨🇳', 'India': '🇮🇳', 'South Korea': '🇰🇷', 'Canada': '🇨🇦',
    'United Kingdom': '🇬🇧', 'Germany': '🇩🇪', 'France': '🇫🇷', 'Japan': '🇯🇵',
    'Brazil': '🇧🇷', 'Mexico': '🇲🇽', 'Australia': '🇦🇺', 'Singapore': '🇸🇬',
    'Nigeria': '🇳🇬', 'Ghana': '🇬🇭', 'South Africa': '🇿🇦', 'Italy': '🇮🇹',
    'Spain': '🇪🇸', 'Indonesia': '🇮🇩', 'Pakistan': '🇵🇰', 'Turkey': '🇹🇷' }
  return map[country] ?? '🌏'
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 36 }) {
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: GRADIENT, color: '#fff', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.36, fontWeight: 800,
    }}>
      {initials}
    </div>
  )
}

// ── Match Info Sheet ───────────────────────────────────────────────────────────
function GroupDetailSheet({ group, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2100, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div className="slide-up" style={{ background: '#fff', borderRadius: '22px 22px 0 0', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, background: '#E0E0E0', borderRadius: 2 }} />
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 22, marginBottom: 4 }}>🤝</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#1A1A1A' }}>{group.mission?.title}</div>
            </div>
            <button onClick={onClose} style={iconBtn}><CloseIcon size={20} color="#9A9A9A" /></button>
          </div>

          {group.matchingSummary && (
            <div style={{ background: LIGHT, borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: PRIMARY, marginBottom: 6, letterSpacing: '0.3px' }}>✨ WHY YOU WERE MATCHED</div>
              <p style={{ fontSize: 14, color: '#2D5A3D', lineHeight: 1.7, margin: 0 }}>{group.matchingSummary}</p>
            </div>
          )}

          <div style={{ fontSize: 13, fontWeight: 800, color: '#6B7280', marginBottom: 12, letterSpacing: '0.3px' }}>YOUR GROUP ({group.members.length} members)</div>
          {group.members.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, padding: '10px 14px', background: '#F9FAFB', borderRadius: 14 }}>
              <Avatar name={m.name} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                {m.country && <div style={{ fontSize: 12, color: '#6B7280' }}>{countryInitials(m.country)} {m.country}</div>}
              </div>
            </div>
          ))}

          <div style={{ background: '#FFFBEB', borderRadius: 14, padding: '12px 16px', marginTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#92400E', marginBottom: 6 }}>📋 NEXT STEPS</div>
            <p style={{ fontSize: 13, color: '#78350F', lineHeight: 1.6, margin: 0 }}>
              Reach out to your group through the Chat tab to coordinate! You can also share contact info and plan your mission together.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Mission Card ───────────────────────────────────────────────────────────────
function MissionCard({ mission, joined, optedIn, onOptIn, onJoin, onLeave }) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (!optedIn) { await onOptIn(); return }
    setLoading(true)
    try {
      if (joined) await onLeave()
      else await onJoin()
    } finally {
      setLoading(false)
    }
  }

  const btnLabel = loading ? '…'
    : !optedIn ? '🔎 Turn on matching to join'
    : joined ? '✓ Joined — Leave'
    : 'Join this Mission'

  return (
    <div style={{
      background: '#fff', borderRadius: 18, padding: '16px 18px', marginBottom: 12,
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      border: `1.5px solid ${joined && optedIn ? PRIMARY + '55' : '#F0F0F0'}`,
      transition: 'border-color 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: joined && optedIn ? LIGHT : '#F3F4F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>
          {joined && optedIn ? '✅' : '🗺️'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{mission.title}</div>
          <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{mission.description}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9A9A9A', marginTop: 8 }}>
            👥 Min {mission.minGroupSize} students per group
            {mission.maxGroupSize ? ` · Max ${mission.maxGroupSize}` : ''}
          </div>
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        style={{
          width: '100%', marginTop: 14, padding: '11px 0', borderRadius: 12,
          border: joined && optedIn ? `1.5px solid ${PRIMARY}` : 'none',
          background: !optedIn ? '#F3F4F6' : joined ? '#fff' : GRADIENT,
          color: !optedIn ? '#6B7280' : joined ? PRIMARY : '#fff',
          fontWeight: 800, fontSize: 14, cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
        }}
      >
        {btnLabel}
      </button>
    </div>
  )
}

// ── Main ScavengerMatch Component ──────────────────────────────────────────────
export default function ScavengerMatch({ user }) {
  const [isOptIn, setIsOptIn] = useState(user?.isScavengerOptIn ?? false)
  const [optInLoading, setOptInLoading] = useState(false)
  const [missions, setMissions] = useState([])
  const [joinedIds, setJoinedIds] = useState(new Set())
  const [myGroups, setMyGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [runningMatch, setRunningMatch] = useState(null)
  const [matchResult, setMatchResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [missions, participation, groups] = await Promise.all([
        api.getScavengerMissions(),
        api.getMyParticipation(),
        api.getMyGroups(),
      ])
      setMissions(missions || [])
      setIsOptIn(participation?.isScavengerOptIn ?? false)
      setJoinedIds(new Set(participation?.joinedMissionIds ?? []))
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
    } finally {
      setOptInLoading(false)
    }
  }

  async function handleJoin(missionId) {
    await api.joinScavengerMission(missionId)
    setJoinedIds(prev => new Set([...prev, missionId]))
  }

  async function handleLeave(missionId) {
    await api.leaveScavengerMission(missionId)
    setJoinedIds(prev => { const s = new Set(prev); s.delete(missionId); return s })
  }

  async function handleRunMatch(missionId) {
    setRunningMatch(missionId)
    setMatchResult(null)
    try {
      const result = await api.runMatching(missionId)
      setMatchResult({ missionId, ...result })
      if (result.groupsCreated > 0) {
        // Reload groups after successful match
        const groups = await api.getMyGroups()
        setMyGroups(groups || [])
      }
    } catch (e) {
      setMatchResult({ missionId, error: e.message })
    } finally {
      setRunningMatch(null)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <div style={{ color: PRIMARY, fontWeight: 700 }}>Loading…</div>
      </div>
    )
  }

  const groupsByMission = {}
  for (const g of myGroups) {
    if (!groupsByMission[g.missionId]) groupsByMission[g.missionId] = []
    groupsByMission[g.missionId].push(g)
  }

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Opt-In Toggle Card */}
      <div style={{ margin: '0 16px 20px', background: isOptIn ? LIGHT : '#F9FAFB', borderRadius: 20, padding: '18px 20px', border: `1.5px solid ${isOptIn ? PRIMARY + '44' : '#E5E7EB'}`, transition: 'all 0.3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: isOptIn ? PRIMARY : '#1A1A1A', marginBottom: 4 }}>
              {isOptIn ? '✅ You\'re opted in!' : '🔎 Find Your Match Group'}
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
              {isOptIn
                ? 'You\'ll be matched into a group for any missions you join. Turn off to opt out.'
                : 'Let AI match you with other students for group scavenger hunt missions based on your interests and goals.'}
            </div>
          </div>
          <button
            onClick={toggleOptIn}
            disabled={optInLoading}
            style={{
              flexShrink: 0, width: 52, height: 30, borderRadius: 15, border: 'none',
              background: isOptIn ? PRIMARY : '#D1D5DB',
              cursor: optInLoading ? 'default' : 'pointer',
              position: 'relative', transition: 'background 0.2s', opacity: optInLoading ? 0.7 : 1,
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: isOptIn ? 25 : 3,
              width: 24, height: 24, borderRadius: '50%', background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s',
            }} />
          </button>
        </div>
      </div>

      {/* My Groups Section */}
      {myGroups.length > 0 && (
        <div style={{ margin: '0 16px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', marginBottom: 12 }}>🤝 My Groups</div>
          {myGroups.map(g => (
            <div
              key={g.id}
              onClick={() => setSelectedGroup(g)}
              style={{
                background: '#fff', borderRadius: 16, padding: '14px 16px', marginBottom: 10,
                boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: `1.5px solid ${PRIMARY}33`,
                cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 28 }}>🤝</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{g.mission?.title ?? 'Mission'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex', gap: -6 }}>
                    {(g.members || []).slice(0, 4).map((m, i) => (
                      <div key={m.id} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i }}>
                        <Avatar name={m.name} size={26} />
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>
                    {g.members.length} member{g.members.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {g.matchingSummary && (
                  <div style={{ fontSize: 12, color: PRIMARY, fontWeight: 600, marginTop: 4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    ✨ {g.matchingSummary}
                  </div>
                )}
              </div>
              <div style={{ color: '#C0C0C0', fontSize: 18 }}>›</div>
            </div>
          ))}
        </div>
      )}

      {/* Missions List — always visible */}
      <div style={{ margin: '0 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', marginBottom: 4 }}>🗺️ Group Missions</div>
        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>
          {isOptIn
            ? "Join missions you'd like to do with a group. You'll be AI-matched when enough students sign up."
            : "Turn on matching above, then join any mission below to get matched with a group."}
        </div>
        {missions.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, color: '#9A9A9A', fontSize: 14 }}>No missions available yet.</div>
        )}
        {missions.map(m => (
          <div key={m.id}>
            <MissionCard
              mission={m}
              joined={joinedIds.has(m.id)}
              optedIn={isOptIn}
              onOptIn={toggleOptIn}
              onJoin={() => handleJoin(m.id)}
              onLeave={() => handleLeave(m.id)}
            />
            {/* Run Matching button — visible when joined + opted in + no group yet */}
            {isOptIn && joinedIds.has(m.id) && !groupsByMission[m.id]?.length && (
              <div style={{ marginBottom: 14, marginTop: -4 }}>
                <button
                  onClick={() => handleRunMatch(m.id)}
                  disabled={runningMatch === m.id}
                  style={{
                    width: '100%', padding: '10px 0', borderRadius: 12, border: `1.5px dashed ${PRIMARY}66`,
                    background: '#fff', color: PRIMARY, fontWeight: 700, fontSize: 13,
                    cursor: runningMatch === m.id ? 'default' : 'pointer',
                    opacity: runningMatch === m.id ? 0.7 : 1,
                  }}
                >
                  {runningMatch === m.id ? '⏳ Running AI matching…' : '🤖 Try to form groups now'}
                </button>
                {matchResult?.missionId === m.id && (
                  <div style={{
                    marginTop: 8, padding: '10px 14px', borderRadius: 12,
                    background: matchResult.error ? '#FEF2F2' : LIGHT,
                    color: matchResult.error ? '#DC2626' : PRIMARY,
                    fontSize: 13, fontWeight: 600,
                  }}>
                    {matchResult.error
                      ? `Error: ${matchResult.error}`
                      : matchResult.groupsCreated > 0
                        ? `✅ ${matchResult.message}`
                        : `ℹ️ ${matchResult.message}`}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Group Detail Sheet */}
      {selectedGroup && createPortal(
        <GroupDetailSheet group={selectedGroup} onClose={() => setSelectedGroup(null)} />,
        document.body
      )}
    </div>
  )
}
