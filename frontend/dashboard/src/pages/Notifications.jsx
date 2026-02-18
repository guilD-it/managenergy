import { useEffect, useMemo, useState } from 'react'
import {
  createAlert,
  createNotification,
  deleteAlert,
  deleteNotification,
  fetchAlerts,
  fetchNotifications,
  updateAlert,
} from '../api/energyApi.js'
import { useAuth } from '../contexts/AuthContext.jsx'

const emptyForm = {
  limit: '',
  status: 'active',
  message: '',
}

export default function Notifications() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [alertsData, notificationsData] = await Promise.all([
        fetchAlerts(),
        fetchNotifications(),
      ])
      setAlerts(alertsData || [])
      setNotifications(notificationsData || [])
    } catch (err) {
      setError(err.data?.detail || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const userNotifications = useMemo(() => {
    if (!user) return []
    return notifications.filter((n) => String(n.user) === String(user.id))
  }, [notifications, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = (alert) => {
    setEditingId(alert.id)
    setForm({
      limit: String(alert.limit),
      status: alert.status,
      message: alert.message,
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = {
      limit: Number(form.limit),
      status: form.status,
      message: form.message.trim(),
    }

    try {
      if (editingId) {
        await updateAlert(editingId, payload)
      } else {
        await createAlert(payload)
      }
      setForm(emptyForm)
      setEditingId(null)
      await loadData()
    } catch (err) {
      setError(err.data?.detail || err.message)
    }
  }

  const handleDeleteAlert = async (alertId) => {
    setError('')
    try {
      await deleteAlert(alertId)
      await loadData()
    } catch (err) {
      setError(err.data?.detail || err.message)
    }
  }

  const handleAttach = async (alertId) => {
    if (!user) return
    setError('')
    try {
      await createNotification({ user: user.id, alert: alertId })
      await loadData()
    } catch (err) {
      setError(err.data?.detail || err.message)
    }
  }

  const handleDetach = async (notificationId) => {
    setError('')
    try {
      await deleteNotification(notificationId)
      await loadData()
    } catch (err) {
      setError(err.data?.detail || err.message)
    }
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h1 className="h4 fw-bold">Notifications et alertes</h1>
        <p className="text-muted small mb-0">
          Configurez les seuils et activez les notifications.
        </p>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">
                {editingId ? 'Modifier une alerte' : 'Nouvelle alerte'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Seuil</label>
                  <input
                    type="number"
                    step="0.1"
                    name="limit"
                    className="form-control"
                    value={form.limit}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Statut</label>
                  <select
                    name="status"
                    className="form-select"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    name="message"
                    className="form-control"
                    rows="3"
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary flex-grow-1">
                    {editingId ? 'Mettre a jour' : 'Creer'}
                  </button>
                  {editingId ? (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleCancel}
                    >
                      Annuler
                    </button>
                  ) : null}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">Alertes disponibles</h2>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Message</th>
                      <th>Seuil</th>
                      <th>Statut</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert.id}>
                        <td>{alert.message}</td>
                        <td>{alert.limit}</td>
                        <td>{alert.status}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2 flex-wrap">
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleEdit(alert)}
                            >
                              Modifier
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAttach(alert.id)}
                            >
                              Activer
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteAlert(alert.id)}
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!alerts.length ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">
                          Aucune alerte configuree.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">Notifications actives</h2>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Alerte</th>
                      <th>Date</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userNotifications.map((notification) => {
                      const alert = alerts.find(
                        (entry) => entry.id === notification.alert
                      )
                      return (
                        <tr key={notification.id}>
                          <td>{alert?.message || 'Alerte inconnue'}</td>
                          <td>{new Date(notification.created_at).toLocaleDateString()}</td>
                          <td className="text-end">
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDetach(notification.id)}
                            >
                              Desactiver
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {!userNotifications.length ? (
                      <tr>
                        <td colSpan="3" className="text-center text-muted py-4">
                          Aucune notification active.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
