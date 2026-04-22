import { useState } from 'react'
import { SunIcon } from './Icons'

const CONCENTRATIONS = [
  'African and African American Studies',
  'Anthropology',
  'Applied Mathematics',
  'Art, Film, and Visual Studies',
  'Astrophysics',
  'Biomedical Engineering',
  'Chemical and Physical Biology',
  'Chemistry',
  'Chemistry and Physics',
  'Classical Studies',
  'Classics',
  'Comparative Literature',
  'Comparative Study of Religion',
  'Computer Science',
  'Earth and Planetary Sciences',
  'East Asian Studies',
  'Economics',
  'Electrical Engineering',
  'Engineering Sciences',
  'English',
  'Environmental Science and Public Policy',
  'Folklore and Mythology',
  'Germanic Languages and Literatures',
  'Government',
  'History',
  'History and Literature',
  'History and Science',
  'History of Art and Architecture',
  'Human Developmental and Regenerative Biology',
  'Human Evolutionary Biology',
  'Integrative Biology',
  'Linguistics',
  'Mathematics',
  'Mechanical Engineering',
  'Medieval Studies',
  'Molecular and Cellular Biology',
  'Music',
  'Near Eastern Languages and Civilizations',
  'Neuroscience',
  'Philosophy',
  'Physics',
  'Psychology',
  'Romance Languages and Literatures',
  'Slavic Languages and Literatures',
  'Sociology',
  'South Asian Studies',
  'Special Concentrations',
  'Statistics',
  'Theater, Dance, and Media',
  'Women, Gender, and Sexuality',
  'Undecided / Exploring',
]

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia',
  'Bosnia and Herzegovina', 'Brazil', 'Bulgaria', 'Cambodia', 'Cameroon', 'Canada',
  'Chile', 'China', 'Colombia', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus',
  'Czech Republic', 'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Estonia', 'Ethiopia', 'Finland', 'France', 'Georgia', 'Germany', 'Ghana', 'Greece',
  'Guatemala', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia',
  'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
  'Kenya', 'Kuwait', 'Kyrgyzstan', 'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg',
  'Malaysia', 'Mexico', 'Moldova', 'Mongolia', 'Morocco', 'Mozambique', 'Myanmar',
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Nigeria', 'North Macedonia',
  'Norway', 'Oman', 'Pakistan', 'Palestine', 'Panama', 'Paraguay', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia', 'South Africa', 'South Korea',
  'Spain', 'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
  'Tanzania', 'Thailand', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Venezuela', 'Vietnam', 'Yemen', 'Zimbabwe',
]

const HOUSES = [
  'Apley Court', 'Canaday Hall', 'Grays Hall', 'Greenough Hall',
  'Hollis Hall', 'Holworthy Hall', 'Hurlbut Hall', 'Lionel Hall',
  'Massachusetts Hall', 'Matthews Hall', 'Mower Hall', 'Pennypacker Hall',
  'Stoughton Hall', 'Straus Hall', 'Thayer Hall', 'Weld Hall',
  'Wigglesworth Hall',
]

const YEARS = ['2028', '2027', '2026', '2025']

const INTERESTS = [
  '🔬 Research', '⚽ Athletics', '🎵 Music', '🎨 Arts',
  '💻 Coding', '🍳 Cooking', '✈️ Travel', '📚 Reading',
  '🎬 Film', '🌐 Languages', '🚀 Entrepreneurship', '🤝 Community Service',
  '💃 Dance', '🎮 Gaming', '🏛️ Politics', '🌱 Sustainability',
]

const STEPS = [
  { id: 'name',          title: 'What should we call you?',       subtitle: "This is how you'll appear to other students." },
  { id: 'country',       title: 'Where are you from?',            subtitle: 'Help others connect with students from your home.' },
  { id: 'year',          title: 'What class year are you?',       subtitle: 'Find others who arrived when you did.' },
  { id: 'concentration', title: "What's your concentration?",     subtitle: "Don't worry — you can always change your mind!" },
  { id: 'house',         title: 'Which dorm are you in?',          subtitle: 'Connect with neighbors on campus.' },
  { id: 'interests',     title: "What are you into?",             subtitle: 'Pick as many as you like.' },
]

