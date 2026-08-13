import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFinance } from '../hooks/useFinance'
import { useSocketEvent } from '../context/SocketContext'
import { Button, Spinner, EmptyState, ProgressBar, Badge } from '../components/ui'
import AddExpenseModal from '../components/finance/AddExpenseModal'
import ExpenseCard from '../components/finance/ExpenseCard'
import BalanceSummary from '../components/finance/BalanceSummary'
import { 
  Plus, ChevronLeft, ChevronRight, Search, DollarSign, Wallet, 
  TrendingUp, TrendingDown, Repeat, PieChart, Sparkles, Filter, X
} from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { key: 'rent',        label: 'Rent',        icon: '🏠', color: '#8A2BE2' },
  { key: 'electricity', label: 'Electricity', icon: '⚡', color: '#F59E0B' },
  { key: 'water',       label: 'Water',       icon: '💧', color: '#00E5FF' },
  { key: 'internet',    label: 'Internet',    icon: '🌐', color: '#3B82F6' },
  { key: 'groceries',   label: 'Groceries',   icon: '🛒', color: '#10B981' },
  { key: 'maintenance', label: 'Maintenance', icon: '🔧', color: '#EC4899' },
  { key: 'other',       label: 'Other',       icon: '📋', color: '#6B7280' },
]

