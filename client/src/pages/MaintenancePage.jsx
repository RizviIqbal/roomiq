import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHouseData, useMaintenance } from '../hooks/useHouseData'
import { useSocketEvent } from '../context/SocketContext'
import { Button, Spinner, EmptyState, ProgressBar, Badge } from '../components/ui'
import ReportIssueModal from '../components/maintenance/ReportIssueModal'
import MaintenanceCard from '../components/maintenance/MaintenanceCard'
import { 
  Plus, Search, Wrench, AlertTriangle, Clock, CheckCircle2, 
  Flame, Zap, Droplet, Home, Sparkles, Filter, X
} from 'lucide-react'

const TABS = [
  { value: '',             label: 'All Tickets' },
  { value: 'reported',     label: 'Reported' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'in_progress',  label: 'In Progress' },
  { value: 'resolved',     label: 'Resolved' },
]

const CATEGORIES = [
  { key: '',            label: 'All Categories' },
  { key: 'plumbing',    label: '🚰 Plumbing' },
  { key: 'electrical',  label: '⚡ Electrical' },
  { key: 'appliance',   label: '❄️ Appliance' },
  { key: 'structural',  label: '🏗️ Structural' },
  { key: 'pest',        label: '🐜 Pest Control' },
  { key: 'other',       label: '📋 Other' },
]

export default function MaintenancePage() {
  const navigate = useNavigate()
  const { houseId, loading: hLoading } = useHouseData()
  const { issues, loading, refresh } = useMaintenance(houseId)
  
  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useSocketEvent('maintenance_updated', useCallback(() => refresh(), [refresh]))

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No House Joined" description="JOIN OR CREATE A HOUSE FIRST TO TRACK MAINTENANCE" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  // Metrics
  const stats = useMemo(() => {
    const total = issues.length
    const urgent = issues.filter(i => (i.priority === 'urgent' || i.priority === 'high') && i.status !== 'resolved').length
    const inProgress = issues.filter(i => i.status === 'in_progress' || i.status === 'acknowledged').length
    const resolved = issues.filter(i => i.status === 'resolved').length

    return { total, urgent, inProgress, resolved }
  }, [issues])

  // Filtered Issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (tab && issue.status !== tab) return false
      if (categoryFilter && issue.category !== categoryFilter) return false
      if (priorityFilter && issue.priority !== priorityFilter) return false

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const titleMatch = issue.title?.toLowerCase().includes(q)
        const descMatch = issue.description?.toLowerCase().includes(q)
        const reporterMatch = issue.reportedBy?.name?.toLowerCase().includes(q)
        if (!titleMatch && !descMatch && !reporterMatch) return false
      }

      return true
    })
  }, [issues, tab, categoryFilter, priorityFilter, searchQuery])

  return (
    <div className="w-full px-4 md:px-8 pb-24 max-w-7xl mx-auto space-y-8">
      
      {/* ========================================================= */}
      {/* 1. MAINTENANCE METRICS STRIP */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Tickets */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Total Tickets</span>
            <Wrench size={16} className="text-accent-orange" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {stats.total} Issues
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Logged across the house
          </div>
        </div>

        {/* Urgent Attention */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Urgent / High Priority</span>
            <AlertTriangle size={16} className={stats.urgent > 0 ? "text-accent-rose animate-pulse" : "text-primary-muted"} />
          </div>
          <div 
            className="font-display text-3xl md:text-4xl font-bold tracking-tight"
            style={{ color: stats.urgent > 0 ? '#F43F5E' : '#FFFFFF' }}
          >
            {stats.urgent} Urgent
          </div>
          <div className="text-xs text-primary-muted mt-2">
            {stats.urgent > 0 ? 'Requires priority technician' : 'No emergency repairs'}
          </div>
        </div>

        {/* In Progress */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Active Repair Works</span>
            <Clock size={16} className="text-accent-cyan" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {stats.inProgress} Ongoing
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Acknowledged or in progress
          </div>
        </div>

        {/* Resolved & Split */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Resolved & Auto-Split</span>
            <CheckCircle2 size={16} className="text-accent-emerald" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {stats.resolved} Fixed
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Costs automatically split in Finance
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
              placeholder="Search repair tickets, descriptions, or reporters..."
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

          {/* Report Issue Button */}
          <Button 
            onClick={() => setShowAdd(true)} 
            className="flex items-center gap-2 shrink-0 bg-accent-orange text-obsidian font-bold shadow-glow w-full sm:w-auto"
          >
            <Plus size={16} /> Report Maintenance Issue
          </Button>
        </div>

        {/* Status & Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          
          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {TABS.map(t => {
              const count = t.value ? issues.filter(i => i.status === t.value).length : issues.length
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

          {/* Category Dropdown/Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setCategoryFilter(c.key)}
                className={`px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors ${categoryFilter === c.key ? 'bg-white/10 text-white font-bold' : 'text-primary-muted hover:text-white'}`}
              >
                {c.label}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. ISSUES LIST */}
      {/* ========================================================= */}
      {loading || hLoading ? (
        <div className="flex justify-center py-16 bento-card rounded-3xl">
          <Spinner size={32} color="#00E5FF" />
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="bento-card rounded-3xl p-12 text-center">
          <EmptyState 
            icon="🔧" 
            title="No Maintenance Issues" 
            description={
              searchQuery 
                ? `NO TICKETS MATCHING "${searchQuery.toUpperCase()}"`
                : tab 
                ? `NO ${tab.toUpperCase()} ISSUES FOUND` 
                : 'EVERYTHING IS IN GREAT SHAPE! REPORT ANY NEW REPAIRS AS NEEDED'
            } 
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIssues.map(issue => (
            <MaintenanceCard key={issue._id} issue={issue} onRefresh={refresh} />
          ))}
        </div>
      )}

      {showAdd && (
        <ReportIssueModal houseId={houseId} onClose={() => setShowAdd(false)} onAdded={() => refresh()} />
      )}
    </div>
  )
}
