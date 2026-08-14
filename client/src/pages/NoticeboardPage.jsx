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
  AlertTriangle, Sparkles, Filter, X, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORY_FILTERS = [
  { key: '',              label: 'All Notices' },
  { key: 'announcement',  label: '📢 Announcements' },
  { key: 'reminder',      label: '⏰ Reminders' },
  { key: 'event',         label: '🎉 Events' },
  { key: 'warning',       label: '⚠️ Warnings' },
  { key: 'general',       label: '📋 General' },
]

export default function NoticeboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { houseId, house, loading: hLoading } = useHouseData()
  const { notices, loading, refresh } = useNotices(houseId)
  
  const [showAdd, setShowAdd] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [pinnedOnly, setPinnedOnly] = useState(false)

  useSocketEvent('notice_posted', useCallback((data) => {
    if (data?.notice?.postedBy?._id !== user._id) {
      toast(`📌 New notice: ${data.notice.title}`, { duration: 4000 })
    }
    refresh()
  }, [refresh, user._id]))

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No House Joined" description="JOIN OR CREATE A HOUSE FIRST TO POST NOTICES" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  const isAdmin = house?.members?.find(m => m.user._id === user._id)?.role === 'admin'

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
      // Pinned notices first, then newest
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }, [notices, pinnedOnly, categoryFilter, searchQuery])

  return (
    <div className="w-full px-4 md:px-8 pb-24 max-w-7xl mx-auto space-y-8">
      
      {/* ========================================================= */}
      {/* 1. NOTICEBOARD METRICS STRIP */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Announcements */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Active Bulletins</span>
            <Megaphone size={16} className="text-accent-orange" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {stats.total} Notices
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Shared with all housemates
          </div>
        </div>

        {/* Pinned Bulletins */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Pinned Critical</span>
            <Pin size={16} className="text-accent-cyan" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {stats.pinned} Pinned
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Highlighted at top of feed
          </div>
        </div>

        {/* House Events */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Social & Events</span>
            <PartyPopper size={16} className="text-accent-purple" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {stats.events} Upcoming
          </div>
          <div className="text-xs text-primary-muted mt-2">
            House potlucks, dinners & plans
          </div>
        </div>

        {/* Reminders & Warnings */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Reminders & Alerts</span>
            <Clock size={16} className="text-accent-emerald" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {stats.reminders} Active
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Rent dates, maintenance schedules
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. CONTROLS, SEARCH & FILTER BAR */}
      {/* ========================================================= */}
      <div className="bento-card rounded-3xl p-5 space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-muted" />
            <input
              type="text"
              placeholder="Search announcements, reminders, or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-glass-border rounded-2xl pl-10 pr-8 py-2.5 text-xs text-white placeholder-primary-muted/50 focus:outline-none focus:border-accent-orange transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-muted hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Post Notice Button */}
          <Button 
            onClick={() => setShowAdd(true)} 
            className="flex items-center gap-2 shrink-0 bg-accent-orange text-obsidian font-bold shadow-glow w-full sm:w-auto"
          >
            <Plus size={16} /> Post House Notice
          </Button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs pb-1">
            {CATEGORY_FILTERS.map(c => (
              <button
                key={c.key}
                onClick={() => setCategoryFilter(c.key)}
                className={`px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all font-label-caps uppercase tracking-wider ${
                  categoryFilter === c.key 
                    ? 'bg-white text-obsidian font-bold shadow-glow scale-105' 
                    : 'bg-white/5 text-primary-muted border border-glass-border hover:bg-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Pinned Quick Toggle */}
          <button
            onClick={() => setPinnedOnly(!pinnedOnly)}
            className={`px-3 py-1 rounded-full text-xs font-label-caps uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
              pinnedOnly ? 'bg-accent-orange/20 text-accent-orange font-bold border border-accent-orange/30' : 'text-primary-muted hover:text-white'
            }`}
          >
            <Pin size={12} /> Pinned Only
          </button>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. NOTICES GRID */}
      {/* ========================================================= */}
      {loading || hLoading ? (
        <div className="flex justify-center py-16 bento-card rounded-3xl">
          <Spinner size={32} color="#00E5FF" />
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="bento-card rounded-3xl p-12 text-center">
          <EmptyState 
            icon="📌" 
            title="No Notices Found" 
            description={
              searchQuery 
                ? `NO ANNOUNCEMENTS MATCHING "${searchQuery.toUpperCase()}"`
                : categoryFilter 
                ? `NO ${categoryFilter.toUpperCase()} BULLETINS AT THE MOMENT` 
                : 'POST YOUR FIRST HOUSE ANNOUNCEMENT TO SHARE WITH ROOMMATES'
            } 
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotices.map(notice => (
            <NoticeCard key={notice._id} notice={notice} onRefresh={refresh} isAdmin={isAdmin} />
          ))}
        </div>
      )}

      {showAdd && (
        <PostNoticeModal houseId={houseId} onClose={() => setShowAdd(false)} onAdded={() => refresh()} />
      )}
    </div>
  )
}
