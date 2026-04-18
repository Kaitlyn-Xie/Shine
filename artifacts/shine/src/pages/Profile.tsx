import { useState } from 'react'
import { GlobeIcon, UserIcon, MapIcon, SunIcon, BookOpenIcon, ArrowRightIcon } from '@/components/Icons'
import { useGetMe, useUpdateMe } from '@workspace/api-client-react'
import { Link } from 'wouter'

const MY_POSTS = [
  { id: 1, bg: 'linear-gradient(160deg, #FFE8A0, #FFC94A)', text: 'First day on campus! So beautiful.' },
  { id: 2, bg: 'linear-gradient(160deg, #C8F0D8, #5BC88A)', text: 'Found the best coffee spot.' },
  { id: 3, bg: 'linear-gradient(160deg, #B8D8FF, #5599EE)', text: 'Spring vibes at Harvard Yard.' },
]

export default function Profile() {
  const { data: user } = useGetMe({ query: { retry: false } })
  const { mutate: updateMe } = useUpdateMe()
  const [showToggle, setShowToggle] = useState(false)

  const isOnCampus = user?.phase === 'on_campus'

  const handlePhaseToggle = () => {
    updateMe({ data: { phase: isOnCampus ? 'pre_arrival' : 'on_campus' } })
    setShowToggle(false)
  }

  return (
    <div className="fade-in" style={{ background: 'var(--bg)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px 12px', background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <span style={{ fontSize: 19, fontWeight: 800, flex: 1 }}>Profile</span>
        <Link href="/resources">
          <button style={{ background: '#F5F5F5', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <BookOpenIcon size={18} color="#4A4A4A" />
          </button>
        </Link>
      </div>

      {/* Cover + Avatar */}
      <div style={{ background: '#fff', marginBottom: 10 }}>
        <div style={{ height: 110, background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)' }} />
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg, #FFE8A0, #FFC94A)', border: '4px solid #fff', marginTop: -38, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)' }}>
            <UserIcon size={34} color="#B86A00" />
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, fontSize: 20 }}>{user?.displayName || 'Your Name'}</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
              <GlobeIcon size={13} color="var(--text-secondary)" />
              Harvard International Student
            </div>
          </div>
          <div style={{ display: 'flex', gap: 28, marginTop: 16 }}>
            {[{ label: 'Posts', value: MY_POSTS.length }, { label: 'Helpful', value: 47 }, { label: 'Badges', value: 3 }].map(stat => (
              <div key={stat.label}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campus status */}
      <div style={{ margin: '0 16px 12px', background: '#fff', borderRadius: 16, padding: '16px 18px', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isOnCampus ? 0 : 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: isOnCampus ? 'linear-gradient(135deg, #C8F0D8, #3CB87A)' : 'linear-gradient(135deg, #FFE8A0, #FFC94A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isOnCampus ? <MapIcon size={20} color="#1A7A4A" /> : <SunIcon size={20} color="#B86A00" />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{isOnCampus ? 'On Campus 🎉' : 'Pre-Arrival Mode'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{isOnCampus ? 'Map & Hunt unlocked' : 'Preparing for Harvard'}</div>
            </div>
          </div>
          <button onClick={() => setShowToggle(true)} style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>
            Change
          </button>
        </div>
        {!isOnCampus && (
          <Link href="/prep-path">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFBF0', border: '1.5px solid #FFE8A0', borderRadius: 12, padding: '10px 14px', cursor: 'pointer' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--orange)' }}>View your Prep Path</span>
              <ArrowRightIcon size={16} color="var(--orange)" />
            </div>
          </Link>
        )}
      </div>

      {/* Quick links */}
      <div style={{ margin: '0 16px 12px', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        {[
          { label: 'Resource Guides', href: '/resources', color: '#5599EE', bg: '#E8F0FF' },
          { label: 'Safe Rooms (Q&A)', href: '/rooms', color: '#FF9A3C', bg: '#FFF3E0' },
          { label: 'Buddy Circles', href: '/circles', color: '#3CB87A', bg: '#E0F7EC' },
        ].map((item, i, arr) => (
          <Link key={item.href} href={item.href}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                </div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</span>
              </div>
              <ArrowRightIcon size={16} color="var(--text-secondary)" />
            </div>
          </Link>
        ))}
      </div>

      {/* Posts grid */}
      <div style={{ margin: '0 16px 80px' }}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>My Posts</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {MY_POSTS.map(post => (
            <div key={post.id} style={{ borderRadius: 12, background: post.bg, aspectRatio: '1', display: 'flex', alignItems: 'flex-end', padding: 8, boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{post.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase toggle sheet */}
      {showToggle && (
        <div onClick={() => setShowToggle(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }}>
          <div className="slide-up" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430, padding: 28, paddingBottom: 40 }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Update campus status</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
              {isOnCampus ? 'Switch back to pre-arrival mode?' : "Have you arrived on campus? This unlocks the Map and Scavenger Hunt!"}
            </div>
            <button onClick={handlePhaseToggle} style={{ width: '100%', background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)', border: 'none', borderRadius: 14, padding: '14px 0', fontSize: 16, fontWeight: 700, color: '#fff', cursor: 'pointer', marginBottom: 12 }}>
              {isOnCampus ? 'Switch to Pre-Arrival' : "Yes, I'm on campus! 🎉"}
            </button>
            <button onClick={() => setShowToggle(false)} style={{ width: '100%', background: 'none', border: '1.5px solid var(--border)', borderRadius: 14, padding: '12px 0', fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
