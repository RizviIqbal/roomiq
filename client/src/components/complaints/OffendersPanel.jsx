import { Avatar, Badge, EmptyState } from '../ui'
import { AlertOctagon } from 'lucide-react'

export default function OffendersPanel({ offenders }) {
  const repeat = offenders.filter(o => o.count >= 2)

  return (
    <div className="glass-panel rounded-[32px] p-8">
      <div className="font-label-caps text-[11px] mb-8 flex items-center gap-2 tracking-[0.15em] text-primary-muted uppercase">
        <AlertOctagon size={14} className="text-accent-rose" /> Complaint Tracker
      </div>

      {offenders.length === 0 ? (
        <EmptyState icon="✅" title="No complaints filed" description="A CLEAN RECORD SO FAR" />
      ) : (
        <div className="space-y-4">
          {offenders.map(o => (
            <div key={o.user._id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-glass-border hover:bg-white/10 transition-colors">
              <Avatar name={o.user.name} size={36} src={o.user.avatar} />
              <div className="flex-1 min-w-0">
                <div className="font-body-md text-[16px] font-medium text-white">{o.user.name}</div>
                <div className="font-label-caps text-[10px] tracking-[0.15em] uppercase text-primary-muted truncate mt-0.5">
                  {[...new Set(o.categories)].join(', ')}
                </div>
              </div>
              <Badge color={o.count >= 2 ? 'terracotta' : 'muted'}>
                {o.count} complaint{o.count > 1 ? 's' : ''}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {repeat.length > 0 && (
        <div className="mt-8 pl-5 border-l-2 border-accent-rose text-[14px] text-white/70 leading-relaxed font-body">
          {repeat.length} roommate{repeat.length>1?'s have':' has'} multiple complaints. Consider raising this in a house meeting.
        </div>
      )}
    </div>
  )
}
