
import { useState, useEffect } from 'react'
import { TrendingDown, Plus, Edit2, Trash2, Calendar, FileText } from 'lucide-react'

interface Expense {
  id: number
  category: string
  description: string
  amount: number
  date: string
}

function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState({
    category: 'Rent',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses')
      const data = await res.json()
      setExpenses(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingExpense ? 'PUT' : 'POST'
      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : '/api/expenses'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        fetchExpenses()
        setShowModal(false)
        setFormData({
          category: 'Rent',
          description: '',
          amount: 0,
          date: new Date().toISOString().split('T')[0]
        })
        setEditingExpense(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      date: expense.date
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
        fetchExpenses()
      } catch (err) {
        console.error(err)
      }
    }
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

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
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', letterSpacing: '2px', color: 'var(--text)', lineHeight: 1 }}>EXPENSES</h1>
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--muted)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Track and manage expenses
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all"
          style={{ background: 'var(--red)', color: '#fff', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Total card */}
      <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderLeft: '4px solid var(--red)', borderRadius: '8px', padding: '24px' }}>
        <p className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
          <TrendingDown className="w-3 h-3" style={{ color: 'var(--red)' }} /> Total Expenses
        </p>
        <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '40px', color: 'var(--red)', lineHeight: 1 }}>
          ₹{totalExpenses.toFixed(2)}
        </p>
      </div>

      <div className="section-label">Expense Records</div>

      <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Date', 'Category', 'Description', 'Amount', 'Actions'].map(h => (
                <th key={h} className="px-5 py-4 text-left" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} style={{ borderBottom: '1px solid rgba(28,36,54,0.6)' }} className="trow">
                <td className="px-5 py-4" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--muted)' }}>{expense.date}</td>
                <td className="px-5 py-4">
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', background: 'var(--s3)', border: '1px solid var(--border)', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {expense.category}
                  </span>
                </td>
                <td className="px-5 py-4" style={{ fontSize: '12px', color: 'var(--muted)' }}>{expense.description || '—'}</td>
                <td className="px-5 py-4" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '20px', color: 'var(--red)', lineHeight: 1 }}>₹{expense.amount.toFixed(2)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(expense)} className="p-2 rounded transition-all" style={{ color: 'var(--blue)', background: 'rgba(78,143,255,0.08)', border: '1px solid rgba(78,143,255,0.15)' }}>
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDelete(expense.id)} className="p-2 rounded transition-all" style={{ color: 'var(--red)', background: 'rgba(240,79,90,0.08)', border: '1px solid rgba(240,79,90,0.15)' }}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(7,9,14,0.85)' }}>
          <div className="w-full max-w-lg p-8 rounded-lg" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '26px', letterSpacing: '2px', color: 'var(--text)', marginBottom: '24px' }}>
              {editingExpense ? 'EDIT EXPENSE' : 'ADD EXPENSE'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <FileText className="w-3 h-3" /> Category
                </label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputCls} style={inputStyle}>
                  <option value="Rent">Rent</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Salary">Salary</option>
                  <option value="Cleaning Materials">Cleaning Materials</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
              <div className="space-y-2">
                <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputCls} style={inputStyle} rows={3} />
              </div>
              <div className="space-y-2">
                <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount</label>
                <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })} className={inputCls} style={inputStyle} required />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <Calendar className="w-3 h-3" /> Date
                </label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={inputCls} style={inputStyle} required />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingExpense(null) }} className="px-6 py-2.5 rounded-lg text-sm transition-all" style={{ border: '1px solid var(--border)', color: 'var(--muted)', background: 'transparent', fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-lg text-sm transition-all" style={{ background: 'var(--red)', color: '#fff', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
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

export default Expenses
