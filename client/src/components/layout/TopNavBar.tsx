import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  User, LogOut, Menu, X, LayoutDashboard, DollarSign, CheckSquare, 
  Wrench, ShoppingCart, FileText, Bell, AlertCircle, 
  Activity, Home, Heart, Users, MessageCircle 
} from 'lucide-react'

interface TopNavBarProps {
  className?: string
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ className = '' }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!user) {
    return null
  }

  const navItems = [
    { label: 'Dashboard',      path: '/app/dashboard',      icon: LayoutDashboard, category: 'House' },
    { label: 'Expenses',       path: '/app/finance',        icon: DollarSign,     category: 'House' },
    { label: 'Chores',         path: '/app/chores',         icon: CheckSquare,    category: 'House' },
    { label: 'Maintenance',    path: '/app/maintenance',    icon: Wrench,         category: 'House' },
    { label: 'Groceries',      path: '/app/shopping',       icon: ShoppingCart,   category: 'House' },
    { label: 'House Rules',    path: '/app/rules',          icon: FileText,       category: 'House' },
    { label: 'Noticeboard',    path: '/app/noticeboard',    icon: Bell,           category: 'House' },
    { label: 'Feedback',       path: '/app/complaints',     icon: AlertCircle,    category: 'House' },
    { label: 'Activity Feed',  path: '/app/activity',       icon: Activity,       category: 'House' },
    { label: 'Find Houses',    path: '/app/discover',       icon: Home,           category: 'Explore' },
    { label: 'Compatibility',  path: '/app/matching',       icon: Heart,          category: 'Explore' },
    { label: 'Find Roommates', path: '/app/find-roommates', icon: Users,          category: 'Explore' },
    { label: 'Messages',       path: '/app/messages',       icon: MessageCircle,  category: 'Explore' },
  ]

  return (
    <>
      <header className={`fixed top-4 left-4 right-4 lg:left-6 lg:right-6 z-50 flex justify-between items-center px-4 py-2 bg-obsidian/80 backdrop-blur-3xl border border-glass-border shadow-glass rounded-full transition-all duration-500 transform-gpu ${className}`} style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}>
        
        {/* Brand Logo */}
        <div 
          className="font-display text-[20px] font-bold tracking-tight text-white cursor-pointer hover:text-accent-orange transition-colors ml-3 flex-shrink-0 flex items-center gap-1.5"
          onClick={() => navigate('/app/dashboard')}
        >
          RoomIQ<span className="text-accent-orange">.</span>
        </div>
        
        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto no-scrollbar max-w-[68vw] xl:max-w-none px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `font-label-caps text-[11px] tracking-[0.08em] px-3.5 py-2.5 transition-all duration-300 relative whitespace-nowrap rounded-full ${
                  isActive
                    ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] bg-white/5'
                    : 'text-primary-muted hover:text-white hover:bg-white/[0.03]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-gradient-to-r from-accent-orange to-accent-rose shadow-[0_0_12px_rgba(255,107,0,0.8)] rounded-full animate-fade-in" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Profile & Actions */}
        <div className="flex items-center gap-2 mr-1 flex-shrink-0">
          <button
            onClick={() => navigate('/app/profile')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs transition-all duration-300"
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <User size={14} className="text-accent-orange" />
            )}
            <span className="font-medium max-w-[90px] truncate hidden sm:inline">{user.name}</span>
          </button>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 rounded-full bg-white/5 hover:bg-accent-rose/20 hover:text-accent-rose text-primary-muted border border-white/10 text-xs transition-all duration-300 hidden sm:flex"
          >
            <LogOut size={14} />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-xl animate-fade-in flex flex-col pt-24 px-6 pb-8 overflow-y-auto"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="glass-panel p-6 rounded-3xl border border-glass-border space-y-6 w-full max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* House Operations Group */}
            <div>
              <div className="font-label-caps text-[10px] text-accent-orange uppercase tracking-widest mb-3">House Living</div>
              <div className="grid grid-cols-2 gap-2">
                {navItems.filter(i => i.category === 'House').map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-medium transition-all ${
                          isActive 
                            ? 'bg-accent-orange text-obsidian font-bold shadow-glow' 
                            : 'bg-white/5 text-primary-muted hover:text-white hover:bg-white/10'
                        }`
                      }
                    >
                      <Icon size={16} />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            </div>

            {/* Social & Discovery Group */}
            <div className="border-t border-white/5 pt-4">
              <div className="font-label-caps text-[10px] text-accent-cyan uppercase tracking-widest mb-3">Explore & Social</div>
              <div className="grid grid-cols-2 gap-2">
                {navItems.filter(i => i.category === 'Explore').map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-medium transition-all ${
                          isActive 
                            ? 'bg-accent-cyan text-obsidian font-bold shadow-glow' 
                            : 'bg-white/5 text-primary-muted hover:text-white hover:bg-white/10'
                        }`
                      }
                    >
                      <Icon size={16} />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            </div>

            {/* Account Actions */}
            <div className="border-t border-white/5 pt-4 flex gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/app/profile'); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
              >
                <User size={14} className="text-accent-orange" /> Profile
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose text-xs font-medium border border-accent-rose/20 transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default TopNavBar
