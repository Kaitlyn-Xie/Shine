import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapIcon, LockIcon, PinIcon, TargetIcon, ArrowRightIcon, ChevronLeftIcon, TrophyIcon, CheckIcon, StarIcon } from '@/components/Icons'
import { useGetMe } from '@workspace/api-client-react'

// Fix Leaflet default icons broken by Vite
// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const PINS = [
  { pos: [42.3744, -71.1182] as [number, number], label: 'Widener Library', type: 'study' },
  { pos: [42.3770, -71.1167] as [number, number], label: 'Johnston Gate', type: 'landmark' },
  { pos: [42.3750, -71.1158] as [number, number], label: 'John Harvard Statue', type: 'landmark' },
  { pos: [42.3762, -71.1148] as [number, number], label: 'Science Center Café', type: 'food' },
  { pos: [42.3730, -71.1200] as [number, number], label: 'Annenberg Dining Hall', type: 'food' },
  { pos: [42.3784, -71.1173] as [number, number], label: 'Smith Campus Center', type: 'campus' },
  { pos: [42.3755, -71.1130] as [number, number], label: 'Harvard Yard', type: 'landmark' },
  { pos: [42.3710, -71.1180] as [number, number], label: 'Adams House', type: 'housing' },
]

const TYPE_COLORS: Record<string, string> = {
  study: '#5599EE', landmark: '#FF9A3C', food: '#5BC88A', campus: '#CC66FF', housing: '#EE5555',
}

function makeIcon(type: string) {
  const color = TYPE_COLORS[type] || '#FFC94A'
  return L.divIcon({
    className: '',
    html: `<div style="width:24px;height:24px;border-radius:50% 50% 50% 4px;background:${color};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.25);transform:rotate(-45deg);"></div>`,
    iconSize: [24, 24], iconAnchor: [12, 22], popupAnchor: [0, -24],
  })
}

const LEADERBOARD = [
  { rank: 1, team: 'The Crimson Crew', score: 2400 },
  { rank: 2, team: 'Globe Trotters', score: 2100 },
  { rank: 3, team: 'Campus Explorers', score: 1850 },
  { rank: 4, team: 'Freshman Force', score: 1600 },
  { rank: 5, team: 'World Wide Herd', score: 1200 },
]

const TASKS = [
  { id: 1, label: 'Visit Widener Library', points: 200, done: false },
  { id: 2, label: 'Find the best coffee spot', points: 150, done: false },
  { id: 3, label: 'Take a photo at Johnston Gate', points: 300, done: false },
  { id: 4, label: 'Find the John Harvard statue', points: 250, done: false },
  { id: 5, label: 'Discover the secret garden', points: 400, done: false },
  { id: 6, label: 'Reach the top of Science Center', points: 350, done: false },
]

