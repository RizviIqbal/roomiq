import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Circle } from 'lucide-react'
import { Avatar, PageTransition, fadeSlideUp } from '../components/ui'
import { motion } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function InboxPage() {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/chat')
        setConversations(data)
      } catch (error) {
        console.error(error)
        toast.error('Failed to load conversations')
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 rounded-full border-2 border-primary-muted border-t-accent-orange animate-spin" />
      </div>
    )
  }

  return (
    <PageTransition className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-10">
        <div className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-accent-orange mb-2">[ INBOX ]</div>
        <h1 className="font-display text-[40px] font-bold tracking-tight text-white">Messages</h1>
        <p className="font-body text-[15px] text-primary-muted">Connect with prospective roommates or chat with your housemates.</p>
      </div>

      {conversations.length === 0 ? (
        <motion.div variants={fadeSlideUp} className="glass-panel rounded-3xl p-16 text-center border border-glass-border">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="font-display text-[24px] text-white mb-2">No messages yet</h3>
          <p className="text-primary-muted max-w-sm mx-auto">When you chat with a house admin or someone messages you, it will appear here.</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          {conversations.map((conv) => {
            const { user, latestMessage, unreadCount } = conv;
            const isMe = latestMessage.sender === user._id; // Wait, actually backend populates it
            // Backend populates sender and receiver as objects
            const isLatestFromMe = latestMessage.sender._id !== user._id;

            return (
              <motion.div 
                variants={fadeSlideUp}
                key={user._id} 
                onClick={() => navigate(`/chat/${user._id}`)}
                className="glass-panel border border-glass-border rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 hover:border-accent-orange/50 hover:shadow-glow transition-all"
              >
                <div className="flex items-center gap-4 truncate">
                  <div className="relative">
                    <Avatar name={user.name} src={user.avatar} size={48} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-rose rounded-full border-2 border-obsidian flex items-center justify-center text-[9px] font-bold text-white shadow-glow">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="truncate">
                    <h3 className={`font-display text-[18px] ${unreadCount > 0 ? 'text-white font-bold' : 'text-white/90'}`}>
                      {user.name}
                    </h3>
                    <p className={`font-body text-[14px] truncate max-w-md ${unreadCount > 0 ? 'text-white font-medium' : 'text-primary-muted'}`}>
                      {isLatestFromMe ? 'You: ' : ''}{latestMessage.content}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                  <span className="font-mono text-[11px] text-primary-muted">
                    {new Date(latestMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent-orange/20 group-hover:text-accent-orange transition-colors">
                    <MessageCircle size={14} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </PageTransition>
  )
}
