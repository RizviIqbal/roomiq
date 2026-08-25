import { useState } from 'react'
import { Button, Input } from '../ui'
import { Overlay, ModalHeader } from '../finance/AddExpenseModal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Send, Pin, Check, Clock, Sparkles } from 'lucide-react'

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

const QUICK_TEMPLATES = [
  {
    label: '👥 Overnight Guest',
    category: 'reminder',
    title: 'Hosting a friend this weekend',
    body: 'Hey everyone, my university friend will be staying over Friday through Sunday. We will keep common spaces quiet by 23:00!'
  },
  {
    label: '🔧 Maintenance Visit',
    category: 'warning',
    title: 'Electrician / Plumber visit tomorrow 10 AM',
    body: 'The landlord scheduled a technician to inspect the kitchen water heater tomorrow around 10:00 AM. Please keep kitchen counter clear.'
  },
  {
    label: '📦 Package Delivery',
    category: 'announcement',
    title: 'Parcel delivery arriving today',
    body: 'Expecting a Daraz delivery today. If someone is home, could you please collect it and leave it by the living room shoe rack? Thanks!'
  },
  {
    label: '🎉 House Potluck',
    category: 'event',
    title: 'Weekend Communal Dinner & Potluck',
    body: 'Let’s do a group dinner this Saturday at 8 PM! I will make biryani / pasta. RSVP below if you want to join!'
  }
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
    if (errors[k]) setErrors(er => ({ ...er, [k]: undefined }))
  }

  const applyTemplate = (t) => {
    setForm(f => ({
      ...f,
      title: t.title,
      body: t.body,
      category: t.category
    }))
    setErrors({})
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
      <div className="bento-card bg-obsidian/95 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] rounded-3xl overflow-hidden relative max-w-lg w-full font-body text-white">
        
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-orange via-purple-500 to-accent-cyan" />

        <ModalHeader 
          icon="📌" 
          title="Broadcast Notice" 
          subtitle="Publish an announcement to the community board"
          onClose={onClose} 
        />

        <div className="p-6 sm:p-8 space-y-5">
          
          {/* Quick Notice Templates */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-label-caps uppercase text-accent-orange font-bold flex items-center gap-1">
              <Sparkles size={11} /> 1-Click Fast Templates
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TEMPLATES.map(t => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-glass-border text-xs text-primary-muted hover:text-white transition-all active:scale-95"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <Input
            label="Notice Headline *"
            placeholder='e.g. "Water supply maintenance this Thursday", "House dinner on Friday"'
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
                    className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-accent-orange text-obsidian border-accent-orange font-bold shadow-glow scale-105'
                        : 'bg-white/5 border-glass-border text-primary-muted hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-primary-muted">
              Message Content *
            </label>
            <textarea
              rows={3}
              placeholder="Write the details of your bulletin here..."
              value={form.body}
              onChange={set('body')}
              className="w-full bg-white/5 border border-glass-border rounded-2xl p-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-accent-orange transition-all resize-none"
            />
            {errors.body && <span className="text-xs text-accent-rose block">{errors.body}</span>}
          </div>

          {/* Expiry Presets & Pinned Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs text-primary-muted font-medium block">Auto-Expire After</label>
              <select
                value={form.expiresInDays}
                onChange={set('expiresInDays')}
                className="w-full bg-[#0d0d12] border border-glass-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-orange cursor-pointer"
              >
                {EXPIRATION_PRESETS.map(p => (
                  <option key={p.value} value={p.value} className="bg-[#0d0d12] text-white">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-glass-border self-end">
              <label htmlFor="pin-toggle" className="text-xs text-white font-medium flex items-center gap-1.5 cursor-pointer">
                <Pin size={13} className="text-accent-orange" /> Pin to Top
              </label>
              <input
                id="pin-toggle"
                type="checkbox"
                checked={form.isPinned}
                onChange={set('isPinned')}
                className="w-4 h-4 rounded border-glass-border accent-accent-orange cursor-pointer"
              >
              </input>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-primary-muted hover:text-white border border-glass-border text-xs font-bold transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-2 py-3 px-5 rounded-xl bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-orange-600 text-obsidian font-bold text-xs shadow-glow transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Send size={14} />
              <span>{loading ? 'Publishing...' : 'Broadcast Bulletin'}</span>
            </button>
          </div>

        </div>
      </div>
    </Overlay>
  )
}
