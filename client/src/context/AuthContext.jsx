import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('roomiq_user')
    const token  = localStorage.getItem('roomiq_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('roomiq_token', data.token)
    localStorage.setItem('roomiq_user',  JSON.stringify(data))
    setUser(data)
    return data
  }

  const register = async (name, email, password, phone, occupation, bkashNumber) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone, occupation, bkashNumber })
    localStorage.setItem('roomiq_token', data.token)
    localStorage.setItem('roomiq_user',  JSON.stringify(data))
    setUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('roomiq_token')
    localStorage.removeItem('roomiq_user')
    setUser(null)
  }

  const refreshUser = async () => {
    const { data } = await api.get('/auth/me')
    const updated = { ...data, token: localStorage.getItem('roomiq_token') }
    localStorage.setItem('roomiq_user', JSON.stringify(updated))
    setUser(updated)
    return updated
  }

  const updateHouse = (houseId) => {
    const updated = { ...user, currentHouse: houseId }
    localStorage.setItem('roomiq_user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, updateHouse }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
