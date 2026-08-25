import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Badge, Avatar, Button, Input, Select } from '../ui'
import { Overlay, ModalHeader } from './AddExpenseModal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { ChevronDown, ChevronUp, Trash2, Bell, CheckCircle, Copy, X } from 'lucide-react'

const CATEGORY_ICONS = {
  rent:'🏠', electricity:'⚡', water:'💧', internet:'📶',
  groceries:'🛒', maintenance:'🔧', other:'📦'
}

const CATEGORY_COLORS = {
  rent:'accent', electricity:'yellow', water:'blue',
  internet:'blue', groceries:'green', maintenance:'muted', other:'muted'
}

export default function ExpenseCard({ expense, currency, onRefresh, members }) {
  const { user } = useAuth()
  const [expanded, setExpanded]       = useState(false)
  const [submittingPayment, setSubmittingPayment] = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [requesting, setRequesting]   = useState(null)
  const [showDelete, setShowDelete]   = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [transactionId, setTransactionId] = useState('')
  const [approving, setApproving]     = useState(null)

  const curr      = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency
  const isPayer   = expense.paidBy?._id === user._id || expense.paidBy === user._id
  const mySplit   = expense.splits?.find(s => (s.user?._id || s.user) === user._id)
  const allPaid   = expense.splits?.every(s => s.isPaid)

  const handleSubmitPayment = async (e) => {
    if (e) e.preventDefault()
    if (paymentMethod === 'bkash' && !transactionId) {
      toast.error('Transaction ID is required for bKash')
      return
    }
    setSubmittingPayment(true)
    try {
      await api.put(`/expenses/${expense._id}/submit-payment`, { paymentMethod, transactionId })
      toast.success('Payment submitted for approval')
      setShowPaymentModal(false)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setSubmittingPayment(false)
    }
  }

  const handleApprovePayment = async (userId) => {
    setApproving(userId)
    try {
      await api.put(`/expenses/${expense._id}/approve-payment`, { userId })
      toast.success('Payment approved')
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setApproving(null)
    }
  }

  const handleRequestPayment = async (toUserId) => {
    setRequesting(toUserId)
    try {
      await api.post(`/expenses/${expense._id}/request-payment`, { toUserId })
      toast.success('Payment request sent')
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setRequesting(null)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/expenses/${expense._id}`)
      toast.success('Expense deleted')
      onRefresh()
      setShowDelete(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="py-6 px-6 md:px-8 hover:bg-white/5 transition-colors group">
        {/* Main row */}
        <div className="flex items-center gap-6">
          {/* Category icon */}
          <div className="text-2xl flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white/5 border border-glass-border rounded-2xl shadow-glow group-hover:scale-110 transition-transform">
            {CATEGORY_ICONS[expense.category] || '📦'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="font-display text-[20px] text-white font-medium truncate group-hover:text-accent-orange transition-colors">
                {expense.title}
              </span>
              {expense.isRecurring && <Badge color="blue">Recurring</Badge>}
              {allPaid && <Badge color="green">Settled</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Avatar name={expense.paidBy?.name} size={20} src={expense.paidBy?.avatar} />
              <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-primary-muted">
                Paid by <span className="text-white font-semibold">{isPayer ? 'you' : expense.paidBy?.name}</span>
                {' · '}
                {new Date(expense.date).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
              </span>
            </div>
          </div>

          {/* Amount + my status */}
          <div className="text-right flex-shrink-0">
            <div className="font-display text-[24px] font-medium tracking-tight text-white drop-shadow-md">
              {curr}{Number(expense.totalAmount).toLocaleString()}
            </div>
            {mySplit && !isPayer && (
              <div className={[
                'font-mono text-[11px] mt-1 tracking-[0.15em] uppercase',
                mySplit.status === 'paid' || mySplit.isPaid ? 'text-accent-emerald' : mySplit.status === 'pending_approval' ? 'text-accent-yellow' : 'text-accent-rose',
              ].join(' ')}>
                {mySplit.status === 'paid' || mySplit.isPaid ? '✓ settled' : mySplit.status === 'pending_approval' ? '⏳ pending' : `you owe ${curr}${mySplit.amount}`}
              </div>
            )}
          </div>

          {/* My quick actions */}
          <div className="flex gap-3 flex-shrink-0 ml-4">
            {mySplit && mySplit.status !== 'paid' && !mySplit.isPaid && mySplit.status !== 'pending_approval' && !isPayer && (
              <Button size="sm" variant="success" onClick={() => setShowPaymentModal(true)}>
                Settle {curr}{mySplit.amount}
              </Button>
            )}
            {mySplit && mySplit.status === 'pending_approval' && !isPayer && (
              <Badge color="yellow" className="h-10 px-4 rounded-full font-bold shadow-glow border border-accent-yellow/30 text-[12px] flex items-center">
                ⏳ Verification Pending
              </Badge>
            )}
            {isPayer && !allPaid && (
              <Button size="sm" variant="secondary" onClick={() => setExpanded(e => !e)}>
                Collect
              </Button>
            )}

            <button
              onClick={() => setExpanded(e => !e)}
              className="flex p-2 text-primary-muted hover:text-white bg-glass border border-transparent hover:border-glass-border hover:bg-glass-hover rounded-full transition-all"
            >
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-6 pt-6 border-t border-glass-border">
            {/* Note */}
            {expense.note && (
              <div className="text-[15px] text-primary-muted font-body mb-6 pl-4 border-l-2 border-accent-orange/50">
                {expense.note}
              </div>
            )}

            {/* Splits */}
            <div className="mb-6">
              <div className="font-label-caps text-[11px] mb-4 text-primary-muted">Split breakdown</div>
              <div className="border border-glass-border rounded-2xl overflow-hidden divide-y divide-glass-border bg-black/20">
                {expense.splits?.map(s => {
                  const uid      = s.user?._id || s.user
                  const isMe     = uid === user._id
                  const name     = s.user?.name || members?.find(m => m.user._id === uid)?.user?.name || 'Unknown'
                  const pending  = expense.paymentRequests?.find(r => (r.to?._id||r.to) === uid && r.status === 'pending')

                  return (
                    <div key={uid} className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors">
                      <Avatar name={name} size={32} src={s.user?.avatar} />
                      <span className="flex-1 font-body-md text-[16px] text-white">{isMe ? 'You' : name}</span>
                      <span className={[
                        'font-display font-medium text-[18px] px-3 py-1 rounded-lg',
                        s.isPaid || s.status === 'paid' ? 'text-primary-muted' : 'text-accent-rose bg-accent-rose/10 border border-accent-rose/20',
                      ].join(' ')}>
                        {curr}{s.amount}
                      </span>
                      {s.isPaid || s.status === 'paid'
                        ? <CheckCircle size={18} className="text-accent-emerald flex-shrink-0" />
                        : s.status === 'pending_approval'
                          ? isPayer && !isMe ? (
                              <div className="flex flex-col items-end gap-1">
                                <span className="font-label-caps text-[9px] text-accent-yellow">Paid via {s.paymentMethod} {s.transactionId && `(${s.transactionId})`}</span>
                                <Button size="sm" variant="success" loading={approving === uid} onClick={() => handleApprovePayment(uid)} className="h-7 text-[10px] px-3 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                  Verify Receipt
                                </Button>
                              </div>
                            ) : (
                              <Badge color="yellow" className="scale-75 whitespace-nowrap">Pending Approval</Badge>
                            )
                          : isPayer && !isMe
                            ? (
                              <button
                              onClick={() => handleRequestPayment(uid)}
                              disabled={!!pending || requesting === uid}
                              title={pending ? 'Request already sent' : 'Request payment'}
                              className={[
                                'flex items-center gap-1.5 px-3 py-1.5 border rounded-full font-label-caps text-[10px] uppercase tracking-wider transition-all',
                                pending
                                  ? 'border-glass-border text-primary-muted cursor-default'
                                  : 'border-white/20 text-white hover:border-accent-orange hover:text-accent-orange bg-white/5 cursor-pointer hover:shadow-glow',
                                requesting === uid ? 'opacity-50' : '',
                              ].join(' ')}
                            >
                              <Bell size={12} />
                              {pending ? 'Requested' : 'Request'}
                            </button>
                          )
                          : <div className="w-5" />
                      }
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Delete (payer only) */}
            {isPayer && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDelete(true)}
                  className="font-label-caps text-[11px] text-primary-muted hover:text-accent-rose transition-all flex items-center gap-2 hover:drop-shadow-[0_0_8px_rgba(225,29,72,0.5)]"
                >
                  <Trash2 size={14} /> Delete expense
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {showDelete && (
        <Overlay onClose={() => setShowDelete(false)}>
          <div className="w-full max-w-sm glass-panel rounded-3xl p-0 overflow-hidden border border-glass-border shadow-glow">
            <ModalHeader title="Delete expense?" onClose={() => setShowDelete(false)} />
            <div className="px-8 pb-8 pt-4">
              <p className="font-body-md text-[16px] text-primary-muted leading-relaxed mb-8">
                This will permanently remove <strong className="text-white">{expense.title}</strong> and all its payment records.
              </p>
              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setShowDelete(false)} className="flex-1">Cancel</Button>
                <Button variant="danger" loading={deleting} onClick={handleDelete} className="flex-1 shadow-[0_0_15px_rgba(225,29,72,0.4)]">Delete</Button>
              </div>
            </div>
          </div>
        </Overlay>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <Overlay onClose={() => setShowPaymentModal(false)}>
          <div className="w-full max-w-md bg-obsidian border border-glass-border rounded-3xl p-0 overflow-hidden shadow-2xl animate-fade-up relative font-body text-white">
            <ModalHeader title={`Settle Split ${curr}${mySplit?.amount}`} onClose={() => setShowPaymentModal(false)} />
            
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Payment Summary Card */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-glass-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={expense.paidBy?.name} size={40} src={expense.paidBy?.avatar} />
                  <div className="min-w-0">
                    <div className="text-xs text-primary-muted font-mono uppercase">Paying Payer</div>
                    <div className="text-sm font-bold text-white truncate">{expense.paidBy?.name}</div>
                    <div className="text-[11px] text-accent-orange truncate">{expense.title}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-xl font-extrabold text-accent-emerald">
                    {curr}{mySplit?.amount}
                  </div>
                  <span className="text-[9px] font-label-caps uppercase text-accent-emerald/80">
                    Your Share
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmitPayment} className="space-y-5">
                
                {/* Payment Channel Pill Selectors - Zero Dropdown Overlap */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-primary-muted pl-1">
                    Select Payment Method
                  </label>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'cash', label: '💵 Cash in Hand' },
                      { id: 'bkash', label: '📱 bKash Wallet' },
                      { id: 'other', label: '📦 Other / Bank' },
                    ].map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                          paymentMethod === method.id
                            ? 'bg-accent-emerald/20 border-accent-emerald text-white shadow-glow scale-[1.02]'
                            : 'bg-white/5 border-glass-border text-primary-muted hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* bKash Details Card */}
                {paymentMethod === 'bkash' && (
                  <div className="p-4 rounded-2xl bg-[#e2136e]/10 border border-[#e2136e]/30 space-y-3 animate-fade-up">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-label-caps text-[10px] text-[#e2136e] uppercase tracking-wider font-bold">
                          {expense.paidBy?.name}'s bKash Number
                        </div>
                        <div className="font-mono text-base font-bold text-white mt-0.5">
                          {expense.paidBy?.bkashNumber || 'No wallet number listed'}
                        </div>
                      </div>

                      {expense.paidBy?.bkashNumber && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(expense.paidBy.bkashNumber)
                              toast.success(`Copied ${expense.paidBy.bkashNumber}!`)
                            }}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
                            title="Copy number"
                          >
                            <Copy size={14} />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(expense.paidBy.bkashNumber)
                              setTimeout(() => { window.location.href = 'bkash://' }, 400)
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#e2136e] hover:bg-[#d00f63] text-white text-[11px] font-bold tracking-wide transition-all shadow-sm active:scale-95"
                          >
                            Open App
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[11px] font-semibold text-primary-muted">
                        bKash Transaction ID (TrxID) <span className="text-accent-rose">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9XF892KL"
                        value={transactionId}
                        onChange={e => setTransactionId(e.target.value)}
                        className="w-full bg-black/40 border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent-emerald font-mono placeholder:text-white/20"
                      />
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-primary-muted hover:text-white border border-glass-border text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>

                  <Button
                    type="submit"
                    variant="success"
                    loading={submittingPayment}
                    className="flex-2 py-3.5 rounded-2xl bg-gradient-to-r from-accent-emerald to-teal-500 hover:opacity-95 text-obsidian font-bold text-xs shadow-glow transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle size={15} />
                    <span>Submit Payment ({curr}{mySplit?.amount})</span>
                  </Button>
                </div>

              </form>
            </div>
          </div>
        </Overlay>
      )}
    </>
  )
}
