import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { SearchIcon, HeartIcon, MessageCircleIcon } from '@/components/Icons'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const TYPE_CONFIG: Record<string, { color: string; light: string; label: string }> = {
  question: { color: '#5599EE', light: '#EEF4FF', label: 'Question' },
  tip:      { color: '#FF9A3C', light: '#FFF5EE', label: 'Tip' },
  story:    { color: '#CC66FF', light: '#F8EEFF', label: 'Story' },
  resource: { color: '#3CB87A', light: '#EEFFF6', label: 'Resource' },
  activity: { color: '#FF6B6B', light: '#FFEEEE', label: 'Activity' },
}

const FILTERS = [
  { id: 'all',      label: 'All',        color: '#4A4A4A' },
  { id: 'question', label: 'Questions',  color: '#5599EE' },
  { id: 'tip',      label: 'Tips',       color: '#FF9A3C' },
  { id: 'story',    label: 'Stories',    color: '#CC66FF' },
  { id: 'resource', label: 'Resources',  color: '#3CB87A' },
  { id: 'activity', label: 'Activities', color: '#FF6B6B' },
]

const CONTENT_ITEMS = [
  {
    id: 1, type: 'resource',
    title: 'Harvard International Office (HIO)',
    body: 'Your first stop for all visa, immigration, and OPT/CPT questions. Walk-in hours Mon–Fri 9am–5pm.',
    location: { lat: 42.3784, lng: -71.1173, label: 'Smith Campus Center' },
    username: 'SHINE Official', initials: 'SO',
    avatarBg: 'linear-gradient(135deg, #3CB87A, #1A9A5A)',
    likes: 142, comments: 12, time: 'Pinned',
  },
  {
    id: 2, type: 'question',
    title: 'How do I open a US bank account as an international student?',
    body: 'I just arrived and need to set up banking. Do I need an SSN? Any banks that are student-friendly?',
    location: { lat: 42.3762, lng: -71.1155, label: 'Harvard Square' },
    username: 'Mei Lin', initials: 'ML',
    avatarBg: 'linear-gradient(135deg, #FFD6B0, #FF9A3C)',
    likes: 24, comments: 8, time: '2h ago',
  },
  {
    id: 3, type: 'tip',
    title: 'Best quiet study spot: Lamont Library 3rd floor stacks',
    body: 'Almost nobody goes there. Bring headphones, natural light is great in the morning. Open until midnight on weekdays.',
    location: { lat: 42.3741, lng: -71.1161, label: 'Lamont Library' },
    username: 'Lucas M.', initials: 'LM',
    avatarBg: 'linear-gradient(135deg, #B8FFD0, #3CB87A)',
    likes: 87, comments: 15, time: '5h ago',
  },
  {
    id: 4, type: 'story',
    title: 'My first morning walk through Johnston Gate',
    body: "I arrived jet-lagged at 6am and walked through Johnston Gate in the fog. Nobody else was around. One of those moments I'll never forget.",
    location: { lat: 42.3770, lng: -71.1167, label: 'Johnston Gate' },
    username: 'Ji-ho P.', initials: 'JP',
    avatarBg: 'linear-gradient(135deg, #F0C8FF, #CC66FF)',
    likes: 201, comments: 34, time: '1d ago',
  },
  {
    id: 5, type: 'tip',
    title: 'Get to Annenberg 5 min before opening — no queue',
    body: 'Shows up at exactly 7:25am and walk straight in. Wait even 10 minutes and the line wraps around the building.',
    location: { lat: 42.3730, lng: -71.1182, label: 'Annenberg Hall' },
    username: 'Priya S.', initials: 'PS',
    avatarBg: 'linear-gradient(135deg, #B8D8FF, #5599EE)',
    likes: 134, comments: 27, time: '2d ago',
  },
  {
    id: 6, type: 'activity',
    title: 'Harvard Coffee Shop Crawl ☕',
    body: "Visit 5 local coffee spots around campus and share your review! Science Center, Crema, Darwin's, Peet's, and one hidden gem of your choice.",
    location: { lat: 42.3762, lng: -71.1148, label: 'Science Center' },
    username: 'Omar K.', initials: 'OK',
    avatarBg: 'linear-gradient(135deg, #FFE0B0, #FF8C00)',
    likes: 56, comments: 19, time: '3d ago',
  },
  {
    id: 7, type: 'question',
    title: 'Best way to get a CharlieCard for the T?',
    body: 'I keep paying cash on the subway. Is the CharlieCard worth getting? Where do I load it?',
    location: { lat: 42.3732, lng: -71.1190, label: 'Harvard T Station' },
    username: 'Sofia R.', initials: 'SR',
    avatarBg: 'linear-gradient(135deg, #FFB8C8, #EE4466)',
    likes: 45, comments: 11, time: '4h ago',
  },
  {
    id: 8, type: 'story',
    title: 'Morning runs along the Charles River',
    body: 'Wake up at 6:30, run down to the river. The sunrise over the water with the crew teams rowing — nothing like it. Highly recommend.',
    location: { lat: 42.3695, lng: -71.1070, label: 'Charles River Esplanade' },
    username: 'Kenji T.', initials: 'KT',
    avatarBg: 'linear-gradient(135deg, #B8D8FF, #5599EE)',
    likes: 178, comments: 22, time: '2d ago',
  },
  {
    id: 9, type: 'resource',
    title: "Harvard HUHS — Free counseling for int'l students",
    body: 'Harvard University Health Services offers free short-term counseling. No referral needed, just call to schedule. Really helped me with adjustment.',
    location: { lat: 42.3748, lng: -71.1188, label: 'Harvard University Health Services' },
    username: 'SHINE Official', initials: 'SO',
    avatarBg: 'linear-gradient(135deg, #3CB87A, #1A9A5A)',
    likes: 93, comments: 8, time: 'Pinned',
  },
  {
    id: 10, type: 'activity',
    title: 'Harvard Yard Sunrise Photo Challenge',
    body: 'Take a photo of Harvard Yard at sunrise (before 7am), post it here with the tag #SHINEsunrise. Best shot wins bragging rights.',
    location: { lat: 42.3755, lng: -71.1130, label: 'Harvard Yard' },
    username: 'Mei Lin', initials: 'ML',
    avatarBg: 'linear-gradient(135deg, #FFD6B0, #FF9A3C)',
    likes: 67, comments: 31, time: '5d ago',
  },
  {
    id: 11, type: 'tip',
    title: 'Harvard ID doubles as your library card, gym pass, AND T discount',
    body: 'Show your Harvard ID at the Harvard Square T station for a discounted semester pass. Also works at several local restaurants.',
    location: { lat: 42.3770, lng: -71.1195, label: 'Harvard ID Office' },
    username: 'Lucas M.', initials: 'LM',
    avatarBg: 'linear-gradient(135deg, #B8FFD0, #3CB87A)',
    likes: 312, comments: 44, time: '1w ago',
  },
]

