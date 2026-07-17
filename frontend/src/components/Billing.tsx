
import { useState, useEffect } from 'react'
import { Plus, Trash2, Users, Calendar, CheckCircle, XCircle, ShoppingCart, Footprints, Download } from 'lucide-react'
import { LOGO_B64 } from '../logoBase64'

interface Service {
  id: number
  name: string
  price: number
  price_min?: number
  price_max?: number
}

interface Customer {
  id: number
  name: string
}

interface InvoiceItem {
  service_id: number
  quantity: number
  rate: number
  shoe_count: number
}

interface Invoice {
  id: number
  invoice_number: string
  date: string
  customer_name?: string
  total: number
  status: string
  total_shoe_count: number
}

// Mock data for testing without backend
const mockServices: Service[] = [
  { id: 1, name: 'Deep Clean', price: 249, price_min: 199, price_max: 349 },
  { id: 2, name: 'Premium Care', price: 349, price_min: 299, price_max: 449 },
  { id: 3, name: 'Lather Care', price: 449, price_min: 399, price_max: 549 },
  { id: 4, name: 'Premium Lather', price: 549, price_min: 499, price_max: 649 }
]

const mockCustomers: Customer[] = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' }
]

const mockInvoices: Invoice[] = [
  { 
    id: 1, 
    invoice_number: 'INV-001', 
    date: '2024-01-15', 
    customer_name: 'John Doe', 
    total: 498, 
    status: 'completed', 
    total_shoe_count: 3 
  },
  { 
    id: 2, 
    invoice_number: 'INV-002', 
    date: '2024-01-16', 
    customer_name: 'Jane Smith', 
    total: 349, 
    status: 'pending', 
    total_shoe_count: 2 
  }
]

