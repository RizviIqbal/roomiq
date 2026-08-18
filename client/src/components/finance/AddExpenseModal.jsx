import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../context/AuthContext'
import { Button, Input, Avatar } from '../ui'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { X, Plus, RefreshCw, Sparkles, Check, Calendar, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'

const CATEGORIES = ['rent', 'electricity', 'water', 'internet', 'groceries', 'maintenance', 'other']

const CATEGORY_META = {
  rent:        { icon: '🏠', label: 'Rent' },
  electricity: { icon: '⚡', label: 'Electric' },
  water:       { icon: '💧', label: 'Water' },
  internet:    { icon: '📶', label: 'WiFi' },
  groceries:   { icon: '🛒', label: 'Groceries' },
  maintenance: { icon: '🔧', label: 'Repairs' },
  other:       { icon: '📦', label: 'Other' },
}

export default function AddExpenseModal({ houseId, members, currency, onClose, onAdded }) {
  const { user } = useAuth()

  const [form, setForm] = useState({
    title:       '',
    totalAmount: '',
    category:    'groceries',
    splitType:   'equal',
    isRecurring: false,
    recurringDay:'1',
    note:        '',
  })
  const [customSplits, setCustomSplits] = useState([])
  const [loading, setLoading]           = useState(false)
  const [errors, setErrors]             = useState({})

  const curr = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency

  // Init custom splits when members load or splitType changes
  useEffect(() => {
    if (!members?.length) return
    const perHead = form.totalAmount
      ? parseFloat((parseFloat(form.totalAmount) / members.length).toFixed(2))
      : 0
    setCustomSplits(members.map(m => ({
      user:   m.user._id,
      name:   m.user.name,
      avatar: m.user.avatar,
      amount: perHead,
    })))
  }, [members, form.splitType])

  // Keep equal splits in sync with amount
  useEffect(() => {
    if (form.splitType !== 'equal' || !members?.length || !form.totalAmount) return
    const perHead = parseFloat((parseFloat(form.totalAmount) / members.length).toFixed(2))
    setCustomSplits(s => s.map(sp => ({ ...sp, amount: perHead })))
  }, [form.totalAmount, form.splitType])

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: val }))
    setErrors(er => ({ ...er, [k]: undefined }))
  }

  const setSplitAmount = (userId, val) => {
    setCustomSplits(s => s.map(sp => sp.user === userId ? { ...sp, amount: parseFloat(val) || 0 } : sp))
  }

  const customTotal = customSplits.reduce((a, s) => a + (parseFloat(s.amount) || 0), 0)
  const splitDiff   = Math.abs(customTotal - parseFloat(form.totalAmount || 0))
  const splitValid  = form.splitType === 'equal' || splitDiff < 0.01

  const validate = () => {
    const e = {}
    if (!form.title.trim())           e.title       = 'Expense title is required'
    if (!form.totalAmount || isNaN(parseFloat(form.totalAmount)) || parseFloat(form.totalAmount) <= 0)
                                       e.totalAmount = 'Enter a valid positive amount'
    if (!splitValid)                   e.split       = `Splits must add up to ${curr}${form.totalAmount} (off by ${curr}${splitDiff.toFixed(2)})`
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        houseId,
        title:       form.title.trim(),
        totalAmount: parseFloat(form.totalAmount),
        category:    form.category,
        splitType:   form.splitType,
        isRecurring: form.isRecurring,
        recurringDay:form.isRecurring ? parseInt(form.recurringDay) : null,
        note:        form.note.trim(),
        splits:      form.splitType === 'custom' ? customSplits : undefined,
      }
      const { data } = await api.post('/expenses', payload)
      toast.success('🎉 Expense recorded and balance ledger updated')
      onAdded(data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record expense')
    } finally {
      setLoading(false)
    }
  }

  const autoBalance = () => {
    const total = parseFloat(form.totalAmount) || 0
    const base  = parseFloat((total / customSplits.length).toFixed(2))
    const remainder = parseFloat((total - base * customSplits.length).toFixed(2))
    setCustomSplits(s => s.map((sp, i) => ({
      ...sp, amount: i === s.length - 1 ? parseFloat((base + remainder).toFixed(2)) : base
    })))
  }

  return (
    <Overlay onClose={onClose}>
      <div className="bento-card bg-obsidian/95 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] rounded-3xl overflow-hidden relative">
        
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-orange via-amber-400 to-accent-purple" />

        <ModalHeader 
          icon="💸" 
          title="Record Shared Expense" 
          subtitle="Auto-split bills across housemates"
          onClose={onClose} 
        />

        <div className="p-6 sm:p-8 space-y-6">

          {/* Title Input */}
          <Input
            label="What was this expense for? *"
            placeholder='e.g. "Monthly Groceries", "August Rent"'
            value={form.title}
            onChange={set('title')}
            error={errors.title}
            className="bg-white/5 border-glass-border text-white text-sm"
          />

          {/* Interactive Category Selector Chips */}
          <div className="space-y-2">
            <label className="text-xs text-primary-muted font-medium block">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => {
                const meta = CATEGORY_META[c]
                const isSelected = form.category === c
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: c }))}
                    className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-accent-orange text-obsidian font-bold shadow-glow scale-[1.02]'
                        : 'bg-white/5 text-primary-muted hover:text-white border border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs text-primary-muted font-medium block">Total Amount *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-lg font-bold text-accent-orange">
                {curr}
              </span>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={form.totalAmount}
                onChange={set('totalAmount')}
                className="w-full bg-white/5 border border-glass-border rounded-2xl pl-10 pr-4 py-3 text-xl font-display font-bold text-white placeholder-primary-muted/40 focus:outline-none focus:border-accent-orange transition-all"
              />
            </div>
            {errors.totalAmount && (
              <p className="text-xs text-accent-rose font-medium mt-1">{errors.totalAmount}</p>
            )}
          </div>

          {/* Split Type Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-primary-muted">
              <span>Split Distribution</span>
              <span className="font-mono text-[11px]">{members?.length || 0} Members in House</span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-2xl border border-glass-border">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, splitType: 'equal' }))}
                className={`py-2 rounded-xl text-xs font-label-caps uppercase tracking-wider transition-all ${
                  form.splitType === 'equal'
                    ? 'bg-white text-obsidian font-bold shadow-glow'
                    : 'text-primary-muted hover:text-white'
                }`}
              >
                Equal Split
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, splitType: 'custom' }))}
                className={`py-2 rounded-xl text-xs font-label-caps uppercase tracking-wider transition-all ${
                  form.splitType === 'custom'
                    ? 'bg-white text-obsidian font-bold shadow-glow'
                    : 'text-primary-muted hover:text-white'
                }`}
              >
                Custom Split
              </button>
            </div>
          </div>

          {/* Split Preview List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-primary-muted">
              <span>{form.splitType === 'equal' ? 'Equal Breakdown' : 'Adjust Individual Shares'}</span>
              {form.splitType === 'custom' && (
                <button
                  type="button"
                  onClick={autoBalance}
                  className="flex items-center gap-1 text-[11px] text-accent-orange hover:underline font-medium"
                >
                  <RefreshCw size={11} /> Auto-Balance
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-glass-border bg-black/30 divide-y divide-white/5 max-h-48 overflow-y-auto custom-scrollbar">
              {customSplits.map(sp => (
                <div key={sp.user} className="flex items-center justify-between p-3 gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={sp.name} src={sp.avatar} size={28} />
                    <span className="text-xs font-medium text-white truncate">{sp.name}</span>
                  </div>

                  {form.splitType === 'custom' ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-primary-muted font-mono">{curr}</span>
                      <input
                        type="number"
                        value={sp.amount}
                        onChange={e => setSplitAmount(sp.user, e.target.value)}
                        className="w-20 px-2.5 py-1 bg-white/5 border border-glass-border rounded-lg text-xs font-mono text-white text-right focus:border-accent-orange outline-none"
                      />
                    </div>
                  ) : (
                    <span className="font-mono text-xs font-bold text-accent-cyan shrink-0">
                      {curr}{Number(sp.amount || 0).toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {form.splitType === 'custom' && form.totalAmount && (
              <div className={`text-[11px] font-mono mt-1 ${splitValid ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                {splitValid ? `✓ Exact match: ${curr}${customTotal.toFixed(2)}` : `✗ ${errors.split}`}
              </div>
            )}
          </div>

          {/* Note Input */}
          <div className="space-y-1.5">
            <label className="text-xs text-primary-muted font-medium block">Note (Optional)</label>
            <textarea
              value={form.note}
              onChange={set('note')}
              placeholder="e.g. Paid via bKash, receipt uploaded in chat"
              rows={2}
              className="w-full bg-white/5 border border-glass-border rounded-2xl p-3 text-xs text-white placeholder-primary-muted/40 focus:outline-none focus:border-accent-orange transition-all resize-none"
            />
          </div>

          {/* Recurring Expense Checkbox */}
          <div 
            onClick={() => setForm(f => ({ ...f, isRecurring: !f.isRecurring }))}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                form.isRecurring ? 'bg-accent-orange border-accent-orange text-obsidian' : 'border-white/20 bg-transparent'
              }`}>
                {form.isRecurring && <Check size={13} className="stroke-[3]" />}
              </div>
              <span className="text-xs font-medium text-white">Recurring monthly expense</span>
            </div>

            {form.isRecurring && (
              <div className="flex items-center gap-1.5 text-xs text-primary-muted" onClick={e => e.stopPropagation()}>
                <span>Day</span>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={form.recurringDay}
                  onChange={set('recurringDay')}
                  className="w-12 py-1 px-1.5 bg-obsidian border border-glass-border rounded-lg text-center font-mono text-white text-xs"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1 py-3 text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              className="flex-[2] py-3 text-xs bg-accent-orange text-obsidian font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={16} /> Record Expense
            </Button>
          </div>

        </div>

      </div>
    </Overlay>
  )
}

// ── Universal Modal Primitives ───────────────────────────────────────────

export const Overlay = ({ children, onClose }) => {
  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-lg relative z-[101] my-auto"
      >
        {children}
      </motion.div>
    </div>,
    document.body
  )
}

export const ModalHeader = ({ icon = '✨', title, subtitle, onClose }) => (
  <div className="flex items-center justify-between p-6 border-b border-glass-border bg-white/[0.02]">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0 shadow-inner">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-bold text-white tracking-tight leading-tight truncate">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-primary-muted truncate mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
    <button 
      onClick={onClose} 
      className="p-2 rounded-full text-primary-muted hover:text-white hover:bg-white/10 transition-colors"
    >
      <X size={18} />
    </button>
  </div>
)