export default function FinancePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    houseId, house, expenses, balances, loading,
    page, pages, category, setCategory, goToPage, refresh,
  } = useFinance()

  const [showAdd, setShowAdd] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all' | 'my_splits' | 'recurring'

  const handleExpenseEvent = useCallback(() => refresh(), [refresh])

  const handlePaymentRequested = useCallback((data) => {
    if (data?.to === user._id) {
      toast(`💰 ${data.amount ? `Payment of ${data.amount} requested` : 'Someone requested a payment from you'} for "${data.title}"`, { duration: 5000 })
    }
    refresh()
  }, [refresh, user._id])

  useSocketEvent('expense_added',     handleExpenseEvent)
  useSocketEvent('expense_updated',   handleExpenseEvent)
  useSocketEvent('expense_deleted',   handleExpenseEvent)
  useSocketEvent('payment_requested', handlePaymentRequested)

  const curr = house?.currency === 'BDT' ? '৳' : house?.currency === 'USD' ? '$' : '৳'

  // Calculate high-level financial metrics
  const financialStats = useMemo(() => {
    const totalSpend = expenses.reduce((acc, ex) => acc + (Number(ex.totalAmount) || 0), 0)
    
    let myTotalShare = 0
    let recurringCount = 0

    expenses.forEach(ex => {
      if (ex.isRecurring) recurringCount++
      const mySplit = ex.splits?.find(s => (s.user?._id || s.user) === user?._id)
      if (mySplit) {
        myTotalShare += Number(mySplit.amount) || 0
      }
    })

    const iOwe = balances.filter(b => b.debtor === user?._id).reduce((a, b) => a + b.amount, 0)
    const owedToMe = balances.filter(b => b.creditor === user?._id).reduce((a, b) => a + b.amount, 0)
    const netPosition = owedToMe - iOwe

    // Category breakdown
    const categoryTotals = {}
    expenses.forEach(ex => {
      const cat = ex.category || 'other'
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(ex.totalAmount || 0)
    })

    return {
      totalSpend,
      myTotalShare,
      netPosition,
      iOwe,
      owedToMe,
      recurringCount,
      categoryTotals
    }
  }, [expenses, balances, user])

  // Filter expenses by search and tab
  const filteredExpenses = useMemo(() => {
    return expenses.filter(ex => {
      // Search text match
      const matchesSearch = 
        !searchQuery ||
        ex.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.paidBy?.name?.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      // Tab filter
      if (filterType === 'recurring') return ex.isRecurring
      if (filterType === 'my_splits') {
        return ex.splits?.some(s => (s.user?._id || s.user) === user?._id)
      }

      return true
    })
  }, [expenses, searchQuery, filterType, user])

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No House Joined" description="JOIN OR CREATE A HOUSE FIRST TO TRACK SHARED EXPENSES" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  return (
    <div className="w-full px-4 md:px-8 pb-24 max-w-7xl mx-auto space-y-8">
      
      {/* ========================================================= */}
      {/* 1. FINANCIAL SUMMARY METRIC CARDS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total House Spend */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Total House Spend</span>
            <DollarSign size={16} className="text-accent-orange" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {curr}{financialStats.totalSpend.toLocaleString()}
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Across {expenses.length} logged expenses
          </div>
        </div>

        {/* My Total Share */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">My Assigned Share</span>
            <Wallet size={16} className="text-accent-cyan" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {curr}{financialStats.myTotalShare.toLocaleString()}
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Your portion of shared expenses
          </div>
        </div>

        {/* Net Debt Position */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Net Balance Position</span>
            {financialStats.netPosition >= 0 ? (
              <TrendingUp size={16} className="text-accent-emerald" />
            ) : (
              <TrendingDown size={16} className="text-accent-rose" />
            )}
          </div>
          <div 
            className="font-display text-3xl md:text-4xl font-bold tracking-tight"
            style={{ color: financialStats.netPosition >= 0 ? '#10B981' : '#F43F5E' }}
          >
            {financialStats.netPosition >= 0 ? '+' : '−'}{curr}{Math.abs(financialStats.netPosition).toLocaleString()}
          </div>
          <div className="text-xs text-primary-muted mt-2">
            {financialStats.netPosition > 0 && `You are owed ${curr}${financialStats.netPosition.toLocaleString()} overall`}
            {financialStats.netPosition < 0 && `You owe ${curr}${Math.abs(financialStats.netPosition).toLocaleString()} overall`}
            {financialStats.netPosition === 0 && 'All debts settled!'}
          </div>
        </div>

        {/* Recurring Bills */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between text-primary-muted mb-3">
            <span className="font-label-caps text-[10px] uppercase tracking-widest">Scheduled Bills</span>
            <Repeat size={16} className="text-accent-purple" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {financialStats.recurringCount} Active
          </div>
          <div className="text-xs text-primary-muted mt-2">
            Auto-recurring monthly splits
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. CATEGORY SPEND DISTRIBUTION BAR */}
      {/* ========================================================= */}
      {financialStats.totalSpend > 0 && (
        <div className="bento-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-primary-muted flex items-center gap-1.5">
              <PieChart size={13} className="text-accent-orange" /> Expense Distribution by Category
            </span>
          </div>

          {/* Multi-segment stacked progress bar */}
          <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden flex shadow-inner">
            {CATEGORIES.map(cat => {
              const amount = financialStats.categoryTotals[cat.key] || 0
              const pct = (amount / financialStats.totalSpend) * 100
              if (pct <= 0) return null
              return (
                <div
                  key={cat.key}
                  style={{ width: `${pct}%`, backgroundColor: cat.color }}
                  className="h-full transition-all hover:opacity-80 relative group/seg"
                  title={`${cat.label}: ${curr}${amount.toLocaleString()} (${Math.round(pct)}%)`}
                />
              )
            })}
          </div>

          {/* Category Legend Chips */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {CATEGORIES.map(cat => {
              const amount = financialStats.categoryTotals[cat.key] || 0
              if (amount <= 0) return null
              const pct = Math.round((amount / financialStats.totalSpend) * 100)
              return (
                <div key={cat.key} className="flex items-center gap-1.5 text-xs text-primary-muted">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-white font-medium">{cat.label}</span>
                  <span className="font-mono text-[10px] opacity-60">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MAIN LEDGER & BALANCE SETTLEMENT SECTION */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left: Expenses Stream (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Controls Bar (Search + Quick Filter + Add Button) */}
          <div className="bento-card rounded-3xl p-5 space-y-4">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Search Box */}
              <div className="relative flex-1 w-full">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-muted" />
                <input
                  type="text"
                  placeholder="Search expenses, payers, or notes..."
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

              {/* Add Expense Button */}
              <Button 
                onClick={() => setShowAdd(true)} 
                className="flex items-center gap-2 shrink-0 bg-accent-orange text-obsidian font-bold shadow-glow w-full sm:w-auto"
              >
                <Plus size={16} /> Add Shared Expense
              </Button>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 pt-1">
              <FilterChip label="All Categories" active={category === ''} onClick={() => setCategory('')} />
              {CATEGORIES.map(c => (
                <FilterChip 
                  key={c.key} 
                  label={`${c.icon} ${c.label}`} 
                  active={category === c.key} 
                  onClick={() => setCategory(category === c.key ? '' : c.key)} 
                />
              ))}
            </div>

            {/* Sub-Filters (All / My Splits / Recurring) */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-xs">
              <span className="text-primary-muted font-label-caps text-[9px] uppercase tracking-wider mr-1">Show:</span>
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-full transition-colors ${filterType === 'all' ? 'bg-white/10 text-white font-bold' : 'text-primary-muted hover:text-white'}`}
              >
                All Expenses ({expenses.length})
              </button>
              <button
                onClick={() => setFilterType('my_splits')}
                className={`px-3 py-1 rounded-full transition-colors ${filterType === 'my_splits' ? 'bg-white/10 text-white font-bold' : 'text-primary-muted hover:text-white'}`}
              >
                My Splits
              </button>
              <button
                onClick={() => setFilterType('recurring')}
                className={`px-3 py-1 rounded-full transition-colors ${filterType === 'recurring' ? 'bg-white/10 text-white font-bold' : 'text-primary-muted hover:text-white'}`}
              >
                Recurring Bills 🔄
              </button>
            </div>

          </div>

          {/* Expense Cards List */}
          {loading ? (
            <div className="flex justify-center py-16 bento-card rounded-3xl">
              <Spinner size={32} color="#00E5FF" />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="bento-card rounded-3xl p-12 text-center">
              <EmptyState 
                icon="💸" 
                title="No Expenses Found" 
                description={
                  searchQuery 
                    ? `NO RESULTS MATCHING "${searchQuery.toUpperCase()}"`
                    : category 
                    ? `NO ${category.toUpperCase()} EXPENSES LOGGED YET` 
                    : 'ADD YOUR FIRST SHARED EXPENSE TO START TRACKING'
                } 
              />
            </div>
          ) : (
            <div className="bento-card rounded-3xl overflow-hidden divide-y divide-glass-border">
              {filteredExpenses.map((ex) => (
                <div key={ex._id} className="transition-colors hover:bg-white/[0.02]">
                  <ExpenseCard
                    expense={ex}
                    currency={house?.currency}
                    members={house?.members}
                    onRefresh={refresh}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-6 mt-4">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="flex p-3 bg-white/5 border border-glass-border hover:bg-white/10 hover:border-white/30 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-mono text-[12px] text-primary-muted tracking-[0.2em] uppercase">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= pages}
                className="flex p-3 bg-white/5 border border-glass-border hover:bg-white/10 hover:border-white/30 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

        </div>

        {/* Right: Balances & Settle Up (4 cols) */}
        <div className="lg:col-span-4">
          <BalanceSummary balances={balances} members={house?.members} currency={house?.currency} />
        </div>

      </div>

      {/* Add expense modal */}
      {showAdd && (
        <AddExpenseModal
          houseId={houseId}
          members={house?.members}
          currency={house?.currency}
          onClose={() => setShowAdd(false)}
          onAdded={() => refresh()}
        />
      )}
    </div>
  )
}

const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={[
      'px-3.5 py-1.5 rounded-full font-label-caps text-[10px] whitespace-nowrap transition-all duration-300 uppercase tracking-wider',
      active 
        ? 'bg-white text-obsidian font-bold shadow-glow scale-105' 
        : 'bg-white/5 text-primary-muted border border-glass-border hover:bg-white/10 hover:border-white/30 hover:text-white',
    ].join(' ')}
  >
    {label}
  </button>
)
