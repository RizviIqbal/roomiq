import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChores } from '../hooks/useChores'
import { useSocketEvent } from '../context/SocketContext'
import { Button, Spinner, EmptyState } from '../components/ui'
import AddChoreModal from '../components/chores/AddChoreModal'
import ChoreCard from '../components/chores/ChoreCard'
import ChoreHistory from '../components/chores/ChoreHistory'
import { Plus } from 'lucide-react'

const TABS = [
  { value: '',         label: 'All' },
  { value: 'pending',  label: 'Pending' },
  { value: 'done',     label: 'Done' },
  { value: 'disputed', label: 'Disputed' },
]

export default function ChoresPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { houseId, house, chores, history, loading, refresh } = useChores()

  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab]         = useState('')

  useSocketEvent('chore_updated', useCallback(() => refresh(), [refresh]))

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No house" description="JOIN A HOUSE FIRST" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  const isAdmin = house?.members?.find(m => m.user._id === user._id)?.role === 'admin'

  const filtered = tab ? chores.filter(c => {
    if (tab === 'pending') return c.status === 'pending'
    return c.status === tab
  }) : chores

  // Sort: overdue first, then by due date
  const sorted = [...filtered].sort((a,b) => {
    const aOverdue = new Date(a.dueDate) < new Date() && a.status === 'pending'
    const bOverdue = new Date(b.dueDate) < new Date() && b.status === 'pending'
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1
    return new Date(a.dueDate) - new Date(b.dueDate)
  })

  return (
    <div className="w-full px-6 md:px-[64px] pb-24">
      {/* Header */}
      <section className="mt-8 mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <div className="font-label-caps text-[12px] uppercase tracking-[0.15em] text-primary-muted mb-2">Household Tasks</div>
          <h1 className="font-display text-[56px] md:text-[80px] font-bold text-white leading-[1.1] tracking-tight">Chores<span className="text-gradient">.</span></h1>
          <p className="font-body-lg text-[18px] text-primary-muted max-w-xl mt-4">Track, rotate, and resolve household chores.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2">
          <Plus size={16} /> New chore
        </Button>
      </section>

      {/* Tabs */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={[
              'px-5 py-2.5 rounded-full font-label-caps text-[11px] uppercase tracking-[0.15em] transition-all shadow-sm whitespace-nowrap',
              tab === t.value ? 'bg-white text-obsidian font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-glass text-primary-muted border border-glass-border hover:bg-glass-hover hover:border-white/30 hover:text-white',
            ].join(' ')}
          >
            {t.label}
            {t.value && <span className={['ml-2 px-2 py-0.5 rounded-full text-[9px] bg-obsidian/30', tab === t.value ? 'text-obsidian bg-obsidian/10' : 'text-primary-muted bg-white/10'].join(' ')}>{chores.filter(c => c.status === t.value).length}</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Chore grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size={32} color="#06B6D4" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="glass-panel rounded-[32px] p-8">
              <EmptyState icon="🧹" title="No chores found" description={tab ? `NO ${tab.toUpperCase()} CHORES` : 'CREATE YOUR FIRST CHORE'} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sorted.map(chore => (
                <ChoreCard key={chore._id} chore={chore} onRefresh={refresh} isAdmin={isAdmin} />
              ))}
            </div>
          )}
        </div>

        {/* Accountability */}
        <div className="lg:pl-8">
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
    </div>
  )
}