function createPinIcon(type: string, selected = false) {
  const color = TYPE_CONFIG[type]?.color ?? '#999999'
  const s = selected ? 38 : 28
  return L.divIcon({
    html: `<div style="
      width:${s}px;height:${s}px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:${color};
      border:2.5px solid #fff;
      box-shadow:0 2px 10px rgba(0,0,0,0.3);
    "></div>`,
    className: '',
    iconSize: [s, s],
    iconAnchor: [s / 2, s],
  })
}

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({ click: onMapClick })
  return null
}

function useBlockMapEvents(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const stop = (e: Event) => e.stopPropagation()
    el.addEventListener('touchstart', stop, { passive: true })
    el.addEventListener('touchmove',  stop, { passive: true })
    el.addEventListener('wheel',      stop, { passive: true })
    el.addEventListener('mousedown',  stop)
    el.addEventListener('dblclick',   stop)
    return () => {
      el.removeEventListener('touchstart', stop)
      el.removeEventListener('touchmove',  stop)
      el.removeEventListener('wheel',      stop)
      el.removeEventListener('mousedown',  stop)
      el.removeEventListener('dblclick',   stop)
    }
  }, [ref])
}

interface ContentItem {
  id: number
  type: string
  title: string
  body: string
  location: { lat: number; lng: number; label: string }
  username: string
  initials: string
  avatarBg: string
  likes: number
  comments: number
  time: string
}

