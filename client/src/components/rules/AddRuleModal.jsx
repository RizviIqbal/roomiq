import { useState } from 'react'
import { Button, Input } from '../ui'
import { Overlay, ModalHeader } from '../finance/AddExpenseModal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Plus, Check, Vote } from 'lucide-react'

const CATEGORIES = ['guests', 'noise', 'cleanliness', 'kitchen', 'bathroom', 'general']
const CATEGORY_META = {
  guests:      { icon: '👥', label: 'Guests' },
  noise:       { icon: '🔊', label: 'Noise' },
  cleanliness: { icon: '🧹', label: 'Cleanliness' },
  kitchen:     { icon: '🍳', label: 'Kitchen' },
  bathroom:    { icon: '🚿', label: 'Bathroom' },
  general:     { icon: '📋', label: 'General' },
}

const VOTING_PERIODS = [
  { value: '1', label: '24 Hours' },
  { value: '3', label: '3 Days' },
  { value: '5', label: '5 Days' },
  { value: '7', label: '1 Week' },
]

export default function AddRuleModal({ houseId, onClose, onAdded }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'general',
    votingDays: '3'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setErrors(er => ({ ...er, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Rule proposal title is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const votingDeadline = new Date(Date.now() + Number(form.votingDays) * 24 * 60 * 60 * 1000)
      const { data } = await api.post('/rules', {
        houseId,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        votingDeadline,
      })
      toast.success('🗳️ Rule proposed — democratic voting is now live')
      onAdded(data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to propose rule')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="bento-card bg-obsidian/95 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] rounded-3xl overflow-hidden relative">
        
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-cyan via-teal-400 to-accent-emerald" />

        <ModalHeader 
          icon="📜" 
          title="Propose House Agreement" 
          subtitle="Initiate a community quorum ballot"
          onClose={onClose} 
        />

        <div className="p-6 sm:p-8 space-y-5">
          
          {/* Title */}
          <Input
            label="Rule Statement *"
            placeholder='e.g. "Quiet hours from 11 PM to 7 AM on weekdays"'
            value={form.title}
            onChange={set('title')}
            error={errors.title}
            className="bg-white/5 border-glass-border text-white text-sm"
          />

          {/* Interactive Category Chips */}
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
                        ? 'bg-accent-cyan text-obsidian font-bold shadow-glow scale-[1.02]'
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

          {/* Description / Reasoning */}
          <div className="space-y-1.5">
            <label className="text-xs text-primary-muted font-medium block">Reasoning & Context (Optional)</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Explain why this rule benefits house harmony..."
              rows={3}
              className="w-full bg-white/5 border border-glass-border rounded-2xl p-3 text-xs text-white placeholder-primary-muted/40 focus:outline-none focus:border-accent-cyan transition-all resize-none"
            />
          </div>

          {/* Voting Period Chips */}
          <div className="space-y-2">
            <label className="text-xs text-primary-muted font-medium block">Voting Window</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VOTING_PERIODS.map(v => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, votingDays: v.value }))}
                  className={`py-2 px-2 rounded-xl text-xs font-label-caps uppercase tracking-wider transition-all text-center ${
                    form.votingDays === v.value
                      ? 'bg-white text-obsidian font-bold shadow-glow scale-[1.02]'
                      : 'bg-white/5 text-primary-muted hover:text-white border border-white/5'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1 py-3 text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              className="flex-[2] py-3 text-xs bg-gradient-to-r from-accent-cyan to-teal-500 hover:from-teal-500 hover:to-teal-600 text-obsidian font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98]"
            >
              <Vote size={16} /> Open Ballot
            </Button>
          </div>

        </div>

      </div>
    </Overlay>
  )
}
