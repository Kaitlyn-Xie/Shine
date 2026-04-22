import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CONTENT_ITEMS, TYPE_CONFIG, FILTERS } from '../data'
import { SearchIcon, HeartIcon, MessageIcon, CloseIcon, ListIcon, MapIcon, SunIcon } from './Icons'
import CreateContent from './CreateContent'

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

function createStoryPinIcon(post, selected = false) {
  const s = selected ? 50 : 42
  const isText = post.mediaType === 'textcard'
  const bg = isText ? 'linear-gradient(135deg,#CC66FF,#9933CC)' : 'linear-gradient(135deg,#00B4D8,#0088AA)'
  const iconSvg = isText
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="7" y2="10"/><line x1="15" y1="14" x2="7" y2="14"/><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`
  return L.divIcon({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          width:${s}px;height:${s}px;border-radius:14px;
          background:${bg};
          border:2.5px solid #fff;
          box-shadow:0 3px 14px rgba(0,0,0,0.28);
          display:flex;align-items:center;justify-content:center;
          transition:all 0.2s;
          transform:${selected ? 'scale(1.15)' : 'scale(1)'};
        ">${iconSvg}</div>
        <div style="
          width:0;height:0;
          border-left:6px solid transparent;border-right:6px solid transparent;
          border-top:8px solid ${isText ? '#9933CC' : '#0088AA'};
          margin-top:-1px;
        "></div>
      </div>`,
    className: '',
    iconSize: [s, s + 9],
    iconAnchor: [s / 2, s + 9],
  })
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: onMapClick })
  return null
}

