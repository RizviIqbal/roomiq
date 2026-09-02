import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocketEvent } from '../context/SocketContext'
import { Badge, Avatar, Button, Spinner, EmptyState, PageTransition, AnimatedNumber, fadeSlideUp } from '../components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  DollarSign, CheckSquare, AlertTriangle, Wrench,
  ShoppingCart, Copy, Check, ArrowRight, Users, X, Shield, UserMinus,
  Mail, Phone, Heart, Sparkles, Plus, Megaphone, Clock, ShieldCheck,
  TrendingUp, TrendingDown, Wallet, Calendar, Zap, MessageCircle,
  Sun, Moon, Coffee, AlertCircle, Pin, CheckCircle2, ChevronRight, HandCoins
} from 'lucide-react'
import SettleBalanceModal from '../components/finance/SettleBalanceModal'

const currency = (amt, curr = 'BDT') =>
  `${curr === 'BDT' ? '৳' : curr === 'USD' ? '$' : curr === 'EUR' ? '€' : ''}${Number(amt || 0).toLocaleString()}`

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [house,       setHouse]       = useState(null)
  const [expenses,    setExpenses]    = useState([])
  const [chores,      setChores]      = useState([])
  const [balances,    setBalances]    = useState([])
  const [lowStock,    setLowStock]    = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [notices,     setNotices]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [copied,      setCopied]      = useState(false)
  const [completingChoreId, setCompletingChoreId] = useState(null)
  const [settlingDebt, setSettlingDebt] = useState(null)

  const [selectedMember, setSelectedMember] = useState(null)
  const [actionLoading, setActionLoading]   = useState(false)

  const houseId = user?.currentHouse?._id || user?.currentHouse

  const fetchDashboard = useCallback(() => {
    if (!houseId) { setLoading(false); return }
    api.get(`/dashboard/house/${houseId}`)
      .then(({ data }) => {
        setHouse(data.house)
        setExpenses(data.recentExpenses || [])
        setChores(data.chores || [])
        setBalances(data.balances || [])
        setLowStock(data.lowStock || [])
        setMaintenance(data.maintenance || [])
        setNotices(data.notices || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [houseId])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  // Real-time socket sync
  const silentRefresh = useCallback(() => fetchDashboard(), [fetchDashboard])
  useSocketEvent('expense_added',       silentRefresh)
  useSocketEvent('expense_updated',     silentRefresh)
  useSocketEvent('expense_deleted',     silentRefresh)
  useSocketEvent('chore_updated',       silentRefresh)
  useSocketEvent('inventory_updated',   silentRefresh)
  useSocketEvent('maintenance_updated', silentRefresh)
  useSocketEvent('notice_posted',       silentRefresh)

  const copyCode = () => {
    navigator.clipboard.writeText(house?.inviteCode || '')
    setCopied(true)
    toast.success('House invite code copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  // 1-Tap Quick Complete Chore directly from Dashboard
  const handleQuickCompleteChore = async (choreId, e) => {
    e.stopPropagation()
    setCompletingChoreId(choreId)
    try {
      await api.put(`/chores/${choreId}/done`)
      toast.success('🎉 Chore completed! (+15 House Karma)', {
        icon: '✅',
        style: { background: '#10B981', color: '#fff' }
      })
      setChores(prev => prev.filter(c => c._id !== choreId))
      fetchDashboard()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete chore')
    } finally {
      setCompletingChoreId(null)
    }
  }

  const handleTransferAdmin = async (newAdminId) => {
    if (!window.confirm("Are you sure you want to transfer the Admin role? You will become a regular member.")) return
    setActionLoading(true)
    try {
      await api.put(`/houses/${houseId}/transfer-admin`, { newAdminId })
      toast.success("Admin role transferred")
      setSelectedMember(null)
      fetchDashboard()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to transfer admin")
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member from the house?")) return
    setActionLoading(true)
    try {
      await api.delete(`/houses/${houseId}/members/${userId}`)
      toast.success("Member removed")
      setSelectedMember(null)
      fetchDashboard()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member")
    } finally {
      setActionLoading(false)
    }
  }

  // Calculate Circadian Greeting & Mode
  const currentHour = new Date().getHours()
  const circadianInfo = useMemo(() => {
    if (currentHour >= 5 && currentHour < 12) {
      return {
        greeting: 'Good morning',
        icon: Sun,
        mode: 'Day Mode: Morning Routine & Quiet Hours Lifted',
        color: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
      }
    } else if (currentHour >= 12 && currentHour < 17) {
      return {
        greeting: 'Good afternoon',
        icon: Coffee,
        mode: 'Focus Mode: Study & Work Hours',
        color: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
      }
    } else if (currentHour >= 17 && currentHour < 22) {
      return {
        greeting: 'Good evening',
        icon: Sparkles,
        mode: 'Evening Mode: Dinner & Chore Handoff',
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      }
    } else {
      return {
        greeting: 'Good night',
        icon: Moon,
        mode: 'Rest Mode: 23:00 Quiet Hours in Effect',
        color: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
      }
    }
  }, [currentHour])

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <div className="text-4xl mb-5">🏠</div>
      <h1 className="text-xl font-bold tracking-tight text-white mb-2">No house connected</h1>
      <p className="text-sm text-primary-muted mb-7">Create a new house profile or join with an invite code.</p>
      <Button onClick={() => navigate('/house-setup')} size="lg" className="bg-gradient-to-r from-accent-purple to-accent-orange font-bold text-white shadow-glow">
        Set up a house
      </Button>
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <Spinner size={36} color="#F97316" />
    </div>
  )

  const myBalance = balances.filter(b =>
    b.debtor === user?._id || b.creditor === user?._id
  )

  const myChores = chores.filter(c =>
    (c.assignedTo?._id === user?._id || c.assignedTo === user?._id) && c.status === 'pending'
  )

  const isMeAdmin = house?.members?.find(m => m.user?._id === user?._id)?.role === 'admin'

  const totalOwedByMe = myBalance.reduce((acc, b) => {
    if (b.debtor === user?._id) return acc + b.amount
    return acc
  }, 0)

  const totalOwedToMe = myBalance.reduce((acc, b) => {
    if (b.creditor === user?._id) return acc + b.amount
    return acc
  }, 0)

  const pinnedNotice = notices.find(n => n.isPinned) || notices[0]

  const CircadianIcon = circadianInfo.icon

  return (
    <PageTransition className="w-full px-4 sm:px-6 lg:px-10 pb-24 space-y-6 max-w-[1600px] mx-auto">
      
      {/* ========================================================= */}
      {/* 1. TOP CIRCADIAN HERO & QUICK PULSE COMMAND CENTER        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* House Overview Hero Card (8 cols) */}
        <motion.div variants={fadeSlideUp} className="lg:col-span-8 bento-card rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden flex flex-col justify-between group shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-orange/10 rounded-full blur-[110px] pointer-events-none group-hover:bg-accent-orange/15 transition-all duration-700" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-accent-purple/10 rounded-full blur-[110px] pointer-events-none" />

          <div className="relative z-10 space-y-4">
            {/* Circadian Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${circadianInfo.color}`}>
                <CircadianIcon size={13} className="animate-pulse" />
                <span>{circadianInfo.mode}</span>
              </div>

              <div className="font-mono text-xs text-primary-muted flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-emerald animate-ping" />
                <span>REAL-TIME SOCKET SYNC</span>
              </div>
            </div>

            {/* Personalized Greeting */}
            <div>
              <div className="text-primary-muted text-sm font-medium">
                {circadianInfo.greeting}, <strong className="text-white">{user?.name?.split(' ')[0]}</strong> 👋
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mt-1">
                {house?.name}
              </h1>
              <p className="font-body text-xs sm:text-sm text-primary-muted max-w-xl leading-relaxed mt-1">
                {house?.address || 'Verified Connected Residence'} • {house?.members?.length || 0} Housemates Active
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-glass-border">
            <button
              onClick={() => navigate('/app/finance')}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-glass-border text-left transition-all group/btn flex flex-col justify-between gap-2 shadow-sm hover:border-accent-emerald/40"
            >
              <div className="flex justify-between items-center">
                <DollarSign size={18} className="text-accent-emerald group-hover/btn:scale-110 transition-transform" />
                <span className="font-mono text-[10px] text-accent-emerald font-bold uppercase">Split</span>
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover/btn:text-accent-emerald transition-colors">Add Expense</div>
                <div className="text-[10px] text-primary-muted">Log receipt or rent</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/app/chores')}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-glass-border text-left transition-all group/btn flex flex-col justify-between gap-2 shadow-sm hover:border-accent-cyan/40"
            >
              <div className="flex justify-between items-center">
                <CheckSquare size={18} className="text-accent-cyan group-hover/btn:scale-110 transition-transform" />
                <span className="font-mono text-[10px] text-accent-cyan font-bold uppercase">{myChores.length} Pending</span>
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover/btn:text-accent-cyan transition-colors">House Chores</div>
                <div className="text-[10px] text-primary-muted">Rotate cleaning</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/app/noticeboard')}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-glass-border text-left transition-all group/btn flex flex-col justify-between gap-2 shadow-sm hover:border-accent-orange/40"
            >
              <div className="flex justify-between items-center">
                <Megaphone size={18} className="text-accent-orange group-hover/btn:scale-110 transition-transform" />
                <span className="font-mono text-[10px] text-accent-orange font-bold uppercase">Board</span>
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover/btn:text-accent-orange transition-colors">Noticeboard</div>
                <div className="text-[10px] text-primary-muted">Post house bulletin</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/app/shopping')}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-glass-border text-left transition-all group/btn flex flex-col justify-between gap-2 shadow-sm hover:border-accent-purple/40"
            >
              <div className="flex justify-between items-center">
                <ShoppingCart size={18} className="text-accent-purple group-hover/btn:scale-110 transition-transform" />
                <span className="font-mono text-[10px] text-accent-purple font-bold uppercase">Pantry</span>
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover/btn:text-accent-purple transition-colors">Supplies</div>
                <div className="text-[10px] text-primary-muted">{lowStock.length} low stock</div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Invite Code & House Quick Stats (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Interactive Invite Code Card */}
          <motion.div 
            variants={fadeSlideUp}
            onClick={copyCode}
            className="bento-card interactive rounded-3xl p-6 flex flex-col justify-center items-center text-center cursor-pointer group !bg-accent-purple/5 !border-accent-purple/20 relative overflow-hidden active:scale-[0.98] transition-all shadow-xl"
          >
            <div className="font-label-caps text-xs text-primary-muted uppercase tracking-widest mb-1.5 group-hover:text-accent-purple transition-colors">
              House Invite Code
            </div>
            
            <div className="font-mono text-3xl font-bold tracking-[0.25em] text-white group-hover:text-gradient transition-all flex items-center gap-2">
              {house?.inviteCode || '••••••'}
            </div>
            
            <div className="mt-2.5 text-xs text-primary-muted flex items-center gap-1 font-label-caps uppercase tracking-wider">
              {copied ? (
                <span className="text-accent-emerald flex items-center gap-1 font-bold">
                  <Check size={13} /> Copied to Clipboard
                </span>
              ) : (
                <span className="flex items-center gap-1 group-hover:text-white transition-colors">
                  <Copy size={13} /> Tap to Copy Invite Code
                </span>
              )}
            </div>
          </motion.div>

          {/* Quick Stat Double Bento */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            <motion.div 
              variants={fadeSlideUp}
              onClick={() => navigate('/app/profile')}
              className="bento-card interactive rounded-3xl p-5 flex flex-col justify-between group !bg-accent-cyan/5 !border-accent-cyan/20 cursor-pointer active:scale-[0.97] transition-all shadow-lg"
            >
              <div className="flex items-center justify-between text-primary-muted group-hover:text-white transition-colors">
                <span className="font-label-caps text-[9px] uppercase tracking-wider">Housemates</span>
                <Users size={15} className="text-accent-cyan" />
              </div>
              <div className="font-display text-4xl font-bold text-white mt-2">
                <AnimatedNumber value={house?.members?.length || 0} />
              </div>
              <div className="text-[10px] text-accent-cyan font-mono mt-1">Active in house</div>
            </motion.div>

            <motion.div 
              variants={fadeSlideUp}
              onClick={() => navigate('/app/maintenance')}
              className="bento-card interactive rounded-3xl p-5 flex flex-col justify-between group !bg-accent-rose/5 !border-accent-rose/20 cursor-pointer active:scale-[0.97] transition-all shadow-lg"
            >
              <div className="flex items-center justify-between text-primary-muted group-hover:text-accent-rose transition-colors">
                <span className="font-label-caps text-[9px] uppercase tracking-wider">Maintenance</span>
                <Wrench size={15} className="text-accent-rose" />
              </div>
              <div className="font-display text-4xl font-bold text-white mt-2">
                <AnimatedNumber value={maintenance.length} />
              </div>
              <div className="text-[10px] text-accent-rose font-mono mt-1">Open reports</div>
            </motion.div>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. URGENT HOUSE ATTENTION BAR (Notice & Low Stock Alert)  */}
      {/* ========================================================= */}
      {(pinnedNotice || lowStock.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {pinnedNotice && (
            <div 
              onClick={() => navigate('/app/noticeboard')}
              className={`bento-card rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/10 transition-all border-amber-500/30 bg-amber-500/5 ${
                lowStock.length > 0 ? 'md:col-span-7' : 'md:col-span-12'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <Pin size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-label-caps uppercase text-amber-400 font-bold tracking-wider">
                    PINNED HOUSE BULLETIN
                  </div>
                  <div className="text-sm font-medium text-white truncate">
                    {pinnedNotice.title}: <span className="text-primary-muted">{pinnedNotice.content}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-primary-muted shrink-0" />
            </div>
          )}

          {lowStock.length > 0 && (
            <div 
              onClick={() => navigate('/app/shopping')}
              className={`bento-card rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/10 transition-all border-rose-500/30 bg-rose-500/5 ${
                pinnedNotice ? 'md:col-span-5' : 'md:col-span-12'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                  <AlertCircle size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-label-caps uppercase text-rose-400 font-bold tracking-wider">
                    PANTRY ALERT
                  </div>
                  <div className="text-sm font-medium text-white truncate">
                    {lowStock.length} item{lowStock.length > 1 ? 's' : ''} running low ({lowStock.map(i => i.name).slice(0, 2).join(', ')})
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-primary-muted shrink-0" />
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. CORE OPERATIONAL BENTO (Finances, 1-Tap Chores, etc.)   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
        
        {/* FINANCIAL HEALTH & INSTANT BKASH SETTLEMENT (lg:col-span-6) */}
        <motion.div variants={fadeSlideUp} className="lg:col-span-6 bento-card rounded-3xl p-6 lg:p-8 space-y-6 !bg-accent-emerald/[0.02] !border-accent-emerald/20 shadow-xl">
          <SectionHead 
            title="My Ledger & Settlement" 
            onNav={() => navigate('/app/finance')} 
          />

          {myBalance.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="text-4xl">🎉</div>
              <h3 className="text-base font-bold text-white">All Settled Up!</h3>
              <p className="text-xs text-primary-muted max-w-xs mx-auto">
                You have zero unsettled debts and zero outstanding balances with your roommates.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBalance.map((b, i) => {
                const iOwe = b.debtor === user?._id
                const member = iOwe
                  ? house?.members?.find(m => m.user?._id === b.creditor)
                  : house?.members?.find(m => m.user?._id === b.debtor)
                const name = member?.user?.name || 'Housemate'
                const bkashNumber = member?.user?.bkashNumber

                const handleBkash = () => {
                  if (!bkashNumber) return
                  navigator.clipboard.writeText(bkashNumber)
                  toast.success(`Copied ${bkashNumber}. Launching bKash...`, {
                    icon: '📱', style: { background: '#e2136e', color: '#fff' }
                  })
                  setTimeout(() => { window.location.href = 'bkash://' }, 500)
                }

                return (
                  <div key={i} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-glass-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar name={name} size={36} src={member?.user?.avatar} />
                        <div>
                          <div className="text-xs text-primary-muted">
                            {iOwe ? 'You owe' : 'Owes you'}
                          </div>
                          <div className="text-sm font-bold text-white">{name}</div>
                        </div>
                      </div>

                      <div 
                        className="font-mono font-bold text-lg"
                        style={{ color: iOwe ? '#F43F5E' : '#10B981' }}
                      >
                        {iOwe ? '−' : '+'}{currency(b.amount, house?.currency)}
                      </div>
                    </div>

                    {iOwe && (
                      <div className="pt-2 border-t border-white/5 flex gap-2">
                        <button 
                          onClick={() => setSettlingDebt({ creditor: member?.user, debtor: user, amount: b.amount })} 
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-accent-emerald to-teal-500 hover:opacity-95 active:scale-[0.98] text-obsidian py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md"
                        >
                          <HandCoins size={14} />
                          <span>Settle {currency(b.amount, house?.currency)} (bKash / Cash)</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* TODAY'S ASSIGNED CHORES WITH 1-TAP COMPLETE (lg:col-span-6) */}
        <motion.div variants={fadeSlideUp} className="lg:col-span-6 bento-card rounded-3xl p-6 lg:p-8 space-y-6 !bg-accent-cyan/[0.02] !border-accent-cyan/20 shadow-xl">
          <SectionHead 
            title="My Assigned Chores" 
            count={myChores.length} 
            onNav={() => navigate('/app/chores')} 
          />

          {myChores.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="text-4xl">✨</div>
              <h3 className="text-base font-bold text-white">All Duties Cleared!</h3>
              <p className="text-xs text-primary-muted max-w-xs mx-auto">
                You have completed all your chores for the week. Take a well-deserved rest!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {myChores.slice(0, 4).map(c => {
                const isOverdue = new Date(c.dueDate) < new Date()
                const isCompleting = completingChoreId === c._id
                return (
                  <div 
                    key={c._id} 
                    className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.99] border border-glass-border flex items-center justify-between gap-3 transition-all group"
                  >
                    {/* 1-Tap Quick Complete Checkbox */}
                    <button
                      onClick={(e) => handleQuickCompleteChore(c._id, e)}
                      disabled={isCompleting}
                      title="Click to complete chore"
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
                        isCompleting 
                          ? 'bg-accent-emerald border-accent-emerald text-black animate-pulse' 
                          : 'border-white/30 hover:border-accent-emerald hover:bg-accent-emerald/20 text-transparent hover:text-accent-emerald'
                      }`}
                    >
                      <Check size={14} className="stroke-[3]" />
                    </button>

                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => navigate('/app/chores')}>
                      <div className="font-display font-medium text-sm text-white group-hover:text-accent-cyan transition-colors truncate">
                        {c.title}
                      </div>
                      <div className="font-mono text-[10px] text-primary-muted mt-0.5 uppercase">
                        Due {new Date(c.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    
                    {isOverdue && (
                      <Badge color="red" className="text-[9px] uppercase tracking-wider shrink-0 animate-pulse">
                        Overdue
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* RECENT SHARED EXPENSES (lg:col-span-7) */}
        <motion.div variants={fadeSlideUp} className="lg:col-span-7 bento-card rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
          <SectionHead 
            title="Recent Shared Expenses" 
            onNav={() => navigate('/app/finance')} 
          />

          {expenses.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="text-4xl">💸</div>
              <h3 className="text-base font-bold text-white">No Shared Expenses Logged</h3>
              <p className="text-xs text-primary-muted max-w-xs mx-auto">
                Log receipts, grocery runs, or monthly rent to split fairly among housemates.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-glass-border">
              {expenses.slice(0, 4).map(ex => (
                <div 
                  key={ex._id} 
                  onClick={() => navigate('/app/finance')}
                  className="py-3.5 flex items-center justify-between group cursor-pointer hover:bg-white/[0.02] active:scale-[0.99] px-2 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar name={ex.paidBy?.name} size={34} src={ex.paidBy?.avatar} />
                    <div className="min-w-0">
                      <div className="font-body text-sm font-medium text-white truncate group-hover:text-accent-orange transition-colors">
                        {ex.title}
                      </div>
                      <div className="font-mono text-[10px] text-primary-muted mt-0.5 uppercase">
                        Paid by {ex.paidBy?.name || 'Roommate'}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-sm text-white shrink-0 ml-4">
                    {currency(ex.totalAmount, house?.currency)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ROOMMATES DIRECTORY & PRESENCE (lg:col-span-5) */}
        <motion.div variants={fadeSlideUp} className="lg:col-span-5 bento-card rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
          <SectionHead 
            title="Housemates" 
            count={house?.members?.length} 
          />

          <div className="space-y-2">
            {house?.members?.map(m => (
              <div 
                key={m.user?._id || Math.random()} 
                onClick={() => m.user && setSelectedMember(m)}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-glass-border cursor-pointer transition-all group"
              >
                <div className="relative">
                  <Avatar name={m.user?.name} size={40} src={m.user?.avatar} />
                  <div className="w-3 h-3 rounded-full bg-accent-emerald absolute -bottom-0.5 -right-0.5 border-2 border-obsidian" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-body text-sm font-bold text-white truncate group-hover:text-accent-orange transition-colors">
                    {m.user?.name || 'Housemate'}
                  </div>
                  <div className="text-[10px] text-primary-muted truncate">
                    {m.user?.occupation || 'Roommate'}
                  </div>
                </div>
                {m.role === 'admin' ? (
                  <Badge color="accent" className="text-[9px] uppercase">
                    Admin
                  </Badge>
                ) : (
                  <span className="text-[10px] font-label-caps text-primary-muted uppercase">
                    Resident
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* ========================================================= */}
      {/* 4. MEMBER PROFILE & ACTIONS MODAL                         */}
      {/* ========================================================= */}
      {selectedMember && selectedMember.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedMember(null)}>
          <div 
            className="bg-obsidian border border-glass-border rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-fade-up space-y-6"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setSelectedMember(null)} className="absolute top-6 right-6 text-primary-muted hover:text-white transition-colors">
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative">
                <Avatar name={selectedMember.user.name} size={84} src={selectedMember.user.avatar} className="ring-2 ring-white/10" />
                <div className="w-4 h-4 rounded-full bg-accent-emerald absolute bottom-0 right-0 border-2 border-obsidian" />
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-white tracking-tight">{selectedMember.user.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  {selectedMember.role === 'admin' && (
                    <Badge color="accent" className="text-[9px] uppercase">
                      <Shield size={10} className="mr-1" /> House Admin
                    </Badge>
                  )}
                  {selectedMember.user.occupation && (
                    <span className="font-label-caps text-[10px] text-accent-orange uppercase tracking-wider">
                      {selectedMember.user.occupation}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-primary-muted space-y-1.5 pt-2 w-full text-left bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 truncate">
                  <Mail size={13} className="text-white/40 shrink-0" />
                  <span className="truncate">{selectedMember.user.email}</span>
                </div>
                {selectedMember.user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-white/40 shrink-0" />
                    <span>{selectedMember.user.phone}</span>
                  </div>
                )}
                {selectedMember.user.bkashNumber && (
                  <div className="flex items-center gap-2 text-accent-emerald">
                    <Wallet size={13} className="shrink-0" />
                    <span>bKash: {selectedMember.user.bkashNumber}</span>
                  </div>
                )}
                {selectedMember.user.bio && (
                  <p className="text-xs text-white/80 pt-2 border-t border-white/5 leading-relaxed">
                    "{selectedMember.user.bio}"
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions (Direct Chat / Admin Management) */}
            <div className="space-y-2.5 pt-3 border-t border-glass-border">
              {selectedMember.user._id !== user?._id && (
                <button 
                  onClick={() => {
                    setSelectedMember(null)
                    navigate(`/app/chat/${selectedMember.user._id}`)
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-accent-purple to-purple-600 hover:from-purple-600 hover:to-accent-purple active:scale-[0.98] text-white font-bold text-xs transition-all shadow-glow flex items-center justify-center gap-2"
                >
                  <MessageCircle size={15} />
                  <span>Send Direct Message</span>
                </button>
              )}

              {isMeAdmin && selectedMember.user._id !== user?._id && (
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button 
                    disabled={actionLoading}
                    onClick={() => handleTransferAdmin(selectedMember.user._id)}
                    className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-accent-orange hover:text-obsidian text-primary-muted border border-accent-orange/30 text-[11px] font-bold transition-all cursor-pointer"
                  >
                    Transfer Admin
                  </button>
                  <button 
                    disabled={actionLoading}
                    onClick={() => handleRemoveMember(selectedMember.user._id)}
                    className="py-2.5 px-3 rounded-xl bg-accent-rose/10 hover:bg-accent-rose text-accent-rose hover:text-white border border-accent-rose/30 text-[11px] font-bold transition-all cursor-pointer"
                  >
                    Remove Member
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Direct Money Settlement Modal */}
      {settlingDebt && (
        <SettleBalanceModal
          houseId={houseId}
          creditor={settlingDebt.creditor}
          debtor={settlingDebt.debtor}
          amount={settlingDebt.amount}
          currency={house?.currency}
          onClose={() => setSettlingDebt(null)}
          onSettled={() => {
            setSettlingDebt(null)
            fetchDashboard()
          }}
        />
      )}
    </PageTransition>
  )
}

const SectionHead = ({ title, count, onNav }) => (
  <div className="flex items-center justify-between border-b border-glass-border pb-3">
    <div className="flex items-center gap-2.5">
      <h2 className="font-display text-lg font-bold text-white">{title}</h2>
      {count != null && (
        <span className="font-mono text-[10px] text-white bg-white/10 rounded-full px-2 py-0.5 border border-white/20">
          {count}
        </span>
      )}
    </div>
    {onNav && (
      <button onClick={onNav} className="font-label-caps text-[10px] text-primary-muted hover:text-white transition-colors flex items-center gap-1 group">
        View All <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    )}
  </div>
)
