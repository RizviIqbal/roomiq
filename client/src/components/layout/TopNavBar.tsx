import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { User, LogOut } from 'lucide-react'

interface TopNavBarProps {
  className?: string
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ className = '' }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return null
  }

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard' },
    { label: 'Finances', path: '/app/finance' },
    { label: 'Chores', path: '/app/chores' },
    { label: 'Rules', path: '/app/rules' },
    { label: 'Issues', path: '/app/maintenance' },
    { label: 'Complaints', path: '/app/complaints' },
    { label: 'Shopping', path: '/app/shopping' },
    { label: 'Notices', path: '/app/noticeboard' },
    { label: 'Activity', path: '/app/activity' },
    { label: 'Discover', path: '/app/discover' },
    { label: 'Match', path: '/app/matching' },
    { label: 'Roommates', path: '/app/find-roommates' },
    { label: 'Messages', path: '/app/messages' },
  ]

  return (
    <header className={`fixed top-4 left-4 right-4 lg:left-8 lg:right-8 z-50 flex justify-between items-center px-4 py-2 bg-obsidian/60 backdrop-blur-3xl border border-glass-border shadow-glass rounded-full transition-all duration-500 transform-gpu ${className}`} style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}>
      <div 
        className="font-display text-[20px] font-bold tracking-tight text-white cursor-pointer hover:text-accent-orange transition-colors ml-4 flex-shrink-0"
        onClick={() => navigate('/app/dashboard')}
      >
        RoomIQ<span className="text-accent-orange">.</span>
      </div>
      
      <nav className="hidden lg:flex items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `font-label-caps tracking-[0.1em] px-5 py-3 transition-all duration-300 relative group ${
                isActive
                  ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  : 'text-primary-muted hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-1 left-5 right-5 h-[2px] bg-gradient-to-r from-accent-orange to-accent-rose shadow-[0_0_12px_rgba(255,107,0,0.8)] rounded-full animate-fade-in" />
                )}
                {!isActive && (
                  <span className="absolute bottom-1 left-5 right-5 h-[1px] bg-white/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-3 mr-2 flex-shrink-0">
        <button
          onClick={() => navigate('/app/profile')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs transition-all duration-300"
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <User size={14} className="text-accent-orange" />
          )}
          <span className="font-medium max-w-[100px] truncate hidden sm:inline">{user.name}</span>
        </button>

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-full bg-white/5 hover:bg-accent-rose/20 hover:text-accent-rose text-primary-muted border border-white/10 text-xs transition-all duration-300"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  )
}

export default TopNavBar
