/**
 * AppLayout - Asosiy layout komponenti
 * Sidebar navigatsiya, header va content area.
 */
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard, Users, Brain, ScatterChart, BarChart3,
  History, Cpu, LogOut, Menu, X, Sun, Moon, Heart, ChevronRight
} from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import { toggleTheme } from '../../store/slices/themeSlice'

const NAV_ITEMS = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patients',    icon: Users,           label: 'Bemorlar' },
  { to: '/predict',     icon: Brain,           label: 'Prognoz' },
  { to: '/models',      icon: BarChart3,       label: 'Modellar' },
  { to: '/train',       icon: Cpu,             label: 'O\'qitish' },
  { to: '/history',     icon: History,         label: 'Tarix' },
]

export default function AppLayout() {
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--color-bg)' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? '240px' : '64px',
        minWidth: sidebarOpen ? '240px' : '64px',
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden',
        zIndex: 10,
      }}>

        {/* Logo */}
        <div style={{
          padding: '1.25rem 1rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          minHeight: '64px',
        }}>
          <div className="animate-heartbeat" style={{
            background: 'rgba(229,62,62,0.15)', borderRadius: '10px',
            padding: '6px', flexShrink: 0,
          }}>
            <Heart size={20} color="#e53e3e" fill="#e53e3e" />
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>Heart AI</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Diagnostika tizimi</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={!sidebarOpen ? label : undefined}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                gap: '0.75rem', padding: '0.6rem 0.75rem',
                borderRadius: '8px', textDecoration: 'none',
                fontSize: '0.875rem', fontWeight: 500,
                whiteSpace: 'nowrap', overflow: 'hidden',
                background: isActive ? 'rgba(229,62,62,0.12)' : 'transparent',
                color: isActive ? '#e53e3e' : 'var(--color-text-muted)',
                borderLeft: isActive ? '2px solid #e53e3e' : '2px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info + actions */}
        <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid var(--color-border)' }}>
          {sidebarOpen && user && (
            <div style={{
              padding: '0.6rem 0.75rem', borderRadius: '8px',
              background: 'var(--color-surface2)', marginBottom: '0.5rem',
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
                {user.full_name || user.username}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                {user.role}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Chiqish"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0.75rem', borderRadius: '8px', border: 'none',
              background: 'transparent', color: 'var(--color-text-muted)',
              cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
              whiteSpace: 'nowrap', overflow: 'hidden',
            }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Chiqish</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <header style={{
          height: '64px', background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 1.5rem',
          flexShrink: 0,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', padding: '4px', borderRadius: '6px',
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Theme toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              style={{
                background: 'var(--color-surface2)', border: '1px solid var(--color-border)',
                borderRadius: '8px', padding: '0.4rem 0.75rem',
                cursor: 'pointer', color: 'var(--color-text)',
                display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem',
              }}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
              {isDark ? 'Kunduz' : 'Kecha'}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