// ── Invoice Download ──────────────────────────────────────────────────────────
async function downloadInvoice(invoice: Invoice) {
  // Fetch full invoice with items from API
  let fullInvoice: any = invoice
  let items: any[] = []
  try {
    const res = await fetch(`/api/invoices/${invoice.id}`)
    if (res.ok) {
      fullInvoice = await res.json()
      items = fullInvoice.items || []
    }
  } catch { /* use basic invoice */ }

  const logoUrl = LOGO_B64
  const companyName  = 'COBBLER SHOE LAUNDRY'
  const companyAddr  = '123 Main Street, City — 600001'
  const companyPhone = '+91 98765 43210'
  const companyEmail = 'info@cobbler.in'
  const companyGST   = 'GSTIN: 29ABCDE1234F1Z5'

  const subtotal = items.reduce((s: number, i: any) => s + Number(i.rate) * Number(i.quantity), 0)
  const discountAmt = (subtotal * Number(fullInvoice.discount || 0)) / 100
  const taxable = subtotal - discountAmt
  const taxAmt = (taxable * Number(fullInvoice.tax || 0)) / 100
  const total = Number(fullInvoice.total || invoice.total)

  const itemRows = items.length > 0 ? items.map((item: any, i: number) => `
    <tr style="border-bottom:1px solid #eee;">
      <td style="padding:10px 8px;text-align:center;color:#666;">${i + 1}</td>
      <td style="padding:10px 8px;">${item.service_name || item.name || 'Service'}</td>
      <td style="padding:10px 8px;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 8px;text-align:right;">₹${Number(item.rate).toFixed(2)}</td>
      <td style="padding:10px 8px;text-align:right;font-weight:600;">₹${(Number(item.rate) * Number(item.quantity)).toFixed(2)}</td>
    </tr>
  `).join('') : `
    <tr><td colspan="5" style="padding:20px;text-align:center;color:#999;">No items</td></tr>
  `

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${fullInvoice.invoice_number}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; color:#1a1a2e; background:#fff; }
    .page { position:relative; width:210mm; min-height:297mm; padding:12mm 14mm; margin:0 auto; overflow:hidden; }

    /* Watermark */
    .watermark {
      position:fixed; top:50%; left:50%;
      transform:translate(-50%,-50%) rotate(-35deg);
      opacity:0.07; pointer-events:none; z-index:0;
      width:200mm;
    }

    /* Header */
    .header { display:flex; align-items:center; justify-content:space-between; padding-bottom:16px; border-bottom:3px solid #1a1a2e; margin-bottom:20px; position:relative; z-index:1; }
    .logo-block { display:flex; align-items:center; gap:14px; }
    .logo { width:64px; height:64px; object-fit:contain; border-radius:8px; }
    .company-name { font-size:22px; font-weight:700; color:#1a1a2e; letter-spacing:1px; }
    .company-sub { font-size:11px; color:#666; margin-top:2px; }
    .invoice-badge { text-align:right; }
    .invoice-title { font-size:32px; font-weight:700; color:#1a1a2e; letter-spacing:2px; }
    .invoice-num { font-size:13px; color:#666; margin-top:4px; font-family:monospace; }

    /* Green accent bar */
    .accent-bar { height:4px; background:linear-gradient(90deg,#1fd693,#4e8fff,#f5b731); border-radius:2px; margin-bottom:20px; }

    /* Info grid */
    .info-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:24px; position:relative; z-index:1; }
    .info-box { background:#f8f9fc; border-radius:8px; padding:14px; border:1px solid #eef; }
    .info-label { font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#999; margin-bottom:6px; }
    .info-value { font-size:13px; font-weight:600; color:#1a1a2e; }
    .info-value-sm { font-size:11px; color:#555; margin-top:2px; }

    /* Status badge */
    .status-paid { background:#d1fae5; color:#065f46; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; display:inline-block; }
    .status-pending { background:#fef3c7; color:#92400e; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; display:inline-block; }

    /* Table */
    .items-table { width:100%; border-collapse:collapse; margin-bottom:20px; position:relative; z-index:1; }
    .items-table thead tr { background:#1a1a2e; color:#fff; }
    .items-table thead th { padding:12px 8px; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; }
    .items-table th:first-child, .items-table td:first-child { text-align:center; width:40px; }
    .items-table th:last-child, .items-table td:last-child { text-align:right; }
    .items-table tbody tr:nth-child(even) { background:#f8f9fc; }

    /* Totals */
    .totals { display:flex; justify-content:flex-end; margin-bottom:24px; position:relative; z-index:1; }
    .totals-box { width:240px; }
    .totals-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; border-bottom:1px solid #eee; }
    .totals-row.grand { background:#1a1a2e; color:#fff; padding:12px; border-radius:8px; margin-top:8px; font-size:16px; font-weight:700; border:none; }
    .totals-row.grand span:last-child { color:#1fd693; }

    /* Footer */
    .footer { border-top:2px solid #eee; padding-top:14px; display:flex; justify-content:space-between; align-items:flex-start; position:relative; z-index:1; }
    .footer-note { font-size:10px; color:#999; max-width:200px; line-height:1.5; }
    .footer-company { text-align:right; font-size:10px; color:#999; line-height:1.7; }
    .thank-you { text-align:center; margin:20px 0 10px; font-size:18px; font-weight:700; color:#1a1a2e; position:relative; z-index:1; }
    .thank-you span { color:#1fd693; }

    @media print { body{-webkit-print-color-adjust:exact; print-color-adjust:exact;} .page{padding:10mm;} }
  </style>
</head>
<body>
<div class="page">
  <!-- Watermark -->
  <img class="watermark" src="${LOGO_B64}" alt="" />

  <!-- Header -->
  <div class="header">
    <div class="logo-block">
      <img class="logo" src="${LOGO_B64}" alt="Cobbler Logo" />
      <div>
        <div class="company-name">${companyName}</div>
        <div class="company-sub">Professional Shoe Care & Laundry Services</div>
        <div class="company-sub">${companyAddr}</div>
        <div class="company-sub">${companyPhone} · ${companyEmail}</div>
        <div class="company-sub">${companyGST}</div>
      </div>
    </div>
    <div class="invoice-badge">
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-num">${fullInvoice.invoice_number}</div>
      <div style="margin-top:8px;">
        <span class="${fullInvoice.status === 'completed' ? 'status-paid' : 'status-pending'}">
          ${fullInvoice.status === 'completed' ? '✓ PAID' : '⏳ PENDING'}
        </span>
      </div>
    </div>
  </div>

  <div class="accent-bar"></div>

  <!-- Info Grid -->
  <div class="info-grid">
    <div class="info-box">
      <div class="info-label">Bill To</div>
      <div class="info-value">${fullInvoice.customer_name || invoice.customer_name || 'Walk-in Customer'}</div>
      <div class="info-value-sm">Customer</div>
    </div>
    <div class="info-box">
      <div class="info-label">Invoice Date</div>
      <div class="info-value">${new Date(fullInvoice.date || invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
      <div class="info-value-sm">Issue Date</div>
    </div>
    <div class="info-box">
      <div class="info-label">Payment</div>
      <div class="info-value">${fullInvoice.payment_method || 'Cash / UPI / Card'}</div>
      <div class="info-value-sm">Method</div>
    </div>
  </div>

  <!-- Items Table -->
  <table class="items-table">
    <thead>
      <tr>
        <th>#</th>
        <th style="text-align:left;">Service Description</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Rate</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <div class="totals-box">
      <div class="totals-row"><span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div>
      ${Number(fullInvoice.discount || 0) > 0 ? `<div class="totals-row"><span>Discount (${fullInvoice.discount}%)</span><span style="color:#e03e4a;">-₹${discountAmt.toFixed(2)}</span></div>` : ''}
      ${Number(fullInvoice.tax || 0) > 0 ? `<div class="totals-row"><span>GST / Tax (${fullInvoice.tax}%)</span><span>₹${taxAmt.toFixed(2)}</span></div>` : ''}
      <div class="totals-row grand"><span>TOTAL</span><span>₹${total.toFixed(2)}</span></div>
    </div>
  </div>

  <!-- Thank you -->
  <div class="thank-you">Thank you for choosing <span>Cobbler</span>!</div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-note">
      * All shoes are handled with care.<br>
      * This is a computer generated invoice.<br>
      * For queries: ${companyEmail}
    </div>
    <div class="footer-company">
      <strong>${companyName}</strong><br>
      ${companyAddr}<br>
      ${companyPhone}<br>
      ${companyGST}
    </div>
  </div>
</div>
<script>window.onload=function(){ window.print(); window.onafterprint=function(){ window.close(); }; }</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

function Billing() {
  const [services, setServices] = useState<Service[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    customer_id: '',
    date: new Date().toISOString().split('T')[0],
    items: [] as InvoiceItem[],
    discount: 0,
    tax: 0
  })

  useEffect(() => {
    fetchServices()
    fetchCustomers()
    fetchInvoices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      const data = await res.json()
      setServices(data.length > 0 ? data : mockServices)
    } catch (err) {
      console.error(err)
      setServices(mockServices)
    }
  }

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

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices')
      const data = await res.json()
      setInvoices(data.length > 0 ? data : mockInvoices)
    } catch (err) {
      console.error(err)
      setInvoices(mockInvoices)
    }
  }

  const addItem = () => {
    if (services.length > 0) {
      setFormData({
        ...formData,
        items: [...formData.items, { service_id: services[0].id, quantity: 1, rate: services[0].price, shoe_count: 1 }]
      })
    }
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items]
    if (field === 'service_id') {
      const service = services.find(s => s.id === value)
      newItems[index] = { ...newItems[index], service_id: value, rate: service?.price || 0 }
    } else {
      newItems[index] = { ...newItems[index], [field]: value }
    }
    setFormData({ ...formData, items: newItems })
  }

  const removeItem = (index: number) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) })
  }

  const calculateTotal = () => {
    let subtotal = 0
    formData.items.forEach(item => {
      subtotal += item.rate * item.quantity
    })
    const discountAmount = (subtotal * formData.discount) / 100
    const taxAmount = ((subtotal - discountAmount) * formData.tax) / 100
    return subtotal - discountAmount + taxAmount
  }

  const calculateTotalShoes = () => {
    return formData.items.reduce((total, item) => total + (item.shoe_count || 0), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, total_shoe_count: calculateTotalShoes() })
      })
      if (res.ok) {
        fetchInvoices()
        setShowModal(false)
        setFormData({
          customer_id: '',
          date: new Date().toISOString().split('T')[0],
          items: [],
          discount: 0,
          tax: 0
        })
      }
    } catch (err) {
      console.error(err)
      const customer = customers.find(c => c.id === parseInt(formData.customer_id))
      const newInvoice: Invoice = {
        id: Date.now(),
        invoice_number: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
        date: formData.date,
        customer_name: customer?.name || 'Walk-in',
        total: calculateTotal(),
        status: 'pending',
        total_shoe_count: calculateTotalShoes()
      }
      setInvoices([...invoices, newInvoice])
      setShowModal(false)
      setFormData({
        customer_id: '',
        date: new Date().toISOString().split('T')[0],
        items: [],
        discount: 0,
        tax: 0
      })
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/invoices/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      fetchInvoices()
    } catch (err) {
      console.error(err)
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status } : inv))
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
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', letterSpacing: '2px', color: 'var(--text)', lineHeight: 1 }}>BILLING</h1>
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--muted)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Create and manage invoices
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all"
          style={{ background: 'var(--green)', color: '#07090e', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      <div className="section-label">Invoice List</div>

      {/* Table */}
      <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Invoice #', 'Date', 'Customer', 'Shoes', 'Total', 'Status', 'Actions'].map(h => (                <th key={h} className="px-5 py-4 text-left" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} style={{ borderBottom: '1px solid rgba(28,36,54,0.6)' }} className="trow">
                <td className="px-5 py-4" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', color: 'var(--text)' }}>{invoice.invoice_number}</td>
                <td className="px-5 py-4" style={{ fontSize: '12px', color: 'var(--muted)' }}>{invoice.date}</td>
                <td className="px-5 py-4" style={{ fontSize: '12px', color: 'var(--muted)' }}>{invoice.customer_name || 'Walk-in'}</td>
                <td className="px-5 py-4">
                  <span className="flex items-center gap-1" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', color: 'var(--yellow)' }}>
                    <Footprints className="w-3 h-3" />{invoice.total_shoe_count}
                  </span>
                </td>
                <td className="px-5 py-4" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', color: 'var(--text)', lineHeight: 1 }}>₹{invoice.total.toFixed(2)}</td>
                <td className="px-5 py-4">
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px',
                    background: invoice.status === 'completed' ? 'rgba(31,214,147,0.12)' : 'rgba(245,183,49,0.12)',
                    color:      invoice.status === 'completed' ? 'var(--green)'          : 'var(--yellow)',
                  }}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {invoice.status === 'pending' ? (
                      <button
                        onClick={() => updateStatus(invoice.id, 'completed')}
                        className="flex items-center gap-1 text-xs transition-all"
                        style={{ color: 'var(--green)', fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                      >
                        <CheckCircle className="w-3 h-3" /> Mark Done
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(invoice.id, 'pending')}
                        className="flex items-center gap-1 text-xs transition-all"
                        style={{ color: 'var(--muted)', fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.5px', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '4px' }}
                      >
                        <XCircle className="w-3 h-3" /> Unmark
                      </button>
                    )}
                    <button
                      onClick={() => downloadInvoice(invoice)}
                      className="flex items-center gap-1 text-xs transition-all"
                      style={{ color: 'var(--blue)', fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.5px', border: '1px solid rgba(78,143,255,0.3)', padding: '3px 8px', borderRadius: '4px', background: 'rgba(78,143,255,0.06)' }}
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto" style={{ background: 'rgba(7,9,14,0.85)' }}>
          <div className="w-full max-w-6xl my-8 p-8 rounded-lg" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '26px', letterSpacing: '2px', color: 'var(--text)', marginBottom: '24px' }}>
              CREATE INVOICE
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <Users className="w-3 h-3" /> Customer
                  </label>
                  <select value={formData.customer_id} onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })} className={inputCls} style={inputStyle}>
                    <option value="">Walk-in Customer</option>
                    {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <Calendar className="w-3 h-3" /> Date
                  </label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={inputCls} style={inputStyle} required />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <ShoppingCart className="w-3 h-3" /> Items
                  </label>
                  <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs transition-all" style={{ color: 'var(--green)', fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.items.map((item, index) => {
                    const service = services.find(s => s.id === item.service_id)
                    return (
                      <div key={index} className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4">
                          <select value={item.service_id} onChange={(e) => updateItem(index, 'service_id', parseInt(e.target.value))} className={inputCls} style={inputStyle}>
                            {services.map((s) => (
                              <option key={s.id} value={s.id}>{s.name} — ₹{s.price}{s.price_min && s.price_max ? ` (₹${s.price_min}–₹${s.price_max})` : ''}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-1">
                          <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))} className={inputCls} style={inputStyle} placeholder="Qty" />
                        </div>
                        <div className="col-span-1">
                          <input type="number" min="1" value={item.shoe_count} onChange={(e) => updateItem(index, 'shoe_count', parseInt(e.target.value))} className={inputCls} style={inputStyle} placeholder="Shoes" />
                        </div>
                        <div className="col-span-3">
                          <input type="number" step="0.01" min={service?.price_min} max={service?.price_max} value={item.rate} onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value))} className={inputCls} style={inputStyle} placeholder="Rate" />
                        </div>
                        <div className="col-span-3">
                          <button type="button" onClick={() => removeItem(index)} className="w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all text-xs" style={{ background: 'rgba(240,79,90,0.1)', border: '1px solid rgba(240,79,90,0.2)', color: 'var(--red)', fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Discount (%)</label>
                  <input type="number" min="0" max="100" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })} className={inputCls} style={inputStyle} />
                </div>
                <div className="space-y-2">
                  <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tax (%)</label>
                  <input type="number" min="0" value={formData.tax} onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) })} className={inputCls} style={inputStyle} />
                </div>
              </div>

              <div className="text-right p-5 rounded-lg space-y-1" style={{ background: 'var(--s3)', border: '1px solid var(--border)' }}>
                <p className="flex items-center justify-end gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>
                  <Footprints className="w-4 h-4" /> Total Shoes: {calculateTotalShoes()}
                </p>
                <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', color: 'var(--text)', lineHeight: 1 }}>
                  TOTAL: ₹{calculateTotal().toFixed(2)}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-lg text-sm transition-all" style={{ border: '1px solid var(--border)', color: 'var(--muted)', background: 'transparent', fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-lg text-sm transition-all" style={{ background: 'var(--green)', color: '#07090e', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Billing
