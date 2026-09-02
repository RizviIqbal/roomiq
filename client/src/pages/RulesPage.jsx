import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHouseData, useRules } from '../hooks/useHouseData'
import { useSocketEvent } from '../context/SocketContext'
import { Button, Spinner, EmptyState, ProgressBar, Badge } from '../components/ui'
import AddRuleModal from '../components/rules/AddRuleModal'
import RuleCard from '../components/rules/RuleCard'
import api from '../services/api'
import toast from 'react-hot-toast'
import { 
  Plus, Search, Vote, Scale, CheckCircle2, XCircle, Clock, 
  Sparkles, FileText, X, Users, Shield, BookOpen, GraduationCap, 
  Briefcase, HeartHandshake, ArrowRight, Bell
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
  const { houseId, house } = useHouseData()
  const { rules = [], loading, refresh } = useRules(houseId)
  
  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [applyingPack, setApplyingPack] = useState(false)

  // Real-time socket sync
  useSocketEvent('rule_updated', useCallback(() => refresh(), [refresh]))
  
  // Real-time friendly rule reminder notification
  useSocketEvent('rule_nudge', useCallback((data) => {
    toast(`🔔 Friendly house reminder: "${data.title}"`, {
      icon: '🕊️',
      duration: 6000,
      style: { background: '#1E1B4B', color: '#fff', border: '1px solid #9333EA', fontWeight: 'bold' }
    })
  }, []))

  // Adopt 1-Click Starter Constitution Pack
  const handleApplyStarterPack = async (packKey) => {
    if (!window.confirm(`Adopt the ${packKey.toUpperCase()} House Constitution Template? This will add 3 curated co-living standards.`)) return
    setApplyingPack(true)
    try {
      const { data } = await api.post(`/rules/house/${houseId}/starter-pack`, { packKey })
      toast.success(data.message, { icon: '📜' })
      refresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply template')
    } finally {
      setApplyingPack(false)
    }
  }

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No House Joined" description="JOIN OR CREATE A HOUSE FIRST TO PROPOSE AND VOTE ON RULES" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  const isAdmin = house?.members?.find(m => (m.user?._id || m.user) === user?._id)?.role === 'admin'
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
      if (tab && r.status !== tab) return false
      if (categoryFilter && r.category !== categoryFilter) return false
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
    <div className="w-full px-4 sm:px-6 lg:px-10 pb-24 space-y-8 max-w-[1600px] mx-auto font-body text-white">
      
      {/* ========================================================= */}
      {/* 1. DEMOCRATIC GOVERNANCE METRICS STRIP                   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Enacted Rules */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group shadow-xl">
          <div className="flex items-center justify-between text-primary-muted mb-2">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Enacted Standards</span>
            <CheckCircle2 size={16} className="text-accent-emerald" />
          </div>
          <div className="font-display text-4xl font-extrabold text-white tracking-tight">
            {stats.active} Active
          </div>
          <div className="text-xs text-primary-muted mt-1">
            Democratically passed by house consensus
          </div>
        </div>

        {/* Voting Ballots */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group shadow-xl">
          <div className="flex items-center justify-between text-primary-muted mb-2">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Open Ballots</span>
            <Vote size={16} className={stats.voting > 0 ? "text-accent-orange animate-pulse" : "text-primary-muted"} />
          </div>
          <div className={`font-display text-4xl font-extrabold tracking-tight ${stats.voting > 0 ? 'text-accent-orange' : 'text-white'}`}>
            {stats.voting} Open
          </div>
          <div className="text-xs text-primary-muted mt-1">
            {stats.voting > 0 ? 'Cast your vote below' : 'Zero pending ballots'}
          </div>
        </div>

        {/* Quorum Threshold */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group shadow-xl">
          <div className="flex items-center justify-between text-primary-muted mb-2">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Majority Quorum</span>
            <Scale size={16} className="text-accent-cyan" />
          </div>
          <div className="font-display text-4xl font-extrabold text-white tracking-tight">
            {majorityQuorum} of {totalMembers}
          </div>
          <div className="text-xs text-primary-muted mt-1">
            Votes required to enact rules
          </div>
        </div>

        {/* Total Proposals */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group shadow-xl">
          <div className="flex items-center justify-between text-primary-muted mb-2">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Rule Archive</span>
            <FileText size={16} className="text-accent-purple" />
          </div>
          <div className="font-display text-4xl font-extrabold text-white tracking-tight">
            {stats.total} Total
          </div>
          <div className="text-xs text-primary-muted mt-1">
            {stats.rejected} dismissed proposals
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. CONSTITUTION STARTER PACKS (FAST ONBOARDING)           */}
      {/* ========================================================= */}
      {rules.length < 5 && (
        <div className="bento-card rounded-3xl p-6 sm:p-8 space-y-4 !bg-gradient-to-r from-accent-purple/10 via-obsidian to-accent-orange/10 border-accent-purple/20 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-label-caps text-[10px] text-accent-cyan uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Sparkles size={12} /> Fast-Pass Constitution Templates
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-0.5">
                Adopt Curated House Standards in 1 Click
              </h3>
              <p className="text-xs text-primary-muted">
                Pre-built living bylaws designed for student focus, working professionals, and communal balance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Academic Pack */}
            <button
              onClick={() => handleApplyStarterPack('academic')}
              disabled={applyingPack}
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-glass-border hover:border-accent-purple/50 text-left transition-all group active:scale-[0.98] flex flex-col justify-between gap-3 shadow-md"
            >
              <div>
                <div className="flex items-center gap-2 text-accent-purple font-bold text-xs">
                  <GraduationCap size={16} /> Academic Focus
                </div>
                <div className="text-xs text-white font-bold mt-1">Student Sanctuary</div>
                <p className="text-[11px] text-primary-muted mt-1 leading-relaxed">
                  23:00 Quiet hours, zero-dish overnight sink rule, 24h guest notice.
                </p>
              </div>
              <span className="text-[10px] font-label-caps text-accent-purple uppercase tracking-wider group-hover:underline flex items-center gap-1">
                Adopt Template →
              </span>
            </button>

            {/* Professional Pack */}
            <button
              onClick={() => handleApplyStarterPack('professional')}
              disabled={applyingPack}
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-glass-border hover:border-accent-cyan/50 text-left transition-all group active:scale-[0.98] flex flex-col justify-between gap-3 shadow-md"
            >
              <div>
                <div className="flex items-center gap-2 text-accent-cyan font-bold text-xs">
                  <Briefcase size={16} /> Work & Career
                </div>
                <div className="text-xs text-white font-bold mt-1">Professional Harmony</div>
                <p className="text-[11px] text-primary-muted mt-1 leading-relaxed">
                  Clean-as-you-cook, daytime WFH meeting respect, dry bathroom floor standard.
                </p>
              </div>
              <span className="text-[10px] font-label-caps text-accent-cyan uppercase tracking-wider group-hover:underline flex items-center gap-1">
                Adopt Template →
              </span>
            </button>

            {/* Social Pack */}
            <button
              onClick={() => handleApplyStarterPack('social')}
              disabled={applyingPack}
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-glass-border hover:border-accent-orange/50 text-left transition-all group active:scale-[0.98] flex flex-col justify-between gap-3 shadow-md"
            >
              <div>
                <div className="flex items-center gap-2 text-accent-orange font-bold text-xs">
                  <HeartHandshake size={16} /> Co-Living Vibes
                </div>
                <div className="text-xs text-white font-bold mt-1">Social & Potluck</div>
                <p className="text-[11px] text-primary-muted mt-1 leading-relaxed">
                  Common room entertainment handoff, labeled fridge shelves, Sunday 30-min group sync.
                </p>
              </div>
              <span className="text-[10px] font-label-caps text-accent-orange uppercase tracking-wider group-hover:underline flex items-center gap-1">
                Adopt Template →
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SEARCH, CONTROLS & FILTER BAR                         */}
      {/* ========================================================= */}
      <div className="bento-card rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-muted" />
            <input
              type="text"
              placeholder="Search house rules, standards, or proposers..."
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

          {/* Propose Rule Button */}
          <button 
            onClick={() => setShowAdd(true)} 
            className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-orange-600 text-obsidian font-bold text-xs shadow-glow transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <Plus size={16} />
            <span>Propose New Rule</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-glass-border">
          
          {/* Status Tabs */}
          <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            {TABS.map(t => {
              const count = t.value ? rules.filter(r => r.status === t.value).length : rules.length
              const isActive = tab === t.value
              return (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-label-caps uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-obsidian font-bold shadow-glow scale-105'
                      : 'bg-white/5 text-primary-muted hover:text-white border border-glass-border hover:border-white/20'
                  }`}
                >
                  <span>{t.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? 'bg-black/20 text-obsidian' : 'bg-white/10 text-white'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Category Chips */}
          <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            {CATEGORY_FILTERS.map(c => (
              <button
                key={c.key}
                onClick={() => setCategoryFilter(c.key)}
                className={`px-3 py-1 rounded-full text-[11px] transition-all whitespace-nowrap ${
                  categoryFilter === c.key
                    ? 'bg-accent-purple text-white font-bold shadow-glow'
                    : 'bg-white/5 text-primary-muted hover:text-white border border-glass-border hover:border-white/20'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 4. RULES CONSTITUTION GRID                                */}
      {/* ========================================================= */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size={36} color="#F97316" />
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="py-20 text-center bento-card rounded-3xl p-8 space-y-3">
          <div className="text-4xl">📜</div>
          <h3 className="font-display text-xl font-bold text-white">No Rules Found</h3>
          <p className="text-xs text-primary-muted max-w-sm mx-auto">
            {searchQuery || categoryFilter || tab 
              ? 'No rules match your active filters. Clear search to see all standards.'
              : 'Your household has no rules enacted yet. Adopt a template or propose your first standard!'}
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-2 px-5 py-2.5 rounded-xl bg-accent-orange text-obsidian font-bold text-xs shadow-glow"
          >
            Propose First Rule
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRules.map((r, i) => (
            <RuleCard 
              key={r._id} 
              rule={r} 
              onRefresh={refresh} 
              isAdmin={isAdmin} 
              index={i} 
              members={house?.members}
            />
          ))}
        </div>
      )}

      {/* Propose Rule Modal */}
      {showAdd && (
        <AddRuleModal
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
