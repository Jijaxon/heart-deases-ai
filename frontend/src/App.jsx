/**
 * App.jsx - Asosiy ilova komponenti
 * React Router va Redux Provider shu yerda o'rnatiladi.
 */
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider, useSelector, useDispatch } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import store from './store'
import { fetchCurrentUser } from './store/slices/authSlice'

// Sahifalar
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PatientsPage from './pages/PatientsPage'
import PredictPage from './pages/PredictPage'
import ModelsPage from './pages/ModelsPage'
import HistoryPage from './pages/HistoryPage'
import TrainPage from './pages/TrainPage'

// Layout
import AppLayout from './components/layout/AppLayout'

// ─── Route Guard ───────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector(s => s.auth)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// ─── App ichki qismi ───────────────────────────────────────────────────────────
function AppInner() {
  const dispatch = useDispatch()
  const { token } = useSelector(s => s.auth)
  const { isDark } = useSelector(s => s.theme)

  // Token bor bo'lsa user ma'lumotlarini olish
  useEffect(() => {
    if (token) dispatch(fetchCurrentUser())
  }, [token, dispatch])

  // Dark/Light tema
  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDark)
  }, [isDark])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          },
        }}
      />
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="predict" element={<PredictPage />} />
          <Route path="models" element={<ModelsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="train" element={<TrainPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

// ─── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  )
}
