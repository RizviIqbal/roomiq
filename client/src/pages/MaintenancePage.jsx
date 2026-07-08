import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHouseData, useMaintenance } from '../hooks/useHouseData'
import { useSocketEvent } from '../context/SocketContext'
import { Button, Spinner, EmptyState } from '../components/ui'
import ReportIssueModal from '../components/maintenance/ReportIssueModal'
import MaintenanceCard from '../components/maintenance/MaintenanceCard'
import { Plus } from 'lucide-react'

const TABS = [
  { value:'',             label:'All' },
  { value:'reported',     label:'Reported' },
  { value:'acknowledged', label:'Acknowledged' },
  { value:'in_progress',  label:'In Progress' },
  { value:'resolved',     label:'Resolved' },
]

export default function MaintenancePage() {
  const navigate = useNavigate()
  const { houseId, loading: hLoading } = useHouseData()
  const { issues, loading, refresh } = useMaintenance(houseId)
  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState('')

  useSocketEvent('maintenance_updated', useCallback(() => refresh(), [refresh]))

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No house" description="JOIN A HOUSE FIRST" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  const filtered = tab ? issues.filter(i => i.status === tab) : issues

  return (
    <div className="w-full px-6 md:px-[64px] pb-24">
      {/* Header */}
      <section className="mt-8 mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <div className="font-label-caps text-[12px] uppercase tracking-[0.15em] text-primary-muted mb-2">Repairs & Upkeep</div>
          <h1 className="font-display text-[56px] md:text-[80px] font-bold text-white leading-[1.1] tracking-tight">Maintenance<span className="text-gradient">.</span></h1>
          <p className="font-body-lg text-[18px] text-primary-muted max-w-xl mt-4">Report and track repairs around the house.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2">
          <Plus size={16} /> Report issue
        </Button>
      </section>

      {/* Tabs */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={[
              'px-5 py-2.5 rounded-full font-label-caps text-[11px] uppercase tracking-[0.15em] transition-all shadow-sm whitespace-nowrap',
              tab === t.value ? 'bg-white text-obsidian font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-glass text-primary-muted border border-glass-border hover:bg-glass-hover hover:border-white/30 hover:text-white',
            ].join(' ')}
          >
            {t.label}
            {t.value && <span className={['ml-2 px-2 py-0.5 rounded-full text-[9px] bg-obsidian/30', tab === t.value ? 'text-obsidian bg-obsidian/10' : 'text-primary-muted bg-white/10'].join(' ')}>{issues.filter(i=>i.status===t.value).length}</span>}
          </button>
        ))}
      </div>

      {loading || hLoading ? (
        <div className="flex justify-center py-16"><Spinner size={32} color="#06B6D4" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-[32px] p-8 max-w-3xl">
          <EmptyState icon="🔧" title="No issues found" description={tab ? `NO ${tab.replace('_',' ').toUpperCase()} ISSUES` : 'REPORT YOUR FIRST MAINTENANCE ISSUE'} />
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {filtered.map(issue => (
            <MaintenanceCard key={issue._id} issue={issue} onRefresh={refresh} />
          ))}
        </div>
      )}

      {showAdd && (
        <ReportIssueModal houseId={houseId} onClose={() => setShowAdd(false)} onAdded={() => refresh()} />
      )}
    </div>
  )
}
