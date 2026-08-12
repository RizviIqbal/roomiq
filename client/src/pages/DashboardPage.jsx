import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocketEvent } from '../context/SocketContext'
import { Badge, Avatar, Button, Spinner, EmptyState } from '../components/ui'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  DollarSign, CheckSquare, AlertTriangle, Wrench,
  ShoppingCart, Copy, Check, ArrowRight, Users, X, Shield, UserMinus,
  Mail, Phone
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
  const [actionLoading, setActionLoading] = useState(false)

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

  // Keep dashboard live as roommates make changes elsewhere
  const silentRefresh = useCallback(() => fetchDashboard(), [fetchDashboard])
  useSocketEvent('expense_added',     silentRefresh)
  useSocketEvent('expense_updated',   silentRefresh)
  useSocketEvent('expense_deleted',   silentRefresh)
  useSocketEvent('chore_updated',     silentRefresh)
  useSocketEvent('inventory_updated', silentRefresh)
  useSocketEvent('maintenance_updated', silentRefresh)

  const copyCode = () => {
    navigator.clipboard.writeText(house?.inviteCode || '')
    setCopied(true)
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
      <Spinner size={28} />
    </div>
  )

  const myBalance = balances.filter(b =>
    b.debtor === user._id || b.creditor === user._id
  )

  const myChores = chores.filter(c =>
    c.assignedTo?._id === user._id || c.assignedTo === user._id
  )

  const isMeAdmin = house?.members?.find(m => m.user?._id === user._id)?.role === 'admin'

  return (
    <div className="w-full px-4 md:px-8 pb-24">
      
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)] relative z-10">
        
        {/* Hero Card - Spans 2 columns */}
        <div className="bento-card rounded-3xl p-8 md:col-span-2 lg:col-span-2 row-span-1 flex flex-col justify-end relative overflow-hidden group animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-orange/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-accent-orange/20 transition-all duration-700" />
          <h1 className="font-display text-[48px] md:text-[64px] font-bold text-white leading-[1] tracking-tight relative z-10">{house?.name}</h1>
          <p className="font-body text-[16px] text-primary-muted mt-2 relative z-10 max-w-sm">
            {house?.address}
          </p>
        </div>

        {/* Invite Code - Spans 1 column */}
        <div 
          onClick={copyCode}
          className="bento-card interactive rounded-3xl p-8 md:col-span-1 lg:col-span-1 row-span-1 flex flex-col justify-center items-center text-center cursor-pointer group animate-fade-up !bg-accent-purple/5 !border-accent-purple/20 glow-violet" style={{ animationDelay: '0.2s' }}
        >
          <div className="font-label-caps text-primary-muted mb-4 group-hover:text-accent-orange transition-colors">Invite Code</div>
          <div className="font-mono text-[24px] md:text-[32px] font-bold tracking-[0.2em] text-white group-hover:text-gradient transition-all flex items-center justify-center gap-3">
            {house?.inviteCode}
          </div>
          <div className="mt-4 opacity-50 group-hover:opacity-100 transition-opacity text-primary-muted flex items-center gap-1 font-label-caps">
            {copied ? <><Check size={12} className="text-accent-emerald" /> Copied</> : <><Copy size={12} /> Click to copy</>}
          </div>
        </div>

        {/* Mini Stats Column - Spans 1 col */}
        <div className="grid grid-rows-2 gap-4 md:col-span-3 lg:col-span-1 row-span-1 lg:row-span-2 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="bento-card interactive rounded-3xl p-6 flex flex-col justify-between group !bg-accent-orange/5 !border-accent-orange/20 glow-cyan">
            <div className="flex items-center gap-3 text-primary-muted group-hover:text-white transition-colors">
              <Users size={16} />
              <span className="font-label-caps">Members</span>
            </div>
            <div className="font-display font-light text-[48px] text-white leading-none mt-4">{house?.members?.length ?? '—'}</div>
          </div>
          <div className="bento-card interactive rounded-3xl p-6 flex flex-col justify-between group !bg-accent-rose/5 !border-accent-rose/20 glow-rose" onClick={() => navigate('/app/maintenance')}>
            <div className="flex items-center gap-3 text-primary-muted group-hover:text-accent-rose transition-colors">
              <Wrench size={16} />
              <span className="font-label-caps">Issues</span>
            </div>
            <div className="font-display font-light text-[48px] text-white leading-none mt-4">{maintenance.length}</div>
          </div>
        </div>

        {/* My Balance Card - Spans 2 cols, 2 rows */}
        <div className="bento-card rounded-3xl p-8 md:col-span-2 lg:col-span-2 row-span-2 flex flex-col animate-fade-up !bg-accent-emerald/5 !border-accent-emerald/20 glow-emerald" style={{ animationDelay: '0.4s' }}>
          <SectionHead title="My Balance" />
          <div className="mt-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {myBalance.length === 0 ? (
              <EmptyState icon="✅" title="All settled up" description="NO OUTSTANDING BALANCES" />
            ) : (
              <div className="space-y-2">
                {myBalance.map((b, i) => {
                  const iOwe = b.debtor === user._id
                  const member = iOwe
                    ? house?.members?.find(m => m.user?._id === b.creditor)
                    : house?.members?.find(m => m.user?._id === b.debtor)
                  const name = member?.user?.name || 'Deleted User'
                  const bkashNumber = member?.user?.bkashNumber

                  const handleBkash = () => {
                    if (!bkashNumber) return;
                    navigator.clipboard.writeText(bkashNumber);
                    toast.success(`Copied ${bkashNumber}. Opening bKash...`, {
                      icon: '📱', style: { background: '#e2136e', color: '#fff' }
                    });
                    setTimeout(() => { window.location.href = 'bkash://'; }, 500);
                  }

                  return (
                    <div key={i} className="flex flex-col gap-2 py-4 px-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-glass-border">
                      <div className="flex items-center justify-between">
                        <div className="font-body-md text-[16px] text-primary-muted">
                          {iOwe ? <>You owe <span className="text-white font-semibold">{name}</span></> : <><span className="text-white font-semibold">{name}</span> owes you</>}
                        </div>
                        <div className={[
                          'font-mono font-bold text-[18px]',
                          iOwe ? 'text-accent-rose' : 'text-accent-emerald drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]',
                        ].join(' ')}>
                          {iOwe ? '−' : '+'}{currency(b.amount, house?.currency)}
                        </div>
                      </div>
                      {iOwe && bkashNumber && (
                        <div className="border-t border-glass-border pt-2 mt-1 animate-fade-up">
                          <button 
                            onClick={handleBkash} 
                            className="w-full flex items-center justify-center gap-2 bg-[#e2136e] hover:bg-[#d00f63] text-white py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm active:scale-[0.98]"
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
          </div>
        </div>

        {/* My pending chores - Spans 1 cols, 2 rows */}
        <div className="bento-card rounded-3xl p-8 md:col-span-1 lg:col-span-1 row-span-2 flex flex-col animate-fade-up !bg-accent-purple/5 !border-accent-purple/20 glow-purple" style={{ animationDelay: '0.5s' }}>
          <SectionHead title="My Chores" count={myChores.length} onNav={() => navigate('/app/chores')} />
          <div className="mt-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {myChores.length === 0 ? (
              <EmptyState icon="🎉" title="No pending chores" description="YOU'RE ALL CLEAR" />
            ) : (
              <div className="space-y-3">
                {myChores.slice(0,4).map(c => (
                  <div key={c._id} className="py-4 border-b border-glass-border last:border-0 group cursor-pointer hover:pl-2 transition-all" onClick={() => navigate('/app/chores')}>
                    <div className="font-display text-[18px] text-white group-hover:text-accent-orange transition-colors truncate">{c.title}</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary-muted">
                        Due {new Date(c.dueDate).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
                      </div>
                      {new Date(c.dueDate) < new Date() && <div className="w-2 h-2 rounded-full bg-accent-rose animate-pulse" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Members - Spans 1 col */}
        <div className="bento-card rounded-3xl p-8 md:col-span-1 lg:col-span-1 row-span-2 flex flex-col animate-fade-up !bg-accent-orange/5 !border-accent-orange/20 glow-cyan" style={{ animationDelay: '0.6s' }}>
          <SectionHead title="Roommates" count={house?.members?.length} />
          <div className="space-y-2 mt-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {house?.members?.map(m => (
              <div 
                key={m.user?._id || Math.random()} 
                onClick={() => m.user && setSelectedMember(m)}
                className="flex items-center gap-4 group cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-all"
              >
                <Avatar name={m.user?.name} size={40} src={m.user?.avatar} />
                <div className="flex-1 min-w-0">
                  <div className="font-body text-[15px] text-white font-medium truncate group-hover:text-accent-orange transition-colors">{m.user?.name || 'Deleted User'}</div>
                  {m.role === 'admin' && <div className="font-label-caps text-[8px] text-accent-orange mt-0.5 flex items-center gap-1"><Shield size={10} /> Admin</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses - Spans 2 cols */}
        <div className="bento-card rounded-3xl p-8 md:col-span-2 lg:col-span-2 row-span-1 flex flex-col animate-fade-up !bg-accent-rose/5 !border-accent-rose/20 glow-rose" style={{ animationDelay: '0.7s' }}>
          <SectionHead title="Recent Expenses" onNav={() => navigate('/app/finance')} />
          <div className="mt-6">
            {expenses.length === 0 ? (
              <EmptyState icon="💸" title="No expenses yet" description="ADD YOUR FIRST SHARED EXPENSE" />
            ) : (
              <div className="space-y-1">
                {expenses.slice(0,3).map(ex => (
                  <div key={ex._id} className="flex items-center justify-between py-3 border-b border-glass-border last:border-0 group cursor-pointer hover:px-2 transition-all" onClick={() => navigate('/app/finance')}>
                    <div className="flex-1 min-w-0">
                      <div className="font-body text-[16px] text-white truncate">{ex.title}</div>
                      <div className="font-mono text-[10px] tracking-[0.1em] text-primary-muted mt-1 uppercase">
                        {ex.paidBy?.name}
                      </div>
                    </div>
                    <div className="font-mono font-medium text-[16px] text-white">
                      {currency(ex.totalAmount, house?.currency)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock (Dynamic) - Spans 1 cols */}
        {lowStock.length > 0 && (
          <div className="bento-card interactive rounded-3xl p-6 md:col-span-1 lg:col-span-1 flex justify-between items-center bg-accent-orange/5 border-accent-orange/20 glow-orange cursor-pointer group animate-fade-up" style={{ animationDelay: '0.8s' }} onClick={() => navigate('/app/shopping')}>
            <div>
              <div className="font-label-caps text-accent-orange mb-1 group-hover:tracking-[0.2em] transition-all">Low Stock</div>
              <div className="font-display text-[32px] text-white font-medium leading-none">{lowStock.length} Items</div>
            </div>
            <ArrowRight size={24} className="text-accent-orange opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        )}

      </div>

      {/* Member Profile Modal */}
      {selectedMember && selectedMember.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedMember(null)}>
          <div 
            className="bg-obsidian border border-glass-border rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-fade-up"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setSelectedMember(null)} className="absolute top-6 right-6 text-primary-muted hover:text-white transition-colors">
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center mb-6">
              <Avatar name={selectedMember.user.name} size={80} src={selectedMember.user.avatar} />
              <h2 className="font-display text-[28px] font-bold text-white mt-4 tracking-tight">{selectedMember.user.name}</h2>
              {selectedMember.role === 'admin' && <div className="font-label-caps text-[10px] text-accent-orange mt-1 flex items-center gap-1"><Shield size={12} /> Admin</div>}
              {selectedMember.user.occupation && (
                <div className="font-label-caps text-[11px] text-accent-orange mt-2 tracking-[0.1em]">{selectedMember.user.occupation}</div>
              )}
              
              <div className="text-primary-muted text-sm mt-2 flex items-center gap-2">
                <Mail size={14} className="text-white/40" /> {selectedMember.user.email}
              </div>
              {selectedMember.user.phone && (
                <div className="text-primary-muted text-sm mt-1 flex items-center gap-2">
                  <Phone size={14} className="text-white/40" /> {selectedMember.user.phone}
                </div>
              )}
              {selectedMember.joinedAt && (
                <div className="font-label-caps text-[9px] text-primary-muted mt-3 uppercase tracking-[0.1em]">
                  Joined {new Date(selectedMember.joinedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </div>
              )}
              
              {selectedMember.user.bio && (
                <div className="mt-4 p-4 bg-white/5 rounded-2xl text-sm text-white/80 border border-white/5 w-full">
                  "{selectedMember.user.bio}"
                </div>
              )}
            </div>

            {isMeAdmin && selectedMember.user._id !== user._id && (
              <div className="border-t border-glass-border pt-6 mt-6 flex flex-col gap-3">
                <div className="font-label-caps text-[10px] uppercase text-accent-rose mb-2 text-center">Admin Actions</div>
                <Button 
                  variant="secondary" 
                  fullWidth 
                  loading={actionLoading}
                  onClick={() => handleTransferAdmin(selectedMember.user._id)}
                  className="!border-accent-orange/30 hover:!bg-accent-orange hover:!text-obsidian"
                >
                  <Shield size={16} className="mr-2" /> Transfer Admin Role
                </Button>
                <Button 
                  variant="danger" 
                  fullWidth 
                  loading={actionLoading}
                  onClick={() => handleRemoveMember(selectedMember.user._id)}
                >
                  <UserMinus size={16} className="mr-2" /> Remove from House
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const SectionHead = ({ title, count, onNav }) => (
  <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-2">
    <div className="flex items-center gap-3">
      <h2 className="font-display text-[22px] font-medium text-white">{title}</h2>
      {count != null && (
        <span className="font-mono text-[10px] text-white bg-white/10 rounded-full px-2 py-0.5 border border-white/20">
          {count}
        </span>
      )}
    </div>
    {onNav && (
      <button onClick={onNav} className="font-label-caps text-[9px] text-primary-muted hover:text-white transition-colors group flex items-center gap-1">
        View <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    )}
  </div>
)
