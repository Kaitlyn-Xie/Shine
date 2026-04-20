import { useState } from 'react'
import { SunIcon } from './Icons'
import { api } from '../lib/api'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const valid = email.trim() && password.length >= 6 && (mode === 'signin' || name.trim())

  const handleSubmit = async () => {
    if (!valid || loading) return
    setError('')
    setLoading(true)
    try {
      let result
      if (mode === 'signup') {
        result = await api.signup(name.trim(), email.trim(), password)
      } else {
        result = await api.signin(email.trim(), password)
      }
      localStorage.setItem('shine_session', result.sessionToken)
      const u = { ...result.user, onboarded: result.user.onboarded }
      localStorage.setItem('shine_user', JSON.stringify(u))
      onLogin(u)
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #FFF9ED 0%, #FFF3D4 50%, #FFEEC0 100%)',
      padding: '24px 24px 48px',
    }}>

      {/* Logo */}
      <div className="sun-pulse" style={{ marginBottom: 12 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFC94A, #FF9A3C)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(255,154,60,0.4)',
        }}>
          <SunIcon size={36} color="#fff" />
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, color: '#1A1A1A', marginBottom: 6 }}>SHINE</div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 36, textAlign: 'center', lineHeight: 1.5 }}>
        Your Harvard journey starts here ✨
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 380, background: '#fff',
        borderRadius: 24, padding: 28,
        boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
      }}>
        {/* Mode tabs */}
        <div style={{ display: 'flex', background: '#F5F5F5', borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {['signin', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }}
              style={{
                flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer',
                borderRadius: 9, fontSize: 14, fontWeight: 700, transition: 'all 0.2s',
                background: mode === m ? '#fff' : 'transparent',
                color: mode === m ? 'var(--orange)' : 'var(--text-secondary)',
                boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              }}>
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Name field (sign up only) */}
        {mode === 'signup' && (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Full Name</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="" autoFocus
              style={inputStyle}
            />
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Email</label>
          <input
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="" type="email"
            autoFocus={mode === 'signin'}
            style={inputStyle}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              type={showPass ? 'text' : 'password'}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            <button onClick={() => setShowPass(v => !v)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 13, color: '#EE4466', marginBottom: 14, padding: '10px 14px', background: '#FFF0F3', borderRadius: 10, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={!valid || loading}
          style={{
            width: '100%', padding: '15px 0', border: 'none', borderRadius: 14, cursor: valid && !loading ? 'pointer' : 'default',
            fontSize: 16, fontWeight: 800, color: '#fff',
            background: valid && !loading ? 'linear-gradient(135deg, #FFC94A, #FF9A3C)' : '#E0E0E0',
            boxShadow: valid && !loading ? '0 4px 20px rgba(255,154,60,0.4)' : 'none',
            transition: 'all 0.2s',
          }}>
          {loading ? '…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </div>

      <p style={{ marginTop: 24, fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
        {mode === 'signin' ? "New to SHINE? " : "Already have an account? "}
        <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--orange)', fontWeight: 700, fontSize: 13 }}>
          {mode === 'signin' ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 700,
  color: '#4A4A4A', marginBottom: 6,
}

const inputStyle = {
  width: '100%', padding: '12px 14px',
  border: '1.5px solid var(--border)', borderRadius: 12,
  fontSize: 15, color: 'var(--text)', background: '#FAFAFA',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}
