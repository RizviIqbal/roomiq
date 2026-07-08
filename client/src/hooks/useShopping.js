import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export const useShopping = () => {
  const { user } = useAuth()
  const houseId  = user?.currentHouse?._id || user?.currentHouse

  const [house,     setHouse]     = useState(null)
  const [list,      setList]      = useState([])
  const [inventory, setInventory] = useState([])
  const [loading,   setLoading]   = useState(true)

  const fetchAll = useCallback(async () => {
    if (!houseId) return
    setLoading(true)
    try {
      const [h, l, inv] = await Promise.all([
        api.get(`/houses/${houseId}`),
        api.get(`/shopping/list/${houseId}`),
        api.get(`/shopping/inventory/${houseId}`),
      ])
      setHouse(h.data)
      setList(l.data)
      setInventory(inv.data)
    } finally {
      setLoading(false)
    }
  }, [houseId])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { houseId, house, list, inventory, loading, refresh: fetchAll }
}
