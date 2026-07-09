import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export const useFinance = () => {
  const { user } = useAuth()
  const houseId  = user?.currentHouse?._id || user?.currentHouse

  const [expenses,  setExpenses]  = useState([])
  const [balances,  setBalances]  = useState([])
  const [house,     setHouse]     = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [page,      setPage]      = useState(1)
  const [pages,     setPages]     = useState(1)
  const [category,  setCategory]  = useState('')

  const fetchExpenses = useCallback(async (pg = 1, cat = '') => {
    if (!houseId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: pg, limit: 10 })
      if (cat) params.set('category', cat)
      const { data } = await api.get(`/expenses/house/${houseId}?${params}`)
      setExpenses(data.expenses)
      setPages(data.pages)
      setPage(pg)
    } finally {
      setLoading(false)
    }
  }, [houseId])

  const fetchBalances = useCallback(async () => {
    if (!houseId) return
    const { data } = await api.get(`/expenses/house/${houseId}/balances`)
    setBalances(data)
  }, [houseId])

  const fetchHouse = useCallback(async () => {
    if (!houseId) return
    const { data } = await api.get(`/houses/${houseId}`)
    setHouse(data)
  }, [houseId])

  useEffect(() => {
    if (!houseId) { setLoading(false); return }
    Promise.all([fetchHouse(), fetchExpenses(1, category), fetchBalances()])
  }, [houseId])

  const refresh = () => {
    fetchExpenses(page, category)
    fetchBalances()
  }

  return {
    houseId, house, expenses, balances, loading,
    page, pages, category,
    setCategory: (cat) => { setCategory(cat); fetchExpenses(1, cat) },
    goToPage: (pg) => fetchExpenses(pg, category),
    refresh,
  }
}
