import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Link } from 'wouter'
import { SearchIcon, HeartIcon, BookmarkIcon } from '@/components/Icons'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

type Category = 'All' | 'Questions' | 'Tips' | 'Stories' | 'Resources' | 'Announcements'

const CATEGORY_COLORS: Record<string, string> = {
  Questions:     '#4A90D9',
  Tips:          '#FF9A3C',
  Stories:       '#3CB87A',
  Resources:     '#CC66FF',
  Announcements: '#EE4466',
}

const POSTS = [
  { id: 1, lat: 42.3770, lng: -71.1167, category: 'Questions', author: 'Mei Lin', initials: 'ML', avatarBg: 'linear-gradient(135deg,#FFD6B0,#FF9A3C)', title: 'Where do I get my ID card?', body: 'Anyone know the exact location of the ID office? Hours?', likes: 12 },
  { id: 2, lat: 42.3750, lng: -71.1158, category: 'Tips', author: 'Lucas M.', initials: 'LM', avatarBg: 'linear-gradient(135deg,#B8FFD0,#3CB87A)', title: 'Best coffee on campus', body: 'Science Center café is underrated. Shorter lines than Peet\'s!', likes: 87 },
  { id: 3, lat: 42.3744, lng: -71.1182, category: 'Stories', author: 'Priya S.', initials: 'PS', avatarBg: 'linear-gradient(135deg,#B8D8FF,#5599EE)', title: 'My first day in Widener', body: 'Got a little lost but found the most amazing reading room on the 3rd floor.', likes: 44 },
  { id: 4, lat: 42.3762, lng: -71.1148, category: 'Resources', author: 'Ji-ho P.', initials: 'JP', avatarBg: 'linear-gradient(135deg,#F0C8FF,#CC66FF)', title: 'HUHS appointment tips', body: 'Book online, way faster. Bring your insurance card on day 1.', likes: 29 },
  { id: 5, lat: 42.3730, lng: -71.1200, category: 'Tips', author: 'Omar K.', initials: 'OK', avatarBg: 'linear-gradient(135deg,#FFE0B0,#FF8C00)', title: 'Annenberg hours', body: 'Freshman dining hall — open 7am–10pm. Swipe in for the first month.', likes: 63 },
  { id: 6, lat: 42.3784, lng: -71.1173, category: 'Announcements', author: 'SHINE', initials: 'SH', avatarBg: 'linear-gradient(135deg,#FFE8A0,#FFC94A)', title: 'Welcome Week event', body: 'Ice cream social at Smith Campus Center — Sunday 4pm. All welcome!', likes: 156 },
  { id: 7, lat: 42.3755, lng: -71.1130, category: 'Questions', author: 'Sofia R.', initials: 'SR', avatarBg: 'linear-gradient(135deg,#FFB8C8,#EE4466)', title: 'Harvard Yard access at night?', body: 'Does the yard close at night or is it always accessible?', likes: 8 },
  { id: 8, lat: 42.3710, lng: -71.1180, category: 'Stories', author: 'Kwame A.', initials: 'KA', avatarBg: 'linear-gradient(135deg,#C8F0D8,#3CB87A)', title: 'Found my people at Adams House', body: 'There\'s a piano room here. 11pm jam sessions have become a thing.', likes: 73 },
]

function makePinIcon(category: string) {
  const color = CATEGORY_COLORS[category] || '#FFC94A'
  return L.divIcon({
    className: '',
    html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22s14-12.667 14-22C28 6.268 21.732 0 14 0z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="white" opacity="0.9"/>
    </svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  })
}

const CATEGORIES: Category[] = ['All', 'Questions', 'Tips', 'Stories', 'Resources', 'Announcements']

