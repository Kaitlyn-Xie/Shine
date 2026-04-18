import { useState, useRef } from 'react'
import { SunIcon, SearchIcon, HeartIcon, BookmarkIcon, PlusIcon, CloseIcon, CameraIcon, VideoIcon, PinIcon, Avatar } from '@/components/Icons'
import { useGetMe } from '@workspace/api-client-react'

const SEED_POSTS = [
  {
    id: 1, username: 'Mei Lin', country: 'China', initials: 'ML',
    avatarBg: 'linear-gradient(135deg, #FFD6B0, #FF9A3C)',
    img: 'https://picsum.photos/seed/harvard1/400/320', imgH: 200,
    text: "Just arrived at Harvard! The campus is absolutely beautiful. Can't wait to explore everything.",
    tags: ['arrival', 'harvard', 'excited'],
    likes: 42,
  },
  {
    id: 2, username: 'Lucas M.', country: 'Brazil', initials: 'LM',
    avatarBg: 'linear-gradient(135deg, #B8FFD0, #3CB87A)',
    img: 'https://picsum.photos/seed/coffee2/400/420', imgH: 260,
    text: 'Best coffee on campus is at the Science Center café. Trust me on this one.',
    tags: ['tips', 'food', 'studylife'],
    likes: 87,
  },
  {
    id: 3, username: 'Priya S.', country: 'India', initials: 'PS',
    avatarBg: 'linear-gradient(135deg, #B8D8FF, #5599EE)',
    img: 'https://picsum.photos/seed/student3/400/290', imgH: 180,
    text: 'Got my student ID and bank account sorted in one day! DM me if you need help navigating the admin stuff.',
    tags: ['admin', 'banking', 'studentid'],
    likes: 134,
  },
  {
    id: 4, username: 'Ji-ho P.', country: 'South Korea', initials: 'JP',
    avatarBg: 'linear-gradient(135deg, #F0C8FF, #CC66FF)',
    img: 'https://picsum.photos/seed/campus4/400/370', imgH: 230,
    text: 'The scavenger hunt was incredible. Our team found every hidden spot on campus!',
    tags: ['scavengerhunt', 'team', 'campus'],
    likes: 56,
  },
  {
    id: 5, username: 'Omar K.', country: 'Egypt', initials: 'OK',
    avatarBg: 'linear-gradient(135deg, #FFE0B0, #FF8C00)',
    img: 'https://picsum.photos/seed/yard5/400/340', imgH: 210,
    text: 'Harvard Yard in the morning light is something else entirely. 6am walks are now a ritual.',
    tags: ['harvardyard', 'morning', 'vibes'],
    likes: 203,
  },
  {
    id: 6, username: 'Sofia R.', country: 'Germany', initials: 'SR',
    avatarBg: 'linear-gradient(135deg, #FFB8C8, #EE4466)',
    img: 'https://picsum.photos/seed/group6/400/270', imgH: 170,
    text: 'Found the European Students group — so nice to meet everyone from home regions!',
    tags: ['europeans', 'community', 'friends'],
    likes: 78,
  },
]

interface Post {
  id: number
  username: string
  country: string
  initials: string
  avatarBg: string
  img: string
  imgH: number
  text: string
  tags: string[]
  likes: number
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      marginBottom: 16,
    }}>
      {/* Post image */}
      <img
        src={post.img}
        alt=""
        style={{ width: '100%', height: post.imgH, objectFit: 'cover', display: 'block' }}
      />

      {/* Post body */}
      <div style={{ padding: '14px 16px 12px' }}>
        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Avatar name={post.username} size={36} bg={post.avatarBg} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{post.username}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>🌍 {post.country}</div>
          </div>
        </div>

        {/* Text */}
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)', marginBottom: 10 }}>{post.text}</p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {post.tags.map(tag => (
              <span key={tag} style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600 }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => { setLiked(!liked); setLikeCount(c => liked ? c - 1 : c + 1) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <HeartIcon size={18} color={liked ? '#EE4466' : '#9A9A9A'} filled={liked} />
            <span style={{ fontSize: 13, color: liked ? '#EE4466' : 'var(--text-secondary)', fontWeight: liked ? 700 : 400 }}>{likeCount}</span>
          </button>
          <button
            onClick={() => setSaved(!saved)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <BookmarkIcon size={18} color={saved ? '#FFC94A' : '#9A9A9A'} filled={saved} />
          </button>
        </div>
      </div>
    </div>
  )
}

