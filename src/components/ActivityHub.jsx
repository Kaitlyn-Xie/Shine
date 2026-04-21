import { useState } from 'react'
import { TargetIcon, CalendarIcon, FlagIcon, TrophyIcon, CheckIcon, CameraIcon, ArrowRightIcon, StarIcon, ChevronLeftIcon, SearchIcon, CloseIcon } from './Icons'

// ── Scavenger Hunt data ──────────────────────────────────────────────────────

const LEADERBOARD = [
  { rank: 1, team: 'The Crimson Crew',  score: 2400 },
  { rank: 2, team: 'Globe Trotters',    score: 2100 },
  { rank: 3, team: 'Campus Explorers',  score: 1850 },
  { rank: 4, team: 'Freshman Force',    score: 1600 },
  { rank: 5, team: 'World Wide Herd',   score: 1200 },
]

const INIT_TASKS = [
  { id: 1, label: 'Visit Widener Library',          points: 200 },
  { id: 2, label: 'Find the best coffee spot',       points: 150 },
  { id: 3, label: 'Take a photo at Johnston Gate',   points: 300 },
  { id: 4, label: 'Find the John Harvard statue',    points: 250 },
  { id: 5, label: 'Discover the secret garden',      points: 400 },
  { id: 6, label: 'Reach the top of Science Center', points: 350 },
]

// ── School Events data ───────────────────────────────────────────────────────

const SCHOOL_EVENTS = [
  { id: 1, title: 'International Student Orientation', date: 'Sep 2 · 10:00 AM', location: 'Science Center Hall B', tag: 'Official', tagColor: '#5599EE', desc: 'Welcome session for all new international students. Bring your Harvard ID.' },
  { id: 2, title: 'HIO Visa & Immigration Workshop',   date: 'Sep 5 · 2:00 PM',  location: 'Holyoke Center 800',   tag: 'Official', tagColor: '#5599EE', desc: 'Learn about maintaining your student visa status, work authorization, and travel.' },
  { id: 3, title: 'Campus Resource Fair',              date: 'Sep 8 · 11:00 AM', location: 'Harvard Yard',          tag: 'Official', tagColor: '#5599EE', desc: 'Meet advisors from financial aid, health services, housing, and more.' },
  { id: 4, title: 'Fall Convocation',                  date: 'Sep 10 · 5:00 PM', location: 'Sanders Theatre',       tag: 'Official', tagColor: '#5599EE', desc: 'Official welcome ceremony for the Class of 2028.' },
  { id: 5, title: 'Academic Calendar Q&A',             date: 'Sep 12 · 3:00 PM', location: 'Zoom (link on portal)', tag: 'Academic', tagColor: '#3CB87A', desc: 'Ask questions about add/drop, reading period, and exam schedules.' },
]

// ── Club Activities data ─────────────────────────────────────────────────────

const CLUB_ACTIVITIES = [
  { id: 1, title: 'Chinese Students Association — Welcome Dinner', date: 'Sep 3 · 6:00 PM', location: 'Annenberg Hall',    members: 87,  tag: 'Culture',  tagColor: '#FF6B6B', desc: 'Annual welcome dinner for new and returning members. RSVP required.' },
  { id: 2, title: 'Harvard International Review Recruitment',       date: 'Sep 6 · 4:00 PM', location: 'Sever Hall 213',    members: 45,  tag: 'Academic', tagColor: '#3CB87A', desc: 'Open meeting for students interested in joining the journal staff.' },
  { id: 3, title: 'South Asian Association — Holi Prep Workshop',   date: 'Sep 9 · 5:00 PM', location: 'Currier JCR',       members: 63,  tag: 'Culture',  tagColor: '#FF6B6B', desc: 'Community craft session preparing decorations for the upcoming Holi celebration.' },
  { id: 4, title: 'Ballroom Dance Club — Beginner Lesson',          date: 'Sep 11 · 7:00 PM', location: 'Quincy Dining Hall', members: 30, tag: 'Sports',   tagColor: '#CC66FF', desc: 'Free intro lesson — no experience needed! All international students welcome.' },
  { id: 5, title: 'Harvard Model UN — Info Session',                date: 'Sep 14 · 5:30 PM', location: 'Lowell Lecture Hall',members: 120,tag: 'Academic', tagColor: '#3CB87A', desc: 'Learn about conference opportunities and how to join the team.' },
]

const rankLabel = r => r === 1 ? '1st' : r === 2 ? '2nd' : r === 3 ? '3rd' : `${r}th`

// ── Root ─────────────────────────────────────────────────────────────────────

export default function ActivityHub({ view = 'hunt' }) {
  return (
    <div className="fade-in">
      {view === 'hunt'   && <ScavengerHuntView />}
      {view === 'events' && <SchoolEventsView />}
      {view === 'clubs'  && <ClubActivitiesView />}
    </div>
  )
}

// ── Scavenger Hunt ────────────────────────────────────────────────────────────

function ScavengerHuntView() {
  const [screen, setScreen] = useState('main')
  const [team, setTeam] = useState(null)
  const [teamName, setTeamName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [tasks, setTasks] = useState(INIT_TASKS.map(t => ({ ...t, done: false })))

  const completed = tasks.filter(t => t.done)
  const totalPoints = completed.reduce((s, t) => s + t.points, 0)
  const progress = Math.round((completed.length / tasks.length) * 100)
  const toggleTask = id => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))

  // Leaderboard screen
  if (screen === 'leaderboard') return (
    <>
      <PageHeader
        title="Leaderboard"
        icon={<TrophyIcon size={18} color="var(--orange)" />}
        onBack={() => setScreen('active')}
      />
      <div style={{ padding: '16px 12px 100px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
          borderRadius: 16, padding: '16px 20px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <StarIcon size={22} color="#fff" />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#1A1A1A' }}>{team}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{totalPoints} pts · {completed.length}/{tasks.length} tasks</div>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          {LEADERBOARD.map((e, i) => (
            <div key={e.rank} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
              borderBottom: i < LEADERBOARD.length - 1 ? '1px solid var(--border)' : 'none',
              background: e.rank <= 3 ? '#FFFBF0' : '#fff',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: e.rank <= 3 ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : '#F0F0F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 12, color: e.rank <= 3 ? '#fff' : '#6B6B6B',
              }}>{rankLabel(e.rank)}</div>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{e.team}</span>
              <span style={{ fontWeight: 800, color: 'var(--orange)', fontSize: 14 }}>{e.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  // Active hunt screen
  if (screen === 'active' && team) return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px 12px', background: '#fff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={() => setScreen('main')} style={iconBtn}>
          <ChevronLeftIcon size={22} color="#4A4A4A" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{team}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{completed.length}/{tasks.length} tasks · {totalPoints} pts</div>
        </div>
        <button onClick={() => setScreen('leaderboard')} style={outlineBtn}>
          <TrophyIcon size={14} color="var(--orange)" /> Leaderboard
        </button>
      </div>

      <div style={{ padding: '14px 20px 6px' }}>
        <div style={{ background: 'var(--border)', borderRadius: 8, height: 7, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 8, background: 'linear-gradient(90deg, #FFC94A, #FF9A3C)', width: `${progress}%`, transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 5, textAlign: 'right' }}>{progress}% complete</div>
      </div>

      <div style={{ padding: '8px 12px 100px' }}>
        {tasks.map((task, i) => (
          <div key={task.id} className="fade-in" style={{
            background: task.done ? '#FFFBF0' : '#fff',
            borderRadius: 16, boxShadow: 'var(--shadow)', padding: '14px 16px', marginBottom: 10,
            border: `1.5px solid ${task.done ? 'var(--yellow)' : 'transparent'}`,
            animationDelay: `${i * 0.04}s`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: task.done ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : '#F0F0F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {task.done ? <CheckIcon size={18} color="#fff" /> : <TargetIcon size={18} color="#9A9A9A" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? 'var(--text-secondary)' : 'var(--text)' }}>{task.label}</div>
                <div style={{ fontSize: 13, color: 'var(--orange)', fontWeight: 700, marginTop: 2 }}>+{task.points} pts</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={() => toggleTask(task.id)} style={{
                  padding: '7px 12px', borderRadius: 20,
                  background: task.done ? '#F0F0F0' : 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
                  border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  color: task.done ? 'var(--text-secondary)' : 'var(--text)',
                }}>{task.done ? 'Undo' : 'Mark done'}</button>
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
    </>
  )

  // Main / lobby screen
  return (
    <>
      <PageHeader title="Scavenger Hunt" icon={<TargetIcon size={18} color="var(--orange)" />} />
      <div style={{ padding: 16 }}>
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
          borderRadius: 16, padding: '28px 24px', marginBottom: 20, textAlign: 'center',
        }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <TargetIcon size={30} color="#fff" />
          </div>
          <h2 style={{ fontWeight: 900, fontSize: 21, marginBottom: 8, color: '#1A1A1A' }}>Explore Harvard Together</h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: '#1A1A1A', opacity: 0.85 }}>Form a team, complete tasks around campus, and compete on the leaderboard.</p>
        </div>

        {team ? (
          <button onClick={() => setScreen('active')} style={primaryBtn}>
            Continue as {team} <ArrowRightIcon size={16} color="#1A1A1A" />
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <button onClick={() => setScreen('create')} style={{ ...primaryBtn, flex: 1 }}>Create Team</button>
            <button onClick={() => setScreen('join')} style={{ flex: 1, padding: 15, borderRadius: 14, background: '#fff', border: '2px solid var(--yellow)', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Join Team</button>
          </div>
        )}

        {screen === 'create' && !team && (
          <div className="slide-up" style={{ background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow)', padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Create a Team</div>
            <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Team name" style={inputStyle} />
            <button onClick={() => { if (teamName.trim()) { setTeam(teamName.trim()); setScreen('active') } }} style={{ width: '100%', padding: 14, background: teamName.trim() ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : 'var(--border)', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: teamName.trim() ? 'pointer' : 'default' }}>Start Hunt</button>
          </div>
        )}

        {screen === 'join' && !team && (
          <div className="slide-up" style={{ background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow)', padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Join a Team</div>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="Enter team code" style={inputStyle} />
            <button onClick={() => { if (joinCode.trim()) { setTeam('Team ' + joinCode.trim()); setScreen('active') } }} style={{ width: '100%', padding: 14, background: joinCode.trim() ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : 'var(--border)', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: joinCode.trim() ? 'pointer' : 'default' }}>Join Team</button>
          </div>
        )}

        {/* Leaderboard preview */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <TrophyIcon size={15} color="var(--orange)" />
            <span style={{ fontWeight: 800, fontSize: 14 }}>Top Teams</span>
          </div>
          {LEADERBOARD.slice(0, 3).map((e, i) => (
            <div key={e.rank} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#fff' }}>{rankLabel(e.rank)}</div>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{e.team}</span>
              <span style={{ fontWeight: 800, color: 'var(--orange)', fontSize: 13 }}>{e.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── School Events ─────────────────────────────────────────────────────────────

function SchoolEventsView() {
  const [search, setSearch] = useState('')
  const filtered = SCHOOL_EVENTS.filter(e =>
    !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <>
      <PageHeader title="School Events" icon={<CalendarIcon size={18} color="var(--orange)" />} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search events…" />
      <div style={{ padding: '12px 12px 100px' }}>
        {filtered.map((ev, i) => (
          <div key={ev.id} className="fade-in" style={{ background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow)', padding: 16, marginBottom: 12, animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: ev.tagColor + '18', color: ev.tagColor }}>
                {ev.tag.toUpperCase()}
              </span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#1A1A1A', marginBottom: 6, lineHeight: 1.35 }}>{ev.title}</div>
            <div style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <CalendarIcon size={12} color="var(--orange)" /> {ev.date}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>📍 {ev.location}</div>
            <p style={{ fontSize: 13, color: '#5A5A5A', lineHeight: 1.6, marginBottom: 12 }}>{ev.desc}</p>
            <button style={{ padding: '8px 18px', borderRadius: 20, background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
              RSVP
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

// ── Club Activities ───────────────────────────────────────────────────────────

function ClubActivitiesView() {
  const [search, setSearch] = useState('')
  const filtered = CLUB_ACTIVITIES.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <>
      <PageHeader title="Club Activities" icon={<FlagIcon size={18} color="var(--orange)" />} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search clubs & activities…" />
      <div style={{ padding: '12px 12px 100px' }}>
        {filtered.map((club, i) => (
          <div key={club.id} className="fade-in" style={{ background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow)', padding: 16, marginBottom: 12, animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: club.tagColor + '18', color: club.tagColor }}>
                {club.tag.toUpperCase()}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>👥 {club.members} members</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#1A1A1A', marginBottom: 6, lineHeight: 1.35 }}>{club.title}</div>
            <div style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <CalendarIcon size={12} color="var(--orange)" /> {club.date}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>📍 {club.location}</div>
            <p style={{ fontSize: 13, color: '#5A5A5A', lineHeight: 1.6, marginBottom: 12 }}>{club.desc}</p>
            <button style={{ padding: '8px 18px', borderRadius: 20, background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
              Join
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

// ── Shared ────────────────────────────────────────────────────────────────────

function PageHeader({ title, icon, onBack }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '14px 20px 12px', background: '#fff',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      {onBack && (
        <button onClick={onBack} style={iconBtn}>
          <ChevronLeftIcon size={22} color="#4A4A4A" />
        </button>
      )}
      {icon}
      <span style={{ fontSize: 18, fontWeight: 800 }}>{title}</span>
    </div>
  )
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ padding: '10px 12px 8px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', borderRadius: 12, padding: '9px 12px' }}>
        <SearchIcon size={15} color="#AAAAAA" />
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', fontFamily: 'inherit' }} />
        {value && <button onClick={() => onChange('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><CloseIcon size={14} color="#AAAAAA" /></button>}
      </div>
    </div>
  )
}

const iconBtn    = { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }
const outlineBtn = { background: '#FFFBF0', border: '1.5px solid var(--yellow)', borderRadius: 20, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: 6 }
const primaryBtn = { width: '100%', padding: 15, borderRadius: 14, background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }
const inputStyle = { width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, outline: 'none', marginBottom: 12, fontFamily: 'inherit' }
