import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Heart, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { loginUser, clearError } from '../store/slices/authSlice'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated } = useSelector(s => s.auth)
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
    return () => dispatch(clearError())
  }, [isAuthenticated])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.username || !form.password) return
    dispatch(loginUser(form))
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: '1rem' }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,62,62,0.06) 0%, transparent 70%)' }} />
      </div>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="animate-heartbeat" style={{ display: 'inline-flex', padding: '16px', borderRadius: '20px', background: 'rgba(229,62,62,0.12)', marginBottom: '1rem' }}>
            <Heart size={40} color="#e53e3e" fill="#e53e3e" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--color-text)', marginBottom: '0.4rem' }}>Heart Disease AI</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Yurak kasalligi diagnostika tizimi</p>
        </div>
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Tizimga kirish</h2>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.3)', color: '#fc8181', fontSize: '0.875rem' }}>
              <AlertCircle size={16} />{error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--color-text-muted)' }}>Foydalanuvchi nomi</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input className="input" style={{ paddingLeft: '2.25rem' }} placeholder="username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} autoComplete="username" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--color-text-muted)' }}>Parol</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input className="input" style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem' }} type={showPass ? 'text' : 'password'} placeholder="Parol" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || !form.username || !form.password} style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
              {loading ? 'Kirish...' : 'Kirish'}
            </button>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}