import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LockIcon, MapIcon, PinIcon, TargetIcon, ArrowRightIcon } from './Icons'
import ScavengerHunt from './ScavengerHunt'

// Fix default marker icons broken by Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Harvard campus pins
const PINS = [
  { pos: [42.3744, -71.1182], label: 'Widener Library',       type: 'study'   },
  { pos: [42.3770, -71.1167], label: 'Johnston Gate',         type: 'landmark'},
  { pos: [42.3750, -71.1158], label: 'John Harvard Statue',   type: 'landmark'},
  { pos: [42.3762, -71.1148], label: 'Science Center Café',   type: 'food'    },
  { pos: [42.3730, -71.1200], label: 'Annenberg Dining Hall', type: 'food'    },
  { pos: [42.3784, -71.1173], label: 'Smith Campus Center',   type: 'campus'  },
  { pos: [42.3755, -71.1130], label: 'Harvard Yard',          type: 'landmark'},
  { pos: [42.3710, -71.1180], label: 'Adams House',           type: 'housing' },
]

const typeColors = {
  study:    '#5599EE',
  landmark: '#FF9A3C',
  food:     '#5BC88A',
  campus:   '#CC66FF',
  housing:  '#EE5555',
}

function makeIcon(type) {
  const color = typeColors[type] || '#FFC94A'
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 4px;
      background:${color};
      border:2.5px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.25);
      transform:rotate(-45deg);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 26],
    popupAnchor: [0, -28],
  })
}

const LEGEND = [
  { type: 'landmark', label: 'Landmark'  },
  { type: 'food',     label: 'Dining'    },
  { type: 'study',    label: 'Study'     },
  { type: 'campus',   label: 'Campus'    },
  { type: 'housing',  label: 'Housing'   },
]

const MAP_FEATURES = [
  { Icon: PinIcon,    label: 'Dining Halls',   desc: '8 locations across campus' },
  { Icon: MapIcon,    label: 'Study Spaces',   desc: '24/7 libraries and quiet zones' },
  { Icon: TargetIcon, label: 'Scavenger Hunt', desc: 'Explore with your team', action: true },
]

export default function MapScreen({ unlocked }) {
  const [showHunt, setShowHunt] = useState(false)

  if (showHunt) return <ScavengerHunt onBack={() => setShowHunt(false)} />

  return (
    <div className="fade-in">
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '14px 20px 12px', background: '#fff',
        borderBottom: '1px solid var(--border)',
      }}>
        <MapIcon size={20} color="#4A4A4A" />
        <span style={{ fontSize: 19, fontWeight: 800 }}>Map</span>
        {unlocked && (
          <span style={{
            marginLeft: 'auto', fontSize: 12, fontWeight: 700,
            color: 'var(--orange)', background: '#FFFBF0',
            padding: '4px 10px', borderRadius: 20,
            border: '1.5px solid var(--yellow)',
          }}>Unlocked</span>
        )}
      </div>

      {unlocked ? (
        /* ── UNLOCKED: real Leaflet map ── */
        <div>
          {/* Map */}
          <div style={{ height: 380, position: 'relative' }}>
            <MapContainer
              center={[42.3770, -71.1167]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {PINS.map((pin, i) => (
                <Marker key={i} position={pin.pos} icon={makeIcon(pin.type)}>
                  <Popup>
                    <strong>{pin.label}</strong>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Legend */}
          <div style={{
            padding: '12px 16px', background: '#fff',
            borderBottom: '1px solid var(--border)',
            display: 'flex', gap: 10, flexWrap: 'wrap',
          }}>
            {LEGEND.map(({ type, label }) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: typeColors[type],
                }} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ padding: '16px 14px' }}>
            {MAP_FEATURES.map(({ Icon, label, desc, action }) => (
              <div
                key={label}
                onClick={action ? () => setShowHunt(true) : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 14px', marginBottom: 10,
                  background: action ? '#FFFBF0' : 'var(--bg)',
                  borderRadius: 12,
                  border: action ? '1.5px solid var(--yellow)' : '1.5px solid transparent',
                  cursor: action ? 'pointer' : 'default',
                }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: action ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : '#ECECEC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} color={action ? '#fff' : '#6B6B6B'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{desc}</div>
                </div>
                {action && <ArrowRightIcon size={16} color="var(--orange)" />}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── LOCKED state ── */
        <div style={{ padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <div style={{
              height: 280, background: '#E8E8E8', position: 'relative', overflow: 'hidden',
            }}>
              <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
                {[40, 80, 120, 160, 200, 240].map(y => (
                  <line key={y} x1="0" y1={y} x2="100%" y2={y} stroke="#ccc" strokeWidth="1" />
                ))}
                {[50, 100, 150, 200, 250, 300, 350].map(x => (
                  <line key={x} x1={x} y1="0" x2={x} y2="100%" stroke="#ccc" strokeWidth="1" />
                ))}
                <rect x="60" y="60" width="120" height="80" rx="4" fill="#D0D0D0" />
                <rect x="200" y="40" width="80" height="100" rx="4" fill="#D0D0D0" />
                <rect x="80" y="160" width="160" height="60" rx="4" fill="#D0D0D0" />
                <rect x="260" y="160" width="60" height="90" rx="4" fill="#D0D0D0" />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.32)', gap: 14,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.95)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <LockIcon size={26} color="#4A4A4A" />
                </div>
                <div style={{
                  background: '#fff', borderRadius: 20, padding: '10px 22px', textAlign: 'center',
                }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>Map Locked</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Go to Profile → toggle "Arrived on Campus"
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Harvard Campus Map</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                The interactive map unlocks when you arrive on campus. Discover dining halls, study spaces, events, and hidden gems — all pinned just for you.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
