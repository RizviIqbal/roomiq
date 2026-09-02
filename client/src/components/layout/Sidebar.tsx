import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  User, LogOut, LayoutDashboard, DollarSign, CheckSquare, 
  Wrench, ShoppingCart, FileText, Bell, AlertCircle, 
  Activity, Home, Heart, Users, MessageCircle, X, Shield, Sparkles
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const houseName = user?.currentHouse?.name || 'My House'

  const houseNavItems = [
    { label: 'Dashboard',     path: '/app/dashboard',   icon: LayoutDashboard },
    { label: 'Expenses',      path: '/app/finance',     icon: DollarSign },
    { label: 'Chores',        path: '/app/chores',      icon: CheckSquare },
    { label: 'Maintenance',   path: '/app/maintenance', icon: Wrench },
    { label: 'Groceries',     path: '/app/shopping',    icon: ShoppingCart },
    { label: 'House Rules',   path: '/app/rules',       icon: FileText },
    { label: 'Noticeboard',   path: '/app/noticeboard', icon: Bell },
    { label: 'Feedback',      path: '/app/complaints',  icon: AlertCircle },
    { label: 'Activity Feed', path: '/app/activity',    icon: Activity },
  ]

  const exploreNavItems = [
    { label: 'House Setup',    path: '/house-setup',        icon: Sparkles },
    { label: 'Find Houses',    path: '/app/discover',       icon: Home },
    { label: 'Compatibility',  path: '/app/matching',       icon: Heart },
    { label: 'Find Roommates', path: '/app/find-roommates', icon: Users },
    { label: 'Messages',       path: '/app/messages',       icon: MessageCircle },
  ]

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-obsidian/95 backdrop-blur-2xl border-r border-glass-border flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="p-6 border-b border-white/5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div 
              className="font-display text-[24px] font-bold tracking-tight text-white cursor-pointer hover:text-accent-orange transition-colors flex items-center gap-1.5"
              onClick={() => { navigate('/app/dashboard'); onClose(); }}
            >
              RoomIQ<span className="text-accent-orange">.</span>
            </div>
            
            {/* Close button for mobile */}
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-full text-primary-muted hover:text-white hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>

          {/* House Indicator Pill */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/5 border border-white/5 text-xs text-primary-muted">
            <div className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="font-medium text-white truncate">{houseName}</span>
          </div>
        </div>

        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
          
          {/* Section 1: House Management */}
          <div>
            <div className="font-label-caps text-[10px] text-accent-orange uppercase tracking-[0.15em] px-3 mb-2 flex items-center gap-1.5">
              <Sparkles size={11} /> House Living
            </div>
            <nav className="space-y-1">
              {houseNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-accent-orange/15 to-transparent text-white font-semibold border-l-2 border-accent-orange shadow-[0_0_15px_rgba(255,107,0,0.1)]'
                          : 'text-primary-muted hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={17} className={`transition-colors ${isActive ? 'text-accent-orange' : 'text-primary-muted group-hover:text-white'}`} />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* Section 2: Explore & Social */}
          <div>
            <div className="font-label-caps text-[10px] text-accent-cyan uppercase tracking-[0.15em] px-3 mb-2 flex items-center gap-1.5">
              <Users size={11} /> Explore & Social
            </div>
            <nav className="space-y-1">
              {exploreNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-accent-cyan/15 to-transparent text-white font-semibold border-l-2 border-accent-cyan shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                          : 'text-primary-muted hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={17} className={`transition-colors ${isActive ? 'text-accent-cyan' : 'text-primary-muted group-hover:text-white'}`} />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>

        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div 
              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
              onClick={() => { navigate('/app/profile'); onClose(); }}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent-orange/20 flex items-center justify-center text-accent-orange shrink-0">
                  <User size={16} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-semibold text-white truncate">{user.name}</div>
                <div className="font-label-caps text-[9px] text-primary-muted truncate uppercase tracking-widest">
                  {user.currentHouse ? 'Member' : 'No House'}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl text-primary-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

      </aside>
    </>
  )
}

export default Sidebar
