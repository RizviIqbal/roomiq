import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Bell, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../ui/index'

export interface TopNavBarProps {
  readonly className?: string;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ className = '' }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Finances', path: '/app/finance' },
    { label: 'Chores', path: '/app/chores' },
    { label: 'Rules', path: '/app/rules' },
    { label: 'Issues', path: '/app/maintenance' },
    { label: 'Match', path: '/app/matching' },
    { label: 'Roommates', path: '/app/find-roommates' },
    { label: 'Inbox', path: '/app/inbox' },
  ]

  return (
    <header className={`fixed top-4 left-4 right-4 lg:left-8 lg:right-8 z-50 flex justify-between items-center px-4 py-2 bg-obsidian/60 backdrop-blur-3xl border border-glass-border shadow-glass rounded-full transition-all duration-500 transform-gpu ${className}`} style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}>
      <div 
        className="font-display text-[20px] font-bold tracking-tight text-white cursor-pointer hover:text-accent-orange transition-colors ml-4 flex-shrink-0"
        onClick={() => navigate('/app/finance')}
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
                {item.label}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-white rounded-t-full shadow-[0_0_10px_rgba(255,255,255,1)]" />
                )}
                {!isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-white/20 rounded-t-full transition-all duration-300 group-hover:w-4" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2 flex-shrink-0 mr-2">
        <button onClick={() => navigate('/app/profile')} className="text-primary-muted hover:text-white p-2.5 transition-all rounded-full hover:bg-white/5 border border-transparent hover:border-glass-border">
          <Settings size={18} strokeWidth={1.5} />
        </button>
        <button onClick={handleLogout} className="text-primary-muted hover:text-accent-rose p-2.5 transition-all rounded-full hover:bg-accent-rose/10 border border-transparent hover:border-accent-rose/20" title="Sign out">
          <LogOut size={18} strokeWidth={1.5} />
        </button>
        <div className="ml-3 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/app/profile')}>
           <Avatar name={user?.name || 'User'} size={36} src={user?.avatar} />
        </div>
      </div>
    </header>
  )
}

export default TopNavBar