function ScavengerHunt({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<'main' | 'active' | 'leaderboard'>('main')
  const [team, setTeam] = useState<string | null>(null)
  const [teamName, setTeamName] = useState('')
  const [tasks, setTasks] = useState(TASKS)

  const completed = tasks.filter(t => t.done)
  const totalPoints = completed.reduce((sum, t) => sum + t.points, 0)
  const progress = Math.round((completed.length / tasks.length) * 100)

  const toggleTask = (id: number) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))

  if (view === 'leaderboard') {
    return (
      <div className="fade-in" style={{ minHeight: '100%', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 12px', background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
          <button onClick={() => setView(team ? 'active' : 'main')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ChevronLeftIcon size={22} color="#4A4A4A" />
          </button>
          <TrophyIcon size={18} color="#FFC94A" />
          <span style={{ fontWeight: 800, fontSize: 17 }}>Leaderboard</span>
        </div>
        <div style={{ padding: '16px' }}>
          {LEADERBOARD.map(entry => (
            <div key={entry.rank} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#fff', borderRadius: 14, marginBottom: 8, boxShadow: 'var(--shadow)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: entry.rank === 1 ? 'linear-gradient(135deg, #FFD700, #FFA500)' : entry.rank === 2 ? 'linear-gradient(135deg, #C0C0C0, #909090)' : entry.rank === 3 ? 'linear-gradient(135deg, #CD7F32, #A0522D)' : '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: entry.rank <= 3 ? '#fff' : '#6A6A6A' }}>
                {entry.rank}
              </div>
              <div style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>{entry.team}</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--orange)' }}>{entry.score.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (view === 'active' && team) {
    return (
      <div className="fade-in" style={{ minHeight: '100%', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 12px', background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
          <button onClick={() => setView('main')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ChevronLeftIcon size={22} color="#4A4A4A" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{team}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{completed.length}/{tasks.length} tasks · {totalPoints} pts</div>
          </div>
          <button onClick={() => setView('leaderboard')} style={{ background: '#FFFBF0', border: '1.5px solid var(--yellow)', borderRadius: 20, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrophyIcon size={14} color="var(--orange)" /> Board
          </button>
        </div>
        <div style={{ padding: '16px 16px 6px' }}>
          <div style={{ background: '#ECECEC', borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #FFC94A, #FF9A3C)', width: `${progress}%`, borderRadius: 6, transition: 'width 0.4s' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{progress}% complete · {totalPoints} points earned</div>
        </div>
        <div style={{ padding: '10px 16px 80px' }}>
          {tasks.map(task => (
            <div key={task.id} onClick={() => toggleTask(task.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#fff', borderRadius: 14, marginBottom: 8, cursor: 'pointer', boxShadow: 'var(--shadow)', opacity: task.done ? 0.7 : 1 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: task.done ? 'linear-gradient(135deg, #C8F0D8, #3CB87A)' : '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
                {task.done && <CheckIcon size={14} color="#1A7A4A" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? 'var(--text-secondary)' : 'var(--text)' }}>{task.label}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFBF0', borderRadius: 20, padding: '4px 10px' }}>
                <StarIcon size={12} color="#FFC94A" filled />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange)' }}>{task.points}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Main hunt screen
  return (
    <div className="fade-in" style={{ minHeight: '100%', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 12px', background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ChevronLeftIcon size={22} color="#4A4A4A" />
        </button>
        <TargetIcon size={18} color="#FF9A3C" />
        <span style={{ fontWeight: 800, fontSize: 17 }}>Scavenger Hunt</span>
      </div>

      <div style={{ padding: 16 }}>
        {/* Hero card */}
        <div style={{ background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)', borderRadius: 20, padding: '20px 20px 16px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.12)', borderRadius: '50%' }} />
          <TrophyIcon size={28} color="rgba(255,255,255,0.9)" />
          <div style={{ fontWeight: 900, fontSize: 22, color: '#fff', marginTop: 8 }}>Explore Harvard</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Find hidden spots, earn points, win prizes.</div>
        </div>

        {/* Team setup */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', marginBottom: 12, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Your Team</div>
          <input
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder="Enter team name..."
            style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 12, padding: '10px 14px', fontSize: 14, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }}
          />
          <button
            onClick={() => { if (teamName.trim()) { setTeam(teamName.trim()); setView('active') } }}
            disabled={!teamName.trim()}
            style={{ width: '100%', background: teamName.trim() ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : '#ECECEC', border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 15, fontWeight: 700, color: teamName.trim() ? '#fff' : '#9A9A9A', cursor: teamName.trim() ? 'pointer' : 'default' }}
          >
            Start Hunt
          </button>
        </div>

        <button onClick={() => setView('leaderboard')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: 'none', borderRadius: 16, padding: '14px 18px', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #FFE8A0, #FFC94A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrophyIcon size={20} color="#B86A00" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Leaderboard</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>See top teams</div>
            </div>
          </div>
          <ArrowRightIcon size={18} color="var(--text-secondary)" />
        </button>
      </div>
    </div>
  )
}

export default function Hunt() {
  const { data: user } = useGetMe({ query: { retry: false } })
  const [showHunt, setShowHunt] = useState(false)

  const isOnCampus = user?.phase === 'on_campus'

  if (showHunt) return <ScavengerHunt onBack={() => setShowHunt(false)} />

  if (!isOnCampus) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80%', padding: 32, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <LockIcon size={36} color="#9A9A9A" />
        </div>
        <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 8 }}>Campus Map</div>
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 260, lineHeight: 1.6 }}>
          The map and scavenger hunt unlock when you arrive on campus. Go to Profile to update your status.
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in" style={{ minHeight: '100%', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px 12px', background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <MapIcon size={20} color="#4A4A4A" />
        <span style={{ fontSize: 19, fontWeight: 800, flex: 1 }}>Campus Map</span>
        <span style={{ background: '#E0F7EC', color: '#1A7A4A', fontSize: 12, fontWeight: 700, borderRadius: 20, padding: '4px 10px' }}>Unlocked</span>
      </div>

      {/* Map */}
      <div style={{ height: 320, position: 'relative' }}>
        <MapContainer
          center={[42.3750, -71.1152]}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {PINS.map((pin, i) => (
            <Marker key={i} position={pin.pos} icon={makeIcon(pin.type)}>
              <Popup>{pin.label}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', gap: 12, overflowX: 'auto' }}>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{type}</span>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: '14px 16px 80px' }}>
        {[
          { Icon: PinIcon, label: 'Dining Halls', desc: '8 locations across campus', color: '#5BC88A', bg: '#E0F7EC' },
          { Icon: MapIcon, label: 'Study Spaces', desc: '24/7 libraries and quiet zones', color: '#5599EE', bg: '#E8F0FF' },
          { Icon: TargetIcon, label: 'Scavenger Hunt', desc: 'Explore with your team', color: '#FF9A3C', bg: '#FFF3E0', action: true },
        ].map((item, i) => {
          const { Icon } = item
          return (
            <div
              key={i}
              onClick={() => item.action && setShowHunt(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#fff', borderRadius: 14, marginBottom: 8, cursor: item.action ? 'pointer' : 'default', boxShadow: 'var(--shadow)' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 14, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={item.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.desc}</div>
              </div>
              {item.action && <ArrowRightIcon size={18} color="var(--text-secondary)" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
