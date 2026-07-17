import { useState, useEffect, useRef } from 'react'
import DashboardOverview from './DashboardOverview'
import MerchantDashboard from './MerchantDashboard'
import Customers from './Customers'
import Billing from './Billing'
import Receipts from './Receipts'
import Expenses from './Expenses'
import ClientDetails from './ClientDetails'
import BusinessDetails from './BusinessDetails'
import ActivityLog from './ActivityLog'
import Settings from './Settings'
import UserManagement from './UserManagement'
import {
  LayoutDashboard, Users, FileText, Receipt, TrendingDown,
  UserCheck, Building2, Activity, Settings as SettingsIcon,
  LogOut, UserCircle, Zap, ShieldCheck, RefreshCw, Sun, Moon,
} from 'lucide-react'

interface DashboardProps {
  user: any
  onLogout: () => void
  theme: 'dark' | 'light'
  toggleTheme: () => void
}

const ALL_GROUPS = [
  {
    label: 'Main', roles: ['admin'],
    items: [
      { id: 'overview',         label: 'Dashboard',        icon: LayoutDashboard, roles: ['admin'] },
      { id: 'client-details',   label: 'Client Details',   icon: UserCheck,       roles: ['admin'] },
      { id: 'business-details', label: 'Business Details', icon: Building2,       roles: ['admin'] },
    ],
  },
  {
    label: 'My Dashboard', roles: ['merchant'],
    items: [
      { id: 'merchant-dash', label: 'Dashboard', icon: LayoutDashboard, roles: ['merchant'] },
    ],
  },
  {
    label: 'Operations', roles: ['admin', 'merchant'],
    items: [
      { id: 'customers', label: 'Customers', icon: Users,        roles: ['admin','merchant'] },
      { id: 'billing',   label: 'Invoices',  icon: FileText,     roles: ['admin','merchant'] },
      { id: 'receipts',  label: 'Receipts',  icon: Receipt,      roles: ['admin','merchant'] },
      { id: 'expenses',  label: 'Expenses',  icon: TrendingDown, roles: ['admin','merchant'] },
    ],
  },
  {
    label: 'System', roles: ['admin'],
    items: [
      { id: 'users',    label: 'User Management', icon: ShieldCheck,  roles: ['admin'] },
      { id: 'activity', label: 'Activity Log',    icon: Activity,     roles: ['admin'] },
      { id: 'settings', label: 'Settings',        icon: SettingsIcon, roles: ['admin'] },
    ],
  },
]

// Marquee items
const MARQUEE_ITEMS = [
  '⚡ COBBLER SHOE LAUNDRY',
  '👟 PREMIUM SHOE CARE',
  '🟢 SYSTEM ONLINE',
  '✨ DEEP CLEAN · PREMIUM CARE · LATHER CARE',
  '📦 ORDER TRACKING LIVE',
  '💳 CASH · UPI · CARD · BANK TRANSFER',
  '🏆 VIP CUSTOMER PRIORITY SERVICE',
  '🔒 SECURE · RELIABLE · FAST',
]

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'12px', color:'var(--green)', letterSpacing:'1px' }}>
      {time.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
    </span>
  )
}

