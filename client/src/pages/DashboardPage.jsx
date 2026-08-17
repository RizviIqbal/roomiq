import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocketEvent } from '../context/SocketContext'
import { Badge, Avatar, Button, Spinner, EmptyState, ProgressBar, PageTransition, AnimatedNumber, fadeSlideUp } from '../components/ui'
import { motion } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  DollarSign, CheckSquare, AlertTriangle, Wrench,
  ShoppingCart, Copy, Check, ArrowRight, Users, X, Shield, UserMinus,
  Mail, Phone, Heart, Sparkles, Plus, Megaphone, Clock, ShieldCheck,
  TrendingUp, TrendingDown, Wallet, Calendar, Zap, MessageCircle
} from 'lucide-react'

const currency = (amt, curr = 'BDT') =>
  `${curr === 'BDT' ? '৳' : curr === 'USD' ? '$' : curr === 'EUR' ? '€' : ''}${Number(amt).toLocaleString()}`

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [house,       setHouse]       = useState(null)
  const [expenses,    setExpenses]    = useState([])
  const [chores,      setChores]      = useState([])
  const [balances,    setBalances]    = useState([])
  const [lowStock,    setLowStock]    = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [copied,      setCopied]      = useState(false)

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

  const copyCode = () => {
    navigator.clipboard.writeText(house?.inviteCode || '')
    setCopied(true)
    toast.success('Invite code copied!')
    setTimeout(() => setCopied(false), 2000)
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

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <div className="text-4xl mb-5 grayscale">🏠</div>
      <h1 className="text-xl font-bold tracking-tight text-white mb-2">No house yet</h1>
      <p className="text-sm text-primary-muted mb-7">Create or join a house to get started.</p>
      <Button onClick={() => navigate('/house-setup')} size="lg">Set up a house</Button>
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <Spinner size={32} color="#00E5FF" />
    </div>
  )

  const myBalance = balances.filter(b =>
    b.debtor === user._id || b.creditor === user._id
  )

  const myChores = chores.filter(c =>
    (c.assignedTo?._id === user._id || c.assignedTo === user._id) && c.status === 'pending'
  )

  const isMeAdmin = house?.members?.find(m => m.user?._id === user._id)?.role === 'admin'

  // Summary Metrics
  const totalNet = myBalance.reduce((acc, b) => {
    if (b.creditor === user._id) return acc + b.amount
    return acc - b.amount
  }, 0)

  return (
    <PageTransition className="w-full px-4 lg:px-8 xl:px-10 pb-24 space-y-6">
      
      {/* ========================================================= */}
      {/* 1. TOP HERO BENTO & QUICK ACTION HUB */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* House Overview Hero Card (8 cols) */}
        <motion.div variants={fadeSlideUp} className="lg:col-span-8 bento-card rounded-3xl p-8 lg:p-10 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-orange/10 rounded-full blur-[90px] pointer-events-none group-hover:bg-accent-orange/20 transition-all duration-700" />
          
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 font-label-caps text-xs text-accent-orange uppercase tracking-widest">
              <Sparkles size={14} className="animate-pulse" /> Shared House Dashboard
            </div>
            
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              {house?.name}
            </h1>
            
            <p className="font-body text-sm text-primary-muted max-w-xl leading-relaxed">
              {house?.address || 'Your connected household'}
            </p>
          </div>

          {/* Quick Action Buttons Row */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/5">
            <button
              onClick={() => navigate('/app/finance')}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.97] border border-white/5 text-left transition-all group/btn flex flex-col justify-between gap-2 shadow-sm"
            >
              <DollarSign size={16} className="text-accent-emerald group-hover/btn:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-white group-hover/btn:text-accent-emerald transition-colors">Add Expense</div>
                <div className="text-[10px] text-primary-muted">Split shared bills</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/app/chores')}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.97] border border-white/5 text-left transition-all group/btn flex flex-col justify-between gap-2 shadow-sm"
            >
              <CheckSquare size={16} className="text-accent-cyan group-hover/btn:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-white group-hover/btn:text-accent-cyan transition-colors">Chores</div>
                <div className="text-[10px] text-primary-muted">{myChores.length} pending</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/app/noticeboard')}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.97] border border-white/5 text-left transition-all group/btn flex flex-col justify-between gap-2 shadow-sm"
            >
              <Megaphone size={16} className="text-accent-orange group-hover/btn:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-white group-hover/btn:text-accent-orange transition-colors">Noticeboard</div>
                <div className="text-[10px] text-primary-muted">Post bulletin</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/app/matching')}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.97] border border-white/5 text-left transition-all group/btn flex flex-col justify-between gap-2 shadow-sm"
            >
              <Heart size={16} className="text-accent-rose group-hover/btn:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-white group-hover/btn:text-accent-rose transition-colors">Harmony</div>
                <div className="text-[10px] text-primary-muted">Lifestyle match</div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Invite Code & Quick House Stats Card (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Invite Code Card */}
          <motion.div 
            variants={fadeSlideUp}
            onClick={copyCode}
            className="bento-card interactive rounded-3xl p-6 flex flex-col justify-center items-center text-center cursor-pointer group !bg-accent-purple/5 !border-accent-purple/20 relative overflow-hidden active:scale-[0.98] transition-all"
          >
            <div className="font-label-caps text-xs text-primary-muted uppercase tracking-widest mb-2 group-hover:text-accent-purple transition-colors">
              House Invite Code
            </div>
            
            <div className="font-mono text-3xl font-bold tracking-[0.2em] text-white group-hover:text-gradient transition-all flex items-center gap-2">
              {house?.inviteCode}
            </div>
            
            <div className="mt-3 text-xs text-primary-muted flex items-center gap-1 font-label-caps uppercase tracking-wider">
              {copied ? (
                <span className="text-accent-emerald flex items-center gap-1 font-bold animate-bounce">
                  <Check size={13} /> Copied to Clipboard
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy size={13} /> Tap to Copy
                </span>
              )}
            </div>
          </motion.div>

          {/* Quick Numbers Dual Bento */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            <motion.div 
              variants={fadeSlideUp}
              onClick={() => navigate('/app/profile')}
              className="bento-card interactive rounded-3xl p-5 flex flex-col justify-between group !bg-accent-cyan/5 !border-accent-cyan/20 cursor-pointer active:scale-[0.97] transition-all"
            >
              <div className="flex items-center justify-between text-primary-muted group-hover:text-white transition-colors">
                <span className="font-label-caps text-[9px] uppercase tracking-wider">Members</span>
                <Users size={15} />
              </div>
              <div className="font-display text-4xl font-bold text-white mt-3">
                <AnimatedNumber value={house?.members?.length || 0} />
              </div>
            </motion.div>

            <motion.div 
              variants={fadeSlideUp}
              onClick={() => navigate('/app/maintenance')}
              className="bento-card interactive rounded-3xl p-5 flex flex-col justify-between group !bg-accent-rose/5 !border-accent-rose/20 cursor-pointer active:scale-[0.97] transition-all"
            >
              <div className="flex items-center justify-between text-primary-muted group-hover:text-accent-rose transition-colors">
                <span className="font-label-caps text-[9px] uppercase tracking-wider">Issues</span>
                <Wrench size={15} />
              </div>
              <div className="font-display text-4xl font-bold text-white mt-3">
                <AnimatedNumber value={maintenance.length} />
              </div>
            </motion.div>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. OPERATIONAL BENTO GRID (Ledger, Chores, Roommates, Expenses) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
        
        {/* My Balance & Settlements (lg:col-span-6) */}
        <motion.div variants={fadeSlideUp} className="lg:col-span-6 bento-card rounded-3xl p-6 lg:p-8 space-y-6 !bg-accent-emerald/[0.02] !border-accent-emerald/20">
          <SectionHead 
            title="My Net Balance" 
            onNav={() => navigate('/app/finance')} 
          />

          {myBalance.length === 0 ? (
            <div className="py-8 text-center">
              <EmptyState icon="✅" title="All Settled Up" description="YOU HAVE NO OUTSTANDING DEBTS OR OWED BALANCES" />
            </div>
          ) : (
            <div className="space-y-3">
              {myBalance.map((b, i) => {
                const iOwe = b.debtor === user._id
                const member = iOwe
                  ? house?.members?.find(m => m.user?._id === b.creditor)
                  : house?.members?.find(m => m.user?._id === b.debtor)
                const name = member?.user?.name || 'Housemate'
                const bkashNumber = member?.user?.bkashNumber

                const handleBkash = () => {
                  if (!bkashNumber) return;
                  navigator.clipboard.writeText(bkashNumber);
                  toast.success(`Copied ${bkashNumber}. Launching bKash...`, {
                    icon: '📱', style: { background: '#e2136e', color: '#fff' }
                  });
                  setTimeout(() => { window.location.href = 'bkash://'; }, 500);
                }

                return (
                  <div key={i} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-glass-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-primary-muted">
                        {iOwe ? (
                          <>You owe <strong className="text-white">{name}</strong></>
                        ) : (
                          <><strong className="text-white">{name}</strong> owes you</>
                        )}
                      </div>
                      <div 
                        className="font-mono font-bold text-base"
                        style={{ color: iOwe ? '#F43F5E' : '#10B981' }}
                      >
                        {iOwe ? '−' : '+'}{currency(b.amount, house?.currency)}
                      </div>
                    </div>

                    {iOwe && bkashNumber && (
                      <div className="pt-2 border-t border-white/5">
                        <button 
                          onClick={handleBkash} 
                          className="w-full flex items-center justify-center gap-2 bg-[#e2136e] hover:bg-[#d00f63] active:scale-[0.98] text-white py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm"
                        >
                          Pay {currency(b.amount, house?.currency)} via bKash
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* My Pending Chores (lg:col-span-6) */}
        <motion.div variants={fadeSlideUp} className="lg:col-span-6 bento-card rounded-3xl p-6 lg:p-8 space-y-6 !bg-accent-purple/[0.02] !border-accent-purple/20">
          <SectionHead 
            title="My Assigned Chores" 
            count={myChores.length} 
            onNav={() => navigate('/app/chores')} 
          />

          {myChores.length === 0 ? (
            <div className="py-8 text-center">
              <EmptyState icon="🎉" title="No Pending Chores" description="YOU ARE ALL CLEAR ON DUTIES" />
            </div>
          ) : (
            <div className="space-y-2">
              {myChores.slice(0, 4).map(c => {
                const isOverdue = new Date(c.dueDate) < new Date()
                return (
                  <div 
                    key={c._id} 
                    onClick={() => navigate('/app/chores')}
                    className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-glass-border flex items-center justify-between cursor-pointer transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-medium text-sm text-white group-hover:text-accent-orange transition-colors truncate">
                        {c.title}
                      </div>
                      <div className="font-mono text-[10px] text-primary-muted mt-1 uppercase">
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

        {/* Recent Shared Expenses (lg:col-span-7) */}
        <motion.div variants={fadeSlideUp} className="lg:col-span-7 bento-card rounded-3xl p-6 lg:p-8 space-y-6">
          <SectionHead 
            title="Recent Shared Expenses" 
            onNav={() => navigate('/app/finance')} 
          />

          {expenses.length === 0 ? (
            <div className="py-8 text-center">
              <EmptyState icon="💸" title="No Expenses Yet" description="LOG YOUR FIRST SHARED HOUSE EXPENSE" />
            </div>
          ) : (
            <div className="divide-y divide-glass-border">
              {expenses.slice(0, 4).map(ex => (
                <div 
                  key={ex._id} 
                  onClick={() => navigate('/app/finance')}
                  className="py-3.5 flex items-center justify-between group cursor-pointer hover:bg-white/[0.02] active:scale-[0.99] px-2 rounded-xl transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-body text-sm font-medium text-white truncate group-hover:text-accent-orange transition-colors">
                      {ex.title}
                    </div>
                    <div className="font-mono text-[10px] text-primary-muted mt-0.5 uppercase">
                      Paid by {ex.paidBy?.name || 'Roommate'}
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

        {/* Roommates Directory (lg:col-span-5) */}
        <motion.div variants={fadeSlideUp} className="lg:col-span-5 bento-card rounded-3xl p-6 lg:p-8 space-y-6">
          <SectionHead 
            title="Housemates" 
            count={house?.members?.length} 
          />

          <div className="space-y-2">
            {house?.members?.map(m => (
              <div 
                key={m.user?._id || Math.random()} 
                onClick={() => m.user && setSelectedMember(m)}
                className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/5 cursor-pointer transition-all group"
              >
                <Avatar name={m.user?.name} size={38} src={m.user?.avatar} />
                <div className="flex-1 min-w-0">
                  <div className="font-body text-sm font-medium text-white truncate group-hover:text-accent-orange transition-colors">
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
                  <Badge color="neutral" className="text-[9px] uppercase">
                    Member
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* ========================================================= */}
      {/* 3. MEMBER PROFILE MODAL */}
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
              <Avatar name={selectedMember.user.name} size={84} src={selectedMember.user.avatar} className="ring-2 ring-white/10" />
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

              <div className="text-xs text-primary-muted space-y-1 pt-2 w-full text-left bg-white/5 p-4 rounded-2xl border border-white/5">
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
                {selectedMember.user.bio && (
                  <p className="text-xs text-white/80 pt-2 border-t border-white/5 leading-relaxed">
                    "{selectedMember.user.bio}"
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions (Chat / Admin Management) */}
            <div className="space-y-2 pt-2 border-t border-glass-border">
              {selectedMember.user._id !== user._id && (
                <Button 
                  fullWidth 
                  size="sm"
                  onClick={() => {
                    setSelectedMember(null)
                    navigate(`/app/chat/${selectedMember.user._id}`)
                  }}
                  className="bg-accent-purple text-white font-bold text-xs"
                >
                  <MessageCircle size={14} className="mr-1.5" /> Send Direct Message
                </Button>
              )}

              {isMeAdmin && selectedMember.user._id !== user._id && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    loading={actionLoading}
                    onClick={() => handleTransferAdmin(selectedMember.user._id)}
                    className="text-[11px] !border-accent-orange/30 hover:!bg-accent-orange hover:!text-obsidian"
                  >
                    Transfer Admin
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    loading={actionLoading}
                    onClick={() => handleRemoveMember(selectedMember.user._id)}
                    className="text-[11px]"
                  >
                    Remove Member
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
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
