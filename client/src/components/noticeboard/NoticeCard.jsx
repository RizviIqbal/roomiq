import { useAuth } from '../../context/AuthContext'
import { Avatar, Badge } from '../ui'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Pin, Trash2 } from 'lucide-react'

const CATEGORY_ICONS = { announcement:'📢', reminder:'⏰', event:'🎉', warning:'⚠️', general:'📋' }
const CATEGORY_COLORS = { announcement:'accent', reminder:'yellow', event:'green', warning:'red', general:'muted' }

export default function NoticeCard({ notice, onRefresh, isAdmin }) {
  const { user } = useAuth()
  const isMine = notice.postedBy?._id === user._id

  const togglePin = async () => {
    try {
      await api.put(`/noticeboard/${notice._id}/pin`)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const remove = async () => {
    try {
      await api.delete(`/noticeboard/${notice._id}`)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  return (
    <div className={[
      'glass-panel rounded-3xl p-6 relative group overflow-hidden transition-all',
      notice.isPinned ? 'border-accent-orange/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-white/10' : 'border-glass-border hover:bg-white/10 hover:border-white/20',
    ].join(' ')}>
      {notice.isPinned && (
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
          <div className="absolute top-[-1px] right-[-1px] border-[24px] border-transparent border-t-accent-orange border-r-accent-orange opacity-20" />
        </div>
      )}
      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[24px] drop-shadow-md">{CATEGORY_ICONS[notice.category]}</span>
            <Badge color={CATEGORY_COLORS[notice.category]}>{notice.category}</Badge>
            {notice.isPinned && <Badge color="accent"><Pin size={10} className="mr-1" /> Pinned</Badge>}
          </div>

          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {isAdmin && (
              <button
                onClick={togglePin}
                className={[
                  'flex p-2 rounded-full transition-colors',
                  notice.isPinned ? 'text-accent-orange bg-accent-orange/10' : 'text-primary-muted hover:text-white hover:bg-white/10',
                ].join(' ')}
              >
                <Pin size={14} />
              </button>
            )}
            {isMine && (
              <button onClick={remove} className="flex p-2 rounded-full text-primary-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        <h3 className="font-display text-[20px] font-medium text-white mb-2 leading-snug tracking-tight">{notice.title}</h3>
        <p className="font-body text-[15px] text-primary-muted leading-relaxed mb-6 whitespace-pre-wrap flex-1">{notice.body}</p>

        <div className="pt-4 border-t border-glass-border flex flex-wrap items-center gap-2 font-label-caps text-[10px] tracking-[0.15em] uppercase text-primary-muted mt-auto">
          <Avatar name={notice.postedBy?.name} size={18} />
          <span className="text-white ml-1">{notice.postedBy?.name}</span>
          <span className="text-white/20">·</span>
          <span>{new Date(notice.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
          {notice.expiresAt && (
            <>
              <span className="text-white/20">·</span>
              <span className="text-accent-rose">expires {new Date(notice.expiresAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
