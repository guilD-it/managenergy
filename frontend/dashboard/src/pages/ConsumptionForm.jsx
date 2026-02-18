import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useData } from '../contexts/DataContext.jsx'

const buildEmptyForm = (defaultCategoryId) => ({
  date: '',
  energyType: defaultCategoryId || '',
  quantity: '',
  cost: '',
})

const getCategoryById = (categories, id) =>
  categories.find((category) => String(category.id) === String(id))

export default function ConsumptionForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, categories, loading, error, addItem, updateItem } = useData()

  const editingItem = useMemo(
    () => items.find((item) => String(item.id) === String(id)),
    [items, id]
  )

  // If we are on /ajouter, no existing item is expected.
  const isEditing = Boolean(id)

  const [form, setForm] = useState(() =>
    buildEmptyForm(categories[0]?.id)
  )
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (editingItem) {
      setForm({
        date: editingItem.date,
        energyType: editingItem.energyType,
        quantity: String(editingItem.quantity),
        cost: String(editingItem.cost),
      })
    } else if (!isEditing) {
      setForm(buildEmptyForm(categories[0]?.id))
    }
  }, [editingItem, isEditing, categories])

  const energy = getCategoryById(categories, form.energyType)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    const payload = {
      date: form.date,
      energyType: form.energyType,
      quantity: Number(form.quantity),
      cost: Number(form.cost),
    }

    try {
      if (isEditing && editingItem) {
        await updateItem(editingItem.id, payload)
      } else {
        await addItem(payload)
      }
      navigate('/consommations')
    } catch (err) {
      setSubmitError(err.message || "Erreur lors de l'enregistrement.")
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

  if (isEditing && !editingItem) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h2 className="h5 fw-bold">Consommation introuvable</h2>
            <p className="text-muted">Cet enregistrement n'existe pas.</p>
            <Link to="/consommations" className="btn btn-primary">
              Retour au tableau
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!categories.length) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h2 className="h5 fw-bold">Aucune energie disponible</h2>
            <p className="text-muted">
              Creez une categorie d'energie avant d'ajouter une consommation.
            </p>
            <Link to="/consommations" className="btn btn-primary">
              Retour
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                  <h1 className="h5 fw-bold mb-1">
                    {isEditing ? 'Modifier une consommation' : 'Ajouter une consommation'}
                  </h1>
                  <p className="text-muted small mb-0">
                    Renseignez l'energie, la quantite et le cout associe.
                  </p>
                </div>
                <Link to="/consommations" className="btn btn-outline">
                  Retour
                </Link>
              </div>

              {error ? <div className="alert alert-danger">{error}</div> : null}
              {submitError ? (
                <div className="alert alert-danger">{submitError}</div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    name="date"
                    className="form-control"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Type d'energie</label>
                  <select
                    name="energyType"
                    className="form-select"
                    value={form.energyType}
                    onChange={handleChange}
                    required
                  >
                    {categories.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Quantite</label>
                  <div className="input-group">
                    <input
                      type="number"
                      step="0.1"
                      name="quantity"
                      className="form-control"
                      value={form.quantity}
                      onChange={handleChange}
                      required
                    />
                    <span className="input-group-text">
                      {energy?.unit || ''}
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Cout (EUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cost"
                    className="form-control"
                    value={form.cost}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  {isEditing ? 'Mettre a jour' : 'Ajouter'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
