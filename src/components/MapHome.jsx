import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CONTENT_ITEMS, TYPE_CONFIG, FILTERS } from '../data'
import { SearchIcon, HeartIcon, MessageIcon, CloseIcon, ListIcon, MapIcon, SunIcon } from './Icons'

// Fix leaflet default icon URLs
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function createPinIcon(type, selected = false) {
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

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: onMapClick })
  return null
}

// Prevents Leaflet from intercepting touch/wheel events on overlay elements
function useBlockMapEvents(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const stop = e => e.stopPropagation()
    el.addEventListener('touchstart',  stop, { passive: true })
    el.addEventListener('touchmove',   stop, { passive: true })
    el.addEventListener('wheel',       stop, { passive: true })
    el.addEventListener('mousedown',   stop)
    el.addEventListener('dblclick',    stop)
    return () => {
      el.removeEventListener('touchstart',  stop)
      el.removeEventListener('touchmove',   stop)
      el.removeEventListener('wheel',       stop)
      el.removeEventListener('mousedown',   stop)
      el.removeEventListener('dblclick',    stop)
    }
  }, [ref])
}

export default function MapHome({ onSunlight }) {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [listView, setListView] = useState(false)
  const [search, setSearch] = useState('')

  const searchRef = useRef(null)
  const filterRef = useRef(null)
  const toggleRef = useRef(null)
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

  const handlePinClick = (item, e) => {
    e.originalEvent.stopPropagation()
    setSelected(item)
    setListView(false)
  }

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 68px)', overflow: 'hidden' }}>

      {/* ── Map ── */}
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

      {/* ── Search bar ── */}
      <div
        ref={searchRef}
        style={{
          position: 'absolute', top: 12, left: 12, right: 12, zIndex: 1000,
        }}
      >
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
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: 14, background: 'transparent',
              fontFamily: 'inherit', color: '#1A1A1A',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
            >
              <CloseIcon size={16} color="#AAAAAA" />
            </button>
          )}
        </div>
      </div>

      {/* ── Filter chips ── */}
      <div
        ref={filterRef}
        style={{
          position: 'absolute', top: 64, left: 0, right: 0, zIndex: 1000,
          display: 'flex', gap: 8, padding: '8px 12px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
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

      {/* ── Right-side button stack: Sunlight (top) + List/Map (bottom) ── */}
      <div
        ref={toggleRef}
        style={{
          position: 'absolute',
          bottom: selected && !listView ? 240 : 20,
          right: 12, zIndex: 1000,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10,
          transition: 'bottom 0.3s ease',
        }}
      >
        {/* ☀️ + Sunlight */}
        <button
          onClick={onSunlight}
          style={{
            height: 40, borderRadius: 20,
            padding: '0 16px 0 12px',
            background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(255,154,60,0.45)',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 800, color: '#fff',
          }}
        >
          <SunIcon size={15} color="#fff" />
          + Sunlight
        </button>

        {/* List / Map toggle */}
        <button
          onClick={() => { setListView(v => !v); if (listView) setSelected(null) }}
          style={{
            background: '#fff', border: 'none', borderRadius: 12,
            padding: '8px 14px', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 700, color: '#4A4A4A',
          }}
        >
          {listView
            ? <><MapIcon size={15} color="#4A4A4A" /> Map</>
            : <><ListIcon size={15} color="#4A4A4A" /> List</>}
        </button>
      </div>

      {/* ── Pin detail bottom sheet ── */}
      {selected && !listView && (
        <PinBottomSheet item={selected} onClose={() => setSelected(null)} />
      )}

      {/* ── List view panel ── */}
      {listView && (
        <ListPanel
          items={filtered}
          onSelect={item => { setSelected(item); setListView(false) }}
          onClose={() => setListView(false)}
        />
      )}
    </div>
  )
}

// ── Pin detail bottom sheet ──────────────────────────────────────────────────
function PinBottomSheet({ item, onClose }) {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.story
  return (
    <div className="slide-up" style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: '#fff', borderRadius: '20px 20px 0 0',
      boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
      maxHeight: '58vh', overflowY: 'auto',
      padding: '0 16px 28px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
        <div style={{ width: 36, height: 4, background: '#E0E0E0', borderRadius: 2 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{
          fontSize: 11, fontWeight: 800, letterSpacing: '0.5px',
          padding: '4px 10px', borderRadius: 20,
          background: cfg.light, color: cfg.color,
        }}>
          {cfg.label.toUpperCase()}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <CloseIcon size={18} color="#9A9A9A" />
        </button>
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.35, marginBottom: 8, color: '#1A1A1A' }}>
        {item.title}
      </h3>
      <p style={{ fontSize: 14, color: '#5A5A5A', lineHeight: 1.65, marginBottom: 14 }}>
        {item.body}
      </p>
      {item.type === 'activity' && item.participants != null && (
        <div style={{ background: cfg.light, borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{item.participants} joined</span>
            <span style={{ fontSize: 12, color: '#9A9A9A' }}>{item.goal} checkpoint{item.goal !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ height: 6, background: '#E8E8E8', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (item.participants / 50) * 100)}%`, background: cfg.color, borderRadius: 3 }} />
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F0F0F0', paddingTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: item.avatarBg, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800,
          }}>{item.initials}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{item.username}</div>
            <div style={{ fontSize: 11, color: '#9A9A9A' }}>{item.location.label} · {item.time}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <button style={actionBtn}>
            <HeartIcon size={15} color="#E8415A" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#7A7A7A' }}>{item.likes}</span>
          </button>
          <button style={actionBtn}>
            <MessageIcon size={15} color="#9A9A9A" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#7A7A7A' }}>{item.comments}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── List view panel ──────────────────────────────────────────────────────────
function ListPanel({ items, onSelect, onClose }) {
  return (
    <div className="slide-up" style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: 'var(--bg)', borderRadius: '20px 20px 0 0',
      boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
      height: '68vh', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 2px' }}>
        <div style={{ width: 36, height: 4, background: '#E0E0E0', borderRadius: 2 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px 12px' }}>
        <span style={{ fontSize: 16, fontWeight: 800 }}>{items.length} post{items.length !== 1 ? 's' : ''}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <CloseIcon size={18} color="#9A9A9A" />
        </button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, padding: '0 12px 20px' }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#AAAAAA', fontSize: 14 }}>
            No posts match your filter.
          </div>
        )}
        {items.map(item => {
          const cfg = TYPE_CONFIG[item.type]
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              style={{
                width: '100%', textAlign: 'left', background: '#fff',
                border: 'none', cursor: 'pointer',
                borderRadius: 14, padding: '14px', marginBottom: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'block',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                    <span style={{ fontSize: 11, color: '#AAAAAA' }}>{item.location.label}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.35, color: '#1A1A1A', marginBottom: 4 }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: 13, color: '#7A7A7A', lineHeight: 1.5,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {item.body}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', background: item.avatarBg, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800,
                      }}>{item.initials}</div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#5A5A5A' }}>{item.username}</span>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#AAAAAA' }}>
                      <HeartIcon size={12} color="#E8415A" /> {item.likes}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#AAAAAA' }}>
                      <MessageIcon size={12} color="#AAAAAA" /> {item.comments}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const actionBtn = {
  display: 'flex', alignItems: 'center', gap: 4,
  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
}
