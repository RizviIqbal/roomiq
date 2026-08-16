import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHouseData, useComplaints } from '../hooks/useHouseData'
import { useSocketEvent } from '../context/SocketContext'
import { Button, Spinner, EmptyState, Badge } from '../components/ui'
import FileComplaintModal from '../components/complaints/FileComplaintModal'
import ComplaintCard from '../components/complaints/ComplaintCard'
import OffendersPanel from '../components/complaints/OffendersPanel'
import { 
  Plus, Search, Shield, Scale, AlertTriangle, CheckCircle2, 
  Clock, Sparkles, Filter, X, Volume2, Sparkle
} from 'lucide-react'

const TABS = [
  { value: '',                label: 'All Tickets' },
  { value: 'open',             label: 'Open' },
  { value: 'under_mediation',  label: 'Mediation' },
  { value: 'resolved',         label: 'Resolved' },
  { value: 'dismissed',        label: 'Dismissed' },
]

const CATEGORY_FILTERS = [
  { key: '',            label: 'All Categories' },
  { key: 'noise',       label: '🔇 Noise' },
  { key: 'cleanliness', label: '🧹 Cleanliness' },
  { key: 'guests',      label: '👥 Guests' },
  { key: 'bills',       label: '💸 Bills & Money' },
  { key: 'behavior',    label: '🤝 House Etiquette' },
  { key: 'other',       label: '📋 Other' },
]

export default function ComplaintsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { houseId, house, loading: hLoading } = useHouseData()
  const { complaints, offenders, loading, refresh } = useComplaints(houseId)
  
  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useSocketEvent('complaint_updated', useCallback(() => refresh(), [refresh]))

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No House Joined" description="JOIN OR CREATE A HOUSE FIRST TO SUBMIT FEEDBACK" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  const isAdmin = house?.members?.find(m => m.user._id === user._id)?.role === 'admin'

  // Summary Metrics
  const stats = useMemo(() => {
    const total = complaints.length
    const mediation = complaints.filter(c => c.status === 'under_mediation').length
    const repeats = complaints.filter(c => c.isRepeatOffense).length
    const resolved = complaints.filter(c => c.status === 'resolved').length

    return { total, mediation, repeats, resolved }
  }, [complaints])

  // Filtered Complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      if (tab && c.status !== tab) return false
      if (categoryFilter && c.category !== categoryFilter) return false

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const titleMatch = c.title?.toLowerCase().includes(q)
        const descMatch = c.description?.toLowerCase().includes(q)
        const targetMatch = c.against?.name?.toLowerCase().includes(q)
        if (!titleMatch && !descMatch && !targetMatch) return false
      }

      return true
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [complaints, tab, categoryFilter, searchQuery])

  return (
    <div className="w-full px-4 lg:px-8 xl:px-10 pb-24 space-y-8">
      
      {/* ========================================================= */}
      {/* 1. CONFLICT RESOLUTION METRICS STRIP */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Feedback */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Feedback Cases</span>
            <Shield size={16} className="text-accent-rose" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {stats.total} Total
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Constructive conflict resolution
          </div>
        </div>

        {/* Active Mediation */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">In Mediation</span>
            <Scale size={16} className={stats.mediation > 0 ? "text-accent-orange animate-pulse" : "text-primary-muted"} />
          </div>
          <div 
            className="font-display text-3xl md:text-4xl font-bold tracking-tight"
            style={{ color: stats.mediation > 0 ? '#FF6B00' : '#FFFFFF' }}
          >
            {stats.mediation} Voting
          </div>
          <div className="text-xs text-primary-muted mt-2">
            {stats.mediation > 0 ? 'Peer consensus voting active' : 'No tickets in mediation'}
          </div>
        </div>

        {/* Repeat Offenses */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Repeat Nuances</span>
            <AlertTriangle size={16} className={stats.repeats > 0 ? "text-accent-rose" : "text-primary-muted"} />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {stats.repeats} Flagged
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Tracked in accountability heatmap
          </div>
        </div>

        {/* Resolved Peacefully */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Resolved</span>
            <CheckCircle2 size={16} className="text-accent-emerald" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {stats.resolved} Settled
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Mutual agreements reached
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
              placeholder="Search feedback tickets, issues, or roommates..."
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

          {/* Submit Feedback Button */}
          <Button 
            variant="danger"
            onClick={() => setShowAdd(true)} 
            className="flex items-center gap-2 shrink-0 shadow-glow w-full sm:w-auto"
          >
            <Plus size={16} /> Submit Feedback
          </Button>
        </div>

        {/* Status & Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          
          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {TABS.map(t => {
              const count = t.value ? complaints.filter(c => c.status === t.value).length : complaints.length
              return (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={[
                    'px-4 py-1.5 rounded-full font-label-caps text-[10px] uppercase tracking-wider transition-all shadow-sm whitespace-nowrap flex items-center gap-2',
                    tab === t.value 
                      ? 'bg-white text-obsidian font-bold shadow-glow scale-105' 
                      : 'bg-white/5 text-primary-muted border border-glass-border hover:bg-white/10 hover:border-white/30 hover:text-white',
                  ].join(' ')}
                >
                  <span>{t.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${tab === t.value ? 'bg-obsidian/20 text-obsidian font-bold' : 'bg-white/10 text-primary-muted'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs">
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

        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. FEEDBACK LOG & OFFENDERS TRACKER */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Incident Log (8 cols) */}
        <div className="lg:col-span-8">
          {loading || hLoading ? (
            <div className="flex justify-center py-16 bento-card rounded-3xl">
              <Spinner size={32} color="#00E5FF" />
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="bento-card rounded-3xl p-12 text-center">
              <EmptyState 
                icon="🛡️" 
                title="No Feedback Cases" 
                description={
                  searchQuery 
                    ? `NO TICKETS MATCHING "${searchQuery.toUpperCase()}"`
                    : tab 
                    ? `NO ${tab.toUpperCase()} CASES AT THE MOMENT` 
                    : 'HOUSE HARMONY IS HIGH! SUBMIT FEEDBACK OR CONCERNS ANYTIME'
                } 
              />
            </div>
          ) : (
            <div className="bento-card rounded-3xl overflow-hidden divide-y divide-glass-border">
              {filteredComplaints.map(c => (
                <div key={c._id} className="transition-colors hover:bg-white/[0.02]">
                  <ComplaintCard complaint={c} onRefresh={refresh} isAdmin={isAdmin} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Repeat Offenders Analytics Panel (4 cols) */}
        <div className="lg:col-span-4">
          <OffendersPanel offenders={offenders} />
        </div>

      </div>

      {showAdd && (
        <FileComplaintModal 
          houseId={houseId} 
          members={house?.members} 
          onClose={() => setShowAdd(false)} 
          onAdded={() => refresh()} 
        />
      )}
    </div>
  )
}
