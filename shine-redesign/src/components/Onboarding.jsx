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
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize',
  'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad',
  'Chile', 'China', 'Colombia', 'Comoros', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus',
  'Czech Republic',
  'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominican Republic',
  'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea',
  'Eswatini', 'Estonia', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala',
  'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hong Kong', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
  'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
  'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger',
  'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Republic of the Congo', 'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa',
  'San Marino', 'São Tomé and Príncipe', 'Saudi Arabia', 'Senegal', 'Serbia',
  'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
  'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka',
  'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe',
]

const HOUSES = [
  'Apley Court', 'Canaday Hall', 'Grays Hall', 'Greenough Hall',
  'Hollis Hall', 'Holworthy Hall', 'Hurlbut Hall', 'Lionel Hall',
  'Massachusetts Hall', 'Matthews Hall', 'Mower Hall', 'Pennypacker Hall',
  'Stoughton Hall', 'Straus Hall', 'Thayer Hall', 'Weld Hall',
  'Wigglesworth Hall',
]

const YEARS = ['2029', '2028', '2027', '2026']

const INTERESTS = [
  'Research', 'Athletics', 'Music', 'Arts',
  'Coding', 'Cooking', 'Travel', 'Reading',
  'Film', 'Languages', 'Entrepreneurship', 'Community Service',
  'Dance', 'Gaming', 'Politics', 'Sustainability',
  'Photography', 'Hiking', 'Yoga & Wellness', 'Fashion',
  'Theater', 'Debate', 'Journalism', 'Finance',
  'Pre-med', 'Architecture', 'Philosophy', 'Biking',
  'Volunteering', 'Podcasting', 'Public Speaking', 'Sports Fandom',
]

// Readiness-to-study slider questions (1 = not at all, 5 = very ready)
const READINESS_QUESTIONS = [
  { key: 'readinessOverall',    label: 'How ready do you feel to start your life as an international student in the U.S.?' },
  { key: 'readinessBelonging',  label: 'How confident are you that you will find a sense of belonging / community on campus?' },
  { key: 'readinessDailyLife',  label: 'How prepared do you feel for day‑to‑day living (housing, food, transportation, phone plan, etc.)?' },
  { key: 'readinessClassroom',  label: 'How familiar do you feel with the U.S. classroom style (participation, group work, office hours, grading)?' },
  { key: 'readinessAcademic',   label: 'How ready do you feel to handle the academic workload (reading, assignments, exams) in the U.S.?' },
  { key: 'readinessProfessors', label: 'How comfortable do you feel contacting professors or asking for help when you need it?' },
  { key: 'readinessFriendship', label: 'How confident are you about making new friends in the U.S.?' },
  { key: 'readinessCulture',    label: 'How familiar do you feel with U.S. culture, social norms, and campus life?' },
  { key: 'readinessWellbeing',  label: 'How prepared do you feel to cope with stress and possible homesickness?' },
  { key: 'readinessCampusHelp', label: 'How aware are you of where to get help on campus (advisors, counseling, international office, etc.)?' },
]

const STEPS = [
  { id: 'name',          title: 'What should we call you?',       subtitle: "This is how you'll appear to other students." },
  { id: 'country',       title: 'Where are you from?',            subtitle: 'Help others connect with students from your home.' },
  { id: 'year',          title: 'What class year are you?',       subtitle: 'Find others who arrived when you did.' },
  { id: 'concentration', title: "What's your concentration?",     subtitle: "Don't worry — you can always change your mind!" },
  { id: 'house',         title: 'Which dorm are you in?',          subtitle: 'Connect with neighbors on campus.' },
  { id: 'interests',     title: "What are you into?",             subtitle: 'Pick as many as you like.' },
  { id: 'readiness',     title: 'Readiness to study in the U.S.', subtitle: 'These answers are private and help us match you with the right people and resources. Drag each slider to reflect how you feel right now.' },
]

const defaultReadiness = () => Object.fromEntries(READINESS_QUESTIONS.map(q => [q.key, 3]))

