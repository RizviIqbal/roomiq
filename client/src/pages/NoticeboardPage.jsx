import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHouseData, useNotices } from '../hooks/useHouseData'
import { useSocketEvent } from '../context/SocketContext'
import { Button, Spinner, EmptyState } from '../components/ui'
import PostNoticeModal from '../components/noticeboard/PostNoticeModal'
import NoticeCard from '../components/noticeboard/NoticeCard'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NoticeboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { houseId, house, loading: hLoading } = useHouseData()
  const { notices, loading, refresh } = useNotices(houseId)
  const [showAdd, setShowAdd] = useState(false)

  useSocketEvent('notice_posted', useCallback((data) => {
    if (data?.notice?.postedBy?._id !== user._id) {
      toast(`📌 New notice: ${data.notice.title}`, { duration: 4000 })
    }
    refresh()
  }, [refresh, user._id]))

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No house" description="JOIN A HOUSE FIRST" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  const isAdmin = house?.members?.find(m => m.user._id === user._id)?.role === 'admin'

  return (
    <div className="w-full px-6 md:px-[64px] pb-24">
      {/* Header */}
      <section className="mt-8 mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <div className="font-label-caps text-[12px] uppercase tracking-[0.15em] text-primary-muted mb-2">House Updates</div>
          <h1 className="font-display text-[56px] md:text-[80px] font-bold text-white leading-[1.1] tracking-tight">Noticeboard<span className="text-gradient">.</span></h1>
          <p className="font-body-lg text-[18px] text-primary-muted max-w-xl mt-4">Announcements, reminders, and updates for the house.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2">
          <Plus size={16} /> Post notice
        </Button>
      </section>

      {loading || hLoading ? (
        <div className="flex justify-center py-16"><Spinner size={32} color="#06B6D4" /></div>
      ) : notices.length === 0 ? (
        <div className="glass-panel rounded-[32px] p-8 max-w-3xl">
          <EmptyState icon="📌" title="No notices yet" description="POST THE FIRST ANNOUNCEMENT FOR YOUR HOUSE" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
          {notices.map(notice => (
            <NoticeCard key={notice._id} notice={notice} onRefresh={refresh} isAdmin={isAdmin} />
          ))}
        </div>
      )}

      {showAdd && (
        <PostNoticeModal houseId={houseId} onClose={() => setShowAdd(false)} onAdded={() => refresh()} />
      )}
    </div>
  )
}
