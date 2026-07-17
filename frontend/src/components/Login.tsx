import { useState } from 'react'
import { Zap, Eye, EyeOff } from 'lucide-react'

interface LoginProps {
  onLogin: (data: any) => void
}

const IS = { background:'var(--s3)', border:'1px solid var(--border)', color:'var(--text)', fontFamily:'Syne, sans-serif', width:'100%', padding:'12px 16px', borderRadius:'8px', outline:'none', fontSize:'14px' } as React.CSSProperties
const LS = { fontFamily:'"JetBrains Mono", monospace', fontSize:'10px', color:'var(--muted)', textTransform:'uppercase' as const, letterSpacing:'1px', display:'block', marginBottom:'6px' }

export default function Login({ onLogin }: LoginProps) {
  const [credential, setCredential] = useState('')
  const [password, setPassword]     = useState('')
  const [pin, setPin]               = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: credential, password, pin })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      onLogin(data)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', fontFamily: 'Syne, sans-serif' }}>
      {/* Grid bg */}
      <div style={{ position:'fixed', inset:0, zIndex:0, backgroundImage:'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize:'40px 40px', opacity:0.35, pointerEvents:'none' }} />

      <div className="w-full max-w-md relative z-10 animate-fadein" style={{ background:'var(--s1)', border:'1px solid var(--border)', borderRadius:'12px', padding:'40px' }}>
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div style={{ background:'var(--yellow)', padding:'10px', borderRadius:'10px', display:'flex' }}>
              <Zap className="w-6 h-6" style={{ color:'#07090e' }} />
            </div>
          </div>
          <h1 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'40px', letterSpacing:'4px', color:'var(--text)', lineHeight:1, marginBottom:'6px' }}>
            COBBLER <span style={{ color:'var(--green)' }}>SHOE</span>
          </h1>
          <p style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'10px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'3px' }}>
            Laundry Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username or Email */}
          <div>
            <label style={LS}>Username or Email</label>
            <input
              type="text"
              value={credential}
              onChange={e => setCredential(e.target.value)}
              style={IS}
              placeholder="admin or admin@cobbler.in"
              required
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div>
            <label style={LS}>Password</label>
            <div style={{ position:'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...IS, paddingRight:'44px' }}
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', cursor:'pointer', color:'var(--muted)', display:'flex' }}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* PIN optional */}
          <div>
            <label style={LS}>PIN <span style={{ color:'var(--muted)', fontWeight:400 }}>(optional)</span></label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              style={IS}
              placeholder="Enter PIN if set"
              maxLength={6}
              autoComplete="off"
            />
          </div>

          {error && (
            <div style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'11px', color:'var(--red)', background:'rgba(240,79,90,0.1)', border:'1px solid rgba(240,79,90,0.2)', padding:'10px 14px', borderRadius:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg transition-all"
            style={{ background:'var(--green)', color:'#07090e', fontFamily:'"JetBrains Mono", monospace', fontWeight:700, fontSize:'12px', textTransform:'uppercase', letterSpacing:'2px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Role hints */}
        <div className="mt-8 space-y-2">
          <div className="section-label" style={{ marginBottom:'8px' }}>Demo Accounts</div>
          {[
            { role:'Admin',    user:'admin',    pass:'111606',       color:'var(--yellow)' },
            { role:'Merchant', user:'merchant', pass:'merchant123',  color:'var(--blue)'   },
          ].map(a => (
            <button key={a.role} type="button"
              onClick={() => { setCredential(a.user); setPassword(a.pass); setPin('') }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all"
              style={{ background:'var(--s3)', border:'1px solid var(--border)', fontFamily:'"JetBrains Mono", monospace', fontSize:'11px' }}>
              <span style={{ color: a.color, textTransform:'uppercase', letterSpacing:'1px' }}>{a.role}</span>
              <span style={{ color:'var(--muted)' }}>{a.user} / {a.pass}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
