import { useState } from 'react'
import { Button, Input, Select } from '../ui'
import { Overlay, ModalHeader } from '../finance/AddExpenseModal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Send } from 'lucide-react'

const CATEGORIES  = ['plumbing','electrical','appliance','structural','pest','other']
const PRIORITIES  = ['low','medium','high','urgent']
const CATEGORY_ICONS = { plumbing:'🚰', electrical:'⚡', appliance:'🔌', structural:'🏗️', pest:'🐜', other:'🔧' }

export default function ReportIssueModal({ houseId, onClose, onAdded }) {
  const [form, setForm] = useState({ title:'', description:'', category:'other', priority:'medium' })
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setErrors(er => ({ ...er, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title       = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('houseId', houseId)
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('category', form.category)
      formData.append('priority', form.priority)
      if (photo) {
        formData.append('photo', photo)
      }

      const { data } = await api.post('/maintenance', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Issue reported')
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
        <ModalHeader title="Report a maintenance issue" onClose={onClose} />
        <div className="flex flex-col gap-6 px-8 pb-8 pt-4">
          <Input
            label="Issue title"
            placeholder='e.g. "AC not cooling properly"'
            value={form.title}
            onChange={set('title')}
            error={errors.title}
          />
          <div>
            <div className="font-label-caps text-[11px] mb-2 tracking-[0.15em] text-primary-muted pl-1">Description</div>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Describe the issue, when it started, and any details..."
              rows={3}
              className={[
                'w-full px-4 py-3 bg-white/5 border rounded-xl text-[15px] text-white resize-y outline-none placeholder:text-white/20 transition-colors',
                errors.description ? 'border-accent-rose focus:border-accent-rose focus:bg-accent-rose/5' : 'border-glass-border focus:border-accent-orange focus:bg-white/10',
              ].join(' ')}
            />
            {errors.description && <span className="text-[12px] text-accent-rose mt-1 block pl-1 font-medium">{errors.description}</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-obsidian text-white">{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </Select>
            <Select label="Priority" value={form.priority} onChange={set('priority')}>
              {PRIORITIES.map(p => <option key={p} value={p} className="bg-obsidian text-white">{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
            </Select>
          </div>
          <div>
            <div className="font-label-caps text-[11px] mb-2 tracking-[0.15em] text-primary-muted pl-1">Photo Evidence (Optional)</div>
            <label className="flex flex-col items-center justify-center w-full h-32 bg-white/5 border-2 border-dashed border-glass-border rounded-xl cursor-pointer hover:bg-white/10 hover:border-accent-orange/50 transition-all group overflow-hidden relative">
              {photo ? (
                <div className="text-center">
                  <div className="text-accent-orange font-bold font-body">{photo.name}</div>
                  <div className="text-[12px] text-primary-muted font-mono mt-1">{(photo.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <span className="text-2xl opacity-60 group-hover:opacity-100 group-hover:text-accent-orange transition-all">📸</span>
                  </div>
                  <p className="text-[13px] text-primary-muted font-body">Click to upload photo</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
            </label>
          </div>
          <div className="flex gap-4 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} loading={loading} className="flex-[2] shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <Send size={18} /> Report issue
            </Button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
