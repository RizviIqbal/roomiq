import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHouseData, useComplaints } from '../hooks/useHouseData'
import { useSocketEvent } from '../context/SocketContext'
import { Button, Spinner, EmptyState } from '../components/ui'
import FileComplaintModal from '../components/complaints/FileComplaintModal'
import ComplaintCard from '../components/complaints/ComplaintCard'
import OffendersPanel from '../components/complaints/OffendersPanel'
import { Plus } from 'lucide-react'

const TABS = [
  { value:'',                label:'All' },
  { value:'open',             label:'Open' },
  { value:'under_mediation',  label:'Mediation' },
  { value:'resolved',         label:'Resolved' },
  { value:'dismissed',        label:'Dismissed' },
]

export default function ComplaintsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { houseId, house, loading: hLoading } = useHouseData()
  const { complaints, offenders, loading, refresh } = useComplaints(houseId)
  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState('')

  useSocketEvent('complaint_updated', useCallback(() => refresh(), [refresh]))

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No house" description="JOIN A HOUSE FIRST" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  const isAdmin = house?.members?.find(m => m.user._id === user._id)?.role === 'admin'
  const filtered = tab ? complaints.filter(c => c.status === tab) : complaints

  return (
    <div className="w-full px-6 md:px-[64px] pb-24">
      {/* Compact Action Bar */}
      <div className="flex items-center justify-end mb-6">
        <Button variant="danger" onClick={() => setShowAdd(true)} className="flex items-center gap-2 shadow-[0_0_15px_rgba(225,29,72,0.3)]">
          <Plus size={16} /> Submit feedback
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl">
        {/* Incident log — 2/3 */}
        <div className="lg:col-span-2">
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
              </button>
            ))}
          </div>

          {loading || hLoading ? (
            <div className="flex justify-center py-16"><Spinner size={32} color="#06B6D4" /></div>
          ) : filtered.length === 0 ? (
            <div className="glass-panel rounded-[32px] p-8">
              <EmptyState icon="✅" title="No complaints" description={tab ? `NOTHING IN "${tab.toUpperCase()}"` : 'NO COMPLAINTS HAVE BEEN FILED'} />
            </div>
          ) : (
            <div className="glass-panel rounded-[32px] p-0 overflow-hidden divide-y divide-glass-border">
              {filtered.map(c => (
                <ComplaintCard key={c._id} complaint={c} onRefresh={refresh} isAdmin={isAdmin} />
              ))}
            </div>
          )}
        </div>

        {/* Tracker — 1/3 */}
        <div className="lg:pl-8">
          <OffendersPanel offenders={offenders} />
        </div>
      </div>

      {showAdd && (
        <FileComplaintModal houseId={houseId} members={house?.members} onClose={() => setShowAdd(false)} onAdded={() => refresh()} />
      )}
    </div>
  )
}
