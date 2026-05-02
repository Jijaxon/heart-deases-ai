import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Users, Search, Filter, Upload, Trash2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchPatients, deletePatient, updatePatient, importCSV, setPage, setFilters, clearFilters } from '../store/slices/patientsSlice'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function PatientsPage() {
  const dispatch = useDispatch()
  const { list, total, page, pageSize, totalPages, loading, filters, importLoading, importResult } = useSelector(s => s.patients)
  const fileRef = useRef()

  const loadPatients = () => {
    const params = { page, page_size: pageSize }
    if (filters.search) params.search = filters.search
    if (filters.target !== null && filters.target !== '') params.target = filters.target
    if (filters.min_age) params.min_age = filters.min_age
    if (filters.max_age) params.max_age = filters.max_age
    dispatch(fetchPatients(params))
  }

  useEffect(() => { loadPatients() }, [page, filters])

  useEffect(() => {
    if (importResult) toast.success(importResult.message)
  }, [importResult])

  const handleDelete = async (id) => {
    if (!confirm('Bemorni o\'chirishni tasdiqlaysizmi?')) return
    await dispatch(deletePatient(id))
    toast.success('Bemor o\'chirildi')
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    await dispatch(importCSV(file))
    loadPatients()
    e.target.value = ''
  }

  const handleVerify = async (patient, target) => {
    const data = { 
      age: patient.age, sex: patient.sex, cp: patient.cp, trestbps: patient.trestbps,
      chol: patient.chol, fbs: patient.fbs, restecg: patient.restecg, thalach: patient.thalach,
      exang: patient.exang, oldpeak: patient.oldpeak, slope: patient.slope, ca: patient.ca, thal: patient.thal,
      target: target
    }
    await dispatch(updatePatient({ id: patient.id, data }))
    toast.success('Bemor tashxisi tasdiqlandi')
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)' }}>Bemorlar</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>Jami: {total} ta bemor</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => fileRef.current?.click()} disabled={importLoading}>
            <Upload size={16} />{importLoading ? 'Import...' : 'CSV Import'}
          </button>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>Qidirish (ID)</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input className="input" style={{ paddingLeft: '2rem' }} placeholder="Bemor ID..." value={filters.search} onChange={e => dispatch(setFilters({ search: e.target.value }))} />
            </div>
          </div>
          <div style={{ minWidth: '140px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>Holat</label>
            <select className="input" value={filters.target ?? ''} onChange={e => dispatch(setFilters({ target: e.target.value === '' ? null : Number(e.target.value) }))}>
              <option value="">Barchasi</option>
              <option value="1">Kasal</option>
              <option value="0">Sog'lom</option>
            </select>
          </div>
          <div style={{ minWidth: '100px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>Min yosh</label>
            <input className="input" type="number" placeholder="20" value={filters.min_age ?? ''} onChange={e => dispatch(setFilters({ min_age: e.target.value || null }))} />
          </div>
          <div style={{ minWidth: '100px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>Max yosh</label>
            <input className="input" type="number" placeholder="80" value={filters.max_age ?? ''} onChange={e => dispatch(setFilters({ max_age: e.target.value || null }))} />
          </div>
          <div style={{ minWidth: '130px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>O'qitish holati</label>
            <select className="input" value={filters.trained ?? ''} onChange={e => dispatch(setFilters({ trained: e.target.value === '' ? null : e.target.value === 'true' }))}>
              <option value="">Barchasi</option>
              <option value="false">Yangi</option>
              <option value="true">O'qitilgan</option>
            </select>
          </div>
          <button className="btn btn-secondary" onClick={() => dispatch(clearFilters())} title="Filtrlarni tozalash">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Yosh</th><th>Jins</th><th>Xolesterin</th><th>Qon bosimi</th><th>Yurak urishi</th><th>Holat</th><th>O'qitilgan</th><th>Qo'shilgan</th><th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Yuklanmoqda...</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Ma'lumot topilmadi</td></tr>
            ) : list.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>#{p.id}</td>
                <td>{p.age}</td>
                <td>{p.sex === 1 ? 'Erkak' : 'Ayol'}</td>
                <td>{p.chol} <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>mg/dl</span></td>
                <td>{p.trestbps} <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>mmHg</span></td>
                <td>{p.thalach}</td>
                <td>
                  {p.target === null ? (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="badge badge-red" style={{ cursor: 'pointer', border: 'none' }} onClick={() => handleVerify(p, 1)}>Kasal</button>
                      <button className="badge badge-green" style={{ cursor: 'pointer', border: 'none' }} onClick={() => handleVerify(p, 0)}>Sog'lom</button>
                    </div>
                  ) : (
                    <span className={`badge ${p.target === 1 ? 'badge-red' : 'badge-green'}`}>
                      {p.target === 1 ? 'Kasal' : "Sog'lom"}
                    </span>
                  )}
                </td>
                <td>
                  <span className={`badge ${p.trained ? 'badge-blue' : 'badge-gray'}`}>
                    {p.trained ? "Ha" : "Yo'q"}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatDate(p.created_at)}</td>
                <td>
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px', borderRadius: '4px' }}>
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem' }} onClick={() => dispatch(setPage(page - 1))} disabled={page <= 1}><ChevronLeft size={16} /></button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1
            return (
              <button key={p} className={`btn ${p === page ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.4rem 0.75rem', minWidth: '36px' }} onClick={() => dispatch(setPage(p))}>{p}</button>
            )
          })}
          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem' }} onClick={() => dispatch(setPage(page + 1))} disabled={page >= totalPages}><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  )
}