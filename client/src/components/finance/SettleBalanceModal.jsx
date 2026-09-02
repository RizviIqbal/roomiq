import { useState } from 'react'
import { Button, Avatar, Input, Select } from '../ui'
import { Overlay, ModalHeader } from './AddExpenseModal'
import { Copy, Check, ArrowRight, Wallet, DollarSign, Smartphone, CheckCircle2 } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function SettleBalanceModal({
  houseId,
  creditor,
  debtor,
  amount,
  currency = 'BDT',
  onClose,
  onSettled
}) {
  const curr = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency
  
  const [paymentMethod, setPaymentMethod] = useState(creditor?.bkashNumber ? 'bkash' : 'cash')
  const [transactionId, setTransactionId] = useState('')
  const [note, setNote]                   = useState('')
  const [loading, setLoading]             = useState(false)
  const [copied, setCopied]               = useState(false)

  const handleCopyWallet = () => {
    if (!creditor?.bkashNumber) return
    navigator.clipboard.writeText(creditor.bkashNumber)
    setCopied(true)
    toast.success(`Copied ${creditor.bkashNumber} to clipboard!`)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLaunchBkash = () => {
    if (!creditor?.bkashNumber) return
    handleCopyWallet()
    setTimeout(() => {
      window.location.href = 'bkash://'
    }, 400)
  }

  const handleSettleSubmit = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)

    try {
      await api.post(`/expenses/house/${houseId}/settle-balance`, {
        creditorId: creditor?._id,
        debtorId: debtor?._id,
        amount: Number(amount),
        paymentMethod,
        transactionId: transactionId.trim(),
        note: note.trim()
      })

      toast.success(`🎉 Successfully settled ${curr}${Number(amount).toLocaleString()} with ${creditor?.name}!`, {
        icon: '✅',
        style: { background: '#10B981', color: '#fff', fontWeight: 'bold' }
      })

      if (onSettled) onSettled()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record settlement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-md bg-obsidian border border-glass-border rounded-3xl p-0 overflow-hidden shadow-2xl animate-fade-up relative font-body text-white">
        
        {/* Modal Header */}
        <ModalHeader title="Settle Shared Balance" onClose={onClose} />

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Transfer Summary Card */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-glass-border space-y-4">
            <div className="flex items-center justify-between">
              
              {/* Payer (Debtor) */}
              <div className="flex flex-col items-center gap-1.5 text-center min-w-0 flex-1">
                <Avatar name={debtor?.name || 'You'} size={44} src={debtor?.avatar} />
                <span className="text-xs font-bold text-white truncate max-w-[100px]">
                  {debtor?.name || 'You'}
                </span>
                <span className="text-[10px] text-primary-muted font-mono uppercase">Paying</span>
              </div>

              {/* Arrow & Amount */}
              <div className="flex flex-col items-center px-3">
                <span className="font-mono text-xl sm:text-2xl font-black text-accent-emerald">
                  {curr}{Number(amount).toLocaleString()}
                </span>
                <div className="flex items-center gap-1 text-primary-muted my-1">
                  <span className="h-0.5 w-6 bg-glass-border rounded-full" />
                  <ArrowRight size={14} className="text-accent-emerald animate-pulse" />
                  <span className="h-0.5 w-6 bg-glass-border rounded-full" />
                </div>
                <span className="text-[9px] font-label-caps text-accent-emerald uppercase tracking-wider">
                  Full Settlement
                </span>
              </div>

              {/* Receiver (Creditor) */}
              <div className="flex flex-col items-center gap-1.5 text-center min-w-0 flex-1">
                <Avatar name={creditor?.name || 'Roommate'} size={44} src={creditor?.avatar} />
                <span className="text-xs font-bold text-white truncate max-w-[100px]">
                  {creditor?.name || 'Roommate'}
                </span>
                <span className="text-[10px] text-primary-muted font-mono uppercase">Receiving</span>
              </div>

            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSettleSubmit} className="space-y-4">
            
            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-primary-muted">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full bg-[#0d0d12] border border-glass-border rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-accent-emerald transition-all cursor-pointer"
              >
                <option value="bkash">📱 bKash Direct Wallet</option>
                <option value="nagad">⚡ Nagad / Rocket</option>
                <option value="cash">💵 Cash in Hand</option>
                <option value="bank">🏦 Bank Transfer</option>
                <option value="other">📦 Other Channel</option>
              </select>
            </div>

            {/* bKash / Wallet Card Hint */}
            {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
              <div className="p-4 rounded-2xl bg-[#e2136e]/10 border border-[#e2136e]/30 space-y-3 animate-fade-up">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-label-caps text-[10px] text-[#e2136e] uppercase tracking-wider font-bold">
                      {creditor?.name}'s {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Wallet
                    </div>
                    <div className="font-mono text-base font-bold text-white mt-0.5">
                      {creditor?.bkashNumber || 'No number listed (Ask roommate)'}
                    </div>
                  </div>

                  {creditor?.bkashNumber && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopyWallet}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
                        title="Copy number"
                      >
                        {copied ? <Check size={14} className="text-accent-emerald" /> : <Copy size={14} />}
                      </button>
                      
                      {paymentMethod === 'bkash' && (
                        <button
                          type="button"
                          onClick={handleLaunchBkash}
                          className="px-3 py-1.5 rounded-xl bg-[#e2136e] hover:bg-[#d00f63] text-white text-[11px] font-bold tracking-wide transition-all shadow-sm active:scale-95"
                        >
                          Open bKash
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-primary-muted">
                      Transaction ID (TrxID)
                    </label>
                    <button
                      type="button"
                      onClick={() => setTransactionId(`BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)}
                      className="text-[10px] text-accent-emerald hover:underline font-mono"
                    >
                      ⚡ Auto-Fill Demo TrxID
                    </button>
                  </div>
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

            {/* Optional Note */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-primary-muted">
                Settlement Memo / Reference
              </label>
              <input
                type="text"
                placeholder="e.g. Cleared WiFi + Grocery expenses for Feb"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full bg-white/5 border border-glass-border rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-emerald placeholder:text-white/20 transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-primary-muted hover:text-white border border-glass-border text-xs font-bold transition-all"
              >
                Cancel
              </button>

              <Button
                type="submit"
                variant="success"
                loading={loading}
                className="flex-2 py-3.5 rounded-2xl bg-gradient-to-r from-accent-emerald to-teal-500 hover:opacity-95 text-obsidian font-bold text-xs shadow-glow transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={15} />
                <span>Confirm & Settle {curr}{Number(amount).toLocaleString()}</span>
              </Button>
            </div>

          </form>

        </div>

      </div>
    </Overlay>
  )
}
