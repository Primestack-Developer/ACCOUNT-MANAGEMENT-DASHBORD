
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, UserPlus, Phone, Mail, MapPin, FileText, Image as ImageIcon, Footprints } from 'lucide-react'

interface Customer {
  id: number
  customer_id: string
  name: string
  mobile: string
  address: string
  email: string
  notes: string
  shoe_count?: number
  shoe_image_before?: string
  shoe_image_after?: string
}

// Mock data for testing without backend
const mockCustomers: Customer[] = [
  {
    id: 1,
    customer_id: 'CUST-001',
    name: 'John Doe',
    mobile: '+1234567890',
    address: '123 Main St, City',
    email: 'john@example.com',
    notes: 'Regular customer',
    shoe_count: 3,
    shoe_image_before: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop',
    shoe_image_after: 'https://images.unsplash.com/photo-1608256245453-3a7753547166?w=300&h=200&fit=crop'
  },
  {
    id: 2,
    customer_id: 'CUST-002',
    name: 'Jane Smith',
    mobile: '+0987654321',
    address: '456 Oak Ave, Town',
    email: 'jane@example.com',
    notes: '',
    shoe_count: 2,
    shoe_image_before: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=300&h=200&fit=crop',
    shoe_image_after: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&h=200&fit=crop'
  }
]

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({ 
    name: '', 
    mobile: '', 
    address: '', 
    email: '', 
    notes: '',
    shoe_count: 0,
    shoe_image_before: '',
    shoe_image_after: ''
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      const data = await res.json()
      setCustomers(data.length > 0 ? data : mockCustomers)
    } catch (err) {
      console.error(err)
      setCustomers(mockCustomers)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingCustomer ? 'PUT' : 'POST'
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        fetchCustomers()
        setShowModal(false)
        setFormData({ name: '', mobile: '', address: '', email: '', notes: '', shoe_count: 0, shoe_image_before: '', shoe_image_after: '' })
        setEditingCustomer(null)
      }
    } catch (err) {
      console.error(err)
      if (editingCustomer) {
        setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...c, ...formData, id: editingCustomer.id } : c))
      } else {
        setCustomers([...customers, { ...formData, id: Date.now(), customer_id: `CUST-${String(customers.length + 1).padStart(3, '0')}` }])
      }
      setShowModal(false)
      setFormData({ name: '', mobile: '', address: '', email: '', notes: '', shoe_count: 0, shoe_image_before: '', shoe_image_after: '' })
      setEditingCustomer(null)
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      mobile: customer.mobile,
      address: customer.address,
      email: customer.email,
      notes: customer.notes,
      shoe_count: customer.shoe_count || 0,
      shoe_image_before: customer.shoe_image_before || '',
      shoe_image_after: customer.shoe_image_after || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await fetch(`/api/customers/${id}`, { method: 'DELETE' })
        fetchCustomers()
      } catch (err) {
        console.error(err)
        setCustomers(customers.filter(c => c.id !== id))
      }
    }
  }

  const inputCls = "w-full px-4 py-3 rounded-lg outline-none transition-all text-sm"
  const inputStyle = {
    background: 'var(--s3)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    fontFamily: 'Syne, sans-serif',
  } as React.CSSProperties

  return (
    <div className="space-y-6 animate-fadein">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', letterSpacing: '2px', color: 'var(--text)', lineHeight: 1 }}>
            CUSTOMERS
          </h1>
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--muted)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Manage your customer database
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all text-sm"
          style={{ background: 'var(--green)', color: '#07090e', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '11px' }}
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="section-label">Customer Records</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="overflow-hidden hover:brightness-110 transition-all"
            style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px' }}
          >
            {(customer.shoe_image_before || customer.shoe_image_after) && (
              <div className="grid grid-cols-2 gap-1 p-2">
                {customer.shoe_image_before && (
                  <div className="relative">
                    <img src={customer.shoe_image_before} alt="Before" className="w-full h-28 object-cover rounded-md" />
                    <span className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.6)', color: 'var(--muted)', fontFamily: '"JetBrains Mono"', fontSize: '9px', textTransform: 'uppercase' }}>Before</span>
                  </div>
                )}
                {customer.shoe_image_after && (
                  <div className="relative">
                    <img src={customer.shoe_image_after} alt="After" className="w-full h-28 object-cover rounded-md" />
                    <span className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(31,214,147,0.2)', color: 'var(--green)', fontFamily: '"JetBrains Mono"', fontSize: '9px', textTransform: 'uppercase' }}>After</span>
                  </div>
                )}
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '15px', color: 'var(--text)' }}>{customer.name}</h3>
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>{customer.customer_id}</p>
                </div>
                {customer.shoe_count ? (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded" style={{ background: 'rgba(245,183,49,0.1)', border: '1px solid rgba(245,183,49,0.2)', color: 'var(--yellow)', fontFamily: '"JetBrains Mono", monospace', fontSize: '10px' }}>
                    <Footprints className="w-3 h-3" />
                    {customer.shoe_count}
                  </div>
                ) : null}
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  <Phone className="w-3 h-3" />{customer.mobile}
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    <Mail className="w-3 h-3" />{customer.email}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(customer)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all text-xs"
                  style={{ background: 'rgba(78,143,255,0.1)', border: '1px solid rgba(78,143,255,0.2)', color: 'var(--blue)', fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all text-xs"
                  style={{ background: 'rgba(240,79,90,0.1)', border: '1px solid rgba(240,79,90,0.2)', color: 'var(--red)', fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto" style={{ background: 'rgba(7,9,14,0.85)' }}>
          <div className="w-full max-w-2xl my-8 p-8 rounded-lg" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '26px', letterSpacing: '2px', color: 'var(--text)', marginBottom: '24px' }}>
              {editingCustomer ? 'EDIT CUSTOMER' : 'ADD CUSTOMER'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <UserPlus className="w-3 h-3" /> Name
                  </label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputCls} style={inputStyle} required />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <Phone className="w-3 h-3" /> Mobile
                  </label>
                  <input type="text" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className={inputCls} style={inputStyle} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <Mail className="w-3 h-3" /> Email
                </label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputCls} style={inputStyle} />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <MapPin className="w-3 h-3" /> Address
                </label>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputCls} style={inputStyle} rows={2} />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <Footprints className="w-3 h-3" /> Number of Shoes
                </label>
                <input type="number" min="0" value={formData.shoe_count} onChange={(e) => setFormData({ ...formData, shoe_count: parseInt(e.target.value) || 0 })} className={inputCls} style={inputStyle} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <ImageIcon className="w-3 h-3" /> Shoe Image (Before) URL
                  </label>
                  <input type="text" value={formData.shoe_image_before} onChange={(e) => setFormData({ ...formData, shoe_image_before: e.target.value })} className={inputCls} style={inputStyle} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <ImageIcon className="w-3 h-3" /> Shoe Image (After) URL
                  </label>
                  <input type="text" value={formData.shoe_image_after} onChange={(e) => setFormData({ ...formData, shoe_image_after: e.target.value })} className={inputCls} style={inputStyle} placeholder="https://..." />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <FileText className="w-3 h-3" /> Notes
                </label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputCls} style={inputStyle} rows={2} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingCustomer(null) }}
                  className="px-6 py-2.5 rounded-lg text-sm transition-all"
                  style={{ border: '1px solid var(--border)', color: 'var(--muted)', background: 'transparent', fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg text-sm transition-all"
                  style={{ background: 'var(--green)', color: '#07090e', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
