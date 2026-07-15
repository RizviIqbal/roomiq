import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocketEvent, useSocket } from '../context/SocketContext'
import { Avatar, Button, Spinner, EmptyState } from '../components/ui'
import api from '../services/api'
import { ChevronLeft, Send, User } from 'lucide-react'

export default function ChatPage() {
  const { userId } = useParams() // The person we are chatting with
  const navigate = useNavigate()
  const { user } = useAuth()
  const socket = useSocket()
  
  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Initial load
  useEffect(() => {
    const loadChat = async () => {
      try {
        setLoading(true)
        // 1. Fetch user details (Assuming matching API or similar exposes it, or we could fetch user directly. Let's use a generic endpoint or mock if not available, but we need the name).
        // For simplicity, we just fetch chat history which shouldn't populate the other user by default unless modified, but let's assume we can at least get their name from messages or matching API.
        // Wait, the chat controller doesn't populate the other user. Let's fetch the other user via matching API or we can just show "Chat".
        const { data } = await api.get(`/chat/${userId}`)
        setMessages(data)
        
        // We join the chat room for ourselves via socket
        if (socket) socket.emit('join_chat', user._id)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
        scrollToBottom()
      }
    }
    loadChat()
  }, [userId, user._id])

  // Handle incoming real-time messages
  useSocketEvent('receive_message', useCallback((newMessage) => {
    // Only add if it belongs to this conversation
    if (
      (newMessage.sender === userId && newMessage.receiver === user._id) ||
      (newMessage.sender === user._id && newMessage.receiver === userId)
    ) {
      setMessages(prev => [...prev, newMessage])
      setTimeout(scrollToBottom, 100)
    }
  }, [userId, user._id]))

  const handleSend = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    const payload = {
      sender: user._id,
      receiver: userId,
      content: content.trim()
    }
    
    // Optimistic UI update could go here, but since the server emits back to the sender,
    // we rely on the socket to append our own message for a true "delivered" feel.
    if (socket) socket.emit('send_message', payload)
    setContent('')
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Spinner size={32} color="#8A2BE2" />
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-obsidian max-w-2xl mx-auto border-x border-glass-border shadow-2xl relative">
      {/* Premium Aurora Glow behind the chat */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[500px] bg-accent-purple/10 rounded-[100%] blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex items-center gap-4 p-6 border-b border-glass-border bg-glass backdrop-blur-xl z-10 sticky top-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-primary-muted hover:text-white transition-colors rounded-full hover:bg-white/10">
          <ChevronLeft size={24} />
        </button>
        <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple border border-accent-purple/30 shadow-[0_0_15px_rgba(138,43,226,0.3)]">
          <User size={20} />
        </div>
        <div>
          <h1 className="font-display font-medium text-[20px] text-white leading-none">Pre-Match Chat</h1>
          <p className="font-mono text-[10px] tracking-[0.1em] text-accent-purple mt-1 uppercase">Encrypted Connection</p>
        </div>
      </header>

      {/* Messages View */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar z-10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-accent-purple/10 flex items-center justify-center text-accent-purple mb-4 shadow-[0_0_30px_rgba(138,43,226,0.2)]">
              <User size={32} />
            </div>
            <h2 className="font-display text-[24px] text-white mb-2">Start the Conversation</h2>
            <p className="text-primary-muted max-w-xs">Ask questions about their lifestyle, habits, or anything else before making a match decision.</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender === user._id
            return (
              <div 
                key={msg._id || i} 
                className={`flex flex-col animate-fade-up ${isMe ? 'items-end' : 'items-start'}`}
                style={{ animationDelay: `${Math.min(i * 0.05, 0.5)}s` }}
              >
                <div 
                  className={`
                    max-w-[80%] px-5 py-3 
                    font-body text-[15px] leading-relaxed
                    shadow-lg backdrop-blur-md transition-all
                    ${isMe 
                      ? 'bg-accent-purple text-white rounded-[24px] rounded-br-[4px] shadow-[0_4px_20px_rgba(138,43,226,0.3)]' 
                      : 'bg-glass border border-glass-border text-primary rounded-[24px] rounded-bl-[4px]'}
                  `}
                >
                  {msg.content}
                </div>
                <span className="font-mono text-[9px] text-primary-muted mt-2 px-2 uppercase tracking-widest opacity-60">
                  {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-obsidian border-t border-glass-border z-10">
        <form onSubmit={handleSend} className="flex gap-2 bg-glass border border-glass-border rounded-full p-1 pl-6 focus-within:border-accent-purple/50 focus-within:bg-white/5 transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-white placeholder-primary-muted/50 font-body text-[15px] focus:outline-none"
          />
          <button 
            type="submit" 
            disabled={!content.trim()}
            className="w-12 h-12 rounded-full bg-accent-purple text-white flex items-center justify-center disabled:opacity-30 disabled:bg-glass disabled:text-primary-muted transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(138,43,226,0.4)] disabled:shadow-none"
          >
            <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
          </button>
        </form>
      </footer>
    </div>
  )
}
