/**
 * Asosiy Layout komponenti
 * Sidebar navigatsiya + Header + Content
 */
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard, Users, Brain, BarChart3,
  History, LogOut, Menu, X, Sun, Moon,
  Activity, ChevronRight, Settings
} from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import { toggleTheme } from '../../store'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/patients', icon: Users, label: 'Bemorlar' },
  { path: '/predict', icon: Brain, label: 'Prognoz' },
  { path: '/train', icon: Activity, label: 'Model O\'qitish' },
  { path: '/analytics', icon: BarChart3, label: 'Tahlil' },
  { path: '/history', icon: History, label: 'Tarix' },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const { isDark } = useSelector(s => s.theme)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? '' : 'light'}`}
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col transition-all duration-300 flex-shrink-0"
        style={{
          width: sidebarOpen ? '240px' : '64px',
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5"
          style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="animate-heartbeat flex-shrink-0"
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <Activity size={20} color="white" />
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in">
              <div style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>
                Heart AI
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                Diagnostika Tizimi
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className="flex items-center gap-3 mx-2 my-0.5 rounded-lg transition-all duration-150"
              style={({ isActive }) => ({
                padding: sidebarOpen ? '0.6rem 0.875rem' : '0.6rem',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                background: isActive ? 'rgba(229,62,62,0.12)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.875rem',
              })}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="animate-fade-in">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--color-border)', padding: '0.75rem' }}>
          {sidebarOpen && user && (
            <div className="mb-3 px-2 animate-fade-in">
              <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                {user.full_name || user.username}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                {user.role === 'admin' ? '👑 Admin' : '🩺 Shifokor'}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full rounded-lg transition-all duration-150"
            style={{
              padding: sidebarOpen ? '0.5rem 0.875rem' : '0.5rem',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              color: 'var(--color-text-muted)',
              fontSize: '0.875rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
            title={!sidebarOpen ? 'Chiqish' : undefined}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Chiqish</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 flex-shrink-0"
          style={{
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            height: '56px',
          }}>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="btn btn-secondary"
            style={{ padding: '0.4rem', width: 34, height: 34 }}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="btn btn-secondary"
              style={{ padding: '0.4rem', width: 34, height: 34 }}
              title="Mavzu o'zgartirish"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
