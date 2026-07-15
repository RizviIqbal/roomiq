import { Avatar, ProgressBar, EmptyState } from '../ui'
import { Trophy, AlertCircle } from 'lucide-react'

export default function ChoreHistory({ history }) {
  if (!history?.length) {
    return <EmptyState icon="📊" title="No history yet" description="COMPLETED CHORES WILL APPEAR HERE" />
  }

  // Sort by completed count descending
  const sorted = [...history].sort((a,b) => b.completed - a.completed)
  const maxCompleted = Math.max(...sorted.map(s => s.completed), 1)

  return (
    <div className="glass-panel rounded-[32px] p-8">
      <div className="font-label-caps text-[11px] mb-6 flex items-center gap-2 text-primary-muted tracking-[0.15em] uppercase">
        <Trophy size={14} className="text-accent-orange" /> Chore Analytics & Statistics
      </div>

      <div className="space-y-6">
        {sorted.map((stat, idx) => {
          const onTimeRate = stat.completed > 0 ? Math.round((stat.onTime / stat.completed) * 100) : 0
          return (
            <div key={stat.user._id} className="group">
              <div className="flex items-center gap-4 mb-3">
                <Avatar name={stat.user.name} size={36} src={stat.user.avatar} />
                <div className="flex-1">
                  <div className="font-body-md text-[16px] font-medium text-white group-hover:text-accent-orange transition-colors">
                    {stat.user.name}
                    {idx === 0 && <span className="ml-2 drop-shadow-md">🏆</span>}
                  </div>
                  <div className="font-label-caps text-[10px] tracking-[0.15em] text-primary-muted mt-0.5">
                    {stat.completed} completed · {onTimeRate}% on time
                  </div>
                </div>
                {stat.late > 0 && (
                  <span className="flex items-center gap-1.5 font-label-caps text-[10px] tracking-[0.15em] text-accent-rose bg-accent-rose/10 px-2 py-1 rounded-full border border-accent-rose/20">
                    <AlertCircle size={12} /> {stat.late} late
                  </span>
                )}
              </div>
              <ProgressBar value={stat.completed} max={maxCompleted} color={idx === 0 ? 'linear-gradient(90deg, #10B981 0%, #06B6D4 100%)' : 'linear-gradient(90deg, #9333EA 0%, #06B6D4 100%)'} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
