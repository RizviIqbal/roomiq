import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHouseData, useNotices } from '../hooks/useHouseData'
import { useSocketEvent } from '../context/SocketContext'
import { Button, Spinner, EmptyState, Badge } from '../components/ui'
import PostNoticeModal from '../components/noticeboard/PostNoticeModal'
import NoticeCard from '../components/noticeboard/NoticeCard'
import { 
  Plus, Search, Pin, Megaphone, Clock, PartyPopper, 
  AlertTriangle, Sparkles, Filter, X, Calendar, MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORY_FILTERS = [
  { key: '',              label: 'All Bulletins' },
  { key: 'announcement',  label: '📢 Announcements' },
  { key: 'reminder',      label: '⏰ Reminders' },
  { key: 'event',         label: '🎉 Events & RSVPs' },
  { key: 'warning',       label: '⚠️ Warnings' },
  { key: 'general',       label: '📋 General' },
]

export default function NoticeboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { houseId, house } = useHouseData()
  const { notices = [], loading, refresh } = useNotices(houseId)
  
  const [showAdd, setShowAdd] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [pinnedOnly, setPinnedOnly] = useState(false)

  // Real-time socket sync
  useSocketEvent('notice_posted', useCallback((data) => {
    if (data?.notice?.postedBy?._id !== user?._id) {
      toast(`📌 New bulletin: ${data.notice.title}`, { duration: 4000, icon: '📢' })
    }
    refresh()
  }, [refresh, user?._id]))

  useSocketEvent('notice_updated', useCallback(() => refresh(), [refresh]))
  useSocketEvent('notice_deleted', useCallback(() => refresh(), [refresh]))

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No House Joined" description="JOIN OR CREATE A HOUSE FIRST TO POST NOTICES" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  const isAdmin = house?.members?.find(m => (m.user?._id || m.user) === user?._id)?.role === 'admin'

  // Summary Metrics
  const stats = useMemo(() => {
    const total = notices.length
    const pinned = notices.filter(n => n.isPinned).length
    const events = notices.filter(n => n.category === 'event').length
    const reminders = notices.filter(n => n.category === 'reminder' || n.category === 'warning').length

    return { total, pinned, events, reminders }
  }, [notices])

  // Filtered Notices
  const filteredNotices = useMemo(() => {
    return notices.filter(notice => {
      if (pinnedOnly && !notice.isPinned) return false
      if (categoryFilter && notice.category !== categoryFilter) return false

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const titleMatch = notice.title?.toLowerCase().includes(q)
        const bodyMatch = notice.body?.toLowerCase().includes(q)
        const authorMatch = notice.postedBy?.name?.toLowerCase().includes(q)
        if (!titleMatch && !bodyMatch && !authorMatch) return false
      }

      return true
    }).sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }, [notices, pinnedOnly, categoryFilter, searchQuery])

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 pb-24 space-y-8 max-w-[1600px] mx-auto font-body text-white">
      
      {/* ========================================================= */}
      {/* 1. NOTICEBOARD METRICS STRIP                              */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Bulletins */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group shadow-xl">
          <div className="flex items-center justify-between text-primary-muted mb-2">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Active Bulletins</span>
            <Megaphone size={16} className="text-accent-orange" />
          </div>
          <div className="font-display text-4xl font-extrabold text-white tracking-tight">
            {stats.total} Notices
          </div>
          <div className="text-xs text-primary-muted mt-1">
            Official household communication feed
          </div>
        </div>

        {/* Pinned Announcements */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group shadow-xl">
          <div className="flex items-center justify-between text-primary-muted mb-2">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Pinned Urgent</span>
            <Pin size={16} className={stats.pinned > 0 ? "text-accent-orange animate-pulse" : "text-primary-muted"} />
          </div>
          <div className={`font-display text-4xl font-extrabold tracking-tight ${stats.pinned > 0 ? 'text-accent-orange' : 'text-white'}`}>
            {stats.pinned} Pinned
          </div>
          <div className="text-xs text-primary-muted mt-1">
            High-priority house standards & alerts
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group shadow-xl">
          <div className="flex items-center justify-between text-primary-muted mb-2">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">House Events</span>
            <PartyPopper size={16} className="text-accent-emerald" />
          </div>
          <div className="font-display text-4xl font-extrabold text-white tracking-tight">
            {stats.events} Events
          </div>
          <div className="text-xs text-primary-muted mt-1">
            Group dinners, gatherings & RSVPs
          </div>
        </div>

        {/* Reminders & Warnings */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group shadow-xl">
          <div className="flex items-center justify-between text-primary-muted mb-2">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Alerts & Reminders</span>
            <Clock size={16} className="text-accent-purple" />
          </div>
          <div className="font-display text-4xl font-extrabold text-white tracking-tight">
            {stats.reminders} Alerts
          </div>
          <div className="text-xs text-primary-muted mt-1">
            Maintenance, guests & deliveries
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. SEARCH, CONTROLS & FILTER BAR                         */}
      {/* ========================================================= */}
      <div className="bento-card rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-muted" />
            <input
              type="text"
              placeholder="Search bulletins, messages, or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-glass-border rounded-2xl pl-11 pr-8 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-accent-orange transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-muted hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Post Bulletin Button */}
          <button 
            onClick={() => setShowAdd(true)} 
            className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-orange-600 text-obsidian font-bold text-xs shadow-glow transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <Plus size={16} />
            <span>Broadcast Bulletin</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-glass-border">
          
          {/* Category Chips */}
          <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            {CATEGORY_FILTERS.map(c => (
              <button
                key={c.key}
                onClick={() => setCategoryFilter(c.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${
                  categoryFilter === c.key
                    ? 'bg-accent-orange text-obsidian font-bold shadow-glow scale-105'
                    : 'bg-white/5 text-primary-muted hover:text-white border border-glass-border hover:border-white/20'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Pinned Toggle */}
          <button
            onClick={() => setPinnedOnly(!pinnedOnly)}
            className={`px-3 py-1.5 rounded-full text-xs font-label-caps uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              pinnedOnly
                ? 'bg-accent-purple text-white font-bold shadow-glow'
                : 'bg-white/5 text-primary-muted hover:text-white border border-glass-border hover:border-white/20'
            }`}
          >
            <Pin size={12} />
            <span>Pinned Only</span>
          </button>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. NOTICEBOARD FEED GRID                                  */}
      {/* ========================================================= */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size={36} color="#F97316" />
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="py-20 text-center bento-card rounded-3xl p-8 space-y-3">
          <div className="text-4xl">📢</div>
          <h3 className="font-display text-xl font-bold text-white">No Bulletins Found</h3>
          <p className="text-xs text-primary-muted max-w-sm mx-auto">
            {searchQuery || categoryFilter || pinnedOnly 
              ? 'No notices match your current filters. Clear filters to view all bulletins.'
              : 'Your house board is empty. Post the first announcement or guest notice!'}
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-2 px-5 py-2.5 rounded-xl bg-accent-orange text-obsidian font-bold text-xs shadow-glow"
          >
            Post First Bulletin
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotices.map((notice) => (
            <NoticeCard 
              key={notice._id} 
              notice={notice} 
              onRefresh={refresh} 
              isAdmin={isAdmin} 
            />
          ))}
        </div>
      )}

      {/* Post Notice Modal */}
      {showAdd && (
        <PostNoticeModal
          houseId={houseId}
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            setShowAdd(false)
            refresh()
          }}
        />
      )}

    </div>
  )
}
