import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button, Input, Select, Avatar } from '../ui'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { X, Plus, RefreshCw } from 'lucide-react'

const CATEGORIES = ['rent','electricity','water','internet','groceries','maintenance','other']

const CATEGORY_ICONS = {
  rent:'🏠', electricity:'⚡', water:'💧', internet:'📶',
  groceries:'🛒', maintenance:'🔧', other:'📦'
}

export default function AddExpenseModal({ houseId, members, currency, onClose, onAdded }) {
  const { user } = useAuth()

  const [form, setForm] = useState({
    title:       '',
    totalAmount: '',
    category:    'other',
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
    if (!form.title.trim())           e.title       = 'Title is required'
    if (!form.totalAmount || isNaN(parseFloat(form.totalAmount)) || parseFloat(form.totalAmount) <= 0)
                                       e.totalAmount = 'Enter a valid amount'
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
        title:       form.title,
        totalAmount: parseFloat(form.totalAmount),
        category:    form.category,
        splitType:   form.splitType,
        isRecurring: form.isRecurring,
        recurringDay:form.isRecurring ? parseInt(form.recurringDay) : null,
        note:        form.note,
        splits:      form.splitType === 'custom' ? customSplits : undefined,
      }
      const { data } = await api.post('/expenses', payload)
      toast.success('Expense added')
      onAdded(data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  const autoBalance = () => {
    // Distribute remainder to last person
    const total = parseFloat(form.totalAmount) || 0
    const base  = parseFloat((total / customSplits.length).toFixed(2))
    const remainder = parseFloat((total - base * customSplits.length).toFixed(2))
    setCustomSplits(s => s.map((sp, i) => ({
      ...sp, amount: i === s.length - 1 ? parseFloat((base + remainder).toFixed(2)) : base
    })))
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-lg glass-panel p-0 border border-glass-border shadow-glow rounded-3xl !overflow-visible">
        <ModalHeader title="Add expense" onClose={onClose} />

        <div className="flex flex-col gap-6 px-8 pb-8 pt-4">

          {/* Title + category */}
          <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
            <Input
              label="What was it for?"
              placeholder='e.g. "July Rent" or "Weekly groceries"'
              value={form.title}
              onChange={set('title')}
              error={errors.title}
            />
            <Select label="Category" value={form.category} onChange={set('category')} className="w-44">
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="bg-obsidian text-white">{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase()+c.slice(1)}</option>
              ))}
            </Select>
          </div>

          {/* Amount */}
          <Input
            label={`Total amount (${currency})`}
            type="number"
            placeholder="0.00"
            value={form.totalAmount}
            onChange={set('totalAmount')}
            error={errors.totalAmount}
            className="text-2xl"
          />

          {/* Split type toggle */}
          <div>
            <div className="font-label-caps text-[11px] mb-2 tracking-[0.15em] text-primary-muted pl-1">Split type</div>
            <div className="inline-flex bg-white/5 border border-glass-border rounded-xl p-1 w-full gap-1">
              {['equal','custom'].map(t => (
                <button
                  key={t}
                  onClick={() => setForm(f => ({ ...f, splitType: t }))}
                  className={[
                    'flex-1 py-2 text-[14px] transition-all rounded-lg font-medium',
                    form.splitType === t ? 'bg-white text-obsidian shadow-md' : 'text-primary-muted hover:text-white hover:bg-white/10',
                  ].join(' ')}
                >
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Split preview */}
          <div>
            <div className="flex items-center justify-between mb-3 pl-1">
              <div className="font-label-caps text-[11px] tracking-[0.15em] text-primary-muted">
                {form.splitType === 'equal' ? 'Equal split preview' : 'Custom split'}
              </div>
              {form.splitType === 'custom' && (
                <button
                  onClick={autoBalance}
                  className="flex items-center gap-1.5 font-label-caps text-[10px] uppercase tracking-wider text-accent-orange hover:text-white transition-colors"
                >
                  <RefreshCw size={12} /> Auto-balance
                </button>
              )}
            </div>

            <div className="border border-glass-border rounded-2xl overflow-hidden divide-y divide-glass-border bg-black/20">
              {customSplits.map(sp => (
                <div key={sp.user} className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors">
                  <Avatar name={sp.name} size={32} />
                  <span className="flex-1 font-body-md text-[16px] text-white">{sp.name}</span>
                  {form.splitType === 'custom' ? (
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[16px] text-primary-muted">{curr}</span>
                      <input
                        type="number"
                        value={sp.amount}
                        onChange={e => setSplitAmount(sp.user, e.target.value)}
                        className="w-24 px-3 py-1.5 font-display text-[16px] font-medium bg-white/5 border border-glass-border rounded-lg text-white text-right outline-none focus:border-accent-orange focus:bg-white/10"
                      />
                    </div>
                  ) : (
                    <span className="font-display text-[18px] font-medium tracking-tight text-white">
                      {curr}{sp.amount.toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Custom split validation */}
            {form.splitType === 'custom' && form.totalAmount && (
              <div className={['mt-3 font-mono text-[11px] tracking-[0.15em] uppercase pl-1', splitValid ? 'text-accent-emerald' : 'text-accent-rose'].join(' ')}>
                {splitValid
                  ? `✓ Splits add up to ${curr}${customTotal.toFixed(2)}`
                  : `✗ ${errors.split}`}
              </div>
            )}
          </div>

          {/* Note */}
          <div>
            <div className="font-label-caps text-[11px] mb-2 tracking-[0.15em] text-primary-muted pl-1">Note (optional)</div>
            <textarea
              value={form.note}
              onChange={set('note')}
              placeholder="Any extra info..."
              rows={2}
              className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-xl text-[15px] text-white resize-y outline-none focus:border-accent-orange focus:bg-white/10 placeholder:text-white/20"
            />
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-4 px-5 py-4 bg-white/5 border border-glass-border rounded-xl">
            <input
              type="checkbox"
              id="recurring"
              checked={form.isRecurring}
              onChange={set('isRecurring')}
              className="w-5 h-5 cursor-pointer accent-accent-orange"
            />
            <label htmlFor="recurring" className="text-[15px] cursor-pointer flex-1 text-white">
              Recurring expense (auto-generates monthly)
            </label>
            {form.isRecurring && (
              <input
                type="number"
                min="1" max="28"
                value={form.recurringDay}
                onChange={set('recurringDay')}
                className="w-14 px-2 py-1.5 text-center bg-white/5 border border-glass-border rounded-lg outline-none focus:border-accent-orange text-white"
              />
            )}
            {form.isRecurring && (
              <span className="font-label-caps text-[10px] text-primary-muted">of each month</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} loading={loading} className="flex-[2] shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <Plus size={18} /> Add expense
            </Button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

// ── Shared modal primitives ───────────────────────────────────────────

import { createPortal } from 'react-dom'

export const Overlay = ({ children, onClose }) => {
  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      className="fixed inset-0 z-[100] bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto"
    >
      <div className="w-full max-w-lg animate-[modalIn_0.3s_cubic-bezier(0.16,1,0.3,1)] relative z-[101]">
        {children}
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(24px) scale(0.98); filter:blur(4px) } to { opacity:1; transform:translateY(0) scale(1); filter:blur(0) } }`}</style>
    </div>,
    document.body
  )
}

export const ModalHeader = ({ title, onClose }) => (
  <div className="flex items-center justify-between px-8 py-6 border-b border-glass-border">
    <div className="font-display text-[24px] font-medium tracking-tight text-white">{title}</div>
    <button onClick={onClose} className="flex p-2 rounded-full text-primary-muted hover:text-white hover:bg-white/10 transition-colors">
      <X size={20} />
    </button>
  </div>
)
