import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button, Input, Avatar } from '../ui'
import { Overlay, ModalHeader } from '../finance/AddExpenseModal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Send, EyeOff, ShieldCheck, Check, AlertOctagon } from 'lucide-react'

const CATEGORIES = ['noise', 'cleanliness', 'guests', 'bills', 'behavior', 'other']
const CATEGORY_META = {
  noise:       { icon: '🔊', label: 'Noise' },
  cleanliness: { icon: '🧹', label: 'Cleanliness' },
  guests:      { icon: '👥', label: 'Guests' },
  bills:       { icon: '💸', label: 'Unpaid Bills' },
  behavior:    { icon: '😠', label: 'Behavior' },
  other:       { icon: '📋', label: 'Other' },
}

export default function FileComplaintModal({ houseId, members, onClose, onAdded }) {
  const { user } = useAuth()
  const others = members?.filter(m => m.user._id !== user._id) || []

  const [form, setForm] = useState({
    against: others[0]?.user?._id || '',
    title: '',
    description: '',
    category: 'noise',
    isAnonymous: false,
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
    if (!form.against)            e.against     = 'Please select a roommate'
    if (!form.title.trim())       e.title       = 'Complaint subject is required'
    if (!form.description.trim()) e.description = 'Please explain the issue and its impact'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await api.post('/complaints', { houseId, ...form })
      toast.success('⚖️ Grievance submitted to mediation panel')
      onAdded(data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to file complaint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="bento-card bg-obsidian/95 border border-white/10 shadow-[0_25px_60px_rgba(225,29,72,0.2)] rounded-3xl overflow-hidden relative">
        
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-rose via-red-500 to-accent-orange" />

        <ModalHeader 
          icon="⚖️" 
          title="File House Mediation Issue" 
          subtitle="Resolve roommate friction democratically"
          onClose={onClose} 
        />

        <div className="p-6 sm:p-8 space-y-5">
          
          {/* Target Roommate Selector */}
          <div className="space-y-2">
            <label className="text-xs text-primary-muted font-medium block">Regarding Roommate *</label>
            <div className="grid grid-cols-2 gap-2">
              {others.map(m => {
                const isSelected = form.against === m.user._id
                return (
                  <div
                    key={m.user._id}
                    onClick={() => setForm(f => ({ ...f, against: m.user._id }))}
                    className={`p-2.5 rounded-2xl flex items-center gap-2.5 cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-accent-rose/20 border-accent-rose text-white shadow-glow'
                        : 'bg-white/5 border-white/5 text-primary-muted hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Avatar name={m.user.name} src={m.user.avatar} size={28} />
                    <span className="text-xs font-medium truncate">{m.user.name}</span>
                  </div>
                )
              })}
            </div>
            {errors.against && (
              <p className="text-xs text-accent-rose font-medium">{errors.against}</p>
            )}
          </div>

          {/* Title */}
          <Input
            label="Subject Headline *"
            placeholder='e.g. "Loud speakers playing after 1 AM on weekdays"'
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
                        ? 'bg-accent-rose text-white font-bold shadow-glow scale-[1.02]'
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

          {/* Detailed Description */}
          <div className="space-y-1.5">
            <label className="text-xs text-primary-muted font-medium block">What happened? *</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Describe what occurred, how often it happens, and proposed resolution..."
              rows={3}
              className="w-full bg-white/5 border border-glass-border rounded-2xl p-3 text-xs text-white placeholder-primary-muted/40 focus:outline-none focus:border-accent-rose transition-all resize-none"
            />
            {errors.description && (
              <p className="text-xs text-accent-rose font-medium">{errors.description}</p>
            )}
          </div>

          {/* Anonymous Option */}
          <div 
            onClick={() => setForm(f => ({ ...f, isAnonymous: !f.isAnonymous }))}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                form.isAnonymous ? 'bg-accent-rose border-accent-rose text-white' : 'border-white/20 bg-transparent'
              }`}>
                {form.isAnonymous && <Check size={13} className="stroke-[3]" />}
              </div>
              <div>
                <div className="text-xs font-medium text-white flex items-center gap-1.5">
                  <EyeOff size={13} className={form.isAnonymous ? 'text-accent-rose' : 'text-primary-muted'} />
                  <span>Submit issue anonymously</span>
                </div>
                <div className="text-[10px] text-primary-muted">Your name is hidden from all members and target</div>
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
              className="flex-[2] py-3 text-xs bg-gradient-to-r from-accent-rose to-red-600 hover:from-red-600 hover:to-rose-700 text-white font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send size={16} /> File for Mediation
            </Button>
          </div>

        </div>

      </div>
    </Overlay>
  )
}
