import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../contexts/DataContext.jsx'

const getCategoryById = (categories, id) =>
  categories.find((category) => String(category.id) === String(id))

export default function Consumptions() {
  const { items, categories, loading, error, loaded, refresh, deleteItem } = useData()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    if (!loaded) {
      refresh()
    }
  }, [loaded, refresh])

  // Filtering is client-side for now (simple and fast for small datasets).
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => {
      const energy = getCategoryById(categories, item.energyType)
      const matchesType = typeFilter === 'all' || item.energyType === typeFilter
      const matchesQuery =
        !query ||
        energy?.name?.toLowerCase().includes(query) ||
        String(item.date).includes(query)
      return matchesType && matchesQuery
    })
  }, [items, categories, search, typeFilter])

  const totalCost = useMemo(
    () => filteredItems.reduce((acc, item) => acc + Number(item.cost || 0), 0),
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
            <div className="flex-grow-1">
              <label className="form-label">Recherche</label>
              <input
                type="text"
                className="form-control"
                placeholder="Date ou energie"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
            <div className="ms-auto">
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
                  <th>Date</th>
                  <th>Energie</th>
                  <th>Quantite</th>
                  <th>Cout (EUR)</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const energy = getCategoryById(categories, item.energyType)
                  return (
                    <tr key={item.id}>
                      <td>{item.date}</td>
                      <td>{energy?.name || '—'}</td>
                      <td>
                        {Number(item.quantity).toFixed(1)} {energy?.unit || ''}
                      </td>
                      <td>{Number(item.cost).toFixed(2)}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2 flex-wrap">
                          <Link
                            className="btn btn-outline btn-sm"
                            to={`/consommations/${item.id}/modifier`}
                          >
                            Modifier
                          </Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteItem(item.id)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!filteredItems.length ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
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