function Dashboard({ user, onLogout, theme, toggleTheme }: DashboardProps) {
  const role       = user?.role || 'merchant'
  const defaultTab = role === 'admin' ? 'overview' : 'merchant-dash'
  const [activeTab,     setActiveTab]     = useState(defaultTab)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [refreshing,    setRefreshing]    = useState(false)
  const [lastRefresh,   setLastRefresh]   = useState(new Date())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchData()
    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(fetchData, 30000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  async function fetchData() {
    setRefreshing(true)
    try {
      const res = await fetch('/api/dashboard')
      setDashboardData(await res.json())
      setLastRefresh(new Date())
    } catch { /* use mock */ }
    setRefreshing(false)
  }

  function renderPage() {
    switch (activeTab) {
      case 'overview':         return <DashboardOverview data={dashboardData} onRefresh={fetchData} />
      case 'merchant-dash':    return <MerchantDashboard data={dashboardData} user={user} />
      case 'client-details':   return <ClientDetails />
      case 'business-details': return <BusinessDetails />
      case 'customers':        return <Customers />
      case 'billing':          return <Billing />
      case 'receipts':         return <Receipts />
      case 'expenses':         return <Expenses />
      case 'users':            return <UserManagement />
      case 'activity':         return <ActivityLog />
      case 'settings':         return <Settings />
      default: return role === 'admin'
        ? <DashboardOverview data={dashboardData} onRefresh={fetchData} />
        : <MerchantDashboard data={dashboardData} user={user} />
    }
  }

  const visibleGroups = ALL_GROUPS
    .filter(g => g.roles.includes(role))
    .map(g => ({ ...g, items: g.items.filter(i => i.roles.includes(role)) }))
    .filter(g => g.items.length > 0)

  const isAdmin    = role === 'admin'
  const roleColor  = isAdmin ? 'var(--yellow)' : 'var(--blue)'
  const roleBg     = isAdmin ? 'rgba(245,183,49,0.12)' : 'rgba(78,143,255,0.12)'
  const roleBorder = isAdmin ? 'rgba(245,183,49,0.25)' : 'rgba(78,143,255,0.25)'

  const marqueeText = MARQUEE_ITEMS.join('   ·   ')

  return (
    <div className="flex flex-col h-screen" style={{ background:'var(--bg)', color:'var(--text)', fontFamily:'Syne, sans-serif' }}>

      {/* ── TOP MARQUEE BAR ── */}
      <div style={{ background:'var(--s1)', borderBottom:'1px solid var(--border)', padding:'6px 0', position:'relative', overflow:'hidden', flexShrink:0 }}>
        <div className="scan-line" />
        <div className="marquee-wrap">
          <div className="marquee-track">
            {/* duplicate for seamless loop */}
            {[...Array(2)].map((_, ri) => (
              <span key={ri} style={{ display:'inline-flex', alignItems:'center', gap:'0' }}>
                {MARQUEE_ITEMS.map((item, i) => (
                  <span key={i} style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'10px', textTransform:'uppercase', letterSpacing:'1.5px', color: i % 3 === 0 ? 'var(--green)' : i % 3 === 1 ? 'var(--yellow)' : 'var(--muted)', padding:'0 28px' }}>
                    {item}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="w-64 flex flex-col flex-shrink-0" style={{ background:'var(--s1)', borderRight:'1px solid var(--border)' }}>
          {/* Logo */}
          <div className="p-5" style={{ borderBottom:'1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="Cobbler"
                style={{ width:42, height:42, objectFit:'contain', borderRadius:'8px', background:'var(--s3)', padding:'2px' }}
                onError={e => { (e.target as HTMLImageElement).style.display='none' }}
              />
              <div>
                <h2 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'20px', letterSpacing:'2px', color:'var(--text)', lineHeight:1 }}>COBBLER</h2>
                <p style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'9px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1px' }}>Shoe Laundry</p>
              </div>
            </div>
            {/* Role badge */}
            <div className="mt-3 flex items-center gap-2">
              <span className="live-dot" />
              <span style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'9px', padding:'3px 8px', borderRadius:'4px', textTransform:'uppercase', letterSpacing:'1px', background:roleBg, color:roleColor, border:`1px solid ${roleBorder}` }}>
                {isAdmin ? '⚡ Admin' : '🏪 Merchant'}
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-3 px-3 space-y-4 overflow-y-auto">
            {visibleGroups.map(group => (
              <div key={group.label}>
                <div style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'9px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'2px', padding:'0 10px', marginBottom:'4px', opacity:0.5 }}>
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.items.map(item => {
                    const Icon  = item.icon
                    const active = activeTab === item.id
                    return (
                      <div key={item.id} className="sidebar-item-wrap">
                        <button onClick={() => setActiveTab(item.id)}
                          className={`nav-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${active ? 'active-nav' : ''}`}
                          style={{ background: active?'var(--s3)':'transparent', color: active?'var(--green)':'var(--muted)', borderLeft: active?'2px solid var(--green)':'2px solid transparent', fontFamily:'Syne, sans-serif', fontWeight:500, fontSize:'13px', letterSpacing:'0.3px' }}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Live clock in sidebar */}
          <div className="px-4 py-2" style={{ borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span className="live-dot" />
              <LiveClock />
            </div>
            {/* Dark / Light toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: theme === 'dark' ? 'var(--s3)' : 'rgba(245,183,49,0.15)',
                border: `1px solid ${theme === 'dark' ? 'var(--border)' : 'rgba(245,183,49,0.4)'}`,
                borderRadius: '20px', padding: '4px 10px', cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {theme === 'dark'
                ? <><Moon  className="w-3 h-3" style={{ color:'var(--blue)'   }} /><span style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'9px', color:'var(--blue)',   textTransform:'uppercase', letterSpacing:'1px' }}>Dark</span></>
                : <><Sun   className="w-3 h-3" style={{ color:'var(--yellow)' }} /><span style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'9px', color:'var(--yellow)', textTransform:'uppercase', letterSpacing:'1px' }}>Light</span></>
              }
            </button>
          </div>

          {/* User footer */}
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              {user.profile_photo
                ? <img src={user.profile_photo} alt="" style={{ width:32, height:32, borderRadius:'8px', objectFit:'cover', border:'1px solid var(--border)' }} />
                : <div className="p-1.5 rounded-full" style={{ background:'var(--s3)', border:'1px solid var(--border)' }}><UserCircle className="w-6 h-6" style={{ color:'var(--muted)' }} /></div>
              }
              <div className="flex-1 min-w-0">
                <p style={{ fontSize:'13px', fontWeight:500, color:'var(--text)', fontFamily:'Syne, sans-serif', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.full_name || user.username}</p>
                <p style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'9px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email || user.role}</p>
              </div>
            </div>
            <button onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all"
              style={{ background:'var(--s3)', color:'var(--muted)', border:'1px solid var(--border)', fontFamily:'"JetBrains Mono", monospace', fontSize:'10px', textTransform:'uppercase', letterSpacing:'1px' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color='var(--red)';(e.currentTarget as HTMLButtonElement).style.borderColor='var(--red)'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color='var(--muted)';(e.currentTarget as HTMLButtonElement).style.borderColor='var(--border)'}}
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 flex flex-col overflow-hidden" style={{ background:'var(--bg)' }}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ background:'var(--s1)', borderBottom:'1px solid var(--border)' }}>
            <div style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'11px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1px' }}>
              {ALL_GROUPS.flatMap(g=>g.items).find(i=>i.id===activeTab)?.label || 'Dashboard'}
            </div>
            <div className="flex items-center gap-4">
              {/* Last refresh */}
              <span style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'9px', color:'var(--muted)' }}>
                Updated: {lastRefresh.toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit',second:'2-digit'})}
              </span>
              {/* Manual refresh */}
              <button onClick={fetchData}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                style={{ background:'var(--s3)', border:'1px solid var(--border)', color:'var(--muted)', fontFamily:'"JetBrains Mono", monospace', fontSize:'10px', textTransform:'uppercase', letterSpacing:'1px' }}>
                <RefreshCw className={`w-3 h-3 ${refreshing ? 'spin' : ''}`} style={{ color:'var(--green)' }} />
                Refresh
              </button>
              <span className="flex items-center gap-1.5" style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'10px', color:'var(--green)' }}>
                <span className="live-dot" /> LIVE
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-8 animate-fadein page-in" key={activeTab}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
