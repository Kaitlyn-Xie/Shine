import { useState } from 'react'
import { ChevronLeftIcon, TargetIcon, TrophyIcon, CheckIcon, CameraIcon, ArrowRightIcon, StarIcon } from './Icons'

const LEADERBOARD = [
  { rank: 1, team: 'The Crimson Crew', score: 2400 },
  { rank: 2, team: 'Globe Trotters',   score: 2100 },
  { rank: 3, team: 'Campus Explorers', score: 1850 },
  { rank: 4, team: 'Freshman Force',   score: 1600 },
  { rank: 5, team: 'World Wide Herd',  score: 1200 },
]

const TASKS = [
  { id: 1, label: 'Visit Widener Library',            points: 200, done: false },
  { id: 2, label: 'Find the best coffee spot',         points: 150, done: false },
  { id: 3, label: 'Take a photo at Johnston Gate',     points: 300, done: false },
  { id: 4, label: 'Find the John Harvard statue',      points: 250, done: false },
  { id: 5, label: 'Discover the secret garden',        points: 400, done: false },
  { id: 6, label: 'Reach the top of Science Center',   points: 350, done: false },
]

const rankLabel = (rank) => {
  if (rank === 1) return '1st'
  if (rank === 2) return '2nd'
  if (rank === 3) return '3rd'
  return `${rank}th`
}

