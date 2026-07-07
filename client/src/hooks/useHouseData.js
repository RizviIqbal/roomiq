import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export const useHouseData = () => {
  const { user } = useAuth()
  const houseId  = user?.currentHouse?._id || user?.currentHouse

  const [house, setHouse] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchHouse = useCallback(async () => {
    if (!houseId) { setLoading(false); return }
    setLoading(true)
    try {
      const { data } = await api.get(`/houses/${houseId}`)
      setHouse(data)
    } finally {
      setLoading(false)
    }
  }, [houseId])

  useEffect(() => { fetchHouse() }, [fetchHouse])

  return { houseId, house, loading, refresh: fetchHouse }
}

export const useRules = (houseId) => {
  const [rules, setRules]     = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!houseId) { setLoading(false); return }
    setLoading(true)
    try {
      const { data } = await api.get(`/rules/house/${houseId}`)
      setRules(data)
    } finally {
      setLoading(false)
    }
  }, [houseId])

  useEffect(() => { fetch() }, [fetch])
  return { rules, loading, refresh: fetch }
}

export const useComplaints = (houseId) => {
  const [complaints, setComplaints] = useState([])
  const [offenders, setOffenders]   = useState([])
  const [loading, setLoading]       = useState(true)

  const fetch = useCallback(async () => {
    if (!houseId) { setLoading(false); return }
    setLoading(true)
    try {
      const [c, o] = await Promise.all([
        api.get(`/complaints/house/${houseId}`),
        api.get(`/complaints/house/${houseId}/offenders`),
      ])
      setComplaints(c.data)
      setOffenders(o.data)
    } finally {
      setLoading(false)
    }
  }, [houseId])

  useEffect(() => { fetch() }, [fetch])
  return { complaints, offenders, loading, refresh: fetch }
}

export const useMaintenance = (houseId) => {
  const [issues, setIssues]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!houseId) { setLoading(false); return }
    setLoading(true)
    try {
      const { data } = await api.get(`/maintenance/house/${houseId}`)
      setIssues(data)
    } finally {
      setLoading(false)
    }
  }, [houseId])

  useEffect(() => { fetch() }, [fetch])
  return { issues, loading, refresh: fetch }
}

export const useNotices = (houseId) => {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!houseId) { setLoading(false); return }
    setLoading(true)
    try {
      const { data } = await api.get(`/noticeboard/house/${houseId}`)
      setNotices(data)
    } finally {
      setLoading(false)
    }
  }, [houseId])

  useEffect(() => { fetch() }, [fetch])
  return { notices, loading, refresh: fetch }
}
