import { useState } from 'react'
import { Button, Input, Select } from '../ui'
import { Overlay, ModalHeader } from '../finance/AddExpenseModal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'

const CATEGORIES = ['guests','noise','cleanliness','kitchen','bathroom','general']
const CATEGORY_ICONS = { guests:'👥', noise:'🔊', cleanliness:'🧹', kitchen:'🍳', bathroom:'🚿', general:'📋' }

export default function AddRuleModal({ houseId, onClose, onAdded }) {
  const [form, setForm] = useState({ title:'', description:'', category:'general', votingDays:'3' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setErrors(er => ({ ...er, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const votingDeadline = new Date(Date.now() + Number(form.votingDays) * 24 * 60 * 60 * 1000)
      const { data } = await api.post('/rules', {
        houseId, title: form.title, description: form.description,
        category: form.category, votingDeadline,
      })
      toast.success('Rule proposed — voting is now open')
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
      <div className="w-full max-w-lg glass-panel p-0 overflow-hidden border border-glass-border shadow-glow rounded-3xl">
        <ModalHeader title="Propose a house rule" onClose={onClose} />
        <div className="flex flex-col gap-6 px-8 pb-8 pt-4">
          <Input
            label="Rule title"
            placeholder='e.g. "No guests after 11 PM on weekdays"'
            value={form.title}
            onChange={set('title')}
            error={errors.title}
          />
          <div>
            <div className="font-label-caps text-[11px] mb-2 tracking-[0.15em] text-primary-muted pl-1">Description (optional)</div>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Explain the reasoning behind this rule..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-xl text-[15px] text-white resize-y outline-none focus:border-accent-orange focus:bg-white/10 placeholder:text-white/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-obsidian text-white">{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </Select>
            <Select label="Voting period" value={form.votingDays} onChange={set('votingDays')}>
              <option value="1" className="bg-obsidian text-white">1 day</option>
              <option value="3" className="bg-obsidian text-white">3 days</option>
              <option value="5" className="bg-obsidian text-white">5 days</option>
              <option value="7" className="bg-obsidian text-white">7 days</option>
            </Select>
          </div>
          <div className="flex gap-4 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} loading={loading} className="flex-[2] shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <Plus size={18} /> Propose rule
            </Button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
