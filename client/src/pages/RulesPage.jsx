import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHouseData, useRules } from '../hooks/useHouseData'
import { useSocketEvent } from '../context/SocketContext'
import { Button, Spinner, EmptyState, ProgressBar, Badge } from '../components/ui'
import AddRuleModal from '../components/rules/AddRuleModal'
import RuleCard from '../components/rules/RuleCard'
import { 
  Plus, Search, Vote, Scale, CheckCircle2, XCircle, Clock, 
  Sparkles, FileText, X, Users, Shield
} from 'lucide-react'

const TABS = [
  { value: '',         label: 'All Rules' },
  { value: 'active',   label: 'Enacted' },
  { value: 'voting',   label: 'Voting Open' },
  { value: 'rejected', label: 'Rejected' },
]

const CATEGORY_FILTERS = [
  { key: '',            label: 'All Categories' },
  { key: 'noise',       label: '🔇 Noise & Quiet' },
  { key: 'cleanliness', label: '🧹 Cleanliness' },
  { key: 'guests',      label: '👥 Guests' },
  { key: 'kitchen',     label: '🍳 Kitchen' },
  { key: 'bathroom',    label: '🚿 Bathroom' },
  { key: 'general',     label: '📋 General' },
]

export default function RulesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { houseId, house, loading: hLoading } = useHouseData()
  const { rules, loading, refresh } = useRules(houseId)
  
  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useSocketEvent('rule_updated', useCallback(() => refresh(), [refresh]))

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No House Joined" description="JOIN OR CREATE A HOUSE FIRST TO PROPOSE AND VOTE ON RULES" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  const isAdmin = house?.members?.find(m => m.user._id === user._id)?.role === 'admin'
  const totalMembers = house?.members?.length || 1
  const majorityQuorum = Math.ceil(totalMembers / 2)

  // Summary Metrics
  const stats = useMemo(() => {
    const total = rules.length
    const active = rules.filter(r => r.status === 'active').length
    const voting = rules.filter(r => r.status === 'voting').length
    const rejected = rules.filter(r => r.status === 'rejected').length

    return { total, active, voting, rejected }
  }, [rules])

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return rules.filter(r => {
      // Status tab
      if (tab && r.status !== tab) return false

      // Category filter
      if (categoryFilter && r.category !== categoryFilter) return false

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const titleMatch = r.title?.toLowerCase().includes(q)
        const descMatch = r.description?.toLowerCase().includes(q)
        const proposerMatch = r.proposedBy?.name?.toLowerCase().includes(q)
        if (!titleMatch && !descMatch && !proposerMatch) return false
      }

      return true
    })
  }, [rules, tab, categoryFilter, searchQuery])

  return (
    <div className="w-full px-4 lg:px-8 xl:px-10 pb-24 space-y-8">
      
      {/* ========================================================= */}
      {/* 1. DEMOCRATIC GOVERNANCE METRICS STRIP */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Constitution */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Enacted Rules</span>
            <CheckCircle2 size={16} className="text-accent-emerald" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {stats.active} Active
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Democratically passed by housemates
          </div>
        </div>

        {/* Voting Ballots */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Active Ballots</span>
            <Vote size={16} className={stats.voting > 0 ? "text-accent-orange animate-pulse" : "text-primary-muted"} />
          </div>
          <div 
            className="font-display text-3xl md:text-4xl font-bold tracking-tight"
            style={{ color: stats.voting > 0 ? '#FF6B00' : '#FFFFFF' }}
          >
            {stats.voting} Open
          </div>
          <div className="text-xs text-primary-muted mt-2">
            {stats.voting > 0 ? 'Cast your vote below' : 'No ongoing ballots'}
          </div>
        </div>

        {/* Quorum Threshold */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Enactment Quorum</span>
            <Scale size={16} className="text-accent-cyan" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {majorityQuorum} of {totalMembers}
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Majority votes needed to enact
          </div>
        </div>

        {/* Total Proposals */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Total Proposals</span>
            <FileText size={16} className="text-accent-purple" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {stats.total} Total
          </div>
          <div className="text-xs text-primary-muted mt-2">
            {stats.rejected} rejected / dismissed
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
              placeholder="Search house rules, descriptions, or proposers..."
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

          {/* Propose Rule Button */}
          <Button 
            onClick={() => setShowAdd(true)} 
            className="flex items-center gap-2 shrink-0 bg-accent-orange text-obsidian font-bold shadow-glow w-full sm:w-auto"
          >
            <Plus size={16} /> Propose House Rule
          </Button>
        </div>

        {/* Status & Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          
          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {TABS.map(t => {
              const count = t.value ? rules.filter(r => r.status === t.value).length : rules.length
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
            {CATEGORY_FILTERS.map(c => (
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
      {/* 3. RULES GRID */}
      {/* ========================================================= */}
      {loading || hLoading ? (
        <div className="flex justify-center py-16 bento-card rounded-3xl">
          <Spinner size={32} color="#00E5FF" />
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="bento-card rounded-3xl p-12 text-center">
          <EmptyState 
            icon="📜" 
            title="No House Rules Found" 
            description={
              searchQuery 
                ? `NO RULES MATCHING "${searchQuery.toUpperCase()}"`
                : tab 
                ? `NO ${tab.toUpperCase()} RULES AT THE MOMENT` 
                : 'PROPOSE YOUR FIRST DEMOCRATIC HOUSE AGREEMENT'
            } 
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredRules.map((rule, i) => (
            <div key={rule._id} className="h-full">
              <RuleCard rule={rule} onRefresh={refresh} isAdmin={isAdmin} index={i} members={house?.members} />
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddRuleModal houseId={houseId} onClose={() => setShowAdd(false)} onAdded={() => refresh()} />
      )}
    </div>
  )
}
