import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BarChart3, CheckCircle } from 'lucide-react'
import { fetchModelComparison, fetchFeatureImportance } from '../store/slices/mlSlice'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts'

export default function ModelsPage() {
  const dispatch = useDispatch()
  const { comparison, featureImportance } = useSelector(s => s.ml)

  useEffect(() => {
    dispatch(fetchModelComparison())
    dispatch(fetchFeatureImportance())
  }, [dispatch])

  const modelNames = { logistic_regression: 'Logistic Regression', random_forest: 'Random Forest', xgboost: 'XGBoost' }
  const modelColors = { logistic_regression: '#3182ce', random_forest: '#e53e3e', xgboost: '#d69e2e' }

  const barData = comparison ? ['accuracy', 'precision', 'recall', 'f1_score', 'roc_auc'].map(metric => {
    const row = { metric: metric.replace('_', ' ').toUpperCase() }
    Object.keys(comparison).forEach(m => { if (comparison[m]) row[m] = comparison[m][metric] })
    return row
  }) : []

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Model Taqqoslash</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>Barcha modellarning ko'rsatkichlari</p>
      </div>

      {/* Model cards */}
      {comparison && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {Object.entries(comparison).map(([name, data]) => data && (
            <div key={name} className="card" style={{ borderColor: data.is_active ? modelColors[name] : 'var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: modelColors[name] }}>{modelNames[name]}</span>
                {data.is_active && <span className="badge badge-green"><CheckCircle size={11} style={{ marginRight: '3px' }} />Aktiv</span>}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)' }}>{data.accuracy}%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Aniqlik</div>
              {/*<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.78rem' }}>*/}
              {/*  {[['F1', data.f1_score], ['AUC', data.roc_auc], ['Recall', data.recall], ['Namunalar', data.training_samples + ' ta']].map(([l, v]) => (*/}
              {/*    <div key={l} style={{ background: 'var(--color-surface2)', padding: '0.35rem 0.5rem', borderRadius: '6px' }}>*/}
              {/*      <span style={{ color: 'var(--color-text-muted)' }}>{l}: </span>*/}
              {/*      <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{typeof v === 'number' ? v + '%' : v}</span>*/}
              {/*    </div>*/}
              {/*  ))}*/}
              {/*</div>*/}
            </div>
          ))}
        </div>
      )}

      {/* Bar chart comparison */}
      {barData.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Ko'rsatkichlar taqqoslash</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="metric" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)' }} />
              <Legend />
              {Object.keys(comparison || {}).filter(m => comparison[m]).map(m => (
                <Bar key={m} dataKey={m} name={modelNames[m]} fill={modelColors[m]} radius={[4,4,0,0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Feature importance */}
      {featureImportance && (
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Feature Importance — {featureImportance.model_name}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {featureImportance.features?.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '130px', fontSize: '0.82rem', color: 'var(--color-text)', flexShrink: 0, textAlign: 'right' }}>{f.name}</div>
                <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'var(--color-surface2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${f.importance}%`, background: `hsl(${220 - i * 15}, 70%, 55%)`, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                </div>
                <div style={{ width: '40px', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{f.importance}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}