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
import { formatDateFR } from '../utils/formatDate.js'

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
  const [groupBy, setGroupBy] = useState('day')
  const [selectedMonth, setSelectedMonth] = useState('')

  useEffect(() => {
    if (!loaded) {
      refresh()
    }
  }, [loaded, refresh])

  const toDate = (value) => {
    if (!value) return null
    const parsed = new Date(`${value}T00:00:00`)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed
  }

  const formatDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`
  const formatMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-')
    const date = new Date(Number(year), Number(month) - 1, 1)
    // Keep month label readable for users while preserving YYYY-MM keys internally.
    const label = date.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    })
    return label.charAt(0).toUpperCase() + label.slice(1)
  }
  const formatPeriodLabel = (key) =>
    groupBy === 'month' ? formatMonthLabel(key) : formatDateFR(key)

  const currentMonthStart = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }, [])

  const currentWindowItems = useMemo(
    () =>
      items.filter((item) => {
        const date = toDate(item.date)
        return date ? date >= currentMonthStart : false
      }),
    [items, currentMonthStart]
  )

  const monthOptions = useMemo(() => {
    const months = new Set()
    currentWindowItems.forEach((item) => {
      const date = toDate(item.date)
      if (!date) return
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      months.add(key)
    })
    return Array.from(months).sort()
  }, [currentWindowItems])

  useEffect(() => {
    // Default to the latest available month when daily view is selected.
    if (!selectedMonth && monthOptions.length) {
      setSelectedMonth(monthOptions[monthOptions.length - 1])
    }
  }, [monthOptions, selectedMonth])

  const getPeriodKey = (date) => {
    if (groupBy === 'month') {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }
    return formatDateKey(date)
  }

  const buildSeries = (source) => {
    const map = new Map()
    source.forEach((item) => {
      const date = toDate(item.date)
      if (!date) return
      const key = getPeriodKey(date)
      map.set(key, (map.get(key) || 0) + Number(item.value || item.quantity || 0))
    })
    const labels = Array.from(map.keys()).sort()
    const values = labels.map((label) => map.get(label) || 0)
    return { labels, values }
  }

  const buildCostSeries = (source) => {
    const map = new Map()
    source.forEach((item) => {
      const date = toDate(item.date)
      if (!date) return
      const key = getPeriodKey(date)
      const total =
        Number(item.quantity || 0) * Number(item.unitPrice || 0)
      map.set(key, (map.get(key) || 0) + total)
    })
    const labels = Array.from(map.keys()).sort()
    const values = labels.map((label) => map.get(label) || 0)
    return { labels, values }
  }

  // Date scope is shared by all charts. Type filter is applied after this step.
  const dateScopedItems = useMemo(() => {
    let data = currentWindowItems
    if (groupBy === 'day' && selectedMonth) {
      data = data.filter((item) => {
        const date = toDate(item.date)
        if (!date) return false
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        return key === selectedMonth
      })
    }
    return data
  }, [currentWindowItems, groupBy, selectedMonth])

  const filteredItems = useMemo(() => {
    if (typeFilter === 'all') return dateScopedItems
    return dateScopedItems.filter(
      (item) => String(item.energyType) === String(typeFilter)
    )
  }, [dateScopedItems, typeFilter])

  const energy =
    typeFilter === 'all' ? null : getCategoryById(categories, typeFilter)

  const palette = [
    'rgba(6, 182, 212, 0.7)',
    'rgba(59, 130, 246, 0.7)',
    'rgba(16, 185, 129, 0.7)',
    'rgba(234, 179, 8, 0.7)',
  ]

  const quantityCharts = useMemo(() => {
    if (typeFilter !== 'all') {
      const series = buildSeries(filteredItems)
      return [
        {
          title: energy ? `Quantite (${energy.unit})` : 'Quantite',
          labels: series.labels.map(formatPeriodLabel),
          datasets: [
            {
              label: energy ? `Quantite (${energy.unit})` : 'Quantite',
              data: series.values,
              backgroundColor: 'rgba(6, 182, 212, 0.7)',
              borderRadius: 6,
            },
          ],
        },
      ]
    }

    // In "all categories" mode, render one chart per category.
    return categories.map((category, index) => {
      const categoryItems = dateScopedItems.filter(
        (item) => String(item.energyType) === String(category.id)
      )
      const series = buildSeries(categoryItems)
      return {
        title: `${category.name} (${category.unit})`,
        labels: series.labels.map(formatPeriodLabel),
        datasets: [
          {
            label: `${category.name} (${category.unit})`,
            data: series.values,
            backgroundColor: palette[index % palette.length],
            borderRadius: 6,
          },
        ],
      }
    })
  }, [typeFilter, filteredItems, dateScopedItems, categories, energy, groupBy])

  const costSeries = useMemo(() => buildCostSeries(filteredItems), [
    filteredItems,
    groupBy,
  ])

  const lineConfig = {
    labels: costSeries.labels.map(formatPeriodLabel),
    datasets: [
      {
        label: 'Cout EUR',
        data: costSeries.values,
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
      <div className="mb-3">
        <div>
          <h1 className="h4 fw-bold">Graphiques</h1>
          <p className="text-muted small mb-0">
            Visualisez vos consommations et les couts associes.
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-3 align-items-end">
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
            <div>
              <div className="btn-group" role="group" aria-label="Periode">
                <button
                  type="button"
                  className={`btn btn-sm ${
                    groupBy === 'day' ? 'btn-primary' : 'btn-outline'
                  }`}
                  onClick={() => setGroupBy('day')}
                >
                  Jour
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${
                    groupBy === 'month' ? 'btn-primary' : 'btn-outline'
                  }`}
                  onClick={() => setGroupBy('month')}
                >
                  Mois
                </button>
              </div>
            </div>
            {groupBy === 'day' ? (
              <div>
                <select
                  className="form-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {formatMonthLabel(month)}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-4">
        {quantityCharts.map((chart) => (
          <div key={chart.title} className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h2 className="h6 fw-bold mb-3">{chart.title}</h2>
                <Bar data={chart} options={options} />
              </div>
            </div>
          </div>
        ))}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">Cout global (EUR)</h2>
              <Line data={lineConfig} options={options} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
