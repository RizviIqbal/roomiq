import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button, Input, Select } from '../ui'
import { Overlay, ModalHeader } from '../finance/AddExpenseModal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Send, EyeOff } from 'lucide-react'

const CATEGORIES = ['noise','cleanliness','guests','bills','behavior','other']
const CATEGORY_ICONS = { noise:'🔊', cleanliness:'🧹', guests:'👥', bills:'💸', behavior:'😠', other:'📋' }

export default function FileComplaintModal({ houseId, members, onClose, onAdded }) {
  const { user } = useAuth()
  const others = members?.filter(m => m.user._id !== user._id) || []

  const [form, setForm] = useState({
    against: others[0]?.user?._id || '',
    title: '', description: '', category: 'other', isAnonymous: false,
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
    if (!form.against)            e.against     = 'Select who this is about'
    if (!form.title.trim())       e.title       = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await api.post('/complaints', { houseId, ...form })
      toast.success('Complaint filed')
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
      <div className="w-full max-w-lg glass-panel p-0 overflow-hidden border border-glass-border shadow-[0_0_40px_rgba(225,29,72,0.15)] rounded-3xl">
        <ModalHeader title="File a complaint" onClose={onClose} />
        <div className="flex flex-col gap-6 px-8 pb-8 pt-4">

          <Select label="About" value={form.against} onChange={set('against')} error={errors.against}>
            {others.map(m => <option key={m.user._id} value={m.user._id} className="bg-obsidian text-white">{m.user.name}</option>)}
          </Select>

          <Input
            label="Title"
            placeholder='e.g. "Loud music late at night"'
            value={form.title}
            onChange={set('title')}
            error={errors.title}
          />

          <div>
            <div className="font-label-caps text-[11px] mb-2 tracking-[0.15em] text-primary-muted pl-1">Description</div>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Describe what happened, when, and how it affected you..."
              rows={4}
              className={[
                'w-full px-4 py-3 bg-white/5 border rounded-xl text-[15px] text-white resize-y outline-none placeholder:text-white/20 transition-colors',
                errors.description ? 'border-accent-rose focus:border-accent-rose focus:bg-accent-rose/5' : 'border-glass-border focus:border-accent-orange focus:bg-white/10',
              ].join(' ')}
            />
            {errors.description && <span className="text-[12px] text-accent-rose mt-1 block pl-1 font-medium">{errors.description}</span>}
          </div>

          <Select label="Category" value={form.category} onChange={set('category')}>
            {CATEGORIES.map(c => <option key={c} value={c} className="bg-obsidian text-white">{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </Select>

          {/* Anonymous toggle */}
          <div className="flex items-center gap-3 px-5 py-4 bg-black/20 border border-glass-border rounded-xl hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setForm(f => ({...f, isAnonymous: !f.isAnonymous}))}>
            <div className={['w-5 h-5 rounded border flex items-center justify-center transition-colors', form.isAnonymous ? 'bg-accent-orange border-accent-orange' : 'bg-transparent border-glass-border'].join(' ')}>
              {form.isAnonymous && <div className="w-2.5 h-2.5 bg-obsidian rounded-sm" />}
            </div>
            <label className="text-[15px] cursor-pointer flex-1 flex items-center gap-2 text-white font-body">
              <EyeOff size={16} className={form.isAnonymous ? 'text-accent-orange' : 'text-primary-muted'} /> File anonymously
            </label>
          </div>
          {form.isAnonymous && (
            <div className="font-label-caps text-[10px] tracking-[0.15em] text-accent-orange/70 mt-1 pl-1">
              Your name won't be shown to anyone, including the person this is about.
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={handleSubmit} loading={loading} className="flex-[2] shadow-[0_0_15px_rgba(225,29,72,0.3)]">
              <Send size={18} /> File complaint
            </Button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
