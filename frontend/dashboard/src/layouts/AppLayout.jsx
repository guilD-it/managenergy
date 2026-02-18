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
        <div className="container py-3 d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3">
          <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3 w-100 w-lg-auto">
            <div className="brand">Managenergy</div>
            <nav className="nav app-nav flex-wrap">
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
          <div className="d-flex align-items-center gap-3 text-white flex-wrap justify-content-between w-100 w-lg-auto">
            <span className="small text-truncate">{user?.email}</span>
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