function CreatePostSheet({ onClose, onSubmit }: { onClose: () => void; onSubmit: (p: Post) => void }) {
  const [text, setText] = useState('')
  const [tags, setTags] = useState('')

  const handleSubmit = () => {
    if (!text.trim()) return
    const seed = Date.now()
    onSubmit({
      id: seed,
      username: 'You',
      country: 'Your Country',
      initials: 'ME',
      avatarBg: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
      img: `https://picsum.photos/seed/${seed}/400/320`,
      imgH: 200,
      text: text.trim(),
      tags: tags.split(' ').filter(t => t.startsWith('#')).map(t => t.slice(1)),
      likes: 0,
    })
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }}
    >
      <div className="slide-up" style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430, padding: 24, paddingBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800 }}>Share with the community</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <CloseIcon size={20} color="#4A4A4A" />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <Avatar name="Me" size={38} />
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Share something with the community..."
            autoFocus
            style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: 15, lineHeight: 1.6, color: 'var(--text)', background: 'transparent', minHeight: 100, fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ border: '1.5px solid var(--border)', borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', padding: 0 }}>
              <CameraIcon size={18} color="var(--text-secondary)" /> Photo
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', padding: 0 }}>
              <VideoIcon size={18} color="var(--text-secondary)" /> Video
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', padding: 0 }}>
              <PinIcon size={18} color="var(--text-secondary)" /> Location
            </button>
          </div>
        </div>

        <input
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="Add tags, e.g. #harvard #tips #arrival"
          style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 12, padding: '10px 14px', fontSize: 14, color: 'var(--text)', background: 'transparent', outline: 'none', marginBottom: 20, boxSizing: 'border-box' }}
        />

        <button
          onClick={handleSubmit}
          style={{ width: '100%', background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)', border: 'none', borderRadius: 14, padding: '14px 0', fontSize: 16, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,154,60,0.35)' }}
        >
          Post
        </button>
      </div>
    </div>
  )
}

const FEED_TABS = [
  { id: 'community', label: 'Community Feed' },
  { id: 'following', label: 'Following' },
]

export default function Home() {
  const { data: user } = useGetMe({ query: { retry: false } })
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS)
  const [showCreate, setShowCreate] = useState(false)
  const [activeTab, setActiveTab] = useState('community')
  const feedRef = useRef<HTMLDivElement>(null)

  const addPost = (post: Post) => {
    setPosts(prev => [post, ...prev])
    setShowCreate(false)
    setActiveTab('community')
    feedRef.current?.closest('main')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const displayedPosts = activeTab === 'community'
    ? posts
    : posts.filter((_, i) => i % 2 === 0)

  return (
    <div className="fade-in" style={{ background: 'var(--bg)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px 10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="sun-pulse">
              <SunIcon size={22} color="#FFC94A" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>SHINE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <SearchIcon size={20} color="#4A4A4A" />
            </button>
            {user && (
              <Avatar name={user.displayName || 'U'} size={32} />
            )}
          </div>
        </div>

        {/* Feed Tabs */}
        <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
          {FEED_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: activeTab === tab.id ? 800 : 500,
                color: activeTab === tab.id ? 'var(--orange)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2.5px solid var(--orange)' : '2.5px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Welcome pill */}
      {user && (
        <div style={{ padding: '12px 20px 4px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #FFF9ED, #FFF3D4)',
            border: '1.5px solid #FFE8A0',
            borderRadius: 20, padding: '6px 14px',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange)' }}>
              Welcome, {user.displayName}! 👋
            </span>
          </div>
        </div>
      )}

      {/* Feed */}
      <div ref={feedRef} style={{ padding: '14px 16px 80px' }}>
        {displayedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        style={{
          position: 'fixed', bottom: 88, right: 16,
          width: 48, height: 48,
          background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
          border: 'none', borderRadius: '50%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(255,154,60,0.45)',
          zIndex: 100,
        }}
      >
        <PlusIcon size={22} color="#fff" />
      </button>

      {showCreate && <CreatePostSheet onClose={() => setShowCreate(false)} onSubmit={addPost} />}
    </div>
  )
}
