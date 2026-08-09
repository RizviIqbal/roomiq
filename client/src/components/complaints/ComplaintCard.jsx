import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Badge, Avatar, Button } from '../ui'
import { Overlay, ModalHeader } from '../finance/AddExpenseModal'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Scale, EyeOff, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'

const CATEGORY_ICONS = { noise:'🔊', cleanliness:'🧹', guests:'👥', bills:'💸', behavior:'😠', other:'📋' }

const STATUS_CONFIG = {
  open:             { color:'yellow', label:'Open' },
  under_mediation:  { color:'accent', label:'Under mediation' },
  resolved:         { color:'green',  label:'Resolved' },
  dismissed:        { color:'muted',  label:'Dismissed' },
}

export default function ComplaintCard({ complaint, onRefresh, isAdmin }) {
  const { user } = useAuth()
  const [loading, setLoading]     = useState(false)
  const [comment, setComment]     = useState('')
  const [showResolve, setShowResolve] = useState(false)
  const [resolution, setResolution]   = useState('')

  const status = STATUS_CONFIG[complaint.status]

  const isAccused = (complaint.against?._id || complaint.against) === user._id
  const isFiler   = !complaint.isAnonymous && (complaint.filedBy?._id || complaint.filedBy) === user._id
  const canVote   = !isAccused && !isFiler && complaint.status !== 'resolved' && complaint.status !== 'dismissed'

  const myVote = complaint.mediationVotes?.find(v => (v.voter?._id || v.voter) === user._id)

  const validCount   = complaint.mediationVotes?.filter(v => v.verdict === 'valid').length || 0
  const invalidCount = complaint.mediationVotes?.filter(v => v.verdict === 'invalid').length || 0

  const castVote = async (verdict) => {
    setLoading(true)
    try {
      await api.post(`/complaints/${complaint._id}/vote`, { verdict, comment })
      toast.success('Vote recorded')
      setComment('')
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const resolve = async (statusVal) => {
    setLoading(true)
    try {
      await api.put(`/complaints/${complaint._id}/resolve`, { status: statusVal, resolution })
      toast.success(`Complaint ${statusVal}`)
      setShowResolve(false)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="p-8 hover:bg-white/5 transition-colors group">
        <div className="flex items-center gap-4 mb-3 flex-wrap">
          <span className="text-[28px] drop-shadow-md w-12 h-12 flex items-center justify-center bg-white/5 border border-glass-border rounded-full flex-shrink-0 group-hover:bg-white/10 transition-colors">{CATEGORY_ICONS[complaint.category]}</span>
          <h3 className="font-display text-[22px] font-medium text-white tracking-tight">{complaint.title}</h3>
          <Badge color={status.color}>{status.label}</Badge>
          {complaint.isRepeatOffense && <Badge color="terracotta">Repeat offense</Badge>}
        </div>

        {/* Incident report pull-quote */}
        <blockquote className="border-l-2 border-accent-orange pl-6 my-6 italic text-white/70 font-serif text-[16px] leading-relaxed relative before:content-[''] before:absolute before:-left-[2px] before:top-0 before:bottom-0 before:w-[2px] before:bg-gradient-to-b before:from-accent-orange before:to-transparent">
          {complaint.description}
        </blockquote>

        <div className="flex items-center gap-3 font-label-caps text-[11px] tracking-[0.15em] uppercase text-primary-muted mb-6">
          <span className="flex items-center gap-2">
            Against <Avatar name={complaint.against?.name} size={20} /> <span className="text-white">{complaint.against?.name}</span>
          </span>
          <span className="text-white/20">·</span>
          {complaint.isAnonymous
            ? <span className="flex items-center gap-1.5"><EyeOff size={14} /> Anonymous</span>
            : <span>By <span className="text-white">{complaint.filedBy?.name}</span></span>
          }
        </div>

        {/* Resolution */}
        {complaint.resolution && (
          <div className="text-[15px] font-body text-white mb-6 bg-white/5 border border-glass-border px-5 py-4 rounded-xl shadow-inner">
            <span className="font-label-caps text-[10px] tracking-[0.15em] uppercase text-primary-muted mr-3 block mb-1">Resolution</span>{complaint.resolution}
          </div>
        )}

        {/* Mediation votes */}
        {complaint.status === 'under_mediation' && (
          <div className="mb-6 bg-black/20 rounded-2xl p-6 border border-glass-border">
            <div className="flex gap-6 font-label-caps text-[11px] uppercase tracking-[0.15em] text-primary-muted mb-4">
              <span className="flex items-center gap-1.5 text-accent-emerald">
                <ThumbsUp size={14} /> {validCount} valid
              </span>
              <span className="flex items-center gap-1.5 text-accent-rose">
                <ThumbsDown size={14} /> {invalidCount} invalid
              </span>
            </div>

            {complaint.mediationVotes?.length > 0 && (
              <div className="space-y-3 mb-4">
                {complaint.mediationVotes.map((v, i) => (
                  <div key={i} className="flex items-start gap-3 text-[14px]">
                    <Avatar name={v.voter?.name} size={24} />
                    <div>
                      <span className="font-body-md font-medium text-white">{v.voter?.name}</span>
                      <span className="text-primary-muted mx-1">voted</span>
                      <span className={v.verdict === 'valid' ? 'text-accent-emerald font-medium' : 'text-primary-muted font-medium'}>{v.verdict}</span>
                      {v.comment && <div className="text-white/60 italic font-serif mt-1">"{v.comment}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vote actions */}
        {canVote && (
          <div className="flex flex-col gap-3 max-w-sm mt-2">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Optional comment..."
              className="px-4 py-2.5 text-[15px] bg-black/40 border border-glass-border rounded-xl text-white outline-none focus:border-accent-orange placeholder:text-white/20"
            />
            <div className="flex gap-3">
              <Button size="sm" variant={myVote?.verdict==='valid' ? 'success':'secondary'} loading={loading} onClick={() => castVote('valid')} className={myVote?.verdict === 'valid' ? 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''}>
                <ThumbsUp size={15} /> Valid {myVote?.verdict==='valid' && '✓'}
              </Button>
              <Button size="sm" variant={myVote?.verdict==='invalid' ? 'danger':'secondary'} loading={loading} onClick={() => castVote('invalid')} className={myVote?.verdict === 'invalid' ? 'shadow-[0_0_15px_rgba(225,29,72,0.3)]' : ''}>
                <ThumbsDown size={15} /> Invalid {myVote?.verdict==='invalid' && '✓'}
              </Button>
            </div>
          </div>
        )}

        {/* Admin resolve */}
        {isAdmin && complaint.status !== 'resolved' && complaint.status !== 'dismissed' && (
          <div className="mt-5">
            <Button size="sm" onClick={() => setShowResolve(true)} className="shadow-glow">
              <Scale size={15} /> Resolve
            </Button>
          </div>
        )}
      </div>

      {/* Resolve modal */}
      {showResolve && (
        <Overlay onClose={() => setShowResolve(false)}>
          <div className="w-full max-w-md glass-panel p-0 overflow-hidden border border-glass-border shadow-glow rounded-3xl">
            <ModalHeader title="Resolve complaint" onClose={() => setShowResolve(false)} />
            <div className="px-8 pb-8 pt-4 flex flex-col gap-6">
              <textarea
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                placeholder="Describe the resolution or outcome..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-xl text-[15px] text-white resize-y outline-none focus:border-accent-orange placeholder:text-white/20"
              />
              <div className="flex gap-4 pt-2">
                <Button variant="secondary" loading={loading} onClick={() => resolve('dismissed')} className="flex-1">Dismiss</Button>
                <Button variant="success" loading={loading} onClick={() => resolve('resolved')} className="flex-1 shadow-[0_0_15px_rgba(16,185,129,0.3)]">Mark resolved</Button>
              </div>
            </div>
          </div>
        </Overlay>
      )}
    </>
  )
}
