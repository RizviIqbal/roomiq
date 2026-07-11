import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Badge, Avatar, Button } from '../ui'
import { Overlay, ModalHeader } from '../finance/AddExpenseModal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { RefreshCw, Flag, CheckCircle2, Clock, XCircle } from 'lucide-react'

const STATUS_CONFIG = {
  pending:  { color: 'yellow', label: 'Pending' },
  done:     { color: 'green',  label: 'Done' },
  disputed: { color: 'red',    label: 'Disputed' },
}

export default function ChoreCard({ chore, onRefresh, isAdmin }) {
  const { user } = useAuth()
  const [loading, setLoading]   = useState(false)
  const [showDispute, setShowDispute] = useState(false)
  const [reason, setReason]     = useState('')

  const isMine    = chore.assignedTo?._id === user._id
  const overdue   = new Date(chore.dueDate) < new Date() && chore.status === 'pending'
  const status    = overdue ? { color:'red', label:'Overdue' } : STATUS_CONFIG[chore.status]

  const markDone = async () => {
    setLoading(true)
    try {
      await api.put(`/chores/${chore._id}/done`)
      toast.success('Marked as done')
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const submitDispute = async () => {
    if (!reason.trim()) { toast.error('Add a reason'); return }
    setLoading(true)
    try {
      await api.post(`/chores/${chore._id}/dispute`, { reason })
      toast.success('Dispute raised')
      setShowDispute(false)
      setReason('')
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const resolveDispute = async (resolution) => {
    setLoading(true)
    try {
      const { data } = await api.put(`/chores/${chore._id}/dispute/resolve`, { resolution })
      toast.success(data.message)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={[
        'glass-panel rounded-[24px] p-6 md:p-8 flex flex-col h-full transition-colors group',
        chore.status === 'disputed' ? 'border-accent-rose/30 bg-accent-rose/5 shadow-[0_0_15px_rgba(225,29,72,0.1)]' : '',
      ].join(' ')}>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-display text-[24px] font-medium text-white leading-snug group-hover:text-accent-orange transition-colors">{chore.title}</h3>
          <Badge color={status.color} className="uppercase tracking-widest text-[10px]">{status.label}</Badge>
        </div>

        {chore.description && (
          <p className="font-body text-[15px] text-primary-muted leading-relaxed mb-6">{chore.description}</p>
        )}

        {chore.isAutoRotate && (
          <div className="flex items-center gap-1.5 font-label-caps text-[10px] tracking-[0.15em] text-accent-orange mb-6 bg-accent-orange/10 border border-accent-orange/20 px-3 py-1.5 rounded-full self-start">
            <RefreshCw size={12} /> Auto-rotates {chore.rotationFrequency}
          </div>
        )}

        {/* Utility row (Assignment & Due Date) */}
        <div className="flex items-center gap-4 mb-6 bg-white/5 p-4 rounded-2xl border border-glass-border">
          <Avatar name={chore.assignedTo?.name} size={40} src={chore.assignedTo?.avatar} />
          <div className="flex-1 min-w-0">
            <div className="font-label-caps text-[10px] tracking-widest text-primary-muted mb-1">Assigned to</div>
            <div className="font-body text-[16px] text-white font-medium">{isMine ? 'You' : chore.assignedTo?.name}</div>
          </div>
          <div className="text-right">
            <div className="font-label-caps text-[10px] tracking-widest text-primary-muted mb-1">Due Date</div>
            <div className={`font-body text-[15px] font-medium ${overdue ? 'text-accent-rose' : 'text-white'}`}>
              {new Date(chore.dueDate).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
            </div>
          </div>
        </div>

        {/* Visual Lifecycle Tracker & Actions */}
        <div className="mt-auto bg-black/20 p-6 rounded-2xl border border-glass-border">
          <div className="font-label-caps text-[11px] tracking-[0.15em] text-primary-muted mb-6 text-center">Chore Status</div>
          
          <div className="flex items-center justify-center relative mb-6 px-4">
            <div className="absolute left-[20%] right-[20%] top-1/2 -translate-y-1/2 h-[2px] bg-white/5 z-0" />
            
            {/* Step 1: Pending */}
            <div className="relative z-10 flex flex-col items-center gap-2 w-1/2">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-obsidian ${
                chore.status === 'pending' ? 'border-accent-orange text-accent-orange shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 
                'border-accent-emerald text-accent-emerald bg-accent-emerald/10'
              }`}>
                {chore.status === 'pending' ? <Clock size={16} /> : <CheckCircle2 size={16} />}
              </div>
              <span className={`font-label-caps text-[10px] tracking-widest ${chore.status === 'pending' ? 'text-accent-orange' : 'text-accent-emerald'}`}>Pending</span>
            </div>

            {/* Step 2: Done / Disputed */}
            <div className="relative z-10 flex flex-col items-center gap-2 w-1/2">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-obsidian ${
                chore.status === 'done' ? 'border-accent-emerald text-accent-emerald shadow-[0_0_15px_rgba(16,185,129,0.4)] bg-accent-emerald/10' : 
                chore.status === 'disputed' ? 'border-accent-rose text-accent-rose shadow-[0_0_15px_rgba(225,29,72,0.4)] bg-accent-rose/10' : 
                'border-glass-border text-white/30'
              }`}>
                {chore.status === 'done' ? <CheckCircle2 size={16} /> : chore.status === 'disputed' ? <XCircle size={16} /> : <div className="w-2.5 h-2.5 rounded-full bg-white/20" />}
              </div>
              <span className={`font-label-caps text-[10px] tracking-widest ${
                chore.status === 'done' ? 'text-accent-emerald' : 
                chore.status === 'disputed' ? 'text-accent-rose' : 
                'text-primary-muted'
              }`}>
                {chore.status === 'disputed' ? 'Disputed' : 'Completed'}
              </span>
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-5 border-t border-glass-border">
            {isMine && chore.status === 'pending' && (
              <Button size="sm" variant="success" loading={loading} onClick={markDone} className="w-full shadow-[0_0_15px_rgba(16,185,129,0.3)] py-3">
                <CheckCircle2 size={18} className="mr-2" /> Mark as Completed
              </Button>
            )}
            
            {!isMine && chore.status === 'done' && (
              <div className="flex flex-col gap-3">
                <div className="font-body text-[13px] text-primary-muted text-center">Is the chore not done properly?</div>
                <Button size="sm" variant="secondary" onClick={() => setShowDispute(true)} className="w-full hover:bg-accent-rose/10 hover:text-accent-rose hover:border-accent-rose/30 transition-all border-dashed">
                  <Flag size={14} className="mr-2" /> Raise Dispute
                </Button>
              </div>
            )}
            
            {chore.status === 'disputed' && chore.dispute && (
              <div className="flex flex-col gap-4">
                <div className="bg-accent-rose/10 border border-accent-rose/30 p-4 rounded-xl font-body text-[14px] text-accent-rose/90 shadow-inner">
                  <span className="font-bold">Dispute Reason:</span> {chore.dispute.reason}
                </div>
                {isAdmin && chore.dispute.status === 'open' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button size="sm" variant="danger" loading={loading} onClick={() => resolveDispute('valid')} className="shadow-[0_0_15px_rgba(225,29,72,0.3)]">Redo Chore</Button>
                    <Button size="sm" variant="secondary" loading={loading} onClick={() => resolveDispute('invalid')}>Keep Done</Button>
                  </div>
                )}
                {!isAdmin && chore.dispute.status === 'open' && (
                  <div className="font-label-caps text-[10px] tracking-widest text-primary-muted text-center opacity-70">
                    Awaiting admin resolution
                  </div>
                )}
              </div>
            )}
            
            {isMine && chore.status === 'done' && (
              <div className="font-label-caps text-[12px] tracking-[0.15em] text-accent-emerald text-center flex items-center justify-center gap-2">
                <CheckCircle2 size={16} /> Completed successfully
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dispute modal */}
      {showDispute && (
        <Overlay onClose={() => setShowDispute(false)}>
          <div className="w-full max-w-md glass-panel p-0 overflow-hidden border border-glass-border shadow-glow rounded-3xl">
            <ModalHeader title="Raise a dispute" onClose={() => setShowDispute(false)} />
            <div className="px-8 pb-8 pt-4 flex flex-col gap-6">
              <p className="font-body text-[15px] text-primary-muted leading-relaxed">
                Explain why <strong className="text-white font-semibold">{chore.title}</strong> wasn't done properly. This will notify {chore.assignedTo?.name} and flag it for review.
              </p>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Floor still dirty near the stove..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-xl text-[15px] text-white resize-y outline-none focus:border-accent-orange focus:bg-white/10 placeholder:text-white/20"
              />
              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setShowDispute(false)} className="flex-1">Cancel</Button>
                <Button variant="danger" loading={loading} onClick={submitDispute} className="flex-1 shadow-[0_0_15px_rgba(225,29,72,0.4)]">Raise dispute</Button>
              </div>
            </div>
          </div>
        </Overlay>
      )}
    </>
  )
}
