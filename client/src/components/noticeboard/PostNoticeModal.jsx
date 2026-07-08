import { useState } from 'react'
import { Button, Input, Select } from '../ui'
import { Overlay, ModalHeader } from '../finance/AddExpenseModal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Send } from 'lucide-react'

const CATEGORIES = ['announcement','reminder','event','warning','general']
const CATEGORY_ICONS = { announcement:'📢', reminder:'⏰', event:'🎉', warning:'⚠️', general:'📋' }

export default function PostNoticeModal({ houseId, onClose, onAdded }) {
  const [form, setForm] = useState({ title:'', body:'', category:'general', isPinned:false, expiresInDays:'' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: val }))
    setErrors(er => ({ ...er, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.body.trim())  e.body  = 'Message is required'
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
        houseId, title: form.title, body: form.body,
        category: form.category, isPinned: form.isPinned, expiresAt,
      })
      toast.success('Notice posted')
      onAdded(data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-lg glass-panel p-0 overflow-hidden border border-glass-border shadow-glow rounded-3xl">
        <ModalHeader title="Post a notice" onClose={onClose} />
        <div className="flex flex-col gap-6 px-8 pb-8 pt-4">
          <Input
            label="Title"
            placeholder='e.g. "Rent due on 1st"'
            value={form.title}
            onChange={set('title')}
            error={errors.title}
          />
          <div>
            <div className="font-label-caps text-[11px] mb-2 tracking-[0.15em] text-primary-muted pl-1">Message</div>
            <textarea
              value={form.body}
              onChange={set('body')}
              placeholder="Write your announcement..."
              rows={3}
              className={[
                'w-full px-4 py-3 bg-white/5 border rounded-xl text-[15px] text-white resize-y outline-none placeholder:text-white/20 transition-colors',
                errors.body ? 'border-accent-rose focus:border-accent-rose focus:bg-accent-rose/5' : 'border-glass-border focus:border-accent-orange focus:bg-white/10',
              ].join(' ')}
            />
            {errors.body && <span className="text-[12px] text-accent-rose mt-1 block pl-1 font-medium">{errors.body}</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-obsidian text-white">{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </Select>
            <Input
              label="Expires in (days, optional)"
              type="number"
              placeholder="Never"
              value={form.expiresInDays}
              onChange={set('expiresInDays')}
            />
          </div>
          <div className="flex items-center gap-3 px-5 py-4 bg-black/20 border border-glass-border rounded-xl hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setForm(f => ({...f, isPinned: !f.isPinned}))}>
            <div className={['w-5 h-5 rounded border flex items-center justify-center transition-colors', form.isPinned ? 'bg-accent-orange border-accent-orange' : 'bg-transparent border-glass-border'].join(' ')}>
              {form.isPinned && <div className="w-2.5 h-2.5 bg-obsidian rounded-sm" />}
            </div>
            <label className="text-[15px] cursor-pointer text-white font-body">Pin to top of board</label>
          </div>
          <div className="flex gap-4 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} loading={loading} className="flex-[2] shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <Send size={18} /> Post notice
            </Button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
