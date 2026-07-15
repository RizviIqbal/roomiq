import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Badge, Button, ProgressBar } from '../ui'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { ThumbsUp, ThumbsDown, Clock, CheckCircle2, XCircle } from 'lucide-react'

const CATEGORY_ICONS = { guests:'👥', noise:'🔊', cleanliness:'🧹', kitchen:'🍳', bathroom:'🚿', general:'📋' }

const STATUS_CONFIG = {
  voting:   { color:'yellow', label:'Voting open', icon: Clock },
  active:   { color:'green',  label:'Active',      icon: CheckCircle2 },
  rejected: { color:'red',    label:'Rejected',    icon: XCircle },
}

export default function RuleCard({ rule, onRefresh, isAdmin, index, members }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const status = STATUS_CONFIG[rule.status]
  const StatusIcon = status.icon

  const myVote   = rule.votes?.find(v => (v.user?._id || v.user) === user._id)
  const yesCount = rule.votes?.filter(v => v.vote === 'yes').length || 0
  const noCount  = rule.votes?.filter(v => v.vote === 'no').length || 0
  const total    = yesCount + noCount
  const yesPct   = total > 0 ? Math.round((yesCount/total)*100) : 0

  const isExpired = new Date(rule.votingDeadline) < new Date()

  const vote = async (choice) => {
    setLoading(true)
    try {
      await api.post(`/rules/${rule._id}/vote`, { vote: choice })
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to vote')
    } finally {
      setLoading(false)
    }
  }

  const finalize = async () => {
    setLoading(true)
    try {
      const { data } = await api.put(`/rules/${rule._id}/finalize`)
      toast.success(data.message)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to finalize')
    } finally {
      setLoading(false)
    }
  }

  const indexLabel = String((index ?? 0) + 1).padStart(2, '0')

  return (
    <div className={`h-full flex flex-col glass-panel p-6 md:p-8 rounded-[32px] border transition-all hover:bg-white/5 ${status.bgClass} ${status.borderColor}`}>
      <div className="flex items-start gap-5 flex-1">
        <div className="flex flex-col items-center gap-2">
          <span className="font-display text-[32px] font-bold text-white/20 mt-[-2px] flex-shrink-0">{indexLabel}.</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <h3 className="font-display text-[24px] font-medium text-white tracking-tight">{rule.title}</h3>
            <Badge color={status.color}>
              <StatusIcon size={12} className="mr-1" /> {status.label}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-display text-[10px] text-white">
              {rule.proposedBy?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="font-label-caps text-[11px] tracking-[0.15em] text-primary-muted">
              Proposed by <span className="text-white font-medium">{rule.proposedBy?.name}</span>
              {rule.status === 'voting' && (
                <> · Voting ends {new Date(rule.votingDeadline).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</>
              )}
            </div>
          </div>

          {rule.description && (
            <p className="font-body text-[16px] text-white/70 leading-relaxed mb-6 max-w-3xl bg-black/20 p-5 rounded-2xl border border-glass-border">{rule.description}</p>
          )}

          {/* Voting explicit list */}
          {members?.length > 0 && (
            <div className="mb-6 bg-black/20 p-5 rounded-2xl border border-glass-border">
              <div className="text-[11px] font-label-caps tracking-widest text-primary-muted mb-4">Housemate Votes</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map(m => {
                  const voted = rule.votes?.find(v => (v.user?._id || v.user) === m.user._id)
                  const initials = m.user.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
                  
                  let voteColor = 'text-primary-muted bg-white/5 border-glass-border'
                  let voteText = 'Pending'
                  let VoteIcon = Clock
                  
                  if (voted?.vote === 'yes') { 
                    voteColor = 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/30'
                    voteText = 'Voted Yes'
                    VoteIcon = ThumbsUp
                  } else if (voted?.vote === 'no') { 
                    voteColor = 'text-accent-rose bg-accent-rose/10 border-accent-rose/30'
                    voteText = 'Voted No'
                    VoteIcon = ThumbsDown
                  }

                  return (
                    <div key={m.user._id} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${voteColor}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center font-display text-[11px] text-white/70 shadow-inner">
                          {initials}
                        </div>
                        <span className="font-body text-sm font-medium text-white line-clamp-1">{m.user.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-label-caps text-[10px] tracking-wider shrink-0">
                        <VoteIcon size={12} /> {voteText}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Voting UI */}
          {rule.status === 'voting' && (
            <div className="bg-black/20 rounded-2xl p-6 border border-glass-border">
              {total > 0 && (
                <div className="mb-5 max-w-md">
                  <div className="flex justify-between font-label-caps text-[11px] tracking-[0.15em] text-primary-muted mb-2">
                    <span className="text-accent-emerald">Yes {yesCount}</span>
                    <span className="text-accent-rose">No {noCount}</span>
                  </div>
                  <ProgressBar value={yesPct} color="linear-gradient(90deg, #10B981 0%, #06B6D4 100%)" />
                </div>
              )}

              <div className="flex gap-3 items-center">
                <Button
                  size="sm"
                  variant={myVote?.vote === 'yes' ? 'success' : 'secondary'}
                  loading={loading}
                  onClick={() => vote('yes')}
                  disabled={isExpired}
                  className={myVote?.vote === 'yes' ? 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''}
                >
                  <ThumbsUp size={15} /> Yes {myVote?.vote === 'yes' && '✓'}
                </Button>
                <Button
                  size="sm"
                  variant={myVote?.vote === 'no' ? 'danger' : 'secondary'}
                  loading={loading}
                  onClick={() => vote('no')}
                  disabled={isExpired}
                  className={myVote?.vote === 'no' ? 'shadow-[0_0_15px_rgba(225,29,72,0.3)]' : ''}
                >
                  <ThumbsDown size={15} /> No {myVote?.vote === 'no' && '✓'}
                </Button>

                {(isAdmin || isExpired) && total > 0 && (
                  <Button size="sm" onClick={finalize} loading={loading} className="ml-auto shadow-glow">
                    Finalize vote
                  </Button>
                )}
              </div>

              {isExpired && total === 0 && (
                <div className="font-label-caps text-[11px] tracking-[0.15em] text-accent-rose mt-4">
                  Voting deadline passed with no votes
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
