import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import AppFooter from '../components/AppFooter.jsx'

const linkClass = ({ isActive }) =>
  `nav-link ${isActive ? 'active text-white' : 'text-white-75'}`

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <header className="app-header">
        <div className="container py-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div className="brand">Managenergy</div>
            <nav className="nav">
              <NavLink to="/consommations" className={linkClass}>
                Consommations
              </NavLink>
              <NavLink to="/graphiques" className={linkClass}>
                Graphiques
              </NavLink>
              <NavLink to="/notifications" className={linkClass}>
                Notifications
              </NavLink>
            </nav>
          </div>
          <div className="d-flex align-items-center gap-3 text-white flex-wrap justify-content-end">
            <span className="small">{user?.email}</span>
            <button className="logout-link" onClick={handleLogout}>
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow-1">
        <Outlet />
      </main>

      <AppFooter />
    </div>
  )
}
