import { useState } from 'react'
import { CloseIcon, CameraIcon, VideoIcon, PinIcon, Avatar } from './Icons'

export default function CreatePost({ onClose, onSubmit }) {
  const [text, setText] = useState('')
  const [tags, setTags] = useState('')

  const handleSubmit = () => {
    if (!text.trim()) return
    onSubmit({
      username: 'You',
      country: 'Your Country',
      initials: 'ME',
      avatarBg: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
      text: text.trim(),
      tags: tags.split(' ').filter(t => t.startsWith('#')).map(t => t.slice(1)),
    })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 200,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="slide-up" style={{
        background: '#fff', borderRadius: '24px 24px 0 0',
        width: '100%', maxWidth: 430, padding: 24, paddingBottom: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800 }}>Create Post</h2>
          <button onClick={onClose} style={iconBtn}>
            <CloseIcon size={20} color="#4A4A4A" />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <Avatar name="Me" size={38} bg="linear-gradient(135deg, #FFC94A, #FF9A3C)" />
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Share something with the community..."
            autoFocus
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none',
              fontSize: 15, lineHeight: 1.6, color: 'var(--text)',
              background: 'transparent', minHeight: 100, fontFamily: 'inherit',
            }}
          />
        </div>

        <input
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="#tags  #harvard  #international"
          style={{
            width: '100%', padding: '10px 14px',
            border: '1.5px solid var(--border)',
            borderRadius: 10, fontSize: 14, outline: 'none',
            fontFamily: 'inherit', marginBottom: 16,
            color: 'var(--orange)',
          }}
        />

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Photo', Icon: CameraIcon },
            { label: 'Video', Icon: VideoIcon },
            { label: 'Location', Icon: PinIcon },
          ].map(({ label, Icon }) => (
            <button key={label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 20,
              border: '1.5px solid var(--border)',
              background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
            }}>
              <Icon size={14} color="var(--text-secondary)" />
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          style={{
            width: '100%', padding: 14,
            background: text.trim()
              ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)'
              : 'var(--border)',
            border: 'none', borderRadius: 14,
            fontSize: 15, fontWeight: 700,
            cursor: text.trim() ? 'pointer' : 'default',
            color: text.trim() ? '#1A1A1A' : 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}>
          Share
        </button>
      </div>
    </div>
  )
}

const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
