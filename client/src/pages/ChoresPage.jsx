import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChores } from '../hooks/useChores'
import { useSocketEvent } from '../context/SocketContext'
import { Button, Spinner, EmptyState, ProgressBar, Badge, PageTransition, AnimatedNumber, fadeSlideUp } from '../components/ui'
import { motion } from 'framer-motion'
import AddChoreModal from '../components/chores/AddChoreModal'
import ChoreCard from '../components/chores/ChoreCard'
import ChoreHistory from '../components/chores/ChoreHistory'
import { 
  Plus, Search, CheckSquare, Clock, AlertTriangle, RotateCw, 
  Trophy, Sparkles, Filter, X, ShieldAlert, CheckCircle2
} from 'lucide-react'

const TABS = [
  { value: '',         label: 'All Tasks' },
  { value: 'pending',  label: 'Pending' },
  { value: 'done',     label: 'Completed' },
  { value: 'disputed', label: 'Disputed' },
]

export default function ChoresPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { houseId, house, chores, history, loading, refresh } = useChores()
  
  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all' | 'my_chores' | 'overdue' | 'rotating'

  const handleRefresh = useCallback(() => refresh(), [refresh])
  useSocketEvent('chore_updated', handleRefresh)
  useSocketEvent('chore_completed', handleRefresh)

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No House Joined" description="JOIN OR CREATE A HOUSE FIRST TO TRACK DUTIES & CHORES" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  const isAdmin = house?.members?.find(m => m.user._id === user._id)?.role === 'admin'

  // Summary Metrics
  const stats = useMemo(() => {
    const total = chores.length
    const done = chores.filter(c => c.status === 'done').length
    const pending = chores.filter(c => c.status === 'pending').length
    const myPendingCount = chores.filter(c => 
      (c.assignedTo?._id === user._id || c.assignedTo === user._id) && c.status === 'pending'
    ).length
    const overdueCount = chores.filter(c => 
      c.status === 'pending' && new Date(c.dueDate) < new Date()
    ).length
    const rotatingCount = chores.filter(c => c.isRotating).length
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0

    return {
      total,
      done,
      pending,
      myPendingCount,
      overdueCount,
      rotatingCount,
      completionRate
    }
  }, [chores, user])

  // Filtered Chores
  const filteredChores = useMemo(() => {
    return chores.filter(chore => {
      // Tab status filter
      if (tab && chore.status !== tab) return false

      // Sub-filter Type
      if (filterType === 'my_chores') {
        const isMine = chore.assignedTo?._id === user._id || chore.assignedTo === user._id
        if (!isMine) return false
      }
      if (filterType === 'overdue') {
        const isOverdue = chore.status === 'pending' && new Date(chore.dueDate) < new Date()
        if (!isOverdue) return false
      }
      if (filterType === 'rotating' && !chore.isRotating) return false

      // Search Query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const titleMatch = chore.title?.toLowerCase().includes(q)
        const descMatch = chore.description?.toLowerCase().includes(q)
        const assigneeMatch = chore.assignedTo?.name?.toLowerCase().includes(q)
        if (!titleMatch && !descMatch && !assigneeMatch) return false
      }

      return true
    }).sort((a, b) => {
      // Overdue first, then by due date
      const aOverdue = a.status === 'pending' && new Date(a.dueDate) < new Date()
      const bOverdue = b.status === 'pending' && new Date(b.dueDate) < new Date()
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1
      return new Date(a.dueDate) - new Date(b.dueDate)
    })
  }, [chores, tab, searchQuery, filterType, user])

  return (
    <PageTransition className="w-full px-4 lg:px-8 xl:px-10 pb-24 space-y-8">
      
      {/* ========================================================= */}
      {/* 1. CHORE OVERVIEW METRICS STRIP */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Tasks */}
        <motion.div variants={fadeSlideUp} className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Active Duties</span>
            <CheckSquare size={16} className="text-accent-orange" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight flex items-baseline gap-2">
            <AnimatedNumber value={stats.total} />
            <span className="text-base text-primary-muted font-normal">Tasks</span>
          </div>
          <div className="text-xs text-primary-muted mt-2">
            {stats.done} completed this cycle
          </div>
        </motion.div>

        {/* My Assigned Pending */}
        <motion.div variants={fadeSlideUp} className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Assigned to Me</span>
            <Clock size={16} className="text-accent-cyan" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight flex items-baseline gap-2">
            <AnimatedNumber value={stats.myPendingCount} />
            <span className="text-base text-primary-muted font-normal">Pending</span>
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Your current responsibilities
          </div>
        </motion.div>

        {/* Overdue Alert */}
        <motion.div variants={fadeSlideUp} className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Overdue Tasks</span>
            <AlertTriangle size={16} className={stats.overdueCount > 0 ? "text-accent-rose animate-pulse" : "text-primary-muted"} />
          </div>
          <div 
            className="font-display text-3xl md:text-4xl font-bold tracking-tight flex items-baseline gap-2"
            style={{ color: stats.overdueCount > 0 ? '#F43F5E' : '#FFFFFF' }}
          >
            <AnimatedNumber value={stats.overdueCount} />
            <span className="text-base font-normal opacity-80">Overdue</span>
          </div>
          <div className="text-xs text-primary-muted mt-2">
            {stats.overdueCount > 0 ? 'Requires attention' : 'All tasks on schedule!'}
          </div>
        </motion.div>

        {/* Completion Progress */}
        <motion.div variants={fadeSlideUp} className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">House Duty Rate</span>
            <Trophy size={16} className="text-accent-emerald" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight flex items-baseline">
            <AnimatedNumber value={stats.completionRate} />
            <span>%</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={stats.completionRate} color="#10B981" height={4} className="bg-white/5" />
          </div>
        </motion.div>

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
              placeholder="Search chore title, description, or assigned roommate..."
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

          {/* New Chore Button */}
          <Button 
            onClick={() => setShowAdd(true)} 
            className="flex items-center gap-2 shrink-0 bg-accent-orange text-obsidian font-bold shadow-glow w-full sm:w-auto"
          >
            <Plus size={16} /> Create New Chore
          </Button>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          
          {/* Main Status Chips */}
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {TABS.map(t => {
              const count = t.value ? chores.filter(c => c.status === t.value).length : chores.length
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

          {/* Sub-Filters (All / Mine / Overdue / Rotating) */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full transition-colors ${filterType === 'all' ? 'bg-white/10 text-white font-bold' : 'text-primary-muted hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('my_chores')}
              className={`px-3 py-1 rounded-full transition-colors ${filterType === 'my_chores' ? 'bg-white/10 text-white font-bold' : 'text-primary-muted hover:text-white'}`}
            >
              My Duties
            </button>
            <button
              onClick={() => setFilterType('overdue')}
              className={`px-3 py-1 rounded-full transition-colors ${filterType === 'overdue' ? 'bg-accent-rose/20 text-accent-rose font-bold' : 'text-primary-muted hover:text-white'}`}
            >
              Overdue
            </button>
            <button
              onClick={() => setFilterType('rotating')}
              className={`px-3 py-1 rounded-full transition-colors ${filterType === 'rotating' ? 'bg-white/10 text-white font-bold' : 'text-primary-muted hover:text-white'}`}
            >
              Auto-Rotating 🔄
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. CHORE GRID & ACCOUNTABILITY LEADERBOARD */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Chores Stream (8 cols) */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="flex justify-center py-16 bento-card rounded-3xl">
              <Spinner size={32} color="#00E5FF" />
            </div>
          ) : filteredChores.length === 0 ? (
            <div className="bento-card rounded-3xl p-12 text-center">
              <EmptyState 
                icon="🧹" 
                title="No Chores Found" 
                description={
                  searchQuery 
                    ? `NO TASKS MATCHING "${searchQuery.toUpperCase()}"`
                    : tab 
                    ? `NO ${tab.toUpperCase()} TASKS AT THE MOMENT` 
                    : 'CREATE YOUR FIRST CHORE TO START ROTATION'
                } 
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredChores.map(chore => (
                <ChoreCard key={chore._id} chore={chore} onRefresh={refresh} isAdmin={isAdmin} />
              ))}
            </div>
          )}
        </div>

        {/* Accountability Leaderboard & History (4 cols) */}
        <div className="lg:col-span-4">
          <ChoreHistory history={history} />
        </div>

      </div>

      {showAdd && (
        <AddChoreModal
          houseId={houseId}
          members={house?.members}
          onClose={() => setShowAdd(false)}
          onAdded={() => refresh()}
        />
      )}
    </PageTransition>
  )
}
