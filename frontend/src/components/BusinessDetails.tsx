import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Building2, Clock, Truck, Globe, GitBranch } from 'lucide-react'

interface BusinessDetail {
  id: number
  business_name: string
  business_type: string
  number_of_branches: string
  business_hours: string
  services_offered: string
  pickup_and_delivery: string
  online_booking: string
}

const API = ''
const inputCls = 'w-full px-4 py-3 rounded-lg outline-none transition-all text-sm'
const inputStyle = { background: 'var(--s3)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'Syne, sans-serif' } as React.CSSProperties

export default function BusinessDetails() {
  const [items, setItems] = useState<BusinessDetail[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<BusinessDetail | null>(null)
  const emptyForm = { business_name: '', business_type: '', number_of_branches: '1', business_hours: '', services_offered: '', pickup_and_delivery: 'No', online_booking: 'No' }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const res = await window.fetch(`${API}/api/business-details`)
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch { setItems([]) }
  }

  function openAdd() { setEditing(null); setForm(emptyForm); setShowModal(true) }
  function openEdit(b: BusinessDetail) {
    setEditing(b)
    setForm({ business_name: b.business_name, business_type: b.business_type, number_of_branches: b.number_of_branches, business_hours: b.business_hours, services_offered: b.services_offered, pickup_and_delivery: b.pickup_and_delivery, online_booking: b.online_booking })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `${API}/api/business-details/${editing.id}` : `${API}/api/business-details`
    await window.fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    load(); setShowModal(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this business record?')) return
    await window.fetch(`${API}/api/business-details/${id}`, { method: 'DELETE' })
    load()
  }

  const badge = (val: string) => {
    const isYes = val === 'Yes'
    return (
      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', background: isYes ? 'rgba(31,214,147,0.12)' : 'rgba(85,101,126,0.2)', color: isYes ? 'var(--green)' : 'var(--muted)' }}>
        {val}
      </span>
    )
  }

  return (
    <div className="space-y-6 animate-fadein">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', letterSpacing: '2px', color: 'var(--text)', lineHeight: 1 }}>BUSINESS DETAILS</h1>
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--muted)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Manage business profile and settings</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all" style={{ background: 'var(--yellow)', color: '#07090e', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <Plus className="w-4 h-4" /> Add Business
        </button>
      </div>

      <div className="section-label">Business Records</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {items.map(b => (
          <div key={b.id} className="p-6 hover:brightness-110 transition-all" style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div style={{ width: 44, height: 44, borderRadius: '8px', background: 'rgba(245,183,49,0.1)', border: '1px solid rgba(245,183,49,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 className="w-5 h-5" style={{ color: 'var(--yellow)' }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '16px', color: 'var(--text)' }}>{b.business_name || '—'}</p>
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)' }}>{b.business_type || '—'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div style={{ padding: '10px', background: 'var(--s3)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-1" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase' }}>
                  <GitBranch className="w-3 h-3" /> Branches
                </div>
                <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', color: 'var(--text)', lineHeight: 1 }}>{b.number_of_branches || '1'}</p>
              </div>
              <div style={{ padding: '10px', background: 'var(--s3)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-1" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase' }}>
                  <Clock className="w-3 h-3" /> Hours
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text)' }}>{b.business_hours || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)' }}>
                <Truck className="w-3 h-3" /> Pickup & Delivery: {badge(b.pickup_and_delivery || 'No')}
              </div>
              <div className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)' }}>
                <Globe className="w-3 h-3" /> Online Booking: {badge(b.online_booking || 'No')}
              </div>
            </div>

            {b.services_offered && (
              <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--s3)', border: '1px solid var(--border)' }}>
                <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Services Offered</p>
                <p style={{ fontSize: '12px', color: 'var(--text)' }}>{b.services_offered}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => openEdit(b)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs transition-all" style={{ background: 'rgba(78,143,255,0.1)', border: '1px solid rgba(78,143,255,0.2)', color: 'var(--blue)', fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase' }}>
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <button onClick={() => handleDelete(b.id)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs transition-all" style={{ background: 'rgba(240,79,90,0.1)', border: '1px solid rgba(240,79,90,0.2)', color: 'var(--red)', fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase' }}>
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-2 text-center py-16" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            No business records yet. Click Add Business to start.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto" style={{ background: 'rgba(7,9,14,0.85)' }}>
          <div className="w-full max-w-lg my-8 p-8 rounded-lg" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '24px', letterSpacing: '2px', color: 'var(--text)', marginBottom: '24px' }}>
              {editing ? 'EDIT BUSINESS' : 'ADD BUSINESS'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Business Name</label>
                <input type="text" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} className={inputCls} style={inputStyle} />
              </div>
              <div className="space-y-2">
                <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Business Type</label>
                <input type="text" value={form.business_type} onChange={e => setForm({ ...form, business_type: e.target.value })} className={inputCls} style={inputStyle} placeholder="e.g. Shoe Laundry" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>No. of Branches</label>
                  <input type="number" min="1" value={form.number_of_branches} onChange={e => setForm({ ...form, number_of_branches: e.target.value })} className={inputCls} style={inputStyle} />
                </div>
                <div className="space-y-2">
                  <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Business Hours</label>
                  <input type="text" value={form.business_hours} onChange={e => setForm({ ...form, business_hours: e.target.value })} className={inputCls} style={inputStyle} placeholder="e.g. 9AM - 9PM" />
                </div>
              </div>
              <div className="space-y-2">
                <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Services Offered</label>
                <textarea value={form.services_offered} onChange={e => setForm({ ...form, services_offered: e.target.value })} className={inputCls} style={inputStyle} rows={3} placeholder="Deep Clean, Premium Care, Lather Care..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[['pickup_and_delivery', 'Pickup & Delivery'], ['online_booking', 'Online Booking']].map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>{label}</label>
                    <select value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className={inputCls} style={inputStyle}>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-lg" style={{ border: '1px solid var(--border)', color: 'var(--muted)', background: 'transparent', fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-lg" style={{ background: 'var(--yellow)', color: '#07090e', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
