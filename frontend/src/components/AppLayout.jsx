import {
  BarChart3,
  Boxes,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle.jsx'
import { useAuth } from '../hooks/useAuth.js'

const links = [
  { to: '/', label: 'Panel', icon: LayoutDashboard },
  { to: '/productos', label: 'Productos', icon: Boxes },
  { to: '/categorias', label: 'Categorias', icon: FolderTree },
  { to: '/ventas', label: 'Ventas', icon: ReceiptText },
  { to: '/reportes', label: 'Reportes', icon: BarChart3 },
  { to: '/usuarios', label: 'Usuarios', icon: Users, adminOnly: true },
]

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-block">
          <Link to="/" className="brand-link" onClick={() => setMenuOpen(false)}>
            WearGT
          </Link>
          <button className="icon-button mobile-only" type="button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menu">
            <X size={20} />
          </button>
        </div>
        <nav className="nav-list" aria-label="Navegacion principal">
          {links
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
        </nav>
      </aside>

      <div className="shell-main">
        <header className="topbar">
          <button className="icon-button mobile-only" type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <Menu size={20} />
          </button>
          <div className="session-summary">
            <span className="muted-label">Sesion</span>
            <strong>{user?.nombre_usuario}</strong>
            <span>{user?.rol}</span>
          </div>
          <div className="topbar-actions">
            <ThemeToggle />
            <button className="secondary-button compact-button" type="button" onClick={handleLogout}>
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </header>
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
