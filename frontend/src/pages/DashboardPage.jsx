import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Users, Heart, ShieldCheck, TrendingUp, Activity, Brain, AlertTriangle } from 'lucide-react'
import { fetchDashboardStats } from '../store/slices/mlSlice'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#38a169', '#e53e3e']

function StatCard({ icon: Icon, label, value, sub, color = '#3182ce' }) {
  return (
    <div className="card animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
      <div style={{ background: `rgba(${color === '#e53e3e' ? '229,62,62' : color === '#38a169' ? '56,161,105' : color === '#d69e2e' ? '214,158,46' : '49,130,206'},0.12)`, borderRadius: '10px', padding: '10px', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>{value ?? '—'}</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)', marginTop: '2px' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{sub}</div>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const dispatch = useDispatch()
  const { dashboardStats: stats, statsLoading } = useSelector(s => s.ml)

  useEffect(() => { dispatch(fetchDashboardStats()) }, [dispatch])

  const pieData = stats ? [
    { name: "Sog'lom", value: stats.healthy_patients },
    { name: 'Kasal', value: stats.sick_patients },
  ] : []

  const riskData = stats ? [
    { name: 'Yuqori', value: stats.high_risk_count, fill: '#e53e3e' },
    { name: "O'rta", value: stats.medium_risk_count, fill: '#d69e2e' },
    { name: 'Past', value: stats.low_risk_count, fill: '#38a169' },
  ] : []

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)' }}>Dashboard</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Umumiy statistika va ko'rsatkichlar</p>
      </div>

      {statsLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Yuklanmoqda...</div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <StatCard icon={Users} label="Jami bemorlar" value={stats?.total_patients} color="#3182ce" />
            <StatCard icon={Heart} label="Kasal bemorlar" value={stats?.sick_patients} color="#e53e3e" sub={`${stats ? Math.round(stats.sick_patients/stats.total_patients*100) : 0}%`} />
            <StatCard icon={ShieldCheck} label="Sog'lom bemorlar" value={stats?.healthy_patients} color="#38a169" />
            <StatCard icon={Brain} label="Prognozlar" value={stats?.total_predictions} color="#805ad5" />
            <StatCard icon={AlertTriangle} label="Yuqori xavf" value={stats?.high_risk_count} color="#e53e3e" />
            <StatCard icon={TrendingUp} label="Model aniqligi" value={stats?.model_accuracy ? `${stats.model_accuracy}%` : '—'} color="#d69e2e" />
            <StatCard icon={Activity} label="O'rtacha yosh" value={stats?.avg_age} color="#3182ce" />
            <StatCard icon={Activity} label="O'rtacha xolesterin" value={stats?.avg_chol} color="#d69e2e" sub="mg/dl" />
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text)' }}>Bemorlar taqsimoti</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Soni']} contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text)' }}>Risk darajalari</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={riskData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)' }} />
                  <Bar dataKey="value" radius={[6,6,0,0]}>
                    {riskData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}