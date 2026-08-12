import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, User, MessageCircle, Sparkles } from 'lucide-react'

interface TopHeaderProps {
  onOpenSidebar: () => void
}

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/app/dashboard':      { title: 'Dashboard', subtitle: 'Overview & quick metrics' },
  '/app/finance':        { title: 'Expenses & Debts', subtitle: 'Shared finances, balances & bills' },
  '/app/chores':         { title: 'Chores & Duties', subtitle: 'Rotations & completion tracking' },
  '/app/maintenance':    { title: 'Maintenance & Repairs', subtitle: 'House issue tickets & evidence' },
  '/app/shopping':       { title: 'Groceries & Inventory', subtitle: 'Shared shopping list & pantry' },
  '/app/rules':          { title: 'House Rules & Voting', subtitle: 'Agreements & active polls' },
  '/app/noticeboard':    { title: 'Noticeboard', subtitle: 'House-wide announcements' },
  '/app/complaints':     { title: 'Anonymous Feedback', subtitle: 'Grievance submission & resolution' },
  '/app/activity':       { title: 'Activity Feed', subtitle: 'Audit log & real-time history' },
  '/app/discover':       { title: 'Find Houses', subtitle: 'Browse available public house listings' },
  '/app/matching':       { title: 'House Compatibility', subtitle: '8-trait lifestyle matching scores' },
  '/app/find-roommates': { title: 'Find Roommates', subtitle: 'Match with potential future roommates' },
  '/app/messages':       { title: 'Private Messages', subtitle: 'Direct conversations' },
  '/app/profile':        { title: 'My Profile', subtitle: 'Personal preferences & settings' },
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenSidebar }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) return null

  // Match the page title
  const currentPath = Object.keys(PAGE_TITLES).find(path => location.pathname.startsWith(path)) || '/app/dashboard'
  const pageInfo = PAGE_TITLES[currentPath] || { title: 'RoomIQ', subtitle: 'Shared living platform' }

  return (
    <header className="sticky top-0 z-30 w-full h-16 lg:h-20 bg-obsidian/70 backdrop-blur-xl border-b border-glass-border px-4 lg:px-10 flex items-center justify-between transition-all">
      
      {/* Left: Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="font-display text-lg lg:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {pageInfo.title}
          </h1>
          {pageInfo.subtitle && (
            <p className="font-body text-xs text-primary-muted hidden sm:block">
              {pageInfo.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Quick Chat & Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/app/messages')}
          title="Direct Messages"
          className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-primary-muted hover:text-white transition-all duration-300 relative group"
        >
          <MessageCircle size={17} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
        </button>

        <button
          onClick={() => navigate('/app/profile')}
          className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group"
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-white/10" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-accent-orange/20 text-accent-orange flex items-center justify-center">
              <User size={13} />
            </div>
          )}
          <span className="text-xs font-medium text-white group-hover:text-accent-orange transition-colors hidden md:inline">
            {user.name}
          </span>
        </button>
      </div>

    </header>
  )
}

export default TopHeader
