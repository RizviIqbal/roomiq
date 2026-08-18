import { useState, useEffect } from 'react'
import { Button, Input, Select, Avatar } from '../ui'
import { Overlay, ModalHeader } from '../finance/AddExpenseModal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Plus, ArrowUp, ArrowDown, Check, Calendar, RotateCw, UserCheck } from 'lucide-react'

const FREQUENCIES = [
  { value: 'daily',    label: 'Daily' },
  { value: 'weekly',   label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'monthly',  label: 'Monthly' },
]

export default function AddChoreModal({ houseId, members, onClose, onAdded }) {
  const [form, setForm] = useState({
    title:             '',
    description:       '',
    assignedTo:        members?.[0]?.user?._id || '',
    dueDate:           new Date(Date.now() + 86400000).toISOString().split('T')[0],
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
    if (!form.title.trim()) e.title   = 'Chore title is required'
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
        title:             form.title.trim(),
        description:       form.description.trim(),
        dueDate:           form.dueDate,
        isAutoRotate:      form.isAutoRotate,
        rotationFrequency: form.rotationFrequency,
        assignedTo:        form.isAutoRotate ? rotationOrder[0] : form.assignedTo,
        rotationOrder:     form.isAutoRotate ? rotationOrder : [form.assignedTo],
      }
      const { data } = await api.post('/chores', payload)
      toast.success('🎉 Chore scheduled on house roster')
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
      <div className="bento-card bg-obsidian/95 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] rounded-3xl overflow-hidden relative">
        
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-purple via-fuchsia-500 to-accent-orange" />

        <ModalHeader 
          icon="🧹" 
          title="Create House Chore" 
          subtitle="Assign cleaning & maintenance tasks"
          onClose={onClose} 
        />

        <div className="p-6 sm:p-8 space-y-5">
          
          {/* Title */}
          <Input
            label="Chore Title *"
            placeholder='e.g. "Clean kitchen sink & counters", "Take out trash"'
            value={form.title}
            onChange={set('title')}
            error={errors.title}
            className="bg-white/5 border-glass-border text-white text-sm"
          />

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs text-primary-muted font-medium block">Instructions (Optional)</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="e.g. Please run the dishwasher before 10 PM and replace bin liner..."
              rows={2}
              className="w-full bg-white/5 border border-glass-border rounded-2xl p-3 text-xs text-white placeholder-primary-muted/40 focus:outline-none focus:border-accent-purple transition-all resize-none"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="text-xs text-primary-muted font-medium block">Due Date *</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={set('dueDate')}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-white/5 border border-glass-border rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-purple transition-all font-mono"
            />
            {errors.dueDate && (
              <p className="text-xs text-accent-rose font-medium">{errors.dueDate}</p>
            )}
          </div>

          {/* Auto-rotate Toggle */}
          <div 
            onClick={() => setForm(f => ({ ...f, isAutoRotate: !f.isAutoRotate }))}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                form.isAutoRotate ? 'bg-accent-purple border-accent-purple text-white' : 'border-white/20 bg-transparent'
              }`}>
                {form.isAutoRotate && <Check size={13} className="stroke-[3]" />}
              </div>
              <div>
                <div className="text-xs font-medium text-white">Auto-rotate between housemates</div>
                <div className="text-[10px] text-primary-muted">Automatically passes to the next person upon completion</div>
              </div>
            </div>
          </div>

          {/* Frequency Chips if Auto-Rotate */}
          {form.isAutoRotate && (
            <div className="space-y-2 animate-fade-up">
              <label className="text-xs text-primary-muted font-medium block">Rotation Cadence</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FREQUENCIES.map(f => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setForm(formState => ({ ...formState, rotationFrequency: f.value }))}
                    className={`py-2 px-2 rounded-xl text-xs font-label-caps uppercase tracking-wider transition-all text-center ${
                      form.rotationFrequency === f.value
                        ? 'bg-accent-purple text-white font-bold shadow-glow scale-[1.02]'
                        : 'bg-white/5 text-primary-muted hover:text-white border border-white/5'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Single Assignee OR Rotation Order */}
          {!form.isAutoRotate ? (
            <div className="space-y-2">
              <label className="text-xs text-primary-muted font-medium block">Assigned Roommate</label>
              <div className="grid grid-cols-2 gap-2">
                {members?.map(m => {
                  const isSelected = form.assignedTo === m.user._id
                  return (
                    <div
                      key={m.user._id}
                      onClick={() => setForm(f => ({ ...f, assignedTo: m.user._id }))}
                      className={`p-2.5 rounded-2xl flex items-center gap-2.5 cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-accent-purple/20 border-accent-purple text-white shadow-glow'
                          : 'bg-white/5 border-white/5 text-primary-muted hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Avatar name={m.user.name} src={m.user.avatar} size={28} />
                      <span className="text-xs font-medium truncate">{m.user.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-primary-muted">
                <span>Rotation Order</span>
                <span className="text-[10px] font-mono">1st in line performs first</span>
              </div>

              <div className="rounded-2xl border border-glass-border bg-black/30 divide-y divide-white/5 max-h-40 overflow-y-auto custom-scrollbar">
                {rotationOrder.map((uid, idx) => {
                  const m = findMember(uid)
                  return (
                    <div key={uid} className="flex items-center justify-between p-2.5 gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-[10px] font-mono font-bold flex items-center justify-center text-accent-purple shrink-0">
                          {idx + 1}
                        </span>
                        <Avatar name={m?.name || 'User'} src={m?.avatar} size={26} />
                        <span className="text-xs font-medium text-white truncate">{m?.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveUp(idx)}
                          disabled={idx === 0}
                          className="p-1 text-primary-muted hover:text-white disabled:opacity-20 transition-colors"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveDown(idx)}
                          disabled={idx === rotationOrder.length - 1}
                          className="p-1 text-primary-muted hover:text-white disabled:opacity-20 transition-colors"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1 py-3 text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              className="flex-[2] py-3 text-xs bg-gradient-to-r from-accent-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={16} /> Create Chore
            </Button>
          </div>

        </div>

      </div>
    </Overlay>
  )
}
