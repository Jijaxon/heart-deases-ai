import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { History, TrendingUp } from 'lucide-react'
import { fetchPredictionHistory } from '../store/slices/mlSlice'
import { formatDate, formatPercent } from '../utils/helpers'

export default function HistoryPage() {
  const dispatch = useDispatch()
  const { history, historyLoading } = useSelector(s => s.ml)

  useEffect(() => { dispatch(fetchPredictionHistory({ page: 1, page_size: 50 })) }, [dispatch])

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Prognozlar Tarixi</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>Barcha o'tkazilgan tahlillar</p>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>ID</th><th>Natija</th><th>Ehtimol</th><th>Xavf balli</th><th>Risk darajasi</th><th>Model</th><th>Sana</th></tr>
          </thead>
          <tbody>
            {historyLoading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Yuklanmoqda...</td></tr>
            ) : history.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Prognoz tarixi bo'sh</td></tr>
            ) : history.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>#{p.id}</td>
                <td><span className={`badge ${p.prediction === 1 ? 'badge-red' : 'badge-green'}`}>{p.prediction_label}</span></td>
                <td>{formatPercent(p.probability)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 40, height: 6, borderRadius: 3, background: 'var(--color-surface2)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p.risk_score}%`, background: p.risk_score >= 70 ? '#e53e3e' : p.risk_score >= 40 ? '#d69e2e' : '#38a169' }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.risk_score}</span>
                  </div>
                </td>
                <td><span className={`badge ${p.risk_label === 'Yuqori xavf' ? 'badge-red' : p.risk_label === "O'rtacha xavf" ? 'badge-yellow' : 'badge-green'}`}>{p.risk_label || '-'}</span></td>
                <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{p.model_used}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatDate(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}