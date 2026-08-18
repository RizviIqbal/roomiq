import { useState } from 'react'
import { Button, Input } from '../ui'
import { Overlay, ModalHeader } from '../finance/AddExpenseModal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Send, Pin, Check, Clock } from 'lucide-react'

const CATEGORIES = ['announcement', 'reminder', 'event', 'warning', 'general']
const CATEGORY_META = {
  announcement: { icon: '📢', label: 'Announcement' },
  reminder:     { icon: '⏰', label: 'Reminder' },
  event:        { icon: '🎉', label: 'House Event' },
  warning:      { icon: '⚠️', label: 'Notice / Warning' },
  general:      { icon: '📋', label: 'General' },
}

const EXPIRATION_PRESETS = [
  { value: '',   label: 'Never' },
  { value: '1',  label: '24 Hours' },
  { value: '3',  label: '3 Days' },
  { value: '7',  label: '1 Week' },
  { value: '30', label: '1 Month' },
]

export default function PostNoticeModal({ houseId, onClose, onAdded }) {
  const [form, setForm] = useState({
    title: '',
    body: '',
    category: 'announcement',
    isPinned: false,
    expiresInDays: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: val }))
    setErrors(er => ({ ...er, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Notice headline is required'
    if (!form.body.trim())  e.body  = 'Notice message body is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const expiresAt = form.expiresInDays
        ? new Date(Date.now() + Number(form.expiresInDays) * 24 * 60 * 60 * 1000)
        : null
      const { data } = await api.post('/noticeboard', {
        houseId,
        title: form.title.trim(),
        body: form.body.trim(),
        category: form.category,
        isPinned: form.isPinned,
        expiresAt,
      })
      toast.success('📌 Notice broadcasted to house bulletin')
      onAdded(data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post notice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="bento-card bg-obsidian/95 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] rounded-3xl overflow-hidden relative">
        
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-emerald via-teal-400 to-accent-cyan" />

        <ModalHeader 
          icon="📌" 
          title="Broadcast Notice" 
          subtitle="Publish an announcement to the community board"
          onClose={onClose} 
        />

        <div className="p-6 sm:p-8 space-y-5">
          
          {/* Title */}
          <Input
            label="Notice Headline *"
            placeholder='e.g. "Water supply maintenance this Thursday", "House dinner on Friday"'
            value={form.title}
            onChange={set('title')}
            error={errors.title}
            className="bg-white/5 border-glass-border text-white text-sm"
          />

          {/* Category Chips */}
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
                        ? 'bg-accent-emerald text-obsidian font-bold shadow-glow scale-[1.02]'
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

          {/* Message Body */}
          <div className="space-y-1.5">
            <label className="text-xs text-primary-muted font-medium block">Message Body *</label>
            <textarea
              value={form.body}
              onChange={set('body')}
              placeholder="Write the full details of your announcement..."
              rows={3}
              className="w-full bg-white/5 border border-glass-border rounded-2xl p-3 text-xs text-white placeholder-primary-muted/40 focus:outline-none focus:border-accent-emerald transition-all resize-none"
            />
            {errors.body && (
              <p className="text-xs text-accent-rose font-medium">{errors.body}</p>
            )}
          </div>

          {/* Expiration Presets */}
          <div className="space-y-2">
            <label className="text-xs text-primary-muted font-medium block">Auto-Archive After</label>
            <div className="grid grid-cols-5 gap-1.5">
              {EXPIRATION_PRESETS.map(e => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, expiresInDays: e.value }))}
                  className={`py-1.5 rounded-xl text-[11px] font-label-caps uppercase tracking-wider transition-all text-center ${
                    form.expiresInDays === e.value
                      ? 'bg-white text-obsidian font-bold shadow-glow scale-[1.02]'
                      : 'bg-white/5 text-primary-muted hover:text-white border border-white/5'
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pin to Top Checkbox */}
          <div 
            onClick={() => setForm(f => ({ ...f, isPinned: !f.isPinned }))}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                form.isPinned ? 'bg-accent-emerald border-accent-emerald text-obsidian' : 'border-white/20 bg-transparent'
              }`}>
                {form.isPinned && <Check size={13} className="stroke-[3]" />}
              </div>
              <div>
                <div className="text-xs font-medium text-white flex items-center gap-1.5">
                  <Pin size={13} className={form.isPinned ? 'text-accent-emerald' : 'text-primary-muted'} />
                  <span>Pin to top of bulletin board</span>
                </div>
                <div className="text-[10px] text-primary-muted">Highlights this notice at the very top for all roommates</div>
              </div>
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
              className="flex-[2] py-3 text-xs bg-gradient-to-r from-accent-emerald to-teal-500 hover:from-teal-500 hover:to-emerald-600 text-obsidian font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send size={16} /> Broadcast Notice
            </Button>
          </div>

        </div>

      </div>
    </Overlay>
  )
}
