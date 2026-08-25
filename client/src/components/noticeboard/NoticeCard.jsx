import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Avatar, Badge } from '../ui'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { 
  Pin, 
  Trash2, 
  Clock, 
  Users, 
  Check, 
  Calendar, 
  AlertTriangle, 
  PartyPopper,
  Sparkles,
  Heart,
  Eye,
  ThumbsUp
} from 'lucide-react'

const CATEGORY_ICONS = { 
  announcement: '📢', 
  reminder: '⏰', 
  event: '🎉', 
  warning: '⚠️', 
  general: '📋' 
}

const CATEGORY_COLORS = { 
  announcement: 'accent', 
  reminder: 'yellow', 
  event: 'green', 
  warning: 'red', 
  general: 'neutral' 
}

const EMOJI_OPTIONS = ['👍', '❤️', '👀', '🎉', '🙏']

export default function NoticeCard({ notice, onRefresh, isAdmin }) {
  const { user } = useAuth()
  const [reacting, setReacting] = useState(false)
  const [rsvping, setRsvping]   = useState(false)

  const isMine = (notice.postedBy?._id || notice.postedBy) === user?._id

  // Toggle Pin
  const togglePin = async () => {
    try {
      await api.put(`/noticeboard/${notice._id}/pin`)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update pin')
    }
  }

  // Delete Notice
  const remove = async () => {
    if (!window.confirm("Are you sure you want to delete this bulletin?")) return
    try {
      await api.delete(`/noticeboard/${notice._id}`)
      toast.success("Notice deleted")
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  // 1-Tap Emoji Reaction
  const handleReact = async (emoji) => {
    setReacting(true)
    try {
      await api.put(`/noticeboard/${notice._id}/react`, { emoji })
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to react')
    } finally {
      setReacting(false)
    }
  }

  // 1-Tap Event RSVP
  const handleRsvp = async (status) => {
    setRsvping(true)
    try {
      await api.put(`/noticeboard/${notice._id}/rsvp`, { status })
      toast.success(`RSVP updated: ${status.replace('_', ' ').toUpperCase()}`)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to RSVP')
    } finally {
      setRsvping(false)
    }
  }

  // User's active reaction
  const myReaction = notice.reactions?.find(
    r => (r.user?._id || r.user) === user?._id
  )

  // User's active RSVP
  const myRsvp = notice.rsvps?.find(
    r => (r.user?._id || r.user) === user?._id
  )

  const goingRsvps = notice.rsvps?.filter(r => r.status === 'going') || []
  const maybeRsvps = notice.rsvps?.filter(r => r.status === 'maybe') || []

  return (
    <div className={`bento-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-5 transition-all relative group shadow-xl ${
      notice.isPinned 
        ? 'border-accent-orange/50 !bg-accent-orange/[0.03] shadow-[0_0_25px_rgba(249,115,22,0.1)]' 
        : 'border-white/10 hover:border-white/20'
    }`}>
      
      {/* Pinned Corner Accent */}
      {notice.isPinned && (
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden rounded-tr-3xl">
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-accent-orange rotate-45 flex items-end justify-center pb-1 text-obsidian shadow-md">
            <Pin size={10} className="stroke-[3]" />
          </div>
        </div>
      )}

      {/* Top Header Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl">{CATEGORY_ICONS[notice.category] || '📋'}</span>
            <Badge color={CATEGORY_COLORS[notice.category] || 'neutral'} className="text-[10px] uppercase font-bold tracking-wider">
              {notice.category}
            </Badge>
            {notice.isPinned && (
              <span className="text-[10px] font-label-caps uppercase text-accent-orange bg-accent-orange/15 px-2.5 py-0.5 rounded-full border border-accent-orange/30 font-bold flex items-center gap-1">
                <Pin size={10} /> Pinned Bulletin
              </span>
            )}
          </div>

          {/* Admin & Poster Actions */}
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {isAdmin && (
              <button
                onClick={togglePin}
                title={notice.isPinned ? "Unpin notice" : "Pin to top"}
                className={`p-2 rounded-xl transition-all ${
                  notice.isPinned ? 'text-accent-orange bg-accent-orange/10' : 'text-primary-muted hover:text-white hover:bg-white/10'
                }`}
              >
                <Pin size={14} />
              </button>
            )}
            {isMine && (
              <button 
                onClick={remove} 
                title="Delete bulletin"
                className="p-2 rounded-xl text-primary-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Title & Body */}
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            {notice.title}
          </h3>
          <p className="font-body text-sm text-primary-muted leading-relaxed mt-2 whitespace-pre-wrap">
            {notice.body}
          </p>
        </div>
      </div>

      {/* Event RSVP Section (If category is 'event') */}
      {notice.category === 'event' && (
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-glass-border space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-label-caps uppercase text-[10px] text-accent-emerald font-bold flex items-center gap-1.5">
              <PartyPopper size={13} /> Event Attendance Roster
            </span>
            <span className="font-mono text-white text-[11px] font-bold">
              {goingRsvps.length} Going • {maybeRsvps.length} Maybe
            </span>
          </div>

          {/* RSVP Toggle Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'going', label: '✅ Going' },
              { id: 'maybe', label: '🤔 Maybe' },
              { id: 'not_going', label: '❌ Can\'t' },
            ].map(btn => {
              const isSelected = myRsvp?.status === btn.id
              return (
                <button
                  key={btn.id}
                  onClick={() => handleRsvp(btn.id)}
                  disabled={rsvping}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                    isSelected
                      ? 'bg-accent-emerald text-obsidian shadow-glow font-extrabold'
                      : 'bg-white/5 border border-glass-border text-primary-muted hover:text-white hover:bg-white/10'
                  }`}
                >
                  {btn.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottom Footer: Author Info & Interactive Reactions */}
      <div className="pt-4 border-t border-glass-border space-y-3">
        
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-primary-muted">
          <div className="flex items-center gap-2">
            <Avatar name={notice.postedBy?.name} size={24} src={notice.postedBy?.avatar} />
            <span className="text-white font-medium">{notice.postedBy?.name || 'Housemate'}</span>
            <span className="text-primary-muted/40">•</span>
            <span>{new Date(notice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          </div>

          {notice.expiresAt && (
            <div className="text-[11px] font-mono text-accent-orange flex items-center gap-1">
              <Clock size={11} />
              <span>Expires {new Date(notice.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}
        </div>

        {/* 1-Tap Emoji Reactions Bar */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {EMOJI_OPTIONS.map(emoji => {
            const count = notice.reactions?.filter(r => r.emoji === emoji).length || 0
            const hasReacted = myReaction?.emoji === emoji

            return (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                disabled={reacting}
                className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                  hasReacted
                    ? 'bg-accent-purple/30 border border-accent-purple text-white shadow-glow'
                    : count > 0
                      ? 'bg-white/10 border border-white/10 text-white'
                      : 'bg-white/5 border border-glass-border text-primary-muted hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{emoji}</span>
                {count > 0 && <span className="font-mono text-[10px] font-bold">{count}</span>}
              </button>
            )
          })}
        </div>

      </div>

    </div>
  )
}
