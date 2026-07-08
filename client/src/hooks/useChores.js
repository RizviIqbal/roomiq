import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export const useChores = () => {
  const { user } = useAuth()
  const houseId  = user?.currentHouse?._id || user?.currentHouse

  const [house,   setHouse]   = useState(null)
  const [chores,  setChores]  = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!houseId) return
    setLoading(true)
    try {
      const [h, ch, hist] = await Promise.all([
        api.get(`/houses/${houseId}`),
        api.get(`/chores/house/${houseId}`),
        api.get(`/chores/house/${houseId}/history`),
      ])
      setHouse(h.data)
      setChores(ch.data)
      setHistory(hist.data)
    } finally {
      setLoading(false)
    }
  }, [houseId])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { houseId, house, chores, history, loading, refresh: fetchAll }
}
