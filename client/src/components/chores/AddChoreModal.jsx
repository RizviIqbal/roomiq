import { useState, useEffect } from 'react'
import { Button, Input, Select, Avatar } from '../ui'
import { Overlay, ModalHeader } from '../finance/AddExpenseModal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Plus, ArrowUp, ArrowDown } from 'lucide-react'

const FREQUENCIES = [
  { value: 'daily',    label: 'Daily' },
  { value: 'weekly',   label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly',  label: 'Monthly' },
]

export default function AddChoreModal({ houseId, members, onClose, onAdded }) {
  const [form, setForm] = useState({
    title:             '',
    description:       '',
    assignedTo:        members?.[0]?.user?._id || '',
    dueDate:           '',
    isAutoRotate:      false,
    rotationFrequency: 'weekly',
  })
  const [rotationOrder, setRotationOrder] = useState(members?.map(m => m.user._id) || [])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  useEffect(() => {
    if (members?.length) {
      setForm(f => ({ ...f, assignedTo: members[0].user._id }))
      setRotationOrder(members.map(m => m.user._id))
    }
  }, [members])

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: val }))
    setErrors(er => ({ ...er, [k]: undefined }))
  }

  const moveUp = (idx) => {
    if (idx === 0) return
    setRotationOrder(o => {
      const copy = [...o]
      ;[copy[idx-1], copy[idx]] = [copy[idx], copy[idx-1]]
      return copy
    })
  }
  const moveDown = (idx) => {
    if (idx === rotationOrder.length - 1) return
    setRotationOrder(o => {
      const copy = [...o]
      ;[copy[idx+1], copy[idx]] = [copy[idx], copy[idx+1]]
      return copy
    })
  }

  const findMember = (id) => members?.find(m => m.user._id === id)?.user

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title   = 'Title is required'
    if (!form.dueDate)      e.dueDate = 'Due date is required'
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
        description: form.description,
        dueDate:     form.dueDate,
        isAutoRotate: form.isAutoRotate,
        rotationFrequency: form.rotationFrequency,
        assignedTo:  form.isAutoRotate ? rotationOrder[0] : form.assignedTo,
        rotationOrder: form.isAutoRotate ? rotationOrder : [form.assignedTo],
      }
      const { data } = await api.post('/chores', payload)
      toast.success('Chore created')
      onAdded(data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create chore')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-lg glass-panel p-0 overflow-hidden border border-glass-border shadow-glow rounded-3xl">
        <ModalHeader title="Create chore" onClose={onClose} />

        <div className="flex flex-col gap-6 px-8 pb-8 pt-4">
          <Input
            label="Chore title"
            placeholder='e.g. "Clean the bathroom"'
            value={form.title}
            onChange={set('title')}
            error={errors.title}
          />

          <div>
            <div className="font-label-caps text-[11px] mb-2 tracking-[0.15em] text-primary-muted pl-1">Description (optional)</div>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Any specific instructions..."
              rows={2}
              className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-xl text-[15px] text-white resize-y outline-none focus:border-accent-orange focus:bg-white/10 placeholder:text-white/20"
            />
          </div>

          <Input
            label="Due date"
            type="date"
            value={form.dueDate}
            onChange={set('dueDate')}
            error={errors.dueDate}
            min={new Date().toISOString().split('T')[0]}
            className="w-full"
          />

          {/* Auto-rotate toggle */}
          <div className="flex items-center gap-4 px-5 py-4 bg-white/5 border border-glass-border rounded-xl">
            <input
              type="checkbox"
              id="autorotate"
              checked={form.isAutoRotate}
              onChange={set('isAutoRotate')}
              className="w-5 h-5 cursor-pointer accent-accent-orange"
            />
            <label htmlFor="autorotate" className="text-[15px] cursor-pointer flex-1 text-white">
              Auto-rotate between roommates
            </label>
            {form.isAutoRotate && (
              <Select value={form.rotationFrequency} onChange={set('rotationFrequency')} className="w-44">
                {FREQUENCIES.map(f => <option key={f.value} value={f.value} className="bg-obsidian">{f.label}</option>)}
              </Select>
            )}
          </div>

          {/* Assignment */}
          {!form.isAutoRotate ? (
            <Select label="Assign to" value={form.assignedTo} onChange={set('assignedTo')}>
              {members?.map(m => (
                <option key={m.user._id} value={m.user._id} className="bg-obsidian">{m.user.name}</option>
              ))}
            </Select>
          ) : (
            <div>
              <div className="font-label-caps text-[11px] mb-3 tracking-[0.15em] text-primary-muted pl-1">
                Rotation order <span className="text-white/30 lowercase">(starts with first person)</span>
              </div>
              <div className="border border-glass-border rounded-2xl overflow-hidden divide-y divide-glass-border bg-black/20">
                {rotationOrder.map((uid, idx) => {
                  const m = findMember(uid)
                  return (
                    <div key={uid} className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors">
                      <span className="font-display font-medium text-[16px] text-primary-muted w-4">{idx+1}</span>
                      <Avatar name={m?.name} size={32} />
                      <span className="flex-1 font-body-md text-[16px] text-white">{m?.name}</span>
                      <button onClick={() => moveUp(idx)} disabled={idx===0} className="p-1.5 text-primary-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-white/10 rounded-full">
                        <ArrowUp size={16} />
                      </button>
                      <button onClick={() => moveDown(idx)} disabled={idx===rotationOrder.length-1} className="p-1.5 text-primary-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-white/10 rounded-full">
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} loading={loading} className="flex-[2] shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <Plus size={18} /> Create chore
            </Button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
