import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../contexts/DataContext.jsx'
import { formatDateFR } from '../utils/formatDate.js'

const getCategoryById = (categories, id) =>
  categories.find((category) => String(category.id) === String(id))

export default function Consumptions() {
  const { items, categories, loading, error, loaded, refresh, deleteItem } = useData()
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    if (!loaded) {
      refresh()
    }
  }, [loaded, refresh])

  // Filtering is client-side for now (simple and fast for small datasets).
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType =
        typeFilter === 'all' ||
        String(item.energyType) === String(typeFilter)
      return matchesType
    })
  }, [items, typeFilter])

  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems]
    sorted.sort((a, b) => {
      let left = a
      let right = b
      if (sortBy === 'date') {
        left = new Date(a.date)
        right = new Date(b.date)
      } else if (sortBy === 'quantity') {
        left = Number(a.quantity || 0)
        right = Number(b.quantity || 0)
      } else if (sortBy === 'unitPrice') {
        left = Number(a.unitPrice || 0)
        right = Number(b.unitPrice || 0)
      } else if (sortBy === 'total') {
        left = Number(a.quantity || 0) * Number(a.unitPrice || 0)
        right = Number(b.quantity || 0) * Number(b.unitPrice || 0)
      }

      if (left < right) return sortDir === 'asc' ? -1 : 1
      if (left > right) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredItems, sortBy, sortDir])

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDir('desc')
    }
  }

  const totalCost = useMemo(
    () =>
      filteredItems.reduce(
        (acc, item) =>
          acc + Number(item.quantity || 0) * Number(item.unitPrice || 0),
        0
      ),
    [filteredItems]
  )

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
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h1 className="h4 fw-bold">Tableau des consommations</h1>
          <p className="text-muted small mb-0">
            Ajoutez, modifiez et supprimez des enregistrements.
          </p>
        </div>
        <div className="d-flex gap-3 flex-wrap">
          <div className="stat-card">
            <div className="stat-label">Enregistrements</div>
            <div className="stat-value">{filteredItems.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total EUR</div>
            <div className="stat-value">{totalCost.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="filter-bar d-flex flex-wrap gap-3 align-items-end">
            <div>
              <label className="form-label">Type d'energie</label>
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Toutes</option>
                {categories.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-action">
              <Link to="/consommations/ajouter" className="btn btn-primary">
                Ajouter
              </Link>
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="table-sort"
                      onClick={() => handleSort('date')}
                    >
                      Date
                    </button>
                  </th>
                  <th>Energie</th>
                  <th>
                    <button
                      type="button"
                      className="table-sort"
                      onClick={() => handleSort('quantity')}
                    >
                      Quantite
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="table-sort"
                      onClick={() => handleSort('unitPrice')}
                    >
                      Prix unitaire
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="table-sort"
                      onClick={() => handleSort('total')}
                    >
                      Cout (EUR)
                    </button>
                  </th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                    {sortedItems.map((item) => {
                      const energy = getCategoryById(categories, item.energyType)
                      const total =
                        Number(item.quantity || 0) * Number(item.unitPrice || 0)
                      return (
                        <tr key={item.id}>
                      <td>{formatDateFR(item.date)}</td>
                      <td>{energy?.name || '—'}</td>
                      <td>
                        {Number(item.quantity).toFixed(1)} {energy?.unit || ''}
                      </td>
                      <td>{Number(item.unitPrice || 0).toFixed(4)}</td>
                      <td>{total.toFixed(2)}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2 flex-wrap">
                          <Link
                            className="btn btn-outline btn-sm icon-btn"
                            to={`/consommations/${item.id}/modifier`}
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
                          </Link>
                          <button
                            className="btn btn-danger btn-sm icon-btn"
                            onClick={() => deleteItem(item.id)}
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
                  )
                })}
                {!filteredItems.length ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      Aucun enregistrement.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
