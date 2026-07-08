import { useState } from 'react'
import { Badge, Avatar, Button } from '../ui'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { ChevronDown, ChevronUp, Wrench, Check, ArrowRight, Eye } from 'lucide-react'

const CATEGORY_ICONS = { plumbing:'🚰', electrical:'⚡', appliance:'🔌', structural:'🏗️', pest:'🐜', other:'🔧' }

const STATUS_FLOW = ['reported','acknowledged','in_progress','resolved']
const STATUS_LABELS = { reported:'Reported', acknowledged:'Acknowledged', in_progress:'In Progress', resolved:'Resolved' }
const STATUS_COLORS = { reported:'red', acknowledged:'yellow', in_progress:'accent', resolved:'green' }

const PRIORITY_COLORS = { low:'muted', medium:'accent', high:'yellow', urgent:'red' }

export default function MaintenanceCard({ issue, onRefresh }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [note, setNote]         = useState('')
  const [cost, setCost]         = useState('')
  const [showImage, setShowImage] = useState(false)

  const currentIdx = STATUS_FLOW.indexOf(issue.status)
  const nextStatus = STATUS_FLOW[currentIdx + 1]

  const advance = async () => {
    if (!nextStatus) return
    setLoading(true)
    try {
      await api.put(`/maintenance/${issue._id}/status`, { status: nextStatus, note, cost })
      toast.success(`Marked as ${STATUS_LABELS[nextStatus]}`)
      setNote('')
      setCost('')
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-panel rounded-[24px] overflow-hidden group border border-glass-border transition-all hover:border-white/10">
      <div 
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-5 w-full px-6 py-5 text-left hover:bg-white/5 transition-colors cursor-pointer select-none"
      >
        <div className="text-[28px] drop-shadow-md w-14 h-14 flex items-center justify-center bg-white/5 border border-glass-border rounded-full flex-shrink-0 group-hover:scale-105 transition-transform">
          {CATEGORY_ICONS[issue.category]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-display text-[22px] font-medium text-white tracking-tight">{issue.title}</span>
            <Badge color={PRIORITY_COLORS[issue.priority]} className="uppercase tracking-widest text-[10px]">{issue.priority}</Badge>
          </div>
          <div className="flex items-center gap-2 font-label-caps text-[11px] tracking-[0.15em] uppercase text-primary-muted">
            <Avatar name={issue.reportedBy?.name} size={20} /> Reported by {issue.reportedBy?.name}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Mini Stepper for collapsed view */}
          <div className="hidden md:flex items-center gap-1 opacity-70">
            {STATUS_FLOW.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-2.5 h-2.5 rounded-full ${i <= currentIdx ? (i === currentIdx ? 'bg-accent-orange animate-pulse' : 'bg-accent-emerald') : 'bg-white/10'}`} title={STATUS_LABELS[s]} />
                {i < STATUS_FLOW.length - 1 && <div className={`w-4 h-[2px] ${i < currentIdx ? 'bg-accent-emerald' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>

          <Badge color={STATUS_COLORS[issue.status]}>{STATUS_LABELS[issue.status]}</Badge>
          {expanded ? <ChevronUp size={20} className="text-white/50" /> : <ChevronDown size={20} className="text-white/50" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-glass-border px-6 md:px-8 py-8 bg-black/40">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Details & Timeline */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              <div>
                <div className="font-label-caps text-[11px] tracking-[0.15em] text-primary-muted mb-3">Issue Description</div>
                <p className="font-body text-[16px] text-white/80 leading-relaxed bg-white/5 p-5 rounded-2xl border border-glass-border">{issue.description}</p>
              </div>

              {/* Status progression UI */}
              <div>
                <div className="font-label-caps text-[11px] tracking-[0.15em] text-primary-muted mb-4">Resolution Tracker</div>
                <div className="flex flex-col gap-4 relative">
                  <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-white/5 z-0" />
                  
                  {STATUS_FLOW.map((step, idx) => {
                    const isCompleted = idx < currentIdx
                    const isCurrent = idx === currentIdx
                    const isUpcoming = idx > currentIdx
                    
                    const historyRecord = issue.statusHistory?.find(h => h.status === step)

                    return (
                      <div key={step} className={`flex items-start gap-4 relative z-10 transition-opacity ${isUpcoming ? 'opacity-40' : 'opacity-100'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                          isCompleted ? 'bg-accent-emerald border-accent-emerald text-obsidian shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 
                          isCurrent ? 'bg-obsidian border-accent-orange text-accent-orange shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 
                          'bg-obsidian border-glass-border text-white/30'
                        }`}>
                          {isCompleted ? <Check size={14} strokeWidth={3} /> : <span className="font-display text-[12px] font-bold">{idx + 1}</span>}
                        </div>
                        
                        <div className="flex-1 pt-1">
                          <div className={`font-display text-[16px] font-medium ${isCurrent ? 'text-accent-orange' : 'text-white'}`}>
                            {STATUS_LABELS[step]}
                          </div>
                          
                          {historyRecord && (
                            <div className="mt-1 mb-2">
                              <div className="font-body text-[13px] text-primary-muted">
                                By {historyRecord.updatedBy?.name} on {new Date(historyRecord.updatedAt).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                              </div>
                              {historyRecord.note && (
                                <div className="font-body text-[14px] text-white/80 mt-2 bg-white/5 px-4 py-2.5 rounded-xl border border-glass-border inline-block">
                                  "{historyRecord.note}"
                                </div>
                              )}
                            </div>
                          )}

                          {isCurrent && nextStatus && (
                            <div className="mt-4 p-5 bg-accent-orange/5 border border-accent-orange/20 rounded-2xl flex flex-col gap-3">
                              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                <input
                                  value={note}
                                  onChange={e => setNote(e.target.value)}
                                  placeholder="Add a note to update status..."
                                  className="flex-1 w-full px-4 py-2.5 text-[14px] bg-black/40 border border-accent-orange/30 rounded-xl text-white outline-none focus:border-accent-orange placeholder:text-white/30"
                                />
                                {nextStatus === 'resolved' && (
                                  <input
                                    type="number"
                                    value={cost}
                                    onChange={e => setCost(e.target.value)}
                                    placeholder="Cost (৳) - Auto-splits"
                                    className="w-full sm:w-64 px-4 py-2.5 text-[14px] bg-black/40 border border-accent-orange/30 rounded-xl text-white outline-none focus:border-accent-orange placeholder:text-white/30"
                                  />
                                )}
                              </div>
                              <Button onClick={advance} loading={loading} className="w-full sm:w-auto self-end shadow-[0_0_15px_rgba(249,115,22,0.3)] whitespace-nowrap">
                                Mark {STATUS_LABELS[nextStatus]} <ArrowRight size={16} className="ml-2" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Evidence Photo */}
            <div className="lg:col-span-1">
              <div className="font-label-caps text-[11px] tracking-[0.15em] text-primary-muted mb-3">Evidence Photo</div>
              {issue.imageUrl ? (
                <div className="relative group rounded-3xl overflow-hidden border border-glass-border shadow-glass aspect-[4/5] bg-black/50">
                  <img src={issue.imageUrl} alt="Issue evidence" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center cursor-pointer" onClick={() => setShowImage(true)}>
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all flex items-center gap-2 bg-obsidian/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-label-caps tracking-widest text-[10px]">
                      <Eye size={14} /> View Full
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-glass-border aspect-[4/5] bg-white/5 flex flex-col items-center justify-center text-center p-6 opacity-60">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Wrench size={20} className="text-primary-muted" />
                  </div>
                  <p className="font-body text-[14px] text-primary-muted">No evidence photo was attached to this report.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Full Image Lightbox */}
      {showImage && issue.imageUrl && (
        <div className="fixed inset-0 z-[100] bg-obsidian/90 backdrop-blur-xl flex flex-col items-center justify-center p-4" onClick={(e) => { e.stopPropagation(); setShowImage(false); }}>
          <img src={issue.imageUrl} alt="Issue evidence" className="max-w-full max-h-[85vh] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 object-contain" />
          <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setShowImage(false); }} className="mt-6 font-label-caps tracking-widest bg-white/10 border-white/20">Close Photo</Button>
        </div>
      )}
    </div>
  )
}
