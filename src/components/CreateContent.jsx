import { useState } from 'react'
import { CloseIcon, PinIcon, CheckIcon } from './Icons'
import { TYPE_CONFIG } from '../data'

const TYPES = [
  { id: 'question', label: 'Question', hint: 'Ask the community something' },
  { id: 'tip',      label: 'Tip',      hint: 'Share a helpful tip or trick' },
  { id: 'story',    label: 'Story',    hint: 'Tell a personal experience' },
  { id: 'resource', label: 'Resource', hint: 'Link to a useful resource' },
  { id: 'activity', label: 'Activity', hint: 'Start a group challenge' },
]

export default function CreateContent({ onClose, onSubmit }) {
  const [type, setType] = useState('tip')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [location, setLocation] = useState('')

  const cfg = TYPE_CONFIG[type]
  const canSubmit = title.trim().length > 0 && body.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({ type, title: title.trim(), body: body.trim(), location: location.trim() || 'Harvard Campus' })
    onClose()
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
        }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>Create Post</span>
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
              placeholder={type === 'question'
                ? 'What do you want to ask?'
                : type === 'tip' ? 'What is your tip?'
                : type === 'story' ? 'What happened?'
                : type === 'resource' ? 'Name of the resource'
                : 'Name your activity'}
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
            <label style={fieldLabel}>Location <span style={{ fontWeight: 400, color: '#AAAAAA' }}>(optional)</span></label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              border: '1.5px solid var(--border)', borderRadius: 12, padding: '10px 14px',
              background: 'var(--bg)',
            }}>
              <PinIcon size={16} color="#AAAAAA" />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Lamont Library, Harvard Yard…"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', fontFamily: 'inherit' }}
              />
            </div>
          </div>

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
            Post {TYPE_CONFIG[type].label}
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
}
