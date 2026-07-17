import { useState } from 'react'
import { Save, Key, Database, Wrench, Tag, CheckCircle } from 'lucide-react'

const API = ''
const inputCls = 'w-full px-4 py-3 rounded-lg outline-none transition-all text-sm'
const inputStyle = { background: 'var(--s3)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'Syne, sans-serif' } as React.CSSProperties

export default function Settings() {
  const [tab, setTab] = useState<'password' | 'backup' | 'services'>('password')
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [backupMsg, setBackupMsg] = useState<string | null>(null)
  const [services, setServices] = useState<any[]>([])
  const [svcLoaded, setSvcLoaded] = useState(false)
  const [newSvc, setNewSvc] = useState({ name: '', price: '' })
  const [svcMsg, setSvcMsg] = useState<string | null>(null)

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg(null)
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwMsg({ type: 'err', text: 'Passwords do not match' }); return }
    if (pwForm.newPassword.length < 4) { setPwMsg({ type: 'err', text: 'Password must be at least 4 characters' }); return }
    try {
      const res = await window.fetch(`${API}/api/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }) })
      const data = await res.json()
      if (res.ok) { setPwMsg({ type: 'ok', text: data.message || 'Password updated successfully' }); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) }
      else { setPwMsg({ type: 'err', text: data.message || 'Failed to update password' }) }
    } catch { setPwMsg({ type: 'err', text: 'Server error. Please try again.' }) }
  }

  async function handleBackup() {
    setBackupMsg(null)
    try {
      const res = await window.fetch(`${API}/api/backup`, { method: 'POST' })
      const data = await res.json()
      setBackupMsg(res.ok ? `✓ Backup created: ${data.path || 'success'}` : `✗ ${data.message}`)
    } catch { setBackupMsg('✗ Server error during backup') }
  }

  async function loadServices() {
    if (svcLoaded) return
    const res = await window.fetch(`${API}/api/services`)
    const data = await res.json()
    setServices(Array.isArray(data) ? data : [])
    setSvcLoaded(true)
  }

  async function addService(e: React.FormEvent) {
    e.preventDefault()
    setSvcMsg(null)
    if (!newSvc.name || !newSvc.price) { setSvcMsg('Name and price are required'); return }
    const res = await window.fetch(`${API}/api/services`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newSvc.name, price: parseFloat(newSvc.price) }) })
    if (res.ok) { setNewSvc({ name: '', price: '' }); setSvcLoaded(false); loadServices(); setSvcMsg('Service added') }
    else { const d = await res.json(); setSvcMsg(d.message || 'Failed to add service') }
  }

  const tabs = [
    { id: 'password', label: 'Change Password', icon: Key },
    { id: 'services', label: 'Services', icon: Tag },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
  ] as const

  return (
    <div className="space-y-6 animate-fadein">
      <div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', letterSpacing: '2px', color: 'var(--text)', lineHeight: 1 }}>SETTINGS</h1>
        <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--muted)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>System configuration and preferences</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1" style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px' }}>
        {tabs.map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'services') loadServices() }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md transition-all flex-1 justify-center"
              style={{ background: active ? 'var(--s3)' : 'transparent', color: active ? 'var(--text)' : 'var(--muted)', border: active ? '1px solid var(--border)' : '1px solid transparent', fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Password */}
      {tab === 'password' && (
        <div className="max-w-md">
          <div className="section-label">Change Password</div>
          <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px' }}>
            <form onSubmit={handlePasswordReset} className="space-y-5">
              {[
                { label: 'Current Password', key: 'currentPassword' },
                { label: 'New Password', key: 'newPassword' },
                { label: 'Confirm New Password', key: 'confirmPassword' },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-2">
                  <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>{label}</label>
                  <input type="password" value={(pwForm as any)[key]} onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })} className={inputCls} style={inputStyle} required />
                </div>
              ))}
              {pwMsg && (
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', padding: '10px 14px', borderRadius: '6px', color: pwMsg.type === 'ok' ? 'var(--green)' : 'var(--red)', background: pwMsg.type === 'ok' ? 'rgba(31,214,147,0.1)' : 'rgba(240,79,90,0.1)', border: `1px solid ${pwMsg.type === 'ok' ? 'rgba(31,214,147,0.2)' : 'rgba(240,79,90,0.2)'}` }}>
                  {pwMsg.text}
                </div>
              )}
              <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all" style={{ background: 'var(--green)', color: '#07090e', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <Save className="w-4 h-4" /> Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Services */}
      {tab === 'services' && (
        <div className="space-y-5">
          <div className="section-label">Service Price List</div>
          <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Service Name', 'Price (₹)'].map(h => (
                    <th key={h} className="px-5 py-3 text-left" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(28,36,54,0.5)' }}>
                    <td className="px-5 py-3" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)' }}>{i + 1}</td>
                    <td className="px-5 py-3" style={{ fontSize: '13px', color: 'var(--text)' }}>{s.name}</td>
                    <td className="px-5 py-3" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '20px', color: 'var(--green)', lineHeight: 1 }}>₹{Number(s.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Add New Service</p>
            <form onSubmit={addService} className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Service Name</label>
                <input type="text" value={newSvc.name} onChange={e => setNewSvc({ ...newSvc, name: e.target.value })} className={inputCls} style={inputStyle} placeholder="e.g. Sneaker Whitening" />
              </div>
              <div className="w-36 space-y-2">
                <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Price ₹</label>
                <input type="number" step="0.01" value={newSvc.price} onChange={e => setNewSvc({ ...newSvc, price: e.target.value })} className={inputCls} style={inputStyle} placeholder="249" />
              </div>
              <button type="submit" className="px-5 py-3 rounded-lg flex items-center gap-2 transition-all" style={{ background: 'var(--green)', color: '#07090e', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                <CheckCircle className="w-4 h-4" /> Add
              </button>
            </form>
            {svcMsg && <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--green)', marginTop: '8px' }}>{svcMsg}</p>}
          </div>
        </div>
      )}

      {/* Backup */}
      {tab === 'backup' && (
        <div className="max-w-lg space-y-5">
          <div className="section-label">Backup & Restore</div>
          <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px' }}>
            <div className="flex items-center gap-4 mb-6">
              <div style={{ width: 48, height: 48, borderRadius: '8px', background: 'rgba(78,143,255,0.1)', border: '1px solid rgba(78,143,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database className="w-5 h-5" style={{ color: 'var(--blue)' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>Database Backup</p>
                <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)' }}>Creates a timestamped copy of cobbler.db in the data/backup folder</p>
              </div>
            </div>
            <button onClick={handleBackup} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all" style={{ background: 'var(--blue)', color: '#fff', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Wrench className="w-4 h-4" /> Create Backup Now
            </button>
            {backupMsg && (
              <div style={{ marginTop: '14px', fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', padding: '10px 14px', borderRadius: '6px', color: backupMsg.startsWith('✓') ? 'var(--green)' : 'var(--red)', background: backupMsg.startsWith('✓') ? 'rgba(31,214,147,0.1)' : 'rgba(240,79,90,0.1)', border: `1px solid ${backupMsg.startsWith('✓') ? 'rgba(31,214,147,0.2)' : 'rgba(240,79,90,0.2)'}` }}>
                {backupMsg}
              </div>
            )}
          </div>
          <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--yellow)', borderRadius: '8px', padding: '16px 20px' }}>
            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Note</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Backup files are stored locally on the server. Schedule regular backups to prevent data loss. Default credentials: admin / 111606</p>
          </div>
        </div>
      )}
    </div>
  )
}