export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState(user.name || '')
  const [country, setCountry] = useState('')
  const [year, setYear] = useState('')
  const [concentration, setConcentration] = useState('')
  const [house, setHouse] = useState('')
  const [interests, setInterests] = useState([])
  const [customInterestInput, setCustomInterestInput] = useState('')
  const [readiness, setReadiness] = useState(defaultReadiness())
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
    if (current.id === 'readiness') return true
    return true
  }

  const toggleInterest = (i) => {
    setInterests(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    )
  }

  const addCustomInterest = () => {
    const val = customInterestInput.trim()
    if (!val || interests.includes(val)) { setCustomInterestInput(''); return }
    setInterests(prev => [...prev, val])
    setCustomInterestInput('')
  }

  const setSlider = (key, val) => setReadiness(prev => ({ ...prev, [key]: val }))

  const handleNext = () => {
    if (!canAdvance()) return
    if (isLast) {
      const profile = {
        ...user, name, country, year, concentration, house, interests,
        ...readiness,
        onboarded: true,
      }
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
          Welcome to SHINE, {name}!
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

      {/* Content — scrollable for readiness step */}
      <div style={{
        flex: 1, padding: '28px 24px 0', display: 'flex', flexDirection: 'column',
        overflowY: current.id === 'readiness' ? 'auto' : 'visible',
      }}>
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
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
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
              {interests.filter(i => !INTERESTS.includes(i)).map(custom => (
                <button key={custom} onClick={() => toggleInterest(custom)}
                  style={{
                    padding: '10px 16px', borderRadius: 20, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', border: '2px solid #CC66FF',
                    background: 'linear-gradient(135deg, #F8EEFF, #EDD9FF)',
                    color: '#9933CC', display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                  {custom}
                  <span style={{ fontSize: 16, lineHeight: 1 }}>×</span>
                </button>
              ))}
            </div>

            {/* Other: custom interest input */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={customInterestInput}
                onChange={e => setCustomInterestInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomInterest()}
                placeholder="Add your own interest…"
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 20, fontSize: 14, fontWeight: 500,
                  border: '2px dashed #CCCCCC', outline: 'none', background: '#FAFAFA',
                  color: '#1A1A1A', fontFamily: 'inherit',
                }}
              />
              <button
                onClick={addCustomInterest}
                disabled={!customInterestInput.trim()}
                style={{
                  padding: '10px 16px', borderRadius: 20, fontSize: 14, fontWeight: 700,
                  background: customInterestInput.trim() ? 'linear-gradient(135deg, #CC66FF, #9933CC)' : '#E0E0E0',
                  color: '#fff', border: 'none', cursor: customInterestInput.trim() ? 'pointer' : 'default',
                  flexShrink: 0,
                }}>
                + Add
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Readiness ── */}
        {current.id === 'readiness' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 32 }}>
            {READINESS_QUESTIONS.map((q, idx) => {
              const val = readiness[q.key]
              return (
                <div key={q.key}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.45, marginBottom: 14 }}>
                    <span style={{
                      display: 'inline-block', width: 22, height: 22,
                      background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
                      borderRadius: '50%', textAlign: 'center', lineHeight: '22px',
                      fontSize: 11, fontWeight: 900, color: '#fff', marginRight: 8,
                      verticalAlign: 'middle', flexShrink: 0,
                    }}>
                      {idx + 1}
                    </span>
                    {q.label}
                  </div>

                  {/* Slider track */}
                  <div style={{ position: 'relative' }}>
                    <input
                      type="range"
                      min={1} max={5} step={1}
                      value={val}
                      onChange={e => setSlider(q.key, Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#FF9A3C', cursor: 'pointer', height: 6 }}
                    />
                    {/* Tick labels */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <span key={n} style={{
                          fontSize: 13, fontWeight: val === n ? 900 : 500,
                          color: val === n ? '#FF9A3C' : '#AAAAAA',
                          minWidth: 20, textAlign: 'center',
                          transition: 'color 0.15s, font-weight 0.15s',
                        }}>
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Low / high labels */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: '#AAAAAA', fontWeight: 500 }}>Not at all</span>
                    <span style={{ fontSize: 11, color: '#AAAAAA', fontWeight: 500 }}>Very much</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Next button — sticky footer */}
      <div style={{ padding: '16px 24px 40px', flexShrink: 0 }}>
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