export default function MapHome() {
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const [search, setSearch] = useState('')
  const [listView, setListView] = useState(false)
  const [liked, setLiked] = useState<Record<number, boolean>>({})
  const [saved, setSaved] = useState<Record<number, boolean>>({})

  const filtered = POSTS.filter(p => {
    const catMatch = activeCategory === 'All' || p.category === activeCategory
    const searchMatch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.body.toLowerCase().includes(search.toLowerCase())
    return catMatch && searchMatch
  })

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#f5f4f1' }}>

      {/* Search bar */}
      <div style={{
        position: 'absolute', top: 12, left: 12, right: 12, zIndex: 500,
        background: 'rgba(255,255,255,0.96)',
        borderRadius: 24, padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 2px 16px rgba(0,0,0,0.14)',
      }}>
        <SearchIcon size={17} color="#9A9A9A" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search posts, tips, questions..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: '#2A2A2A' }}
        />
      </div>

      {/* Category chips */}
      <div style={{
        position: 'absolute', top: 62, left: 0, right: 0, zIndex: 500,
        display: 'flex', gap: 8, padding: '0 12px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {CATEGORIES.map(cat => {
          const active = activeCategory === cat
          const color = cat === 'All' ? '#2A2A2A' : CATEGORY_COLORS[cat]
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                flexShrink: 0,
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                border: active ? 'none' : '1.5px solid rgba(255,255,255,0.8)',
                background: active ? (cat === 'All' ? '#2A2A2A' : color) : 'rgba(255,255,255,0.88)',
                color: active ? '#fff' : '#2A2A2A',
                cursor: 'pointer',
                boxShadow: active ? `0 2px 8px ${cat === 'All' ? 'rgba(0,0,0,0.2)' : color}44` : '0 1px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Map (always rendered behind) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <MapContainer
          center={[42.3740, -71.1170]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
          />
          {filtered.map(post => (
            <Marker key={post.id} position={[post.lat, post.lng]} icon={makePinIcon(post.category)}>
              <Popup>
                <div style={{ minWidth: 180, fontFamily: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: post.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{post.initials}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{post.author}</div>
                      <div style={{ fontSize: 11, color: CATEGORY_COLORS[post.category] || '#888', fontWeight: 600 }}>{post.category}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{post.title}</div>
                  <div style={{ fontSize: 12, color: '#555', lineHeight: 1.4 }}>{post.body}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* List view overlay */}
      {listView && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, top: 110, zIndex: 400,
          background: 'rgba(245,244,241,0.97)',
          overflowY: 'auto', scrollbarWidth: 'none',
          padding: '12px 12px 80px',
        }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9A9A9A', fontSize: 14 }}>No posts match your filter</div>
          )}
          {filtered.map(post => (
            <div key={post.id} style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', marginBottom: 10, boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: post.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{post.initials}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{post.author}</div>
                  <div style={{ fontSize: 11, color: CATEGORY_COLORS[post.category] || '#888', fontWeight: 600 }}>{post.category}</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{post.title}</div>
              <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5, marginBottom: 10 }}>{post.body}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={() => setLiked(prev => ({ ...prev, [post.id]: !prev[post.id] }))} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: liked[post.id] ? '#EE4466' : '#9A9A9A' }}>
                  <HeartIcon size={16} color={liked[post.id] ? '#EE4466' : '#9A9A9A'} filled={!!liked[post.id]} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{post.likes + (liked[post.id] ? 1 : 0)}</span>
                </button>
                <button onClick={() => setSaved(prev => ({ ...prev, [post.id]: !prev[post.id] }))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <BookmarkIcon size={16} color={saved[post.id] ? '#FF9A3C' : '#9A9A9A'} filled={!!saved[post.id]} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating action buttons */}
      <div style={{ position: 'absolute', bottom: 84, right: 16, zIndex: 600, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
        {/* List toggle */}
        <button
          onClick={() => setListView(v => !v)}
          style={{
            background: listView ? '#2A2A2A' : 'rgba(255,255,255,0.95)',
            color: listView ? '#fff' : '#2A2A2A',
            border: 'none', borderRadius: 20, padding: '8px 16px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(0,0,0,0.16)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <span style={{ fontSize: 15 }}>☰</span> List
        </button>

        {/* + Sunlight post button */}
        <Link href="/post">
          <button style={{
            background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
            border: 'none', borderRadius: 24, padding: '10px 18px',
            fontSize: 14, fontWeight: 800, color: '#fff', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(255,154,60,0.45)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 15 }}>☀</span>
            + Sunlight
          </button>
        </Link>
      </div>
    </div>
  )
}
