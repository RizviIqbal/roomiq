import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Badge, Button, ProgressBar } from '../ui'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Bell, 
  Check, 
  Sparkles, 
  Trash2, 
  ShieldCheck 
} from 'lucide-react'

const CATEGORY_ICONS = { 
  guests: '👥', 
  noise: '🔇', 
  cleanliness: '🧹', 
  kitchen: '🍳', 
  bathroom: '🚿', 
  general: '📋' 
}

const STATUS_CONFIG = {
  voting:   { color:'yellow', label:'Voting Open', icon: Clock },
  active:   { color:'green',  label:'Enacted',     icon: CheckCircle2 },
  rejected: { color:'red',    label:'Rejected',    icon: XCircle },
}

export default function RuleCard({ rule, onRefresh, isAdmin, index, members }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [nudging, setNudging] = useState(false)
  const [nudged, setNudged]   = useState(false)

  const status = STATUS_CONFIG[rule.status] || STATUS_CONFIG.active
  const StatusIcon = status.icon

  const myVote   = rule.votes?.find(v => (v.user?._id || v.user) === user?._id)
  const yesCount = rule.votes?.filter(v => v.vote === 'yes').length || 0
  const noCount  = rule.votes?.filter(v => v.vote === 'no').length || 0
  const total    = yesCount + noCount
  const yesPct   = total > 0 ? Math.round((yesCount / total) * 100) : 0

  const isExpired = new Date(rule.votingDeadline) < new Date()
  const isProposer = (rule.proposedBy?._id || rule.proposedBy) === user?._id

  const vote = async (choice) => {
    setLoading(true)
    try {
      await api.post(`/rules/${rule._id}/vote`, { vote: choice })
      toast.success(`Vote recorded: ${choice.toUpperCase()}`)
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

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this proposed rule?")) return
    setLoading(true)
    try {
      await api.delete(`/rules/${rule._id}`)
      toast.success("Rule removed")
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete rule")
    } finally {
      setLoading(false)
    }
  }

  // 1-Tap Friendly Rule Nudge
  const handleNudge = async () => {
    setNudging(true)
    try {
      await api.post(`/rules/${rule._id}/nudge`)
      setNudged(true)
      toast.success(`🔔 Friendly reminder sent for: "${rule.title}"`, {
        icon: '🕊️',
        style: { background: '#9333EA', color: '#fff', fontWeight: 'bold' }
      })
      setTimeout(() => setNudged(false), 5000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reminder')
    } finally {
      setNudging(false)
    }
  }

  const indexLabel = String((index ?? 0) + 1).padStart(2, '0')

  return (
    <div className="h-full flex flex-col bento-card rounded-3xl p-6 sm:p-8 space-y-6 border-white/10 hover:border-white/20 transition-all shadow-xl relative group">
      
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl font-black text-white/20">
            #{indexLabel}
          </span>
          <span className="text-xl">
            {CATEGORY_ICONS[rule.category] || '📋'}
          </span>
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              {rule.title}
            </h3>
            <div className="text-xs text-primary-muted flex items-center gap-2 mt-0.5">
              <span>Proposed by <strong className="text-white">{rule.proposedBy?.name || 'Housemate'}</strong></span>
              {rule.status === 'voting' && (
                <>• <span className="text-accent-orange font-mono">Ends {new Date(rule.votingDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span></>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge color={status.color} className="text-xs uppercase tracking-wider">
            <StatusIcon size={12} className="mr-1 inline" /> {status.label}
          </Badge>

          {isProposer && rule.status === 'voting' && (
            <button
              onClick={handleDelete}
              title="Delete proposed rule"
              className="p-2 rounded-xl bg-white/5 hover:bg-accent-rose/20 text-primary-muted hover:text-accent-rose transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

      </div>

      {/* Rule Description Box */}
      {rule.description && (
        <p className="font-body text-sm text-white/80 leading-relaxed bg-white/[0.03] p-4 rounded-2xl border border-glass-border">
          {rule.description}
        </p>
      )}

      {/* Housemate Votes Grid (During Voting) */}
      {rule.status === 'voting' && members?.length > 0 && (
        <div className="space-y-2.5 bg-black/20 p-4 rounded-2xl border border-glass-border">
          <div className="flex justify-between items-center text-[10px] font-label-caps uppercase tracking-wider text-primary-muted">
            <span>Housemate Ballots</span>
            <span className="text-white font-bold">{total} of {members.length} Voted</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {members.map(m => {
              const uid = m.user?._id || m.user
              const voted = rule.votes?.find(v => (v.user?._id || v.user) === uid)
              const initials = (m.user?.name || 'H').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
              
              let voteClass = 'bg-white/5 text-primary-muted border-glass-border'
              let label = 'Pending'
              
              if (voted?.vote === 'yes') {
                voteClass = 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30 font-bold'
                label = 'Voted Yes'
              } else if (voted?.vote === 'no') {
                voteClass = 'bg-accent-rose/15 text-accent-rose border-accent-rose/30 font-bold'
                label = 'Voted No'
              }

              return (
                <div key={uid} className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all ${voteClass}`}>
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center text-[9px] text-white shrink-0">
                      {initials}
                    </div>
                    <span className="truncate">{m.user?.name || 'Housemate'}</span>
                  </div>
                  <span className="font-label-caps text-[9px] uppercase tracking-wider shrink-0 ml-1">
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Voting Progress & Action Buttons */}
      {rule.status === 'voting' && (
        <div className="bg-white/[0.02] rounded-2xl p-4 border border-glass-border space-y-4">
          
          {total > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between font-label-caps text-[10px] tracking-wider text-primary-muted">
                <span className="text-accent-emerald font-bold">Yes: {yesCount} ({yesPct}%)</span>
                <span className="text-accent-rose font-bold">No: {noCount} ({100 - yesPct}%)</span>
              </div>
              <ProgressBar value={yesPct} color="linear-gradient(90deg, #10B981 0%, #06B6D4 100%)" />
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => vote('yes')}
              disabled={loading || isExpired}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                myVote?.vote === 'yes'
                  ? 'bg-accent-emerald text-obsidian shadow-glow'
                  : 'bg-white/5 hover:bg-accent-emerald/20 text-white border border-glass-border hover:border-accent-emerald/40'
              }`}
            >
              <ThumbsUp size={14} />
              <span>Vote Yes {myVote?.vote === 'yes' && '✓'}</span>
            </button>

            <button
              onClick={() => vote('no')}
              disabled={loading || isExpired}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                myVote?.vote === 'no'
                  ? 'bg-accent-rose text-white shadow-glow'
                  : 'bg-white/5 hover:bg-accent-rose/20 text-white border border-glass-border hover:border-accent-rose/40'
              }`}
            >
              <ThumbsDown size={14} />
              <span>Vote No {myVote?.vote === 'no' && '✓'}</span>
            </button>

            {(isAdmin || isExpired) && total > 0 && (
              <Button size="sm" onClick={finalize} loading={loading} className="bg-accent-orange text-obsidian font-bold text-xs shadow-glow">
                Finalize Ballot
              </Button>
            )}
          </div>

        </div>
      )}

      {/* ACTIVE RULE: Polite Nudge Action */}
      {rule.status === 'active' && (
        <div className="pt-2 border-t border-glass-border flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-accent-emerald font-mono">
            <ShieldCheck size={14} />
            <span>Enacted by Majority Consensus</span>
          </div>

          <button
            onClick={handleNudge}
            disabled={nudging || nudged}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
              nudged
                ? 'bg-accent-purple text-white border-accent-purple'
                : 'bg-white/5 hover:bg-accent-purple/20 text-primary-muted hover:text-white border-glass-border hover:border-accent-purple/40'
            }`}
          >
            <Bell size={13} className={nudging ? 'animate-spin' : ''} />
            <span>{nudged ? 'Reminder Sent!' : 'Send Friendly Nudge'}</span>
          </button>
        </div>
      )}

    </div>
  )
}
