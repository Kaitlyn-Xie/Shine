import { useState } from 'react'
import {
  SearchIcon, EditIcon, ChevronLeftIcon,
  PaperclipIcon, MicIcon, SmileIcon, SendIcon,
  PinIcon, UsersIcon, MessageIcon, Avatar, UserIcon
} from './Icons'

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

const MESSAGES = {
  helpdesk: [
    { from: 'system', text: 'Welcome to the International Help Desk.', time: '9:00 AM' },
    { from: 'them', name: 'Support Team', text: 'Hi! How can we help you today?', time: '9:01 AM' },
    { from: 'them', name: 'Support Team', text: 'We are available Monday – Friday, 9am to 5pm.', time: '9:01 AM' },
  ],
  john: [
    { from: 'them', name: 'John', text: 'Hey! Welcome to Harvard!', time: '2h ago' },
    { from: 'them', name: 'John', text: 'Let me know if you need any help around campus.', time: '2h ago' },
    { from: 'me', text: 'Thanks so much! Really appreciate it.', time: '2h ago' },
  ],
  fresh26: [
    { from: 'them', name: 'Mei Lin', text: 'Hey everyone! So excited to finally be here.', time: '20m ago' },
    { from: 'them', name: 'Lucas M.', text: 'Same! Anyone going to the orientation dinner?', time: '18m ago' },
    { from: 'them', name: 'Priya S.', text: 'Yes! See you all there.', time: '15m ago' },
  ],
}

export default function Chat() {
  const [activeChat, setActiveChat] = useState(null)
  const [message, setMessage] = useState('')
  const [allMessages, setAllMessages] = useState(MESSAGES)

  const sendMessage = () => {
    if (!message.trim() || !activeChat) return
    setAllMessages(prev => ({
      ...prev,
      [activeChat.id]: [
        ...(prev[activeChat.id] || []),
        { from: 'me', text: message.trim(), time: 'Just now' },
      ],
    }))
    setMessage('')
  }

  if (activeChat) {
    const msgs = allMessages[activeChat.id] || []
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Chat Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', background: '#fff',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <button onClick={() => setActiveChat(null)} style={iconBtn}>
            <ChevronLeftIcon size={22} color="#4A4A4A" />
          </button>
          <Avatar name={activeChat.name} size={36} bg={activeChat.bg} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{activeChat.name}</div>
            {activeChat.members && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{activeChat.members} members</div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', paddingBottom: 80 }}>
          {msgs.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.from === 'me' ? 'flex-end' : msg.from === 'system' ? 'center' : 'flex-start',
              marginBottom: 10,
            }}>
              {msg.from === 'system' ? (
                <div style={{
                  background: '#FFFBF0', padding: '7px 14px',
                  borderRadius: 20, fontSize: 12, color: 'var(--orange)', fontWeight: 600,
                }}>{msg.text}</div>
              ) : (
                <div style={{ maxWidth: '75%' }}>
                  {msg.from === 'them' && (
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3, marginLeft: 4 }}>
                      {msg.name}
                    </div>
                  )}
                  <div style={{
                    padding: '10px 14px',
                    background: msg.from === 'me'
                      ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)'
                      : '#fff',
                    borderRadius: msg.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    fontSize: 14, lineHeight: 1.5,
                    boxShadow: 'var(--shadow)',
                  }}>
                    {msg.text}
                  </div>
                  <div style={{
                    fontSize: 11, color: 'var(--text-secondary)', marginTop: 4,
                    textAlign: msg.from === 'me' ? 'right' : 'left',
                    paddingLeft: msg.from !== 'me' ? 4 : 0,
                  }}>
                    {msg.time}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 14px 20px',
          background: '#fff', borderTop: '1px solid var(--border)',
        }}>
          <button style={iconBtn}><PaperclipIcon size={20} color="#9A9A9A" /></button>
          <button style={iconBtn}><MicIcon size={20} color="#9A9A9A" /></button>
          <button style={iconBtn}><SmileIcon size={20} color="#9A9A9A" /></button>
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Message..."
            style={{
              flex: 1, padding: '10px 14px',
              border: '1.5px solid var(--border)', borderRadius: 24,
              outline: 'none', fontSize: 14, fontFamily: 'inherit',
              background: 'var(--bg)',
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: message.trim() ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : 'var(--border)',
              border: 'none', cursor: message.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}>
            <SendIcon size={15} color={message.trim() ? '#fff' : '#AAAAAA'} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 12px',
        background: '#fff', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <span style={{ fontSize: 19, fontWeight: 800 }}>Chats</span>
        <button style={iconBtn}><EditIcon size={20} color="#4A4A4A" /></button>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 12px 8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', borderRadius: 12, padding: '10px 14px',
          boxShadow: 'var(--shadow)',
        }}>
          <SearchIcon size={16} color="#AAAAAA" />
          <input placeholder="Search chats..." style={{
            flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent',
          }} />
        </div>
      </div>

      <Section title="Pinned" Icon={PinIcon} items={PINNED} onSelect={setActiveChat} />
      <Section title="Group Chats" Icon={UsersIcon} items={GROUPS} onSelect={setActiveChat} />
      <Section title="Direct Messages" Icon={MessageIcon} items={DMS} onSelect={setActiveChat} />
    </div>
  )
}

function Section({ title, Icon, items, onSelect }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        padding: '10px 16px 6px',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Icon size={13} color="var(--orange)" />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </span>
      </div>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', margin: '0 12px', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        {items.map((item, i) => (
          <button key={item.id} onClick={() => onSelect(item)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
            textAlign: 'left',
          }}>
            <Avatar name={item.name} size={44} bg={item.bg} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
              <div style={{
                fontSize: 13, color: 'var(--text-secondary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{item.last}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.time}</span>
              {item.unread > 0 && (
                <span style={{
                  background: 'var(--orange)', color: '#fff',
                  borderRadius: 10, width: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>{item.unread}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
