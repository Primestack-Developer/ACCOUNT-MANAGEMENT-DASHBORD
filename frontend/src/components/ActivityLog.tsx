import { useState, useEffect } from 'react'
import { RefreshCw, Activity } from 'lucide-react'

interface LogEntry {
  id: number
  user_id: number | null
  username: string
  action: string
  table_name: string | null
  record_id: number | null
  old_data: string | null
  new_data: string | null
  ip_address: string | null
  created_at: string
}

const API = ''

const actionColor: Record<string, string> = {
  LOGIN: 'var(--green)',
  LOGIN_FAILED: 'var(--red)',
  PIN_FAILED: 'var(--red)',
  CREATE: 'var(--blue)',
  UPDATE: 'var(--yellow)',
  UPDATE_STATUS: 'var(--yellow)',
  DELETE: 'var(--red)',
  PASSWORD_RESET: 'var(--yellow)',
}

const actionBg: Record<string, string> = {
  LOGIN: 'rgba(31,214,147,0.1)',
  LOGIN_FAILED: 'rgba(240,79,90,0.1)',
  PIN_FAILED: 'rgba(240,79,90,0.1)',
  CREATE: 'rgba(78,143,255,0.1)',
  UPDATE: 'rgba(245,183,49,0.1)',
  UPDATE_STATUS: 'rgba(245,183,49,0.1)',
  DELETE: 'rgba(240,79,90,0.1)',
  PASSWORD_RESET: 'rgba(245,183,49,0.1)',
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await window.fetch(`${API}/api/activity-logs?limit=500`)
      const data = await res.json()
      setLogs(Array.isArray(data) ? data : [])
    } catch { setLogs([]) }
    setLoading(false)
  }

  const filtered = filter ? logs.filter(l => l.action.includes(filter.toUpperCase()) || (l.table_name || '').includes(filter.toLowerCase()) || (l.username || '').toLowerCase().includes(filter.toLowerCase())) : logs

  const inputStyle = { background: 'var(--s3)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', padding: '8px 14px', borderRadius: '6px', outline: 'none', width: '220px' } as React.CSSProperties

  return (
    <div className="space-y-6 animate-fadein">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', letterSpacing: '2px', color: 'var(--text)', lineHeight: 1 }}>ACTIVITY LOG</h1>
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--muted)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>All system events and changes</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="text" placeholder="Filter by action, table, user..." value={filter} onChange={e => setFilter(e.target.value)} style={inputStyle} />
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all" style={{ background: 'var(--s3)', border: '1px solid var(--border)', color: 'var(--muted)', fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', textTransform: 'uppercase' }}>
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: logs.length, color: 'var(--text)' },
          { label: 'Logins', value: logs.filter(l => l.action === 'LOGIN').length, color: 'var(--green)' },
          { label: 'Creates', value: logs.filter(l => l.action === 'CREATE').length, color: 'var(--blue)' },
          { label: 'Deletes', value: logs.filter(l => l.action === 'DELETE').length, color: 'var(--red)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{s.label}</p>
            <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: s.color, lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="section-label">Event Stream — {filtered.length} records</div>

      <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Time', 'User', 'Action', 'Table', 'Record ID', 'IP'].map(h => (
                <th key={h} className="px-5 py-3 text-left" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid rgba(28,36,54,0.5)' }} className="trow">
                <td className="px-5 py-3" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-5 py-3" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--text)' }}>
                  {log.username || '—'}
                </td>
                <td className="px-5 py-3">
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', padding: '2px 8px', borderRadius: '4px',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    color: actionColor[log.action] || 'var(--muted)',
                    background: actionBg[log.action] || 'rgba(85,101,126,0.15)',
                  }}>
                    {log.action}
                  </span>
                </td>
                <td className="px-5 py-3" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)' }}>
                  {log.table_name || '—'}
                </td>
                <td className="px-5 py-3" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)' }}>
                  {log.record_id ?? '—'}
                </td>
                <td className="px-5 py-3" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)' }}>
                  {log.ip_address || '—'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <Activity className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--s3)' }} />
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>No activity found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
