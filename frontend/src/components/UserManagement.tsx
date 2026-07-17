import { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, ShieldCheck, User, Mail, Key, Camera, X } from 'lucide-react'

interface AppUser {
  id: number
  username: string
  email: string
  role: string
  full_name: string
  pin: string
  profile_photo: string | null
  created_at: string
}

const iCls = 'w-full px-4 py-3 rounded-lg outline-none transition-all text-sm'
const iSty = { background:'var(--s3)', border:'1px solid var(--border)', color:'var(--text)', fontFamily:'Syne, sans-serif' } as React.CSSProperties
const lSty = { fontFamily:'"JetBrains Mono", monospace', fontSize:'10px', color:'var(--muted)', textTransform:'uppercase' as const, letterSpacing:'1px', display:'block', marginBottom:'6px' }

export default function UserManagement() {
  const [users,      setUsers]      = useState<AppUser[]>([])
  const [showModal,  setShowModal]  = useState(false)
  const [editing,    setEditing]    = useState<AppUser | null>(null)
  const [msg,        setMsg]        = useState<{type:'ok'|'err', text:string}|null>(null)
  const [preview,    setPreview]    = useState<string | null>(null)

  const emptyForm = { username:'', email:'', password:'', role:'merchant', full_name:'', pin:'', profile_photo:'' }
  const [form, setForm] = useState(emptyForm)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const res  = await fetch('/api/users')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch { setUsers([]) }
  }

  function openAdd() {
    setEditing(null); setForm(emptyForm); setPreview(null); setMsg(null); setShowModal(true)
  }

  function openEdit(u: AppUser) {
    setEditing(u)
    setForm({ username:u.username, email:u.email||'', password:'', role:u.role, full_name:u.full_name||'', pin:u.pin||'', profile_photo:u.profile_photo||'' })
    setPreview(u.profile_photo || null)
    setMsg(null); setShowModal(true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // limit to 2MB
    if (file.size > 2 * 1024 * 1024) { setMsg({type:'err', text:'Image must be under 2MB'}); return }
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setPreview(base64)
      setForm(f => ({ ...f, profile_photo: base64 }))
    }
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    setPreview(null)
    setForm(f => ({ ...f, profile_photo: '' }))
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null)
    if (!editing && !form.password) { setMsg({type:'err', text:'Password is required'}); return }
    try {
      const method = editing ? 'PUT' : 'POST'
      const url    = editing ? `/api/users/${editing.id}` : '/api/users'
      const body: any = {
        username:      form.username,
        email:         form.email,
        role:          form.role,
        full_name:     form.full_name,
        pin:           form.pin,
        profile_photo: form.profile_photo || null,
      }
      if (form.password) body.password = form.password
      const res  = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { setMsg({type:'err', text:data.message||'Failed'}); return }
      setMsg({type:'ok', text: editing ? 'User updated ✓' : 'User created ✓'})
      load()
      setTimeout(() => setShowModal(false), 700)
    } catch { setMsg({type:'err', text:'Server error'}) }
  }

  async function handleDelete(id: number, username: string) {
    if (!confirm(`Delete user "${username}"?`)) return
    const res  = await fetch(`/api/users/${id}`, { method:'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.message); return }
    load()
  }

  const roleBadge = (role: string) => (
    <span style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'9px', padding:'2px 8px', borderRadius:'4px',
      textTransform:'uppercase', letterSpacing:'0.5px',
      background: role==='admin'?'rgba(245,183,49,0.12)':'rgba(78,143,255,0.12)',
      color:      role==='admin'?'var(--yellow)':'var(--blue)' }}>
      {role}
    </span>
  )

  return (
    <div className="space-y-6 animate-fadein">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'32px', letterSpacing:'2px', color:'var(--text)', lineHeight:1 }}>USER MANAGEMENT</h1>
          <p style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'11px', color:'var(--muted)', marginTop:'6px', textTransform:'uppercase', letterSpacing:'1px' }}>
            Manage admin and merchant accounts
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all"
          style={{ background:'var(--yellow)', color:'#07090e', fontFamily:'"JetBrains Mono", monospace', fontWeight:600, fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px' }}>
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="section-label">{users.length} accounts</div>

      {/* Table */}
      <div style={{ background:'var(--s2)', border:'1px solid var(--border)', borderRadius:'8px', overflow:'hidden' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom:'1px solid var(--border)' }}>
              {['User','Email','Role','PIN','Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left" style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'10px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom:'1px solid rgba(28,36,54,0.5)' }} className="trow">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {u.profile_photo
                      ? <img src={u.profile_photo} alt={u.username} style={{ width:36, height:36, borderRadius:'8px', objectFit:'cover', border:'1px solid var(--border)' }} />
                      : (
                        <div style={{ width:36, height:36, borderRadius:'8px', background:'var(--s3)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <User className="w-4 h-4" style={{ color:'var(--muted)' }} />
                        </div>
                      )
                    }
                    <div>
                      <p style={{ fontFamily:'Syne, sans-serif', fontWeight:600, fontSize:'13px', color:'var(--text)' }}>{u.full_name || u.username}</p>
                      <p style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'10px', color:'var(--muted)' }}>@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4" style={{ fontSize:'12px', color:'var(--muted)' }}>{u.email||'—'}</td>
                <td className="px-5 py-4">{roleBadge(u.role)}</td>
                <td className="px-5 py-4" style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'12px', color:'var(--muted)' }}>{u.pin ? '••••' : '—'}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(u)} className="p-2 rounded transition-all"
                      style={{ color:'var(--blue)', background:'rgba(78,143,255,0.08)', border:'1px solid rgba(78,143,255,0.15)' }}>
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDelete(u.id, u.username)} className="p-2 rounded transition-all"
                        style={{ color:'var(--red)', background:'rgba(240,79,90,0.08)', border:'1px solid rgba(240,79,90,0.15)' }}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'11px', color:'var(--muted)' }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
          style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(7,9,14,0.88)', zIndex:9999, overflowY:'auto', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'40px 16px' }}
        >
          <div style={{ background:'var(--s1)', border:'1px solid var(--border)', borderRadius:'10px', padding:'32px', width:'100%', maxWidth:'520px' }}>
            <h2 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'24px', letterSpacing:'2px', color:'var(--text)', marginBottom:'24px' }}>
              {editing ? 'EDIT USER' : 'ADD USER'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Profile Photo Upload */}
              <div className="space-y-2">
                <label style={lSty}>Profile Photo</label>
                <div className="flex items-center gap-4">
                  {/* Preview circle */}
                  <div style={{ width:72, height:72, borderRadius:'10px', background:'var(--s3)', border:'2px dashed var(--border)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                    {preview
                      ? <img src={preview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <Camera className="w-6 h-6" style={{ color:'var(--muted)' }} />
                    }
                  </div>
                  <div className="flex flex-col gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all"
                      style={{ background:'var(--s3)', border:'1px solid var(--border)', color:'var(--text)', fontFamily:'"JetBrains Mono", monospace', textTransform:'uppercase', letterSpacing:'0.5px', cursor:'pointer' }}>
                      <Camera className="w-3 h-3" style={{ color:'var(--blue)' }} />
                      {preview ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    {preview && (
                      <button type="button" onClick={removePhoto}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all"
                        style={{ background:'rgba(240,79,90,0.08)', border:'1px solid rgba(240,79,90,0.2)', color:'var(--red)', fontFamily:'"JetBrains Mono", monospace', textTransform:'uppercase', letterSpacing:'0.5px', cursor:'pointer' }}>
                        <X className="w-3 h-3" /> Remove
                      </button>
                    )}
                    <p style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'9px', color:'var(--muted)' }}>JPG, PNG, WEBP · Max 2MB</p>
                  </div>
                </div>
                {/* Hidden file input */}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} style={{ display:'none' }} />
              </div>

              {/* Name + Username */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2" style={lSty}><User className="w-3 h-3" /> Full Name</label>
                  <input type="text" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} className={iCls} style={iSty} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2" style={lSty}><ShieldCheck className="w-3 h-3" /> Username</label>
                  <input type="text" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} className={iCls} style={iSty} required placeholder="johndoe" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2" style={lSty}><Mail className="w-3 h-3" /> Email</label>
                <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className={iCls} style={iSty} placeholder="john@cobbler.in" />
              </div>

              {/* Password + PIN */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2" style={lSty}>
                    <Key className="w-3 h-3" /> Password
                    {editing && <span style={{color:'var(--muted)',fontSize:'9px'}}>(blank = keep)</span>}
                  </label>
                  <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className={iCls} style={iSty} placeholder={editing?'Leave blank to keep':'Required'} />
                </div>
                <div className="space-y-2">
                  <label style={lSty}>PIN <span style={{color:'var(--muted)',fontSize:'9px'}}>(optional)</span></label>
                  <input type="password" value={form.pin} onChange={e=>setForm({...form,pin:e.target.value})} className={iCls} style={iSty} placeholder="4–6 digits" maxLength={6} />
                </div>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label style={lSty}>Role</label>
                <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className={iCls} style={iSty}>
                  <option value="merchant">Merchant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Message */}
              {msg && (
                <div style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'11px', padding:'10px 14px', borderRadius:'6px',
                  color: msg.type==='ok'?'var(--green)':'var(--red)',
                  background: msg.type==='ok'?'rgba(31,214,147,0.1)':'rgba(240,79,90,0.1)',
                  border:`1px solid ${msg.type==='ok'?'rgba(31,214,147,0.2)':'rgba(240,79,90,0.2)'}` }}>
                  {msg.text}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setShowModal(false)}
                  style={{ border:'1px solid var(--border)', color:'var(--muted)', background:'transparent', fontFamily:'"JetBrains Mono", monospace', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', padding:'10px 24px', borderRadius:'8px', cursor:'pointer' }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ background:'var(--yellow)', color:'#07090e', fontFamily:'"JetBrains Mono", monospace', fontWeight:700, fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', padding:'10px 24px', borderRadius:'8px', cursor:'pointer' }}>
                  {editing ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
