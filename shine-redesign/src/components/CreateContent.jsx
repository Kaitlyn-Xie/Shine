import { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CloseIcon, CheckIcon, EditIcon, ZapIcon } from './Icons'
import { TYPE_CONFIG } from '../data'
import { api } from '../lib/api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const TYPES = [
  { id: 'question', label: 'Question', hint: 'Ask the community something' },
  { id: 'tip',      label: 'Tip',      hint: 'Share a helpful tip or trick' },
  { id: 'story',    label: 'Story',    hint: 'Tell a personal experience' },
  { id: 'resource', label: 'Resource', hint: 'Link to a useful resource' },
]

function createColoredPinIcon(color) {
  return L.divIcon({
    html: `<div style="
      width:30px;height:30px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:${color};
      border:3px solid #fff;
      box-shadow:0 2px 12px rgba(0,0,0,0.28);
    "></div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  })
}

function MapTapHandler({ onTap }) {
  useMapEvents({ click: (e) => onTap([e.latlng.lat, e.latlng.lng]) })
  return null
}

function InlineMapPicker({ pinColor, onConfirm, onCancel }) {
  const defaultCenter = [42.3755, -71.1175]
  const [pin, setPin] = useState(defaultCenter)
  const [locationName, setLocationName] = useState('')
  const markerRef = useRef(null)
  const iconRef = useRef(createColoredPinIcon(pinColor))

  useEffect(() => {
    iconRef.current = createColoredPinIcon(pinColor)
    if (markerRef.current) markerRef.current.setIcon(iconRef.current)
  }, [pinColor])

  const handleDragEnd = () => {
    const latlng = markerRef.current?.getLatLng()
    if (latlng) setPin([latlng.lat, latlng.lng])
  }

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: `2px solid ${pinColor}55`, marginBottom: 12 }}>
      <div style={{ position: 'relative', height: 220 }}>
        <MapContainer
          center={defaultCenter}
          zoom={15}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapTapHandler onTap={setPin} />
          <Marker
            position={pin}
            icon={iconRef.current}
            draggable
            ref={markerRef}
            eventHandlers={{ dragend: handleDragEnd }}
          />
        </MapContainer>
      </div>

      <div style={{ background: '#FAFAFA', padding: '12px 14px', borderTop: `1.5px solid ${pinColor}33` }}>
        <div style={{ fontSize: 11, color: '#AAAAAA', marginBottom: 10, textAlign: 'center' }}>
          Tap the map or drag the pin to your exact spot
        </div>
        <input
          value={locationName}
          onChange={e => setLocationName(e.target.value)}
          placeholder="Name this location (e.g. Widener Library)…"
          style={{
            width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)',
            borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none',
            background: '#fff', marginBottom: 10, boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px 0', border: '1.5px solid var(--border)', borderRadius: 12,
              background: '#fff', fontSize: 13, fontWeight: 700, color: '#4A4A4A', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ lat: pin[0], lng: pin[1], name: locationName.trim() || 'My location' })}
            style={{
              flex: 2, padding: '10px 0', border: 'none', borderRadius: 12,
              background: pinColor, fontSize: 13, fontWeight: 800, color: '#fff',
              cursor: 'pointer', boxShadow: `0 2px 8px ${pinColor}55`,
            }}
          >
            Use this location ✓
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CreateContent({ onClose, onSubmit, editPost = null }) {
  const isEditing = editPost !== null
  const [type, setType] = useState(editPost?.type ?? 'tip')
  const [title, setTitle] = useState(editPost?.title ?? '')
  const [body, setBody] = useState(editPost?.body ?? '')
  const [location, setLocation] = useState(editPost?.location ?? null)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const cfg = TYPE_CONFIG[type]
  const canSubmit = title.trim().length > 0 && body.trim().length > 0 && !saving

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSaving(true)
    setSaveError(null)
    const localUpdate = {
      ...(isEditing ? editPost : {}),
      id: isEditing ? editPost.id : Date.now(),
      type,
      title: title.trim(),
      body: body.trim(),
      location: location ?? null,
      likes: isEditing ? editPost.likes : 0,
      time: isEditing ? editPost.time : 'Just now',
    }
    try {
      if (isEditing && editPost?.dbId) {
        const saved = await api.updateSunlightPost(editPost.dbId, {
          title: title.trim(),
          body: body.trim(),
          isAnonymous: editPost.isAnonymous ?? false,
        })
        onSubmit(saved ?? localUpdate)
      } else {
        onSubmit(localUpdate)
      }
      onClose()
    } catch (e) {
      setSaveError(e.message || 'Could not save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div
        className="slide-up"
        style={{
          width: '100%', maxWidth: 430, margin: '0 auto',
          background: '#fff', borderRadius: '24px 24px 0 0',
          maxHeight: '92vh', display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 12px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 18, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {isEditing ? <EditIcon size={16} color="#1A1A1A" /> : <ZapIcon size={16} color="#1A1A1A" />}
            {isEditing ? 'Edit Sunlight Post' : 'New Sunlight Post'}
          </span>
          <button onClick={onClose} style={iconBtn}>
            <CloseIcon size={20} color="#4A4A4A" />
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px 32px' }}>

          {/* Type selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={fieldLabel}>Post type</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TYPES.map(t => {
                const isActive = type === t.id
                const tc = TYPE_CONFIG[t.id]
                return (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    style={{
                      padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                      background: isActive ? tc.color : tc.light,
                      color: isActive ? '#fff' : tc.color,
                      fontSize: 13, fontWeight: 700,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
              {TYPES.find(t => t.id === type)?.hint}
            </p>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={fieldLabel}>Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={
                type === 'question' ? 'What do you want to ask?'
                : type === 'tip'      ? 'What is your tip?'
                : type === 'story'    ? 'What happened?'
                : type === 'resource' ? 'Name of the resource'
                : 'Name your activity'
              }
              maxLength={120}
              style={inputStyle}
            />
          </div>

          {/* Body */}
          <div style={{ marginBottom: 16 }}>
            <label style={fieldLabel}>Details</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Share more details…"
              rows={4}
              maxLength={600}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.55 }}
            />
            <div style={{ fontSize: 11, color: '#AAAAAA', textAlign: 'right', marginTop: 4 }}>
              {body.length}/600
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: 24 }}>
            <label style={fieldLabel}>
              Location <span style={{ fontWeight: 400, color: '#AAAAAA' }}>(optional — pins on the map)</span>
            </label>

            {!showMapPicker && !location && (
              <button
                onClick={() => setShowMapPicker(true)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  border: `1.5px dashed ${cfg.color}88`, borderRadius: 12,
                  padding: '12px 14px', background: cfg.light, cursor: 'pointer',
                }}
              >
                {/* Mini colored pin preview */}
                <div style={{ position: 'relative', width: 26, height: 30, flexShrink: 0 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)', background: cfg.color,
                    border: '2px solid #fff', boxShadow: `0 2px 6px ${cfg.color}66`,
                    position: 'absolute', top: 0, left: 2,
                  }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>
                    Drop a pin on the map
                  </div>
                  <div style={{ fontSize: 11, color: '#AAAAAA', marginTop: 1 }}>
                    Pin will appear in this post type's color
                  </div>
                </div>
              </button>
            )}

            {showMapPicker && (
              <InlineMapPicker
                pinColor={cfg.color}
                onConfirm={(loc) => { setLocation(loc); setShowMapPicker(false) }}
                onCancel={() => setShowMapPicker(false)}
              />
            )}

            {location && !showMapPicker && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                border: `1.5px solid ${cfg.color}66`, borderRadius: 12,
                padding: '10px 14px', background: cfg.light,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)', background: cfg.color,
                  border: '2px solid #fff', flexShrink: 0,
                }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: cfg.color }}>
                  {location.name}
                </span>
                <button
                  onClick={() => setLocation(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#AAAAAA', padding: 2 }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Error message */}
          {saveError && (
            <div style={{ marginBottom: 10, padding: '10px 14px', background: '#FEF2F2', borderRadius: 10, color: '#DC2626', fontSize: 13, fontWeight: 600 }}>
              {saveError}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none',
              background: canSubmit ? cfg.color : '#E0E0E0',
              color: canSubmit ? '#fff' : '#AAAAAA',
              fontSize: 16, fontWeight: 800, cursor: canSubmit ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.2s, color 0.2s',
              boxShadow: canSubmit ? `0 4px 16px ${cfg.color}55` : 'none',
            }}
          >
            <CheckIcon size={18} color={canSubmit ? '#fff' : '#AAAAAA'} />
            {saving ? 'Saving…' : isEditing ? 'Save changes' : `Post ${TYPE_CONFIG[type].label}`}
          </button>
        </div>
      </div>
    </div>
  )
}

const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const fieldLabel = {
  display: 'block', fontSize: 13, fontWeight: 700,
  color: '#4A4A4A', marginBottom: 7, letterSpacing: '0.1px',
}
const inputStyle = {
  width: '100%', border: '1.5px solid var(--border)', borderRadius: 12,
  padding: '10px 14px', fontSize: 14, outline: 'none',
  background: 'var(--bg)', fontFamily: 'inherit', color: '#1A1A1A',
  boxSizing: 'border-box',
}
