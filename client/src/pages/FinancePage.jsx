import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFinance } from '../hooks/useFinance'
import { useSocketEvent } from '../context/SocketContext'
import { Button, Spinner, EmptyState } from '../components/ui'
import AddExpenseModal from '../components/finance/AddExpenseModal'
import ExpenseCard from '../components/finance/ExpenseCard'
import BalanceSummary from '../components/finance/BalanceSummary'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['rent','electricity','water','internet','groceries','maintenance','other']

export default function FinancePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    houseId, house, expenses, balances, loading,
    page, pages, category, setCategory, goToPage, refresh,
  } = useFinance()

  const [showAdd, setShowAdd] = useState(false)

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

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No house" description="JOIN A HOUSE FIRST" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  return (
    <div className="w-full px-4 md:px-[64px] pb-24 relative z-10">
      
      {/* Compact Action Bar */}
      <div className="flex items-center justify-end mb-6">
        <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2">
          <Plus size={16} /> Add expense
        </Button>
      </div>

      {/* Asymmetrical Bento layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Ledger stream — 2/3 */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Category filter bento block */}
          <div className="bento-card rounded-3xl p-6">
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
              <FilterChip label="All" active={category === ''} onClick={() => setCategory('')} />
              {CATEGORIES.map(c => (
                <FilterChip key={c} label={c.charAt(0).toUpperCase()+c.slice(1)} active={category === c} onClick={() => setCategory(c)} />
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16 bento-card rounded-3xl">
              <Spinner size={32} color="#00E5FF" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="bento-card rounded-3xl p-12">
              <EmptyState icon="💸" title="No expenses found" description={category ? `NO ${category.toUpperCase()} EXPENSES YET` : 'ADD YOUR FIRST SHARED EXPENSE'} />
            </div>
          ) : (
            <div className="bento-card rounded-3xl overflow-hidden">
              {expenses.map((ex, idx) => (
                <div key={ex._id} className={idx !== expenses.length - 1 ? "border-b border-glass-border" : ""}>
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
              <span className="font-mono text-[12px] text-primary-muted tracking-[0.2em] uppercase">Page {page} of {pages}</span>
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

        {/* Balance blocks — 1/3 */}
        <div className="lg:col-span-1">
          {/* We assume BalanceSummary will internally render as a bento card or we wrap it here */}
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
      'px-4 py-2 rounded-full font-label-caps whitespace-nowrap transition-all duration-300',
      active ? 'bg-white text-obsidian font-bold shadow-glow scale-105' : 'bg-white/5 text-primary-muted border border-glass-border hover:bg-white/10 hover:border-white/30 hover:text-white',
    ].join(' ')}
  >
    {label}
  </button>
)