function createHuntPinIcon(selected = false) {
  const s = selected ? 46 : 38
  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:${s}px;height:${s}px;border-radius:12px;background:linear-gradient(135deg,#2ECC87,#1B8757);border:3px solid #fff;box-shadow:0 3px 14px rgba(27,135,87,${selected ? '0.7' : '0.4'});display:flex;align-items:center;justify-content:center;font-size:${selected ? 22 : 18}px;transform:${selected ? 'scale(1.1)' : 'scale(1)'};transition:all 0.2s;">🗺️</div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #1B8757;margin-top:-1px;"></div>
    </div>`,
    className: '',
    iconSize: [s, s + 9],
    iconAnchor: [s / 2, s + 9],
  })
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

export default function MapHome({ onSunlight, communityPosts = [], sunlightPosts: sunlightPostsProp = [], onEditSunlightPost }) {
  const sunlightPosts = Array.isArray(sunlightPostsProp) ? sunlightPostsProp : []
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [selectedStory, setSelectedStory] = useState(null)
  const [selectedHuntPost, setSelectedHuntPost] = useState(null)
  const [listView, setListView] = useState(false)
  const [search, setSearch] = useState('')
  const [editingPost, setEditingPost] = useState(null)

  const allLocatedPosts = communityPosts.filter(p => p.location)
  const storyPosts = allLocatedPosts.filter(p => !p.isHunt).filter(p => {
    if (filter !== 'all' && filter !== 'photo') return false
    if (search) {
      const q = search.toLowerCase()
      const inText    = (p.text    || '').toLowerCase().includes(q)
      const inCaption = (p.caption || '').toLowerCase().includes(q)
      const inLoc     = (p.location?.name || '').toLowerCase().includes(q)
      if (!inText && !inCaption && !inLoc) return false
    }
    return true
  })
  const huntPosts = allLocatedPosts.filter(p => p.isHunt)
  const sunlightPostIds = new Set(sunlightPosts.map(p => p.id))

  const searchRef = useRef(null)
  const filterRef = useRef(null)
  const toggleRef = useRef(null)
  useBlockMapEvents(searchRef)
  useBlockMapEvents(filterRef)
  useBlockMapEvents(toggleRef)

  const sunlightWithLocation = sunlightPosts.filter(p => p.location)

  const allPinItems = [...CONTENT_ITEMS, ...sunlightWithLocation]

  const filtered = allPinItems.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      const inTitle = (item.title || '').toLowerCase().includes(q)
      const inBody  = (item.body  || '').toLowerCase().includes(q)
      if (!inTitle && !inBody) return false
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
        <MapClickHandler onMapClick={() => { setSelected(null); setSelectedStory(null); setSelectedHuntPost(null) }} />
        {filtered.map(item => (
          <Marker
            key={item.id}
            position={[item.location.lat, item.location.lng]}
            icon={createPinIcon(item.type, selected?.id === item.id)}
            eventHandlers={{ click: (e) => handlePinClick(item, e) }}
          />
        ))}
        {storyPosts.map(post => (
          <Marker
            key={`story-${post.id}`}
            position={[post.location.lat, post.location.lng]}
            icon={createStoryPinIcon(post, selectedStory?.id === post.id)}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation()
                setSelectedStory(post)
                setSelected(null)
                setSelectedHuntPost(null)
                setListView(false)
              }
            }}
          />
        ))}
        {huntPosts.map(post => (
          <Marker
            key={`hunt-${post.id}`}
            position={[post.location.lat, post.location.lng]}
            icon={createHuntPinIcon(selectedHuntPost?.id === post.id)}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation()
                setSelectedHuntPost(post)
                setSelected(null)
                setSelectedStory(null)
                setListView(false)
              }
            }}
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
        }}
      >
        {/* Scrollable chip row */}
        <div style={{
          display: 'flex', gap: 7, padding: '8px 12px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}>
          {FILTERS.map(f => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                onClick={() => setFilter(active && f.id !== 'all' ? 'all' : f.id)}
                style={{
                  flexShrink: 0, padding: '6px 11px', borderRadius: 20, border: 'none',
                  background: active ? (f.id === 'all' ? '#1A1A1A' : f.color) : 'rgba(255,255,255,0.93)',
                  color: active ? '#fff' : (f.id === 'all' ? '#4A4A4A' : f.color),
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {f.label}
              </button>
            )
          })}
          {/* Right spacer so last chip isn't flush against the fade */}
          <div style={{ minWidth: 36, flexShrink: 0 }} />
        </div>
        {/* Right-edge gradient fade — hints that more chips are scrollable */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 40,
          background: 'linear-gradient(to right, transparent, rgba(245,245,245,0.92))',
          pointerEvents: 'none',
        }} />
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
        <PinBottomSheet
          item={selected}
          isSunlightPost={sunlightPostIds.has(selected.id)}
          onEdit={() => { setEditingPost(selected); setSelected(null) }}
          onClose={() => setSelected(null)}
        />
      )}

      {/* ── Story (community post) bottom sheet ── */}
      {selectedStory && !listView && (
        <StoryBottomSheet post={selectedStory} onClose={() => setSelectedStory(null)} />
      )}

      {/* ── Hunt post bottom sheet ── */}
      {selectedHuntPost && !listView && (
        <HuntPostBottomSheet post={selectedHuntPost} onClose={() => setSelectedHuntPost(null)} />
      )}

      {/* ── List view panel ── */}
      {listView && (
        <ListPanel
          items={filtered}
          onSelect={item => { setSelected(item); setListView(false) }}
          onClose={() => setListView(false)}
        />
      )}

      {/* ── Edit sunlight post ── */}
      {editingPost && (
        <CreateContent
          editPost={editingPost}
          onClose={() => setEditingPost(null)}
          onSubmit={(updated) => { onEditSunlightPost?.(updated); setEditingPost(null) }}
        />
      )}
    </div>
  )
}

// ── Pin detail bottom sheet ──────────────────────────────────────────────────
function PinBottomSheet({ item, onClose, isSunlightPost, onEdit }) {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isSunlightPost && (
            <button
              onClick={onEdit}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: cfg.light, border: `1.5px solid ${cfg.color}44`,
                borderRadius: 20, padding: '5px 12px', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, color: cfg.color,
              }}
            >
              ✏️ Edit
            </button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <CloseIcon size={18} color="#9A9A9A" />
          </button>
        </div>
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

// ── Story (community post) bottom sheet ──────────────────────────────────────
function StoryBottomSheet({ post, onClose }) {
  const [liked, setLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(0)
  const toggleLike = () => {
    setLiked(v => !v)
    setLocalLikes(n => n + (liked ? -1 : 1))
  }

  return (
    <div className="slide-up" style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: '#fff', borderRadius: '20px 20px 0 0',
      boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
      maxHeight: '68vh', overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
        <div style={{ width: 36, height: 4, background: '#E0E0E0', borderRadius: 2 }} />
      </div>

      {/* Story pin label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '0.5px',
            padding: '4px 10px', borderRadius: 20,
            background: '#FFF3E0', color: '#FF9A3C',
          }}>STORY</span>
          {post.location && (
            <span style={{ fontSize: 12, color: '#9A9A9A', fontWeight: 500 }}>📍 {post.location.name}</span>
          )}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <CloseIcon size={18} color="#9A9A9A" />
        </button>
      </div>

      {/* Media */}
      {post.mediaType === 'photo' && post.img && (
        <img src={post.img} alt="" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', display: 'block' }} />
      )}
      {post.mediaType === 'textcard' && post.textContent && (
        <div style={{
          margin: '0 16px',
          borderRadius: 16, padding: '20px 18px',
          background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: 100,
        }}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1.5, textAlign: 'center', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
            {post.textContent}
          </p>
        </div>
      )}

      {/* Caption + footer */}
      <div style={{ padding: '14px 16px 28px' }}>
        <p style={{ fontSize: 14, color: '#2A2A2A', lineHeight: 1.65, marginBottom: 14 }}>{post.text}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F0F0F0', paddingTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: post.avatarBg ?? '#FFC94A',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800,
            }}>
              {(post.username ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{post.username}</div>
              <div style={{ fontSize: 11, color: '#9A9A9A' }}>{post.time ?? 'just now'}</div>
            </div>
          </div>
          <button onClick={toggleLike} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <HeartIcon size={18} color={liked ? '#E8415A' : '#BBBBBB'} filled={liked} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#7A7A7A' }}>{(post.likes ?? 0) + localLikes}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function HuntPostBottomSheet({ post, onClose }) {
  const [liked, setLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(0)
  const toggleLike = () => { setLiked(v => !v); setLocalLikes(n => n + (liked ? -1 : 1)) }

  return (
    <div className="slide-up" style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: '#fff', borderRadius: '20px 20px 0 0',
      boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
      maxHeight: '72vh', overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
        <div style={{ width: 36, height: 4, background: '#E0E0E0', borderRadius: 2 }} />
      </div>

      {/* Header badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.5px', padding: '4px 10px', borderRadius: 20, background: '#E8F8F0', color: '#1B8757' }}>🗺️ HUNT</span>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.5px', padding: '4px 10px', borderRadius: 20, background: '#EDE9FE', color: '#7C3AED' }}>🤖 AI Match</span>
          {post.location?.name && <span style={{ fontSize: 11, color: '#9A9A9A', fontWeight: 500 }}>📍 {post.location.name}</span>}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <CloseIcon size={18} color="#9A9A9A" />
        </button>
      </div>

      {/* Selfie */}
      {post.img && (
        <img src={post.img} alt="Hunt completion selfie" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} />
      )}

      {/* Caption + footer */}
      <div style={{ padding: '14px 16px 28px' }}>
        {post.text && <p style={{ fontSize: 14, color: '#2A2A2A', lineHeight: 1.65, marginBottom: 14 }}>{post.text}</p>}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F0F0F0', paddingTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2ECC87,#1B8757)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>
              {(post.username ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{post.username}</div>
              <div style={{ fontSize: 11, color: '#9A9A9A' }}>{post.time ?? 'just now'}</div>
            </div>
          </div>
          <button onClick={toggleLike} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <HeartIcon size={18} color={liked ? '#E8415A' : '#BBBBBB'} filled={liked} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#7A7A7A' }}>{(post.likes ?? 0) + localLikes}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const actionBtn = {
  display: 'flex', alignItems: 'center', gap: 4,
  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
}