export default function ScavengerHunt({ onBack }) {
  const [view, setView] = useState('main')
  const [team, setTeam] = useState(null)
  const [teamName, setTeamName] = useState('')
  const [tasks, setTasks] = useState(TASKS)
  const [joinCode, setJoinCode] = useState('')

  const completed = tasks.filter(t => t.done)
  const totalPoints = completed.reduce((sum, t) => sum + t.points, 0)
  const progress = Math.round((completed.length / tasks.length) * 100)

  const toggleTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))

  if (view === 'active' && team) {
    return (
      <div className="fade-in">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px 12px', background: '#fff',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <button onClick={() => setView('main')} style={iconBtn}>
            <ChevronLeftIcon size={22} color="#4A4A4A" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{team}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {completed.length}/{tasks.length} tasks · {totalPoints} pts
            </div>
          </div>
          <button onClick={() => setView('leaderboard')} style={{
            background: '#FFFBF0', border: '1.5px solid var(--yellow)',
            borderRadius: 20, padding: '7px 14px', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, color: 'var(--orange)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <TrophyIcon size={14} color="var(--orange)" /> Leaderboard
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ padding: '16px 20px 8px' }}>
          <div style={{ background: 'var(--border)', borderRadius: 8, height: 7, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 8,
              background: 'linear-gradient(90deg, #FFC94A, #FF9A3C)',
              width: `${progress}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 5, textAlign: 'right' }}>
            {progress}% complete
          </div>
        </div>

        <div style={{ padding: '0 12px 24px' }}>
          {tasks.map((task, i) => (
            <div key={task.id} className="fade-in" style={{
              background: task.done ? '#FFFBF0' : '#fff',
              borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
              padding: '14px 16px', marginBottom: 10,
              border: task.done ? '1.5px solid var(--yellow)' : '1.5px solid transparent',
              animationDelay: `${i * 0.04}s`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: task.done ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : '#F0F0F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {task.done
                    ? <CheckIcon size={18} color="#fff" />
                    : <TargetIcon size={18} color="#9A9A9A" />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 600, fontSize: 14,
                    textDecoration: task.done ? 'line-through' : 'none',
                    color: task.done ? 'var(--text-secondary)' : 'var(--text)',
                  }}>{task.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--orange)', fontWeight: 700, marginTop: 2 }}>
                    +{task.points} pts
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button onClick={() => toggleTask(task.id)} style={{
                    padding: '7px 12px', borderRadius: 20,
                    background: task.done ? '#F0F0F0' : 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
                    border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700,
                    color: task.done ? 'var(--text-secondary)' : 'var(--text)',
                  }}>
                    {task.done ? 'Undo' : 'Mark done'}
                  </button>
                  {!task.done && (
                    <button style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      padding: '7px 10px', borderRadius: 20,
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    }}>
                      <CameraIcon size={12} color="var(--text-secondary)" /> Proof
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (view === 'leaderboard') {
    return (
      <div className="fade-in">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px 12px', background: '#fff',
          borderBottom: '1px solid var(--border)',
        }}>
          <button onClick={() => setView('active')} style={iconBtn}>
            <ChevronLeftIcon size={22} color="#4A4A4A" />
          </button>
          <TrophyIcon size={18} color="var(--orange)" />
          <span style={{ fontSize: 19, fontWeight: 800 }}>Leaderboard</span>
        </div>
        <div style={{ padding: '20px 12px' }}>
          {/* Your team card */}
          <div style={{
            background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
            borderRadius: 'var(--radius)', padding: '16px 20px',
            marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <StarIcon size={24} color="#fff" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{team}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{totalPoints} points · {completed.length}/{tasks.length} tasks</div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            {LEADERBOARD.map((entry, i) => (
              <div key={entry.rank} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px',
                borderBottom: i < LEADERBOARD.length - 1 ? '1px solid var(--border)' : 'none',
                background: entry.rank <= 3 ? '#FFFBF0' : '#fff',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: entry.rank <= 3 ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : '#F0F0F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 13,
                  color: entry.rank <= 3 ? '#fff' : '#6B6B6B',
                }}>
                  {rankLabel(entry.rank)}
                </div>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{entry.team}</span>
                <span style={{ fontWeight: 800, color: 'var(--orange)', fontSize: 14 }}>
                  {entry.score.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Main screen
  return (
    <div className="fade-in">
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 16px 12px', background: '#fff',
        borderBottom: '1px solid var(--border)',
      }}>
        <button onClick={onBack} style={iconBtn}>
          <ChevronLeftIcon size={22} color="#4A4A4A" />
        </button>
        <TargetIcon size={18} color="var(--orange)" />
        <span style={{ fontSize: 19, fontWeight: 800 }}>Scavenger Hunt</span>
      </div>

      <div style={{ padding: 20 }}>
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
          borderRadius: 'var(--radius)', padding: '28px 24px', marginBottom: 24,
          textAlign: 'center',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <TargetIcon size={30} color="#fff" />
          </div>
          <h2 style={{ fontWeight: 900, fontSize: 22, marginBottom: 8 }}>Explore Harvard Together</h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.9 }}>
            Form a team, complete tasks around campus, and compete on the leaderboard.
          </p>
        </div>

        {team ? (
          <button onClick={() => setView('active')} style={{
            width: '100%', padding: 16,
            background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
            border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15,
            cursor: 'pointer', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            Continue as {team}
            <ArrowRightIcon size={16} color="#1A1A1A" />
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button onClick={() => setView('create')} style={{
              flex: 1, padding: 15, borderRadius: 14,
              background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
              border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
            }}>Create Team</button>
            <button onClick={() => setView('join')} style={{
              flex: 1, padding: 15, borderRadius: 14,
              background: '#fff', border: '2px solid var(--yellow)',
              cursor: 'pointer', fontWeight: 700, fontSize: 14,
            }}>Join Team</button>
          </div>
        )}

        {view === 'create' && !team && (
          <div className="slide-up" style={{
            background: '#fff', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)', padding: 20, marginBottom: 16,
          }}>
            <h3 style={{ fontWeight: 800, marginBottom: 14, fontSize: 15 }}>Create a Team</h3>
            <input
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Team name"
              style={inputStyle}
            />
            <button
              onClick={() => { if (teamName.trim()) { setTeam(teamName.trim()); setView('active') } }}
              style={{
                width: '100%', padding: 14,
                background: teamName.trim() ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : 'var(--border)',
                border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14,
                cursor: teamName.trim() ? 'pointer' : 'default',
              }}>
              Start Hunt
            </button>
          </div>
        )}

        {view === 'join' && !team && (
          <div className="slide-up" style={{
            background: '#fff', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)', padding: 20, marginBottom: 16,
          }}>
            <h3 style={{ fontWeight: 800, marginBottom: 14, fontSize: 15 }}>Join a Team</h3>
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              placeholder="Enter team code"
              style={inputStyle}
            />
            <button
              onClick={() => { if (joinCode.trim()) { setTeam('Team ' + joinCode.trim()); setView('active') } }}
              style={{
                width: '100%', padding: 14,
                background: joinCode.trim() ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : 'var(--border)',
                border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14,
                cursor: joinCode.trim() ? 'pointer' : 'default',
              }}>
              Join Team
            </button>
          </div>
        )}

        {/* Leaderboard preview */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{
            padding: '13px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <TrophyIcon size={15} color="var(--orange)" />
            <span style={{ fontWeight: 800, fontSize: 14 }}>Leaderboard</span>
          </div>
          {LEADERBOARD.slice(0, 3).map((entry, i) => (
            <div key={entry.rank} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 12, color: '#fff',
              }}>
                {rankLabel(entry.rank)}
              </div>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{entry.team}</span>
              <span style={{ fontWeight: 800, color: 'var(--orange)', fontSize: 13 }}>
                {entry.score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const inputStyle = {
  width: '100%', padding: '12px 14px',
  border: '1.5px solid var(--border)', borderRadius: 10,
  fontSize: 14, outline: 'none', marginBottom: 12, fontFamily: 'inherit',
}
