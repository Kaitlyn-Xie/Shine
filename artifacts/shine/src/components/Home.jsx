import { useState } from 'react'
import { SunIcon, SearchIcon, HeartIcon, UserIcon, Avatar } from './Icons'

const POSTS = [
  {
    id: 1, username: 'Mei Lin', country: 'China', initials: 'ML',
    avatarBg: 'linear-gradient(135deg, #FFD6B0, #FF9A3C)',
    img: 'https://picsum.photos/seed/harvard1/400/320', imgH: 200,
    text: "Just arrived at Harvard! The campus is absolutely beautiful.",
    likes: 42,
  },
  {
    id: 2, username: 'Lucas M.', country: 'Brazil', initials: 'LM',
    avatarBg: 'linear-gradient(135deg, #B8FFD0, #3CB87A)',
    img: 'https://picsum.photos/seed/coffee2/400/420', imgH: 260,
    text: 'Best coffee on campus is at the Science Center. Trust me.',
    likes: 87,
  },
  {
    id: 3, username: 'Priya S.', country: 'India', initials: 'PS',
    avatarBg: 'linear-gradient(135deg, #B8D8FF, #5599EE)',
    img: 'https://picsum.photos/seed/student3/400/290', imgH: 180,
    text: 'Got my student ID and bank account sorted! DM me if you need help.',
    likes: 134,
  },
  {
    id: 4, username: 'Ji-ho P.', country: 'South Korea', initials: 'JP',
    avatarBg: 'linear-gradient(135deg, #F0C8FF, #CC66FF)',
    img: 'https://picsum.photos/seed/campus4/400/370', imgH: 230,
    text: 'The scavenger hunt was incredible. Our team found every hidden spot!',
    likes: 56,
  },
  {
    id: 5, username: 'Omar K.', country: 'Egypt', initials: 'OK',
    avatarBg: 'linear-gradient(135deg, #FFE0B0, #FF8C00)',
    img: 'https://picsum.photos/seed/yard5/400/340', imgH: 210,
    text: 'Harvard Yard in the morning light is something else entirely.',
    likes: 203,
  },
  {
    id: 6, username: 'Sofia R.', country: 'Germany', initials: 'SR',
    avatarBg: 'linear-gradient(135deg, #FFB8C8, #EE4466)',
    img: 'https://picsum.photos/seed/group6/400/270', imgH: 170,
    text: 'Found the European Students group — so nice to meet everyone!',
    likes: 78,
  },
]

export default function Home({ onProfileClick, extraPosts = [] }) {
  const [baseLiked, setBaseLiked] = useState(new Set())
  const [basePosts, setBasePosts] = useState(POSTS)

  const allPosts = [...extraPosts, ...basePosts]

  const toggleLike = (id) => {
    const wasLiked = baseLiked.has(id)
    setBaseLiked(prev => {
      const next = new Set(prev); wasLiked ? next.delete(id) : next.add(id); return next
    })
    setBasePosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + (wasLiked ? -1 : 1) } : p))
  }

  const leftCol  = allPosts.filter((_, i) => i % 2 === 0)
  const rightCol = allPosts.filter((_, i) => i % 2 === 1)

  return (
    <div className="fade-in">
      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 12px',
        background: '#fff', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <SunIcon size={20} color="var(--orange)" />
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>SHINE</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button style={iconBtn}><SearchIcon size={20} color="#4A4A4A" /></button>
          <button
            onClick={onProfileClick}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <UserIcon size={15} color="#fff" />
          </button>
        </div>
      </div>

      {/* Two-column masonry grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 10px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leftCol.map((post, i) => <PostCard key={post.id} post={post} liked={baseLiked.has(post.id)} onLike={toggleLike} delay={i * 0.07} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
          {rightCol.map((post, i) => <PostCard key={post.id} post={post} liked={baseLiked.has(post.id)} onLike={toggleLike} delay={i * 0.07 + 0.04} />)}
        </div>
      </div>
    </div>
  )
}

function PostCard({ post, liked, onLike, delay }) {
  return (
    <div className="fade-in" style={{
      background: '#fff', borderRadius: 14,
      overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
      animationDelay: `${delay}s`,
    }}>
      <img
        src={post.img} alt=""
        style={{ width: '100%', height: post.imgH, objectFit: 'cover', display: 'block', background: '#F0F0F0' }}
        loading="lazy"
      />
      <div style={{ padding: '9px 10px 10px' }}>
        <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text)', marginBottom: 8 }}>{post.text}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Avatar name={post.username} size={20} bg={post.avatarBg || 'linear-gradient(135deg,#FFC94A,#FF9A3C)'} />
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1, fontWeight: 500 }}>{post.username}</span>
          <button onClick={() => onLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <HeartIcon size={14} color={liked ? '#E8415A' : '#BBBBBB'} filled={liked} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{post.likes}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const iconBtn = { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }
