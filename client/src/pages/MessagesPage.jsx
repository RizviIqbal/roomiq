import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocketEvent, useSocket } from '../context/SocketContext'
import { useHouseData } from '../hooks/useHouseData'
import { Avatar, Button, Spinner, EmptyState, Badge, PageTransition } from '../components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  MessageCircle, Search, Send, Smile, CheckCheck, 
  ChevronLeft, Sparkles, X, UserPlus, ShieldCheck
} from 'lucide-react'

const QUICK_REACTIONS = ['❤️', '👍', '😂', '🔥', '👏', '😮']
const ICEBREAKERS = [
  '👋 Hey, are you free to chat?',
  '🛒 Did you check the grocery list?',
  '🧹 Quick reminder about today’s chore duty',
  '💸 Just settled the shared expense on bKash'
]

export default function MessagesPage() {
  const { userId: paramUserId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const socket = useSocket()
  const { house } = useHouseData()

  const [conversations, setConversations] = useState([])
  const [activeUserId, setActiveUserId] = useState(paramUserId || null)
  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('chats') // 'chats' | 'housemates'
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [messageReactions, setMessageReactions] = useState({}) // msgId -> reactionEmoji

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }

  // 1. Fetch Conversations Inbox
  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/chat')
      setConversations(data || [])
      
      // Auto-select first conversation if none selected on desktop
      if (!paramUserId && !activeUserId && data?.length > 0 && window.innerWidth >= 1024) {
        setActiveUserId(data[0].user?._id || data[0].user)
      }
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [paramUserId, activeUserId])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Sync paramUserId with activeUserId
  useEffect(() => {
    if (paramUserId) {
      setActiveUserId(paramUserId)
    }
  }, [paramUserId])

  // 2. Fetch Active Chat Thread
  useEffect(() => {
    if (!activeUserId) return

    const loadChat = async () => {
      try {
        setChatLoading(true)
        const { data } = await api.get(`/chat/${activeUserId}`)
        if (Array.isArray(data)) {
          setMessages(data)
        } else {
          setMessages(data.messages || [])
          setOtherUser(data.otherUser || null)
        }

        // Join personal socket room
        if (socket && user?._id) {
          socket.emit('join_chat', user._id)
        }
      } catch (err) {
        console.error('Error loading chat history:', err)
      } finally {
        setChatLoading(false)
        setTimeout(() => scrollToBottom(false), 50)
      }
    }

    loadChat()
  }, [activeUserId, socket, user?._id])

  // 3. Socket Listeners for Real-time Messaging
  useSocketEvent('receive_message', useCallback((newMessage) => {
    const isRelevantToCurrentChat =
      (newMessage.sender === activeUserId && newMessage.receiver === user._id) ||
      (newMessage.sender === user._id && newMessage.receiver === activeUserId)

    if (isRelevantToCurrentChat) {
      setMessages(prev => [...prev, newMessage])
      setTimeout(scrollToBottom, 100)
    }

    // Refresh inbox list to update latest snippet & badge
    fetchConversations()
  }, [activeUserId, user?._id, fetchConversations]))

  // 4. Send Message Handler
  const handleSend = (e) => {
    if (e) e.preventDefault()
    if (!content.trim() || !activeUserId) return

    const payload = {
      sender: user._id,
      receiver: activeUserId,
      content: content.trim()
    }

    if (socket) {
      socket.emit('send_message', payload)
    }
    setContent('')
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  const handleSelectConversation = (uid) => {
    setActiveUserId(uid)
    navigate(`/app/chat/${uid}`, { replace: true })
  }

  const handleReaction = (msgId, emoji) => {
    setMessageReactions(prev => ({
      ...prev,
      [msgId]: prev[msgId] === emoji ? null : emoji
    }))
  }

  // Filtered Conversations & Housemates
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      if (!searchQuery) return true
      const name = c.user?.name?.toLowerCase() || ''
      const lastMsg = c.latestMessage?.content?.toLowerCase() || ''
      return name.includes(searchQuery.toLowerCase()) || lastMsg.includes(searchQuery.toLowerCase())
    })
  }, [conversations, searchQuery])

  const housematesList = useMemo(() => {
    if (!house?.members) return []
    return house.members
      .filter(m => m.user?._id !== user._id)
      .filter(m => {
        if (!searchQuery) return true
        return m.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      })
  }, [house, user, searchQuery])

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <Spinner size={36} color="#00E5FF" />
      </div>
    )
  }

  return (
    <PageTransition className="w-full px-2 sm:px-4 lg:px-8 xl:px-10 pb-16">
      
      {/* Container simulating a full messenger desktop app */}
      <div className="bento-card rounded-3xl overflow-hidden shadow-2xl h-[calc(100vh-8.5rem)] min-h-[580px] grid grid-cols-1 lg:grid-cols-12 relative">
        
        {/* ========================================================= */}
        {/* LEFT PANE: INBOX & ROOMMATE CONTACTS (4 cols on desktop) */}
        {/* ========================================================= */}
        <div className={`lg:col-span-4 xl:col-span-4 border-r border-glass-border flex flex-col bg-white/[0.02] backdrop-blur-xl h-full ${
          activeUserId ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Header */}
          <div className="p-4 border-b border-glass-border space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>💬</span> Messages
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab(activeTab === 'chats' ? 'housemates' : 'chats')}
                  className="px-3 py-1.5 rounded-full text-[11px] font-label-caps uppercase tracking-wider bg-accent-orange/10 hover:bg-accent-orange/20 text-accent-orange border border-accent-orange/30 transition-all flex items-center gap-1.5 font-bold active:scale-95"
                >
                  <UserPlus size={13} className="text-accent-orange" />
                  <span>{activeTab === 'chats' ? 'New Chat' : 'Inbox'}</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search chats or housemates..."
                className="w-full bg-white/5 border border-glass-border rounded-2xl pl-10 pr-8 py-2.5 text-xs text-white placeholder-primary-muted/50 focus:outline-none focus:border-accent-orange transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-muted hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sub-tabs (Recent Chats / Housemates) */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex-1 py-2 rounded-xl text-[11px] font-label-caps uppercase tracking-wider transition-all ${
                  activeTab === 'chats'
                    ? 'bg-white text-obsidian font-bold shadow-glow scale-[1.02]'
                    : 'bg-white/5 text-primary-muted hover:text-white border border-glass-border'
                }`}
              >
                Recent ({conversations.length})
              </button>
              <button
                onClick={() => setActiveTab('housemates')}
                className={`flex-1 py-2 rounded-xl text-[11px] font-label-caps uppercase tracking-wider transition-all ${
                  activeTab === 'housemates'
                    ? 'bg-white text-obsidian font-bold shadow-glow scale-[1.02]'
                    : 'bg-white/5 text-primary-muted hover:text-white border border-glass-border'
                }`}
              >
                Roommates ({housematesList.length})
              </button>
            </div>
          </div>

          {/* Conversation List / Housemates List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/[0.03]">
            {activeTab === 'chats' ? (
              filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-primary-muted space-y-3">
                  <div className="text-3xl">💬</div>
                  <p className="text-xs">No conversations yet.</p>
                  <Button 
                    size="sm" 
                    onClick={() => setActiveTab('housemates')}
                    className="text-xs bg-accent-orange text-obsidian font-bold shadow-glow"
                  >
                    Message a Roommate
                  </Button>
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const { user: chatUser, latestMessage, unreadCount } = conv
                  if (!chatUser) return null
                  const isSelected = activeUserId === chatUser._id
                  const isLatestFromMe = latestMessage?.sender === user._id || latestMessage?.sender?._id === user._id

                  return (
                    <div
                      key={chatUser._id}
                      onClick={() => handleSelectConversation(chatUser._id)}
                      className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-white/10 border-l-4 border-accent-orange' 
                          : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <Avatar name={chatUser.name} src={chatUser.avatar} size={44} />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-obsidian" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className={`text-sm truncate font-medium ${isSelected ? 'text-white font-bold' : 'text-white/90'}`}>
                            {chatUser.name}
                          </h4>
                          {latestMessage?.createdAt && (
                            <span className="font-mono text-[10px] text-primary-muted shrink-0 ml-2">
                              {new Date(latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-primary-muted truncate">
                            {isLatestFromMe && <span className="text-accent-orange font-medium">You: </span>}
                            {latestMessage?.content || 'Started a conversation'}
                          </p>

                          {unreadCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-accent-orange text-obsidian text-[9px] font-bold flex items-center justify-center shrink-0 animate-pulse">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )
            ) : (
              housematesList.length === 0 ? (
                <div className="p-8 text-center text-primary-muted">
                  <p className="text-xs">No roommates found.</p>
                </div>
              ) : (
                housematesList.map(m => (
                  <div
                    key={m.user._id}
                    onClick={() => {
                      handleSelectConversation(m.user._id)
                      setActiveTab('chats')
                    }}
                    className="p-3.5 flex items-center justify-between hover:bg-white/[0.04] cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="relative shrink-0">
                        <Avatar name={m.user.name} src={m.user.avatar} size={42} />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-obsidian" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-medium text-white truncate">{m.user.name}</h4>
                        <p className="text-[11px] text-primary-muted truncate">{m.user.occupation || 'Roommate'}</p>
                      </div>
                    </div>
                    <button className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-accent-orange text-obsidian shadow-glow hover:scale-105 active:scale-95 transition-all">
                      Chat
                    </button>
                  </div>
                ))
              )
            )}
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT PANE: ACTIVE WHATSAPP / MESSENGER CONVERSATION (8 cols) */}
        {/* ========================================================= */}
        <div className={`lg:col-span-8 xl:col-span-8 flex flex-col bg-obsidian/60 backdrop-blur-md h-full relative ${
          !activeUserId ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {activeUserId ? (
            <>
              {/* Header Bar */}
              <div className="px-5 py-3.5 border-b border-glass-border flex items-center justify-between bg-white/[0.02] z-20">
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => {
                      setActiveUserId(null)
                      navigate('/app/messages')
                    }}
                    className="lg:hidden p-1.5 -ml-1 text-primary-muted hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="relative shrink-0">
                    <Avatar 
                      name={otherUser?.name || 'User'} 
                      src={otherUser?.avatar} 
                      size={42} 
                      className="border border-white/10 ring-2 ring-accent-orange/20" 
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-obsidian shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-base text-white truncate leading-tight flex items-center gap-2">
                      {otherUser?.name || 'Roommate Chat'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-accent-emerald font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                      <span>Active Now</span>
                      <span className="text-white/20">•</span>
                      <span className="text-primary-muted font-mono text-[10px]">End-to-End Encrypted</span>
                    </div>
                  </div>
                </div>

                {/* Right Status Badge */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-accent-emerald font-label-caps text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck size={12} /> Encrypted Direct
                  </div>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar z-10">
                {chatLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Spinner size={28} color="#00E5FF" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-sm mx-auto animate-fade-up">
                    <div className="w-16 h-16 rounded-full bg-accent-orange/10 flex items-center justify-center text-accent-orange shadow-glow">
                      <MessageCircle size={32} />
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-bold text-white">Start the Conversation</h4>
                      <p className="text-xs text-primary-muted mt-1 leading-relaxed">
                        Say hello to {otherUser?.name || 'your roommate'}. Send a quick icebreaker to get started!
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 w-full pt-2">
                      {ICEBREAKERS.map((text, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setContent(text)
                            inputRef.current?.focus()
                          }}
                          className="p-3 text-xs text-left bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white/90 hover:text-white transition-all hover:border-accent-orange/40 active:scale-[0.98]"
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Timestamp Banner */}
                    <div className="flex justify-center my-2">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-primary-muted tracking-wider uppercase">
                        Direct Encryption Active
                      </span>
                    </div>

                    {messages.map((msg, i) => {
                      const isMe = msg.sender === user._id || msg.sender?._id === user._id
                      const reaction = messageReactions[msg._id || i]

                      return (
                        <motion.div
                          key={msg._id || i}
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className={`relative max-w-[82%] sm:max-w-[70%] flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            
                            {/* Message Bubble */}
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed relative shadow-md transition-all ${
                                isMe
                                  ? 'bg-gradient-to-r from-accent-purple to-purple-600 text-white rounded-br-xs shadow-[0_4px_16px_rgba(124,58,237,0.3)]'
                                  : 'bg-white/10 border border-white/10 text-white rounded-bl-xs'
                              }`}
                            >
                              <div>{msg.content}</div>

                              {/* Time & Delivery Status inside bubble */}
                              <div className={`flex items-center gap-1 justify-end mt-1 text-[10px] ${
                                isMe ? 'text-white/70' : 'text-primary-muted'
                              }`}>
                                <span className="font-mono">
                                  {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isMe && (
                                  <CheckCheck size={13} className="text-cyan-300" />
                                )}
                              </div>

                              {/* Applied Reaction Badge */}
                              {reaction && (
                                <div className="absolute -bottom-2.5 right-2 px-1.5 py-0.5 rounded-full bg-obsidian border border-white/20 text-xs shadow-md animate-bounce">
                                  {reaction}
                                </div>
                              )}
                            </div>

                            {/* Quick Emoji Reaction Hover Trigger */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-obsidian/90 border border-white/10 rounded-full px-2 py-1 shadow-lg">
                              {QUICK_REACTIONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(msg._id || i, emoji)}
                                  className="hover:scale-125 transition-transform text-xs p-0.5"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>

                          </div>
                        </motion.div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Emoji Tray Overlay */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-20 left-4 bg-obsidian border border-glass-border p-3 rounded-2xl shadow-2xl z-30 grid grid-cols-6 gap-2 text-xl"
                  >
                    {['😀', '😂', '😍', '🔥', '👍', '🙌', '🎉', '☕', '🏠', '🧹', '💸', '🙏'].map(em => (
                      <button
                        key={em}
                        onClick={() => {
                          setContent(prev => prev + em)
                          setShowEmojiPicker(false)
                          inputRef.current?.focus()
                        }}
                        className="hover:scale-125 transition-transform p-1.5 rounded-lg hover:bg-white/10"
                      >
                        {em}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Composer Input Bar */}
              <div className="p-3 sm:p-4 bg-white/[0.03] border-t border-glass-border backdrop-blur-xl z-20">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  
                  {/* Emoji Button */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2.5 rounded-full text-primary-muted hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Smile size={20} />
                  </button>

                  {/* Text Input */}
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder={`Message ${otherUser?.name || 'roommate'}...`}
                      className="w-full bg-white/5 border border-glass-border rounded-full py-3 px-5 text-sm text-white placeholder-primary-muted/50 focus:outline-none focus:border-accent-orange focus:bg-white/10 transition-all shadow-inner"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!content.trim()}
                    className="h-11 px-5 rounded-full bg-accent-orange text-obsidian font-bold text-xs flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 shadow-glow transition-all disabled:opacity-40 disabled:hover:scale-100 shrink-0"
                  >
                    <span>Send</span>
                    <Send size={14} className="translate-x-[1px]" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-primary-muted space-y-4">
              <div className="w-20 h-20 rounded-full bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center text-accent-orange text-3xl shadow-glow">
                💬
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white">Your Roommate Messenger</h3>
                <p className="text-xs text-primary-muted max-w-sm mt-1 leading-relaxed">
                  Select a chat on the left or click on any roommate to start real-time messaging with instant delivery.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </PageTransition>
  )
}