export default function MapHome({ onSunlight }: { onSunlight?: () => void }) {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<ContentItem | null>(null)
  const [listView, setListView] = useState(false)
  const [search, setSearch] = useState('')

  const searchRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLDivElement>(null)
  useBlockMapEvents(searchRef)
  useBlockMapEvents(filterRef)
  useBlockMapEvents(toggleRef)

  const filtered = CONTENT_ITEMS.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!item.title.toLowerCase().includes(q) && !item.body.toLowerCase().includes(q)) return false
    }
    return true
  })

  const handlePinClick = (item: ContentItem, e: L.LeafletMouseEvent) => {
    e.originalEvent.stopPropagation()
    setSelected(item)
    setListView(false)
  }

  const cfg = selected ? TYPE_CONFIG[selected.type] : null

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 68px)', overflow: 'hidden' }}>

      {/* Map */}
      <MapContainer
        center={[42.3755, -71.1175]}
        zoom={15}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={() => setSelected(null)} />
        {filtered.map(item => (
          <Marker
            key={item.id}
            position={[item.location.lat, item.location.lng]}
            icon={createPinIcon(item.type, selected?.id === item.id)}
            eventHandlers={{ click: (e) => handlePinClick(item, e) }}
          />
        ))}
      </MapContainer>

      {/* Search bar */}
      <div ref={searchRef} style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 1000 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', borderRadius: 14, padding: '10px 14px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
        }}>
          <SearchIcon size={17} color="#AAAAAA" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts, tips, questions…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', fontFamily: 'inherit', color: '#1A1A1A' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', lineHeight: 1 }}>
              <span style={{ fontSize: 16, color: '#AAAAAA' }}>✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div ref={filterRef} style={{
        position: 'absolute', top: 64, left: 0, right: 0, zIndex: 1000,
        display: 'flex', gap: 8, padding: '8px 12px',
        overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
      } as React.CSSProperties}>
        {FILTERS.map(f => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setFilter(active && f.id !== 'all' ? 'all' : f.id)}
              style={{
                flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none',
                background: active ? (f.id === 'all' ? '#1A1A1A' : f.color) : 'rgba(255,255,255,0.93)',
                color: active ? '#fff' : (f.id === 'all' ? '#4A4A4A' : f.color),
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* List view overlay */}
      {listView && (
        <div style={{
          position: 'absolute', top: 116, bottom: 0, left: 0, right: 0, zIndex: 800,
          background: 'rgba(248,247,244,0.97)', overflowY: 'auto', padding: '12px 12px 24px',
        }}>
          {filtered.map(item => {
            const c = TYPE_CONFIG[item.type]
            return (
              <div key={item.id} style={{
                background: '#fff', borderRadius: 16, padding: '14px 16px', marginBottom: 10,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: item.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {item.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{item.username}</div>
                    <div style={{ fontSize: 11, color: c?.color, fontWeight: 600 }}>{c?.label}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: 11, color: '#9A9A9A' }}>{item.time}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5, marginBottom: 10 }}>{item.body}</div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <HeartIcon size={14} color="#BBBBBB" />
                    <span style={{ fontSize: 13, color: '#6B6B6B' }}>{item.likes}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MessageCircleIcon size={14} color="#BBBBBB" />
                    <span style={{ fontSize: 13, color: '#6B6B6B' }}>{item.comments}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Selected card popup */}
      {selected && !listView && (
        <div style={{
          position: 'absolute', bottom: 20, left: 12, right: 12, zIndex: 900,
          background: '#fff', borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: '16px 16px 14px',
          animation: 'slideUp 0.25s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: selected.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {selected.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{selected.username}</div>
              <div style={{ fontSize: 12, color: cfg?.color, fontWeight: 600 }}>{cfg?.label} · {selected.time}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#AAAAAA', lineHeight: 1 }}>✕</button>
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{selected.title}</div>
          <div style={{ fontSize: 13, color: '#555', lineHeight: 1.55, marginBottom: 12 }}>{selected.body}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <HeartIcon size={15} color="#BBBBBB" />
              <span style={{ fontSize: 13, color: '#6B6B6B', fontWeight: 600 }}>{selected.likes}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <MessageCircleIcon size={15} color="#BBBBBB" />
              <span style={{ fontSize: 13, color: '#6B6B6B', fontWeight: 600 }}>{selected.comments}</span>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#AAAAAA' }}>{selected.location.label}</div>
          </div>
        </div>
      )}

      {/* Right-side FAB stack */}
      <div ref={toggleRef} style={{
        position: 'absolute',
        bottom: selected && !listView ? 240 : 20,
        right: 12, zIndex: 1000,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10,
        transition: 'bottom 0.3s ease',
      }}>
        {/* ☀ + Sunlight */}
        <button
          onClick={onSunlight}
          style={{
            height: 40, borderRadius: 20, padding: '0 16px 0 12px',
            background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(255,154,60,0.45)',
            fontSize: 14, fontWeight: 800, color: '#fff',
            display: 'flex', alignItems: 'center', gap: 7,
          }}
        >
          <span style={{ fontSize: 15 }}>☀</span>
          + Sunlight
        </button>

        {/* List / Map toggle */}
        <button
          onClick={() => setListView(v => !v)}
          style={{
            height: 40, borderRadius: 20, padding: '0 16px',
            background: listView ? '#1A1A1A' : 'rgba(255,255,255,0.95)',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
            fontSize: 13, fontWeight: 700,
            color: listView ? '#fff' : '#1A1A1A',
            display: 'flex', alignItems: 'center', gap: 7,
          }}
        >
          <span style={{ fontSize: 15 }}>☰</span>
          {listView ? 'Map' : 'List'}
        </button>
      </div>
    </div>
  )
}
