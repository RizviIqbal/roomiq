import { io } from 'socket.io-client'

let socket = null

export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || '/', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}
