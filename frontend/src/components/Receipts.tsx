
import { useState, useEffect } from 'react'
import { CreditCard, Plus } from 'lucide-react'

interface Invoice {
  id: number
  invoice_number: string
  total: number
  customer_name: string
}

function Receipts() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [receipts, setReceipts] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [formData, setFormData] = useState({
    payment_method: 'Cash',
    amount_received: 0,
    balance_amount: 0,
    notes: ''
  })

  useEffect(() => {
    fetchInvoices()
    fetchReceipts()
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices')
      const data = await res.json()
      setInvoices(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchReceipts = async () => {
    try {
      const res = await fetch('/api/receipts')
      const data = await res.json()
      setReceipts(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateReceipt = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setFormData({
      payment_method: 'Cash',
      amount_received: invoice.total,
      balance_amount: 0,
      notes: ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInvoice) return
    try {
      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: selectedInvoice.id,
          ...formData
        })
      })
      if (res.ok) {
        fetchReceipts()
        setShowModal(false)
        setSelectedInvoice(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const inputCls = "w-full px-4 py-3 rounded-lg outline-none transition-all text-sm"
  const inputStyle = {
    background: 'var(--s3)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    fontFamily: 'Syne, sans-serif',
  } as React.CSSProperties

  const tableStyle = {
    background: 'var(--s2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    overflow: 'hidden',
  } as React.CSSProperties

  return (
    <div className="space-y-8 animate-fadein">
      <div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', letterSpacing: '2px', color: 'var(--text)', lineHeight: 1 }}>RECEIPTS</h1>
        <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--muted)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Manage receipts and payments
        </p>
      </div>

      {/* Receipts table */}
      <div className="section-label">Receipts</div>
      <div style={tableStyle}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Receipt #', 'Invoice #', 'Customer', 'Payment Method', 'Amount Received', 'Balance'].map(h => (
                <th key={h} className="px-5 py-4 text-left" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt) => (
              <tr key={receipt.id} style={{ borderBottom: '1px solid rgba(28,36,54,0.6)' }} className="trow">
                <td className="px-5 py-4" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', color: 'var(--text)' }}>{receipt.receipt_number}</td>
                <td className="px-5 py-4" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--muted)' }}>{receipt.invoice_number}</td>
                <td className="px-5 py-4" style={{ fontSize: '12px', color: 'var(--muted)' }}>{receipt.customer_name || 'Walk-in'}</td>
                <td className="px-5 py-4">
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', background: 'var(--s3)', border: '1px solid var(--border)', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {receipt.payment_method}
                  </span>
                </td>
                <td className="px-5 py-4" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', color: 'var(--green)', lineHeight: 1 }}>₹{receipt.amount_received.toFixed(2)}</td>
                <td className="px-5 py-4" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', color: receipt.balance_amount > 0 ? 'var(--red)' : 'var(--muted)', lineHeight: 1 }}>₹{receipt.balance_amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoices table */}
      <div className="section-label">Invoices</div>
      <div style={tableStyle}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Invoice #', 'Customer', 'Total', 'Actions'].map(h => (
                <th key={h} className="px-5 py-4 text-left" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} style={{ borderBottom: '1px solid rgba(28,36,54,0.6)' }} className="trow">
                <td className="px-5 py-4" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', color: 'var(--text)' }}>{invoice.invoice_number}</td>
                <td className="px-5 py-4" style={{ fontSize: '12px', color: 'var(--muted)' }}>{invoice.customer_name || 'Walk-in'}</td>
                <td className="px-5 py-4" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', color: 'var(--text)', lineHeight: 1 }}>₹{invoice.total.toFixed(2)}</td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => handleCreateReceipt(invoice)}
                    className="flex items-center gap-2 text-xs transition-all"
                    style={{ color: 'var(--green)', fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  >
                    <Plus className="w-3 h-3" /> Create Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedInvoice && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(7,9,14,0.85)' }}>
          <div className="w-full max-w-lg p-8 rounded-lg" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '26px', letterSpacing: '2px', color: 'var(--text)', marginBottom: '20px' }}>
              CREATE RECEIPT
            </h2>
            <div className="p-4 rounded-lg mb-6" style={{ background: 'var(--s3)', border: '1px solid var(--border)' }}>
              <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>
                Invoice: <span style={{ color: 'var(--text)' }}>{selectedInvoice.invoice_number}</span>
                {' · '}Total: <span style={{ color: 'var(--green)' }}>₹{selectedInvoice.total.toFixed(2)}</span>
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <CreditCard className="w-3 h-3" /> Payment Method
                </label>
                <select value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })} className={inputCls} style={inputStyle}>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="space-y-2">
                <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount Received</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount_received}
                  onChange={(e) => setFormData({ ...formData, amount_received: parseFloat(e.target.value), balance_amount: selectedInvoice.total - parseFloat(e.target.value) })}
                  className={inputCls}
                  style={inputStyle}
                  required
                />
              </div>
              <div className="space-y-2">
                <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Balance Amount</label>
                <input type="number" step="0.01" value={formData.balance_amount} readOnly className={inputCls} style={{ ...inputStyle, opacity: 0.6 }} />
              </div>
              <div className="space-y-2">
                <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputCls} style={inputStyle} rows={3} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-lg text-sm transition-all" style={{ border: '1px solid var(--border)', color: 'var(--muted)', background: 'transparent', fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-lg text-sm transition-all" style={{ background: 'var(--green)', color: '#07090e', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Create Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Receipts
