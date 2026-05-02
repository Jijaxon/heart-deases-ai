import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Cpu, CheckCircle, AlertCircle, BarChart2, RefreshCw } from 'lucide-react'
import { trainModel, clearTrainResult } from '../store/slices/mlSlice'
import toast from 'react-hot-toast'

export default function TrainPage() {
  const dispatch = useDispatch()
  const { trainResult, trainLoading, trainError } = useSelector(s => s.ml)
  const [modelName, setModelName] = useState('random_forest')
  const [onlyUntrained, setOnlyUntrained] = useState(false)

  const handleTrain = async () => {
    dispatch(clearTrainResult())
    const result = await dispatch(trainModel({ model_name: modelName, use_only_untrained: onlyUntrained }))
    if (trainModel.fulfilled.match(result)) toast.success("Model muvaffaqiyatli o'qitildi!")
    else toast.error(result.payload || "O'qitishda xatolik")
  }

  const models = [
    { value: 'logistic_regression', label: 'Logistic Regression', desc: 'Oddiy va tez, tushunish oson' },
    { value: 'random_forest', label: 'Random Forest', desc: 'Yuqori aniqlik, tavsiya etiladi' },
    { value: 'xgboost', label: 'XGBoost', desc: 'Pro darajali, eng yaxshi natija' },
  ]

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)' }}>Model O'qitish</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>DB dagi ma'lumotlar bilan modelni yangilash</p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Model tanlang</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {models.map(m => (
            <label key={m.value} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem', borderRadius: '10px', border: `2px solid ${modelName === m.value ? '#e53e3e' : 'var(--color-border)'}`, cursor: 'pointer', background: modelName === m.value ? 'rgba(229,62,62,0.06)' : 'transparent', transition: 'all 0.2s' }}>
              <input type="radio" value={m.value} checked={modelName === m.value} onChange={e => setModelName(e.target.value)} style={{ marginTop: '2px', accentColor: '#e53e3e' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{m.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{m.desc}</div>
              </div>
            </label>
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', padding: '0.875rem', borderRadius: '10px', background: 'var(--color-surface2)', cursor: 'pointer' }}>
          <input type="checkbox" checked={onlyUntrained} onChange={e => setOnlyUntrained(e.target.checked)} style={{ accentColor: '#e53e3e' }} />
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-text)' }}>Faqat yangi ma'lumotlarda o'qit</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>trained=False bo'lgan yozuvlar ishlatiladi (incremental learning)</div>
          </div>
        </label>

        <button className="btn btn-primary" onClick={handleTrain} disabled={trainLoading} style={{ width: '100%', padding: '0.875rem', marginTop: '1.25rem', fontSize: '0.95rem' }}>
          {trainLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
              O'qitilmoqda...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Cpu size={16} />Modelni O'qitish</span>
          )}
        </button>
      </div>

      {trainError && (
        <div className="card" style={{ borderColor: 'rgba(229,62,62,0.4)', background: 'rgba(229,62,62,0.06)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', color: '#fc8181', alignItems: 'center' }}>
            <AlertCircle size={18} /> {trainError}
          </div>
        </div>
      )}

      {trainResult && (
        <div className="card animate-fade-in" style={{ borderColor: 'rgba(56,161,105,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#68d391' }}>
            <CheckCircle size={20} />
            <span style={{ fontWeight: 600 }}>{trainResult.message}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[
              { label: 'Aniqlik', val: trainResult.metrics?.accuracy },
              { label: 'Precision', val: trainResult.metrics?.precision },
              { label: 'Recall', val: trainResult.metrics?.recall },
              { label: 'F1 Score', val: trainResult.metrics?.f1_score },
              { label: 'ROC AUC', val: trainResult.metrics?.roc_auc },
              { label: 'Namunalar', val: trainResult.trained_samples, isInt: true },
            ].map(item => (
              <div key={item.label} style={{ padding: '0.75rem', background: 'var(--color-surface2)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  {item.isInt ? item.val : item.val ? `${(item.val * 100).toFixed(1)}%` : '—'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}