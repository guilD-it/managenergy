import { useEffect, useMemo, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import AppFooter from '../components/AppFooter.jsx'
import {
  fetchAlerts,
  fetchNotifications,
  updateNotification,
} from '../api/energyApi.js'
import { formatDateFR } from '../utils/formatDate.js'

const linkClass = ({ isActive }) =>
  `nav-link ${isActive ? 'active text-white' : 'text-white-75'}`

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [alerts, setAlerts] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const loadNotifications = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [alertsData, notificationsData] = await Promise.all([
        fetchAlerts(),
        fetchNotifications(),
      ])
      setAlerts(alertsData || [])
      setNotifications(notificationsData || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Preload notifications once user session is available.
    if (user) {
      loadNotifications()
    }
  }, [user])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const handleMarkRead = async (notificationId) => {
    await updateNotification(notificationId, { read: true })
    await loadNotifications()
  }

  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <header className="app-header">
        <div className="container py-3 d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3">
          <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3 w-100 w-lg-auto">
            <div className="brand d-flex align-items-center gap-2">
              <img
                src="/managenergy-logo.svg"
                alt="Managenergy"
                className="brand-logo"
              />
              <span>Managenergy</span>
            </div>
            <nav className="nav app-nav flex-wrap">
              <NavLink to="/consommations" className={linkClass}>
                Consommations
              </NavLink>
              <NavLink to="/graphiques" className={linkClass}>
                Graphiques
              </NavLink>
              <NavLink to="/alertes" className={linkClass}>
                Alertes
              </NavLink>
            </nav>
          </div>
          <div className="d-flex align-items-center gap-3 text-white flex-wrap justify-content-between w-100 w-lg-auto">
            <span className="small text-truncate">{user?.email}</span>
            <div className="notif-wrapper">
              <button
                className="notif-button"
                type="button"
                onClick={() => setOpen((prev) => !prev)}
              >
                <span className="notif-icon" aria-hidden="true">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    className="bi bi-bell"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2" />
                    <path
                      fillRule="evenodd"
                      d="M8 1.918a1 1 0 0 1 .9.55l.35.7A5 5 0 0 1 13 8c0 1.098.5 2.089 1.294 2.744.123.101.206.255.206.426A.83.83 0 0 1 13.67 12H2.33a.83.83 0 0 1-.83-.83c0-.17.083-.325.206-.426A3.5 3.5 0 0 0 3 8a5 5 0 0 1 3.75-4.832l.35-.7a1 1 0 0 1 .9-.55"
                    />
                  </svg>
                </span>
                {unreadCount ? (
                  <span className="notif-badge">{unreadCount}</span>
                ) : null}
              </button>
              {open ? (
                <div className="notif-panel">
                  <div className="notif-header">
                    <span className="fw-bold">Notifications</span>
                    <button
                      className="btn btn-sm btn-outline"
                      type="button"
                      onClick={() => setOpen(false)}
                    >
                      Fermer
                    </button>
                  </div>
                  {loading ? (
                    <div className="text-muted small">Chargement...</div>
                  ) : null}
                  {!loading && !notifications.length ? (
                    <div className="text-muted small">Aucune notification.</div>
                  ) : null}
                  {!loading &&
                    notifications.map((notification) => {
                      const alert = alerts.find(
                        (entry) => entry.id === notification.alert
                      )
                      const isRead = Boolean(notification.read)
                      return (
                        <div
                          key={notification.id}
                          className={`notif-item ${isRead ? 'is-read' : ''}`}
                        >
                          <div className="notif-title">
                            {alert?.message || 'Alerte'}
                          </div>
                          <div className="notif-meta">
                            {formatDateFR(notification.created_at)}
                          </div>
                          {!isRead ? (
                            <button
                              className="btn btn-sm btn-primary mt-2"
                              type="button"
                              onClick={() => handleMarkRead(notification.id)}
                            >
                              Marquer lu
                            </button>
                          ) : null}
                        </div>
                      )
                    })}
                </div>
              ) : null}
            </div>
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
