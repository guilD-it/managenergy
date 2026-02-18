import { createContext, useContext, useEffect, useMemo, useState } from 'react'
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
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const mapConsumption = (item) => ({
  id: item.id,
  date: toDateInput(item.date_consommation),
  energyType: item.category,
  quantity: Number(item.value ?? 0),
  cost: Number(item.price ?? 0),
})

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadData = async () => {
    if (!user) {
      setItems([])
      setCategories([])
      return
    }

    setLoading(true)
    setError('')
    try {
      const [categoriesData, consumptionsData] = await Promise.all([
        fetchCategories(),
        fetchConsumptions(),
      ])
      setCategories(categoriesData || [])
      setItems((consumptionsData || []).map(mapConsumption))
    } catch (err) {
      setError(err.data?.detail || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const addItem = async (payload) => {
    setError('')
    const apiPayload = {
      category: payload.energyType,
      value: payload.quantity,
      price: payload.cost,
      date_consommation: new Date(payload.date).toISOString(),
    }
    await createConsumption(apiPayload)
    await loadData()
  }

  const updateItem = async (id, payload) => {
    setError('')
    const apiPayload = {
      category: payload.energyType,
      value: payload.quantity,
      price: payload.cost,
      date_consommation: new Date(payload.date).toISOString(),
    }
    await updateConsumption(id, apiPayload)
    await loadData()
  }

  const deleteItem = async (id) => {
    setError('')
    await deleteConsumption(id)
    await loadData()
  }

  const value = useMemo(
    () => ({
      items,
      categories,
      loading,
      error,
      refresh: loadData,
      addItem,
      updateItem,
      deleteItem,
    }),
    [items, categories, loading, error]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