export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState(user.name || '')
  const [country, setCountry] = useState('')
  const [year, setYear] = useState('')
  const [concentration, setConcentration] = useState('')
  const [house, setHouse] = useState('')
  const [interests, setInterests] = useState([])
  const [done, setDone] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = ((step) / STEPS.length) * 100

  const canAdvance = () => {
    if (current.id === 'name') return name.trim().length > 0
    if (current.id === 'country') return country.trim().length > 0
    if (current.id === 'year') return !!year
    if (current.id === 'concentration') return !!concentration
    if (current.id === 'house') return !!house
    if (current.id === 'interests') return interests.length > 0
    return true
  }

  const toggleInterest = (i) => {
    setInterests(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    )
  }

  const handleNext = () => {
    if (!canAdvance()) return
    if (isLast) {
      const profile = { ...user, name, country, year, concentration, house, interests, onboarded: true }
      localStorage.setItem('shine_user', JSON.stringify(profile))
      setDone(true)
      setTimeout(() => onComplete(profile), 1800)
    } else {
      setStep(s => s + 1)
    }
  }

  if (done) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #FFF9ED 0%, #FFF3D4 50%, #FFEEC0 100%)',
        padding: 32,
      }}>
        <div className="sun-pulse" style={{ marginBottom: 20 }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(255,154,60,0.5)',
          }}>
            <SunIcon size={44} color="#fff" />
          </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#1A1A1A', textAlign: 'center', marginBottom: 12 }}>
          Welcome to SHINE, {name}! 🎉
        </div>
        <div style={{ fontSize: 16, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6 }}>
          Your Harvard journey starts now.
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(160deg, #FFF9ED 0%, #FFF3D4 60%, #FFEEC0 100%)',
    }}>
      {/* Progress bar */}
      <div style={{ height: 4, background: '#FFE8A0' }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg, #FFC94A, #FF9A3C)',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Step counter */}
      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
          Step {step + 1} of {STEPS.length}
        </div>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--orange)', fontWeight: 700 }}>
            ← Back
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '28px 24px 32px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1A1A1A', marginBottom: 8, lineHeight: 1.2 }}>
          {current.title}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.5 }}>
          {current.subtitle}
        </p>

        {/* ── Step: Name ── */}
        {current.id === 'name' && (
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="Your full name"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleNext()}
            style={inputStyle}
          />
        )}

        {/* ── Step: Country ── */}
        {current.id === 'country' && (
          <div style={{ position: 'relative' }}>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              style={{
                width: '100%', padding: '16px 44px 16px 18px',
                border: `2px solid ${country ? '#FF9A3C' : 'var(--border)'}`,
                borderRadius: 16, fontSize: 16, color: country ? 'var(--text)' : '#AAAAAA',
                background: '#fff', outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box', cursor: 'pointer',
                appearance: 'none', WebkitAppearance: 'none',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}
            >
              <option value="" disabled>Select your home country…</option>
              {COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <svg
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke={country ? '#FF9A3C' : '#AAAAAA'} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        )}

        {/* ── Step: Year ── */}
        {current.id === 'year' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {YEARS.map(y => (
              <button key={y} onClick={() => setYear(y)}
                style={{
                  padding: '14px 24px', borderRadius: 16, fontSize: 16, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s',
                  border: year === y ? '2px solid #FF9A3C' : '2px solid var(--border)',
                  background: year === y ? 'linear-gradient(135deg, #FFF0CC, #FFE4A0)' : '#fff',
                  color: year === y ? '#FF9A3C' : 'var(--text)',
                  boxShadow: year === y ? '0 4px 16px rgba(255,154,60,0.25)' : 'none',
                }}>
                Class of {y}
              </button>
            ))}
          </div>
        )}

        {/* ── Step: Concentration ── */}
        {current.id === 'concentration' && (
          <div style={{ position: 'relative' }}>
            <select
              value={concentration}
              onChange={e => setConcentration(e.target.value)}
              style={{
                width: '100%', padding: '16px 44px 16px 18px',
                border: `2px solid ${concentration ? '#FF9A3C' : 'var(--border)'}`,
                borderRadius: 16, fontSize: 16, color: concentration ? 'var(--text)' : '#AAAAAA',
                background: '#fff', outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box', cursor: 'pointer',
                appearance: 'none', WebkitAppearance: 'none',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}
            >
              <option value="" disabled>Select your concentration…</option>
              {CONCENTRATIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <svg
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke={concentration ? '#FF9A3C' : '#AAAAAA'} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        )}

        {/* ── Step: House ── */}
        {current.id === 'house' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {HOUSES.map(h => (
              <button key={h} onClick={() => setHouse(h)}
                style={{
                  padding: '13px 18px', borderRadius: 14, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                  border: house === h ? '2px solid #FF9A3C' : '2px solid var(--border)',
                  background: house === h ? 'linear-gradient(135deg, #FFF0CC, #FFE4A0)' : '#fff',
                  color: house === h ? '#FF9A3C' : 'var(--text)',
                  boxShadow: house === h ? '0 2px 12px rgba(255,154,60,0.2)' : 'none',
                }}>
                {h}
              </button>
            ))}
          </div>
        )}

        {/* ── Step: Interests ── */}
        {current.id === 'interests' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {INTERESTS.map(i => {
              const active = interests.includes(i)
              return (
                <button key={i} onClick={() => toggleInterest(i)}
                  style={{
                    padding: '10px 16px', borderRadius: 20, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                    border: active ? '2px solid #FF9A3C' : '2px solid var(--border)',
                    background: active ? 'linear-gradient(135deg, #FFF0CC, #FFE4A0)' : '#fff',
                    color: active ? '#FF9A3C' : 'var(--text)',
                    boxShadow: active ? '0 2px 10px rgba(255,154,60,0.25)' : 'none',
                  }}>
                  {i}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Next button — sticky footer */}
      <div style={{ padding: '0 24px 40px' }}>
        <button onClick={handleNext}
          style={{
            width: '100%', padding: '16px 0', border: 'none', borderRadius: 16,
            fontSize: 16, fontWeight: 800, cursor: canAdvance() ? 'pointer' : 'default',
            background: canAdvance() ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : '#E0E0E0',
            color: canAdvance() ? '#fff' : '#AAAAAA',
            boxShadow: canAdvance() ? '0 6px 24px rgba(255,154,60,0.4)' : 'none',
            transition: 'all 0.2s',
          }}>
          {isLast ? "Let's go! ✨" : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '16px 18px',
  border: '2px solid var(--border)', borderRadius: 16,
  fontSize: 17, color: 'var(--text)', background: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
}
