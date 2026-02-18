import { useEffect, useMemo, useState } from 'react'
import {
  createAlert,
  createNotification,
  deleteAlert,
  fetchAlerts,
  updateAlert,
} from '../api/energyApi.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useData } from '../contexts/DataContext.jsx'

const emptyForm = {
  category: '',
  limit: '',
  status: 'active',
  message: '',
}

export default function Notifications() {
  const { user } = useAuth()
  const { categories, loaded: dataLoaded, refresh } = useData()
  const [alerts, setAlerts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [alertsLoaded, setAlertsLoaded] = useState(false)

  const loadData = async () => {
    if (!user) {
      setAlerts([])
      setAlertsLoaded(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const alertsData = await fetchAlerts()
      setAlerts(alertsData || [])
      setAlertsLoaded(true)
    } catch (err) {
      setError(err.data?.detail || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!dataLoaded) {
      refresh()
    }
    if (!alertsLoaded) {
      loadData()
    }
  }, [dataLoaded, alertsLoaded, user])

  const filteredAlerts = useMemo(() => {
    if (categoryFilter === 'all') return alerts
    return alerts.filter(
      (alert) => String(alert.category) === String(categoryFilter)
    )
  }, [alerts, categoryFilter])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = (alert) => {
    setEditingId(alert.id)
    setForm({
      category: alert.category,
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
      category: form.category,
      limit: Number(form.limit),
      status: form.status,
      message: form.message.trim(),
    }

    try {
      if (editingId) {
        await updateAlert(editingId, payload)
      } else {
        const created = await createAlert(payload)
        // Auto-attach the new alert for the current user.
        if (created?.id) {
          await createNotification({ alert: created.id })
        }
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
      await createNotification({ alert: alertId })
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
        <h1 className="h4 fw-bold">Alertes</h1>
        <p className="text-muted small mb-0">
          Configurez les seuils par categorie.
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
                  <label className="form-label">Categorie</label>
                  <select
                    name="category"
                    className="form-select"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selectionner</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.unit})
                      </option>
                    ))}
                  </select>
                </div>
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
              <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
                <h2 className="h6 fw-bold mb-0">Alertes disponibles</h2>
                <div>
                  <label className="form-label">Filtrer par categorie</label>
                  <select
                    className="form-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">Toutes</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.unit})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Categorie</th>
                      <th>Message</th>
                      <th>Seuil</th>
                      <th>Statut</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.map((alert) => (
                      <tr key={alert.id}>
                        <td>
                          {categories.find(
                            (category) =>
                              String(category.id) === String(alert.category)
                          )?.name || '—'}
                        </td>
                        <td>{alert.message}</td>
                        <td>{alert.limit}</td>
                        <td>{alert.status}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2 flex-wrap">
                            <button
                              className="btn btn-outline btn-sm icon-btn"
                              onClick={() => handleEdit(alert)}
                              title="Modifier"
                              aria-label="Modifier"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-pencil-square"
                                viewBox="0 0 16 16"
                                aria-hidden="true"
                              >
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2 1.042-1.042a.5.5 0 0 1 .707 0z" />
                                <path d="M13.752 4.396 11.104 1.75 4.439 8.414a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12z" />
                                <path
                                  fillRule="evenodd"
                                  d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                />
                              </svg>
                            </button>
                            <button
                              className="btn btn-primary btn-sm icon-btn"
                              onClick={() => handleAttach(alert.id)}
                              title="Activer"
                              aria-label="Activer"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-bell"
                                viewBox="0 0 16 16"
                                aria-hidden="true"
                              >
                                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2" />
                                <path
                                  fillRule="evenodd"
                                  d="M8 1.918a1 1 0 0 1 .9.55l.35.7A5 5 0 0 1 13 8c0 1.098.5 2.089 1.294 2.744.123.101.206.255.206.426A.83.83 0 0 1 13.67 12H2.33a.83.83 0 0 1-.83-.83c0-.17.083-.325.206-.426A3.5 3.5 0 0 0 3 8a5 5 0 0 1 3.75-4.832l.35-.7a1 1 0 0 1 .9-.55"
                                />
                              </svg>
                            </button>
                            <button
                              className="btn btn-danger btn-sm icon-btn"
                              onClick={() => handleDeleteAlert(alert.id)}
                              title="Supprimer"
                              aria-label="Supprimer"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-trash"
                                viewBox="0 0 16 16"
                                aria-hidden="true"
                              >
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0A.5.5 0 0 1 8.5 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!alerts.length ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          Aucune alerte configuree.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Notifications actives are now handled in the header dropdown */}
        </div>
      </div>
    </div>
  )
}
