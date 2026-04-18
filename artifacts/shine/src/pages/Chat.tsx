import { useState } from 'react'
import { SearchIcon, EditIcon, ChevronLeftIcon, SendIcon, PaperclipIcon, SmileIcon, Avatar, UsersIcon, PinIcon } from '@/components/Icons'

const PINNED = [
  { id: 'helpdesk', name: 'International Help Desk', initials: 'IH', bg: 'linear-gradient(135deg, #FFC94A, #FF9A3C)', last: 'Welcome to Harvard! How can we help?', time: 'Now', unread: 2 },
  { id: 'housing', name: 'Housing Support', initials: 'HS', bg: 'linear-gradient(135deg, #B8D8FF, #5599EE)', last: 'Room assignments are now available.', time: '1h', unread: 1 },
]
const GROUPS = [
  { id: 'fresh26', name: 'Freshman 2026', initials: 'F26', bg: 'linear-gradient(135deg, #FFE8A0, #FFC94A)', last: 'Anyone going to the orientation?', time: '15m', members: 312, unread: 5 },
  { id: 'chinese', name: 'Chinese Students Association', initials: 'CS', bg: 'linear-gradient(135deg, #FFB8B8, #EE5555)', last: 'Anyone going to Boston Chinatown this weekend?', time: '32m', members: 87, unread: 0 },
  { id: 'csmajors', name: 'CS Majors', initials: 'CS', bg: 'linear-gradient(135deg, #C8F0D8, #3CB87A)', last: 'CS50 problem set due tonight!', time: '1h', members: 145, unread: 3 },
]
const DMS = [
  { id: 'john', name: 'John', initials: 'JO', bg: 'linear-gradient(135deg, #B8D8FF, #5599EE)', last: 'Hey, welcome to Harvard!', time: '2h', unread: 0 },
  { id: 'emma', name: 'Emma', initials: 'EM', bg: 'linear-gradient(135deg, #F0C8FF, #CC66FF)', last: 'Did you find the library?', time: '3h', unread: 1 },
  { id: 'alex', name: 'Alex', initials: 'AL', bg: 'linear-gradient(135deg, #C8F0D8, #3CB87A)', last: "Let's grab coffee tomorrow.", time: '1d', unread: 0 },
]

interface Msg { from: 'me' | 'them' | 'system'; name?: string; text: string; time: string }
type Messages = Record<string, Msg[]>

const INITIAL_MESSAGES: Messages = {
  helpdesk: [
    { from: 'system', text: 'Welcome to the International Help Desk.', time: '9:00 AM' },
    { from: 'them', name: 'Support Team', text: 'Hi! How can we help you today?', time: '9:01 AM' },
    { from: 'them', name: 'Support Team', text: 'We are available Monday–Friday, 9am to 5pm.', time: '9:01 AM' },
  ],
  john: [
    { from: 'them', name: 'John', text: 'Hey! Welcome to Harvard!', time: '2h ago' },
    { from: 'them', name: 'John', text: 'Let me know if you need any help.', time: '2h ago' },
    { from: 'me', text: 'Thanks so much!', time: '2h ago' },
  ],
  fresh26: [
    { from: 'them', name: 'Mei Lin', text: 'Hey everyone! So excited to finally be here.', time: '20m ago' },
    { from: 'them', name: 'Lucas M.', text: 'Same! Anyone going to the orientation dinner?', time: '18m ago' },
    { from: 'them', name: 'Priya S.', text: 'Yes! See you all there.', time: '15m ago' },
  ],
}

interface ChatItem {
  id: string; name: string; initials: string; bg: string;
  last: string; time: string; unread: number; members?: number
}

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Chat() {
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null)
  const [message, setMessage] = useState('')
  const [allMessages, setAllMessages] = useState<Messages>(INITIAL_MESSAGES)

  const sendMessage = () => {
    if (!message.trim() || !activeChat) return
    setAllMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), { from: 'me', text: message.trim(), time: now() }],
    }))
    setMessage('')
  }

  if (activeChat) {
    const msgs = allMessages[activeChat.id] || []
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F7F4' }}>
        {/* Chat header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50, flexShrink: 0 }}>
          <button onClick={() => setActiveChat(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ChevronLeftIcon size={22} color="#4A4A4A" />
          </button>
          <Avatar name={activeChat.name} size={36} bg={activeChat.bg} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{activeChat.name}</div>
            {activeChat.members && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{activeChat.members} members</div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {msgs.map((msg, i) => {
            if (msg.from === 'system') {
              return (
                <div key={i} style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', padding: '4px 0' }}>{msg.text}</div>
              )
            }
            const isMe = msg.from === 'me'
            return (
              <div key={i} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                {!isMe && <Avatar name={msg.name || '?'} size={28} />}
                <div style={{ maxWidth: '72%' }}>
                  {!isMe && msg.name && (
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3, marginLeft: 2 }}>{msg.name}</div>
                  )}
                  <div style={{
                    background: isMe ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : '#fff',
                    color: isMe ? '#fff' : 'var(--text)',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: '10px 14px',
                    fontSize: 14, lineHeight: 1.5,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 3, textAlign: isMe ? 'right' : 'left', marginLeft: isMe ? 0 : 4 }}>{msg.time}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Input */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px 12px', background: '#fff', borderTop: '1px solid var(--border)' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <PaperclipIcon size={20} color="#9A9A9A" />
          </button>
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Message..."
            style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 20, padding: '9px 14px', fontSize: 14, outline: 'none', background: '#F8F7F4' }}
          />
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <SmileIcon size={20} color="#9A9A9A" />
          </button>
          <button
            onClick={sendMessage}
            style={{
              background: message.trim() ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : '#ECECEC',
              border: 'none', borderRadius: '50%', width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: message.trim() ? 'pointer' : 'default',
              transition: 'background 0.2s',
            }}
          >
            <SendIcon size={16} color={message.trim() ? '#fff' : '#9A9A9A'} />
          </button>
        </div>
      </div>
    )
  }

  // Chat list
  const Row = ({ item }: { item: ChatItem }) => (
    <button
      onClick={() => setActiveChat(item)}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border)' }}
    >
      <Avatar name={item.name} size={46} bg={item.bg} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{item.name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.time}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item.last}</span>
          {item.unread > 0 && (
            <span style={{ background: '#FF9A3C', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 6 }}>{item.unread}</span>
          )}
        </div>
      </div>
    </button>
  )

  return (
    <div className="fade-in" style={{ background: '#fff', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 12px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50, background: '#fff' }}>
        <span style={{ fontSize: 19, fontWeight: 800 }}>Messages</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><SearchIcon size={20} color="#4A4A4A" /></button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><EditIcon size={20} color="#4A4A4A" /></button>
        </div>
      </div>

      {/* Pinned */}
      <div style={{ padding: '12px 16px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <PinIcon size={13} color="#FF9A3C" />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Pinned</span>
        </div>
        {PINNED.map(item => <Row key={item.id} item={{ ...item, members: undefined }} />)}
      </div>

      {/* Groups */}
      <div style={{ padding: '12px 0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, padding: '0 16px' }}>
          <UsersIcon size={13} color="#5599EE" />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Groups</span>
        </div>
        {GROUPS.map(item => <Row key={item.id} item={item} />)}
      </div>

      {/* Direct messages */}
      <div style={{ padding: '12px 0 80px' }}>
        <div style={{ padding: '0 16px', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Direct Messages</span>
        </div>
        {DMS.map(item => <Row key={item.id} item={{ ...item, members: undefined }} />)}
      </div>
    </div>
  )
}
