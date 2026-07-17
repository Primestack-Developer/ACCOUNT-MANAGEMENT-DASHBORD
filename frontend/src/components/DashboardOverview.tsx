import { useState, useEffect, useRef } from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { TrendingUp, Users, Clock, CheckCircle, ShoppingBag, DollarSign, FileText, Footprints, Crown } from 'lucide-react'
import PageHeader from './PageHeader'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement)

interface Props { data: any; onRefresh?: () => void }

const card = { background:'var(--s2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'20px' } as React.CSSProperties
const CT   = { fontFamily:'"JetBrains Mono", monospace', fontSize:'10px', color:'var(--muted)', textTransform:'uppercase' as const, letterSpacing:'1px', marginBottom:'16px' }

const chartBase = {
  responsive:true, maintainAspectRatio:false,
  plugins:{
    legend:{display:false},
    tooltip:{ backgroundColor:'#0d1017', borderColor:'#1c2436', borderWidth:1, titleColor:'#dde4ef', bodyColor:'#55657e', titleFont:{family:'"JetBrains Mono", monospace', size:11}, bodyFont:{family:'Syne, sans-serif', size:12} }
  },
  scales:{
    y:{ beginAtZero:true, grid:{color:'rgba(28,36,54,0.8)'}, ticks:{color:'#55657e', font:{family:'"JetBrains Mono", monospace', size:10}}, border:{color:'#1c2436'} },
    x:{ grid:{display:false}, ticks:{color:'#55657e', font:{family:'"JetBrains Mono", monospace', size:10}}, border:{color:'#1c2436'} },
  },
  animation:{ duration:600 },
}

const doughnutOpts = {
  responsive:true, maintainAspectRatio:false,
  plugins:{
    legend:{ position:'bottom' as const, labels:{ color:'#55657e', font:{family:'"JetBrains Mono", monospace', size:10}, padding:16 } },
    tooltip:{ backgroundColor:'#0d1017', borderColor:'#1c2436', borderWidth:1, titleColor:'#dde4ef', bodyColor:'#55657e' }
  },
  animation:{ duration:800 },
}

// Simulate live sales data by shifting + adding new point
function useliveSalesData(baseData: number[]) {
  const [pts, setPts] = useState(baseData)
  useEffect(() => {
    const t = setInterval(() => {
      setPts(prev => {
        const next = [...prev.slice(1), Math.round(prev[prev.length-1] * (0.85 + Math.random() * 0.35))]
        return next
      })
    }, 4000)
    return () => clearInterval(t)
  }, [])
  return pts
}

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function DashboardOverview({ data: propData, onRefresh }: Props) {
  const d = propData || {
    todaySales:1200, monthlySales:45000, totalCustomers:25, vipCustomers:4,
    pendingOrders:5, completedOrders:20, totalShoesToday:15, totalShoesMonth:320,
    serviceRevenue:[
      { name:'Deep Clean', revenue:15000 },{ name:'Premium Care', revenue:12000 },
      { name:'Lather Care', revenue:10000 },{ name:'Premium Lather', revenue:8000 }
    ],
    recentBills:[
      { id:1, invoice_number:'INV-001', customer_name:'John Doe',    total:498, status:'completed', total_shoe_count:3 },
      { id:2, invoice_number:'INV-002', customer_name:'Jane Smith',  total:349, status:'pending',   total_shoe_count:2 },
      { id:3, invoice_number:'INV-003', customer_name:'Mike Johnson',total:449, status:'completed', total_shoe_count:2 },
    ]
  }

  // Live sales sparkline
  const livePoints  = useliveSalesData([1200,1900,3000,2500,3500,4200,3800])
  // Live day label — always shows today at end
  const todayIdx    = new Date().getDay() // 0=Sun
  const rotatedDays = [...DAYS.slice(todayIdx === 0 ? 0 : todayIdx), ...DAYS.slice(0, todayIdx === 0 ? 0 : todayIdx)].slice(-7)

  // KPI flash on data change
  const [flashKey, setFlashKey] = useState(0)
  const prevData = useRef(propData)
  useEffect(() => {
    if (propData !== prevData.current) { setFlashKey(k => k+1); prevData.current = propData }
  }, [propData])

  const stats = [
    { label:"Today's Sales",   value:`₹${Number(d.todaySales||0).toFixed(0)}`,   icon:DollarSign,  accent:'var(--green)',  change:'+12.5%' },
    { label:'Monthly Sales',   value:`₹${Number(d.monthlySales||0).toFixed(0)}`, icon:TrendingUp,  accent:'var(--blue)',   change:'+8.2%'  },
    { label:'Customers',       value:d.totalCustomers||0,                         icon:Users,       accent:'var(--blue)',   change:'+5'     },
    { label:'VIP',             value:d.vipCustomers||0,                           icon:Crown,       accent:'var(--yellow)', change:'+1'     },
    { label:'Shoes Today',     value:d.totalShoesToday||15,                       icon:Footprints,  accent:'var(--yellow)', change:'+3'     },
    { label:'Pending',         value:d.pendingOrders||0,                          icon:Clock,       accent:'var(--red)',    change:'-2'     },
    { label:'Completed',       value:d.completedOrders||0,                        icon:CheckCircle, accent:'var(--green)',  change:'+15'    },
  ]

  const salesChartData = {
    labels: rotatedDays,
    datasets:[{
      label:'Sales (₹)', data:livePoints,
      borderColor:'#1fd693', backgroundColor:'rgba(31,214,147,0.08)',
      fill:true, tension:0.4, pointBackgroundColor:'#1fd693', pointRadius:3,
    }],
  }

  const serviceChartData = {
    labels:(d.serviceRevenue||[]).map((s:any)=>s.name),
    datasets:[{
      label:'Revenue (₹)', data:(d.serviceRevenue||[]).map((s:any)=>s.revenue),
      backgroundColor:['#1fd693','#4e8fff','#f5b731','#f04f5a','#b07eff','#ff6b6b'],
      borderRadius:4, borderSkipped:false,
    }],
  }

  const ordersChartData = {
    labels:['Pending','Completed'],
    datasets:[{
      data:[d.pendingOrders||0, d.completedOrders||0],
      backgroundColor:['#f5b731','#1fd693'], borderColor:'transparent', hoverOffset:6,
    }],
  }

  return (
    <div className="space-y-8 animate-fadein page-enter">

      {/* Header */}
      <PageHeader
        title="DASHBOARD"
        highlight="OVERVIEW"
        subtitle="Welcome back — live data · auto-refreshes every 30s"
        gradient="green"
        action={
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Cobbler" style={{ width:48, height:48, objectFit:'contain', borderRadius:'8px', background:'var(--s2)', padding:'3px', border:'1px solid var(--border)' }} onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />
            <span className="flex items-center gap-2" style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'10px', color:'var(--green)', background:'rgba(31,214,147,0.08)', border:'1px solid rgba(31,214,147,0.2)', padding:'4px 12px', borderRadius:'4px' }}>
              <span className="live-dot" /> LIVE DATA
            </span>
          </div>
        }
      />

      <div className="section-label">KPI Overview</div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className={`card-live card-hover stagger-${Math.min(i+1,8)}`} style={{ ...card, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, width:'3px', height:'100%', background:stat.accent, borderRadius:'8px 0 0 8px' }} />
              <div style={{ paddingLeft:'8px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
                  <Icon className="w-4 h-4" style={{ color:stat.accent }} />
                  <span style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'9px', color:stat.change.startsWith('-')?'var(--red)':'var(--green)', background:stat.change.startsWith('-')?'rgba(240,79,90,0.1)':'rgba(31,214,147,0.1)', padding:'2px 6px', borderRadius:'4px' }}>
                    {stat.change}
                  </span>
                </div>
                <div key={flashKey} className="kpi-flash" style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'28px', lineHeight:1, color:'var(--text)', margin:'4px 0' }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'9px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="section-label">Live Analytics</div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Live line chart */}
        <div className="lg:col-span-2 card-live" style={card}>
          <div style={{ ...CT, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span className="flex items-center gap-2"><ShoppingBag className="w-3 h-3" /> Weekly Sales Trend</span>
            <span className="flex items-center gap-1.5" style={{ color:'var(--green)', fontSize:'9px' }}><span className="live-dot" style={{ width:'5px', height:'5px' }} /> Updating</span>
          </div>
          <div style={{ height:'220px' }}>
            <Line data={salesChartData} options={chartBase} />
          </div>
        </div>

        {/* Doughnut */}
        <div className="card-live" style={card}>
          <div style={{ ...CT, display:'flex', alignItems:'center', gap:'8px' }}>
            <CheckCircle className="w-3 h-3" /> Order Status
          </div>
          <div style={{ height:'220px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Doughnut data={ordersChartData} options={doughnutOpts} />
          </div>
        </div>
      </div>

      {/* Recent Bills + Bar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent bills */}
        <div className="card-live" style={card}>
          <div style={CT}>Recent Bills</div>
          <div className="space-y-3">
            {(d.recentBills||[]).map((bill:any, idx:number) => (
              <div key={bill.id || idx} className="trow flex items-center justify-between"
                style={{ padding:'12px', borderRadius:'6px', background:'var(--s3)', border:'1px solid var(--border)', animation:`fadeInUp 0.3s ease ${idx * 0.08}s both` }}>
                <div className="flex items-center gap-3">
                  <div style={{ width:'34px', height:'34px', borderRadius:'6px', background:'rgba(245,183,49,0.1)', border:'1px solid rgba(245,183,49,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <FileText className="w-4 h-4" style={{ color:'var(--yellow)' }} />
                  </div>
                  <div>
                    <p style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'11px', color:'var(--text)', fontWeight:500 }}>{bill.invoice_number}</p>
                    <p style={{ fontSize:'11px', color:'var(--muted)' }}>{bill.customer_name||'Walk-in'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'18px', color:'var(--text)', lineHeight:1 }}>
                    ₹{Number(bill.total||0).toFixed(0)}
                  </p>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    <span style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'9px', color:'var(--muted)', display:'flex', alignItems:'center', gap:'3px' }}>
                      <Footprints className="w-3 h-3" />{bill.total_shoe_count||0}
                    </span>
                    <span className={bill.status==='pending'?'badge-pending':''} style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'9px', padding:'2px 7px', borderRadius:'4px', background:bill.status==='completed'?'rgba(31,214,147,0.12)':'rgba(245,183,49,0.12)', color:bill.status==='completed'?'var(--green)':'var(--yellow)', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                      {bill.status||'pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {(!d.recentBills||d.recentBills.length===0) && (
              <p style={{ fontFamily:'"JetBrains Mono", monospace', fontSize:'11px', color:'var(--muted)', textAlign:'center', padding:'24px' }}>No recent bills</p>
            )}
          </div>
        </div>

        {/* Bar chart */}
        <div className="card-live" style={card}>
          <div style={{ ...CT, display:'flex', alignItems:'center', gap:'8px' }}>
            <TrendingUp className="w-3 h-3" /> Service-wise Revenue
          </div>
          <div style={{ height:'220px' }}>
            <Bar data={serviceChartData} options={chartBase} />
          </div>
        </div>
      </div>
    </div>
  )
}
