import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, User, Phone, Mail, Calendar, Building2 } from 'lucide-react'

interface ClientDetail {
  id: number
  client_name: string
  company_name: string
  contact_number: string
  email: string
  meeting_date: string
  created_at: string
}

const API = ''
const inputCls = 'w-full px-4 py-3 rounded-lg outline-none transition-all text-sm'
const inputStyle = { background: 'var(--s3)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'Syne, sans-serif' } as React.CSSProperties

export default function ClientDetails() {
  const [clients, setClients] = useState<ClientDetail[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ClientDetail | null>(null)
  const [form, setForm] = useState({ client_name: '', company_name: '', contact_number: '', email: '', meeting_date: new Date().toISOString().split('T')[0] })

  useEffect(() => { fetch() }, [])

  async function fetch() {
    try {
      const res = await window.fetch(`${API}/api/client-details`)
      const data = await res.json()
      setClients(Array.isArray(data) ? data : [])
    } catch { setClients([]) }
  }

  function openAdd() { setEditing(null); setForm({ client_name: '', company_name: '', contact_number: '', email: '', meeting_date: new Date().toISOString().split('T')[0] }); setShowModal(true) }
  function openEdit(c: ClientDetail) { setEditing(c); setForm({ client_name: c.client_name, company_name: c.company_name, contact_number: c.contact_number, email: c.email, meeting_date: c.meeting_date }); setShowModal(true) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `${API}/api/client-details/${editing.id}` : `${API}/api/client-details`
    await window.fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    fetch(); setShowModal(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this client record?')) return
    await window.fetch(`${API}/api/client-details/${id}`, { method: 'DELETE' })
    fetch()
  }

  return (
    <div className="space-y-6 animate-fadein">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', letterSpacing: '2px', color: 'var(--text)', lineHeight: 1 }}>CLIENT DETAILS</h1>
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--muted)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Manage client meeting records</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all" style={{ background: 'var(--blue)', color: '#fff', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      <div className="section-label">Client Records</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clients.map(c => (
          <div key={c.id} className="p-5 hover:brightness-110 transition-all" style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'rgba(78,143,255,0.1)', border: '1px solid rgba(78,143,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User className="w-4 h-4" style={{ color: 'var(--blue)' }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{c.client_name || '—'}</p>
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)' }}>{c.company_name || '—'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {c.contact_number && <div className="flex items-center gap-2" style={{ fontSize: '12px', color: 'var(--muted)' }}><Phone className="w-3 h-3" />{c.contact_number}</div>}
              {c.email && <div className="flex items-center gap-2" style={{ fontSize: '12px', color: 'var(--muted)' }}><Mail className="w-3 h-3" />{c.email}</div>}
              {c.meeting_date && <div className="flex items-center gap-2" style={{ fontSize: '12px', color: 'var(--muted)' }}><Calendar className="w-3 h-3" />Meeting: {c.meeting_date}</div>}
              {c.created_at && (
                <div className="flex items-center gap-2" style={{ fontFamily:'"JetBrains Mono", monospace', fontSize: '9px', color: 'var(--muted)', marginTop:'4px' }}>
                  🕐 Added: {new Date(c.created_at).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs transition-all" style={{ background: 'rgba(78,143,255,0.1)', border: '1px solid rgba(78,143,255,0.2)', color: 'var(--blue)', fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase' }}>
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <button onClick={() => handleDelete(c.id)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs transition-all" style={{ background: 'rgba(240,79,90,0.1)', border: '1px solid rgba(240,79,90,0.2)', color: 'var(--red)', fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase' }}>
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <div className="col-span-3 text-center py-16" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            No client records yet. Click Add Client to start.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto" style={{ background: 'rgba(7,9,14,0.85)' }}>
          <div className="w-full max-w-lg my-8 p-8 rounded-lg" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '24px', letterSpacing: '2px', color: 'var(--text)', marginBottom: '24px' }}>
              {editing ? 'EDIT CLIENT' : 'ADD CLIENT'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Client Name', icon: User, key: 'client_name', type: 'text' },
                { label: 'Company Name', icon: Building2, key: 'company_name', type: 'text' },
                { label: 'Contact Number', icon: Phone, key: 'contact_number', type: 'text' },
                { label: 'Email', icon: Mail, key: 'email', type: 'email' },
                { label: 'Meeting Date', icon: Calendar, key: 'meeting_date', type: 'date' },
              ].map(({ label, icon: Icon, key, type }) => (
                <div key={key} className="space-y-2">
                  <label className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <Icon className="w-3 h-3" /> {label}
                  </label>
                  <input type={type} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className={inputCls} style={inputStyle} />
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-lg" style={{ border: '1px solid var(--border)', color: 'var(--muted)', background: 'transparent', fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-lg" style={{ background: 'var(--blue)', color: '#fff', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
