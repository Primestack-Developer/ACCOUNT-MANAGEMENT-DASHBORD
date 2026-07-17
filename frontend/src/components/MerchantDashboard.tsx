import { Line, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { DollarSign, Users, Clock, CheckCircle, TrendingUp, FileText, Footprints, ShoppingBag } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement)

const card = { background:'var(--s2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'20px' } as React.CSSProperties
const CT = { fontFamily:'"JetBrains Mono", monospace', fontSize:'10px', color:'var(--muted)', textTransform:'uppercase' as const, letterSpacing:'1px', marginBottom:'14px' }
const chartOpts = {
  responsive:true, maintainAspectRatio:false,
  plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#0d1017', borderColor:'#1c2436', borderWidth:1, titleColor:'#dde4ef', bodyColor:'#55657e' } },
  scales:{ y:{ beginAtZero:true, grid:{color:'rgba(28,36,54,0.8)'}, ticks:{color:'#55657e', font:{family:'"JetBrains Mono", monospace', size:10}}, border:{color:'#1c2436'} }, x:{ grid:{display:false}, ticks:{color:'#55657e', font:{family:'"JetBrains Mono", monospace', size:10}}, border:{color:'#1c2436'} } }
}

export default function MerchantDashboard({ data: pd, user }: { data: any; user: any }) {
  const d = pd || { todaySales:0, monthlySales:0, totalCustomers:0, pendingOrders:0, completedOrders:0, vipCustomers:0, recentBills:[], serviceRevenue:[] }

  const kpis = [
    { label:"Today's Sales",   value:`₹${Number(d.todaySales||0).toFixed(0)}`,   icon:DollarSign,  accent:'var(--green)'  },
    { label:'Monthly Sales',   value:`₹${Number(d.monthlySales||0).toFixed(0)}`, icon:TrendingUp,  accent:'var(--blue)'   },
    { label:'My Customers',    value:d.totalCustomers||0,                         icon:Users,       accent:'var(--blue)'   },
    { label:'Pending',         value:d.pendingOrders||0,                          icon:Clock,       accent:'var(--red)'    },
    { label:'Completed',       value:d.completedOrders||0,                        icon:CheckCircle, accent:'var(--green)'  },
  ]

  const salesData = {
    labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets:[{ label:'Sales', data:[800,1400,2200,1900,2800,3400,3100], borderColor:'#4e8fff', backgroundColor:'rgba(78,143,255,0.08)', fill:true, tension:0.4, pointBackgroundColor:'#4e8fff', pointRadius:3 }]
  }
  const ordersData = {
    labels:['Pending','Completed'],
    datasets:[{ data:[d.pendingOrders||0, d.completedOrders||0], backgroundColor:['#f5b731','#1fd693'], borderColor:'transparent' }]
  }

  return (
    <div className="space-y-8 animate-fadein">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'32px', letterSpacing:'2px', color:'var(--text)', lineHeight:1 }}>
            MERCHANT <span style={{ color:'var(--blue)' }}>DASHBOARD</span>
          </h1>
          <p style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'11px', color:'var(--muted)', marginTop:'6px', textTransform:'uppercase', letterSpacing:'1px' }}>
            Welcome, {user?.full_name || user?.username} — here's your day at a glance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Cobbler" style={{ width:52, height:52, objectFit:'contain', borderRadius:'10px', background:'var(--s2)', padding:'3px', border:'1px solid var(--border)' }} onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />
          <div style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'10px', color:'var(--muted)', background:'var(--s3)', border:'1px solid var(--border)', padding:'4px 12px', borderRadius:'4px' }}>
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="section-label">My KPIs</div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((k,i) => {
          const Icon = k.icon
          return (
            <div key={i} style={{ ...card, position:'relative', overflow:'hidden' }} className="hover:brightness-110 transition-all">
              <div style={{ position:'absolute', top:0, left:0, width:'3px', height:'100%', background:k.accent, borderRadius:'8px 0 0 8px' }} />
              <div style={{ paddingLeft:'8px' }}>
                <Icon className="w-4 h-4 mb-2" style={{ color:k.accent }} />
                <div style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'28px', lineHeight:1, color:'var(--text)', margin:'4px 0' }}>{k.value}</div>
                <div style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'9px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{k.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="section-label">Analytics</div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2" style={card}>
          <div style={{ ...CT, display:'flex', alignItems:'center', gap:'8px' }}><ShoppingBag className="w-3 h-3" /> Weekly Sales</div>
          <div style={{ height:'200px' }}><Line data={salesData} options={chartOpts} /></div>
        </div>
        <div style={card}>
          <div style={{ ...CT, display:'flex', alignItems:'center', gap:'8px' }}><CheckCircle className="w-3 h-3" /> Order Status</div>
          <div style={{ height:'200px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Doughnut data={ordersData} options={{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom' as const, labels:{ color:'#55657e', font:{ family:'"JetBrains Mono", monospace', size:10 }, padding:12 } } } }} />
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="section-label">Recent Orders</div>
      <div style={{ ...card, padding:0, overflow:'hidden' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom:'1px solid var(--border)' }}>
              {['Invoice','Customer','Amount','Status'].map(h=>(
                <th key={h} className="px-5 py-3 text-left" style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'10px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(d.recentBills||[]).slice(0,8).map((b:any) => (
              <tr key={b.id} style={{ borderBottom:'1px solid rgba(28,36,54,0.5)' }} className="hover:brightness-110 transition-all">
                <td className="px-5 py-3" style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'11px', color:'var(--text)' }}>
                  <div className="flex items-center gap-2"><FileText className="w-3 h-3" style={{ color:'var(--yellow)' }} />{b.invoice_number}</div>
                </td>
                <td className="px-5 py-3" style={{ fontSize:'12px', color:'var(--muted)' }}>{b.customer_name||'Walk-in'}</td>
                <td className="px-5 py-3" style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'18px', color:'var(--text)', lineHeight:1 }}>₹{Number(b.total||0).toFixed(0)}</td>
                <td className="px-5 py-3">
                  <span style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'9px', padding:'2px 7px', borderRadius:'4px', textTransform:'uppercase', background: b.status==='completed'?'rgba(31,214,147,0.12)':'rgba(245,183,49,0.12)', color: b.status==='completed'?'var(--green)':'var(--yellow)' }}>
                    {b.status||'pending'}
                  </span>
                </td>
              </tr>
            ))}
            {(!d.recentBills||d.recentBills.length===0) && (
              <tr><td colSpan={4} className="px-5 py-12 text-center" style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'11px', color:'var(--muted)' }}>No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Quick actions */}
      <div className="section-label">Quick Actions</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'New Invoice',   icon:FileText,   color:'var(--green)',  hint:'Go to Invoices → Create Invoice' },
          { label:'Add Customer',  icon:Users,      color:'var(--blue)',   hint:'Go to Customers → Add Customer' },
          { label:'Add Expense',   icon:TrendingUp, color:'var(--red)',    hint:'Go to Expenses → Add Expense' },
          { label:'Create Receipt',icon:Footprints, color:'var(--yellow)', hint:'Go to Receipts → Create Receipt' },
        ].map(a => {
          const Icon = a.icon
          return (
            <div key={a.label} className="p-4 rounded-lg" style={{ background:'var(--s3)', border:'1px solid var(--border)' }}>
              <Icon className="w-5 h-5 mb-2" style={{ color:a.color }} />
              <p style={{ fontFamily:'Syne, sans-serif', fontWeight:600, fontSize:'13px', color:'var(--text)', marginBottom:'4px' }}>{a.label}</p>
              <p style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'9px', color:'var(--muted)' }}>{a.hint}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
