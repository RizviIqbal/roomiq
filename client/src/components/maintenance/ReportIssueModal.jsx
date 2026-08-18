import { useState } from 'react'
import { Button, Input } from '../ui'
import { Overlay, ModalHeader } from '../finance/AddExpenseModal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Send, UploadCloud, X, AlertTriangle } from 'lucide-react'

const CATEGORIES = ['plumbing', 'electrical', 'appliance', 'structural', 'pest', 'other']
const CATEGORY_META = {
  plumbing:   { icon: '🚰', label: 'Plumbing' },
  electrical: { icon: '⚡', label: 'Electrical' },
  appliance:  { icon: '🔌', label: 'Appliance' },
  structural: { icon: '🏗️', label: 'Structural' },
  pest:       { icon: '🐜', label: 'Pest Control' },
  other:      { icon: '🔧', label: 'Other' },
}

const PRIORITIES = [
  { value: 'low',    label: 'Low',    color: 'text-primary-muted border-white/10' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400 border-amber-400/40 bg-amber-400/10' },
  { value: 'high',   label: 'High',   color: 'text-accent-orange border-accent-orange/40 bg-accent-orange/10' },
  { value: 'urgent', label: 'Urgent', color: 'text-accent-rose border-accent-rose/50 bg-accent-rose/10' },
]

export default function ReportIssueModal({ houseId, onClose, onAdded }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'plumbing',
    priority: 'medium'
  })
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setErrors(er => ({ ...er, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title       = 'Issue title is required'
    if (!form.description.trim()) e.description = 'Please describe the issue in detail'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('houseId', houseId)
      formData.append('title', form.title.trim())
      formData.append('description', form.description.trim())
      formData.append('category', form.category)
      formData.append('priority', form.priority)
      if (photo) {
        formData.append('photo', photo)
      }

      const { data } = await api.post('/maintenance', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('🛠️ Maintenance ticket submitted to house log')
      onAdded(data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit issue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="bento-card bg-obsidian/95 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] rounded-3xl overflow-hidden relative">
        
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-accent-rose" />

        <ModalHeader 
          icon="🔧" 
          title="Report Maintenance Issue" 
          subtitle="File repair ticket with optional photo evidence"
          onClose={onClose} 
        />

        <div className="p-6 sm:p-8 space-y-5">
          
          {/* Title */}
          <Input
            label="What is broken or needs repair? *"
            placeholder='e.g. "Water heater leaking in master bath", "AC fuse tripped"'
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
                        ? 'bg-amber-400 text-obsidian font-bold shadow-glow scale-[1.02]'
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

          {/* Priority Level */}
          <div className="space-y-2">
            <label className="text-xs text-primary-muted font-medium block">Urgency Level</label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES.map(p => {
                const isSelected = form.priority === p.value
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                    className={`py-2 px-2 rounded-xl text-xs font-label-caps uppercase tracking-wider transition-all text-center border ${
                      isSelected
                        ? 'bg-white text-obsidian font-bold shadow-glow scale-[1.02]'
                        : p.color
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs text-primary-muted font-medium block">Detailed Description *</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Describe what happened, when it started, and current impact..."
              rows={3}
              className="w-full bg-white/5 border border-glass-border rounded-2xl p-3 text-xs text-white placeholder-primary-muted/40 focus:outline-none focus:border-amber-400 transition-all resize-none"
            />
            {errors.description && (
              <p className="text-xs text-accent-rose font-medium">{errors.description}</p>
            )}
          </div>

          {/* Photo Evidence Upload Box */}
          <div className="space-y-1.5">
            <label className="text-xs text-primary-muted font-medium block">Photo Evidence (Optional)</label>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-glass-border hover:border-amber-400/50 rounded-2xl cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] transition-all group relative">
              {photo ? (
                <div className="flex items-center justify-between w-full px-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xl">📸</span>
                    <div className="truncate text-left">
                      <p className="text-xs font-bold text-white truncate">{photo.name}</p>
                      <p className="text-[10px] text-primary-muted font-mono">{(photo.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setPhoto(null)
                    }}
                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-primary-muted hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-center py-2">
                  <UploadCloud size={22} className="text-primary-muted group-hover:text-amber-400 transition-colors" />
                  <div className="text-left">
                    <p className="text-xs font-medium text-white">Upload image proof</p>
                    <p className="text-[10px] text-primary-muted">PNG, JPG or WEBP up to 5MB</p>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={e => {
                  if (e.target.files?.[0]) setPhoto(e.target.files[0])
                }} 
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1 py-3 text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              className="flex-[2] py-3 text-xs bg-gradient-to-r from-amber-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-obsidian font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send size={16} /> Submit Ticket
            </Button>
          </div>

        </div>

      </div>
    </Overlay>
  )
}
