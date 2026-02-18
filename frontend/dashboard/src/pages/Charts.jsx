import { useEffect, useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { useData } from '../contexts/DataContext.jsx'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

const getCategoryById = (categories, id) =>
  categories.find((category) => String(category.id) === String(id))

export default function Charts() {
  const { items, categories, loading, error, loaded, refresh } = useData()
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    if (!loaded) {
      refresh()
    }
  }, [loaded, refresh])

  // Filter by energy type to keep units consistent in charts.
  const filteredItems = useMemo(() => {
    if (typeFilter === 'all') return items
    return items.filter((item) => item.energyType === typeFilter)
  }, [items, typeFilter])

  const labels = useMemo(() => filteredItems.map((i) => i.date), [filteredItems])
  const quantityData = useMemo(
    () => filteredItems.map((i) => i.quantity),
    [filteredItems]
  )
  const costData = useMemo(
    () => filteredItems.map((i) => i.cost),
    [filteredItems]
  )

  const energy =
    typeFilter === 'all' ? null : getCategoryById(categories, typeFilter)

  const barConfig = {
    labels,
    datasets: [
      {
        label: energy ? `Quantite (${energy.unit})` : 'Quantite',
        data: quantityData,
        backgroundColor: 'rgba(6, 182, 212, 0.7)',
        borderRadius: 6,
      },
    ],
  }

  const lineConfig = {
    labels,
    datasets: [
      {
        label: 'Cout EUR',
        data: costData,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.3,
        fill: true,
        pointRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
    },
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
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold">Graphiques</h1>
          <p className="text-muted small mb-0">
            Visualisez vos consommations et les couts associes.
          </p>
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
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">
                {energy ? `Quantite (${energy.unit})` : 'Quantite'}
              </h2>
              <Bar data={barConfig} options={options} />
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">Cout (EUR)</h2>
              <Line data={lineConfig} options={options} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
