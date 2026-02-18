import { createContext, useContext, useMemo, useState } from 'react'
import {
  createConsumption,
  deleteConsumption,
  fetchCategories,
  fetchConsumptions,
  updateConsumption,
} from '../api/energyApi.js'
import { useAuth } from './AuthContext.jsx'

const DataContext = createContext(null)

const toDateInput = (dateValue) => {
  if (!dateValue) return ''
  // Preserve server calendar day (YYYY-MM-DD) without timezone conversion.
  if (typeof dateValue === 'string' && dateValue.length >= 10) {
    const candidate = dateValue.slice(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return candidate
  }
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`
}

// Keep frontend model aligned with API payload shape.
const mapConsumption = (item) => ({
  id: item.id,
  date: toDateInput(item.date_consommation),
  energyType: item.category,
  quantity: Number(item.value ?? 0),
  unitPrice: Number(item.unit_price ?? 0),
})

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  const loadData = async (force = false) => {
    if (!user) {
      setItems([])
      setCategories([])
      setLoaded(false)
      return
    }
    if (loading) return
    // Avoid duplicate calls unless an explicit refresh is requested after CRUD.
    if (loaded && !force) return

    setLoading(true)
    setError('')
    try {
      const [categoriesData, consumptionsData] = await Promise.all([
        fetchCategories(),
        fetchConsumptions(),
      ])
      setCategories(categoriesData || [])
      setItems((consumptionsData || []).map(mapConsumption))
      setLoaded(true)
    } catch (err) {
      setError(err.data?.detail || err.message)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (payload) => {
    setError('')
    const apiPayload = {
      category: payload.energyType,
      value: payload.quantity,
      unit_price: payload.unitPrice,
      date_consommation: new Date(payload.date).toISOString(),
    }
    await createConsumption(apiPayload)
    await loadData(true)
  }

  const updateItem = async (id, payload) => {
    setError('')
    const apiPayload = {
      category: payload.energyType,
      value: payload.quantity,
      unit_price: payload.unitPrice,
      date_consommation: new Date(payload.date).toISOString(),
    }
    await updateConsumption(id, apiPayload)
    await loadData(true)
  }

  const deleteItem = async (id) => {
    setError('')
    await deleteConsumption(id)
    await loadData(true)
  }

  const value = useMemo(
    () => ({
      items,
      categories,
      loading,
      error,
      loaded,
      refresh: loadData,
      addItem,
      updateItem,
      deleteItem,
    }),
    [items, categories, loading, error, loaded]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
