import { createContext, useContext, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import { getSocket } from '../services/socket'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const houseId  = user?.currentHouse?._id || user?.currentHouse
  const socketRef = useRef(getSocket())

  useEffect(() => {
    const socket = socketRef.current
    if (!user) {
      socket.disconnect()
      return
    }

    if (!socket.connected) socket.connect()

    if (houseId) {
      socket.emit('join_house', houseId)
    }

    return () => {
      if (houseId) socket.emit('leave_house', houseId)
    }
  }, [user, houseId])

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)

/**
 * Subscribe to a socket event for the lifetime of the component.
 * Automatically cleans up on unmount or when deps change.
 *
 * @param {string} event - event name
 * @param {function} handler - callback(data)
 */
export const useSocketEvent = (event, handler) => {
  const socket = useSocket()

  useEffect(() => {
    if (!socket || !event || !handler) return
    socket.on(event, handler)
    return () => socket.off(event, handler)
  }, [socket, event, handler])
}
