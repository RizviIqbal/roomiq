export * from './Button';
export * from './Spinner';
export * from './EmptyState';

import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, PartyPopper, CircleCheck, Banknote, Search, ClipboardList, Megaphone, Wrench as WrenchIcon, Package, Users as UsersIcon, ChevronDown } from 'lucide-react'

export const ICON_MAP = {
  '🏠': Home,
  '🎉': PartyPopper,
  '✅': CircleCheck,
  '💸': Banknote,
  '📋': ClipboardList,
  '👥': UsersIcon,
  '📌': Megaphone,
  '🔧': WrenchIcon,
  '📦': Package,
  '🧹': Search,
  '📜': ClipboardList,
}

export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

export const fadeSlideUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)', scale: 0.98 },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)', scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
}

export const PageTransition = ({ children, className = '' }) => (
  <motion.div variants={staggerContainer} initial="hidden" animate="show" className={className}>
    {children}
  </motion.div>
)

export const AnimatedNumber = ({ value, duration = 1500, className = '' }) => {
  const [display, setDisplay] = useState(0)
  const num = typeof value === 'number' ? value : parseInt(value) || 0

  useEffect(() => {
    if (num === 0) { setDisplay(0); return }
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4) // Quartic ease out
      setDisplay(Math.round(eased * num))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [num, duration])

  return <span className={className}>{display}</span>
}

export const StatCard = ({ icon: Icon, label, value, className = '' }) => (
  <motion.div variants={fadeSlideUp} className={`p-8 glass-panel rounded-[24px] group ${className}`}>
    <div className="flex items-center gap-3 mb-6 text-primary-muted group-hover:text-accent-orange transition-colors">
      {Icon && <Icon size={18} strokeWidth={1.5} />}
      <span className="font-label-caps text-[11px] tracking-[0.15em]">{label}</span>
    </div>
    <div className={`text-[48px] font-display font-light text-white drop-shadow-md group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all`}>
      {typeof value === 'number' ? <AnimatedNumber value={value} /> : value ?? '—'}
    </div>
  </motion.div>
)

export const SectionBlock = ({ title, count, onNav, navLabel = 'View all', children, className = '' }) => (
  <motion.section variants={fadeSlideUp} className={`p-8 glass-panel rounded-[32px] ${className}`}>
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-glass-border">
      <div className="flex items-center gap-4">
        <h2 className="font-display text-[28px] font-medium text-white">{title}</h2>
        {count != null && (
          <span className="font-mono text-[12px] text-white bg-white/10 rounded-full px-3 py-1 shadow-glow border border-white/20">
            {count}
          </span>
        )}
      </div>
      {onNav && (
        <button onClick={onNav} className="font-label-caps text-[11px] tracking-[0.15em] text-primary-muted hover:text-white transition-colors cursor-pointer border-b border-transparent hover:border-white pb-0.5">
          {navLabel}
        </button>
      )}
    </div>
    {children}
  </motion.section>
)

export const Card = ({ children, className = '', onClick, hover, style }) => (
  <div
    onClick={onClick}
    style={style}
    className={[
      'p-6 md:p-8 glass-panel rounded-[24px]',
      (onClick || hover) ? 'cursor-pointer hover:border-white/20 hover:bg-glass-hover hover:shadow-glow hover:-translate-y-1' : '',
      className,
    ].join(' ')}
  >
    {children}
  </div>
)

export const Badge = ({ children, color = 'neutral', pulse }) => {
  const colors = {
    neutral:    'border-glass-border text-primary-muted bg-white/5',
    accent:     'border-accent-purple/30 text-accent-purple bg-accent-purple/10 shadow-[0_0_10px_rgba(147,51,234,0.2)]',
    green:      'border-accent-emerald/30 text-accent-emerald bg-accent-emerald/10',
    red:        'border-accent-rose/30 text-accent-rose bg-accent-rose/10',
    yellow:     'border-yellow-500/30 text-yellow-400 bg-yellow-500/10',
    blue:       'border-accent-orange/30 text-accent-orange bg-accent-orange/10 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
    muted:      'border-transparent text-primary-muted bg-transparent',
  }
  return (
    <span className={[
      'inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full backdrop-blur-md',
      'font-label-caps text-[10px] font-semibold tracking-[0.15em] whitespace-nowrap',
      colors[color] || colors.neutral,
      pulse ? 'animate-pulse' : '',
    ].join(' ')}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
      {children}
    </span>
  )
}

export const Avatar = ({ name = '', size = 36, src }) => {
  const initials = name?.split(' ')?.map(w => w[0])?.join('')?.slice(0,2)?.toUpperCase() || '?'

  if (src) return (
    <img
      src={src} alt={name}
      style={{ width:size, height:size }}
      className="object-cover rounded-full border border-glass-border flex-shrink-0 shadow-sm"
    />
  )

  return (
    <div
      style={{ width:size, height:size, fontSize: Math.max(10, size * 0.34) }}
      className="bg-white/10 border border-glass-border backdrop-blur-md flex items-center justify-center font-display font-medium text-white flex-shrink-0 rounded-full"
    >
      {initials}
    </div>
  )
}

export const AvatarStack = ({ members = [], size = 32, max = 5 }) => {
  const visible = members.slice(0, max)
  const remaining = members.length - max
  return (
    <div className="flex items-center">
      {visible.map((m, i) => (
        <div key={m.user?._id || i} className="relative" style={{ marginLeft: i === 0 ? 0 : -10, zIndex: max - i }}>
          <Avatar name={m.user?.name || ''} size={size} src={m.user?.avatar} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          style={{ width: size, height: size, marginLeft: -10, fontSize: Math.max(9, size * 0.3) }}
          className="relative z-0 bg-obsidian border border-glass-border flex items-center justify-center font-label-caps text-[10px] text-primary-muted flex-shrink-0 rounded-full"
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}

export const Divider = ({ label }) => (
  <div className="flex items-center gap-4 py-6">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-glass-border to-glass-border" />
    {label && <span className="font-label-caps text-[11px] text-primary-muted uppercase tracking-[0.2em] whitespace-nowrap px-4">{label}</span>}
    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-glass-border to-glass-border" />
  </div>
)

export const ProgressBar = ({ value, max = 100, color, height = 6, animate = false }) => (
  <div className="bg-white/5 w-full overflow-hidden rounded-full border border-glass-border" style={{ height }}>
    <motion.div
      initial={animate ? { width: 0 } : false}
      animate={{ width: `${Math.min((value/max)*100, 100)}%` }}
      transition={animate ? { duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 } : { duration: 0.7, ease: 'easeOut' }}
      style={{
        height: '100%',
        background: color || 'linear-gradient(90deg, #9333EA 0%, #06B6D4 100%)',
      }}
      className="rounded-full relative overflow-hidden shadow-[0_0_10px_rgba(147,51,234,0.5)]"
    />
  </div>
)

export const Input = forwardRef(({ label, error, icon, prefix, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-2">
    {label && <label className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-primary-muted pl-1">{label}</label>}
    <div className="relative group">
      {icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-muted flex group-hover:text-accent-orange transition-colors">
          {icon}
        </span>
      )}
      {prefix && (
        <span className={`absolute top-1/2 -translate-y-1/2 text-white font-body ${icon ? 'left-[44px]' : 'left-4'}`}>
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        className={[
          'w-full bg-white/5 border border-glass-border rounded-xl py-4 text-[16px] text-white font-body transition-all duration-300 focus:outline-none focus:border-accent-orange focus:bg-white/10 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] placeholder:text-white/20',
          icon && prefix ? 'pl-[90px] pr-4' : (icon ? 'pl-12 pr-4' : (prefix ? 'pl-16 pr-4' : 'px-4')),
          error ? 'border-accent-rose focus:border-accent-rose focus:shadow-[0_0_15px_rgba(225,29,72,0.15)]' : '',
          className,
        ].join(' ')}
        {...props}
      />
    </div>
    {error && <span className="text-[12px] text-accent-rose mt-1 pl-1">{error}</span>}
  </div>
))
Input.displayName = 'Input'

export const Select = ({ label, error, children, className = '', value, onChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Parse children to get options list
  const options = []
  let selectedContent = value
  React.Children.forEach(children, child => {
    if (child && child.props && child.type === 'option') {
      options.push({ value: child.props.value, content: child.props.children })
      if (child.props.value === value) {
        selectedContent = child.props.children
      }
    }
  })

  const handleSelect = (optionValue) => {
    setIsOpen(false)
    if (onChange) {
      // Simulate native event structure so existing handlers work seamlessly
      onChange({ target: { value: optionValue } })
    }
  }

  return (
    <div className="flex flex-col gap-2" ref={wrapperRef}>
      {label && <label className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-primary-muted pl-1">{label}</label>}
      
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={[
            'w-full bg-white/5 border border-glass-border rounded-xl py-4 px-4 text-[16px] text-white font-body cursor-pointer transition-all duration-300 hover:border-white/30 hover:bg-white/10 flex items-center justify-between',
            isOpen ? 'border-accent-orange bg-white/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : '',
            error ? 'border-accent-rose focus:border-accent-rose' : '',
            className,
          ].join(' ')}
          {...props}
        >
          <span className="truncate flex items-center gap-2">{selectedContent}</span>
          <ChevronDown size={18} className={`text-primary-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent-orange' : ''}`} />
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-obsidian/95 backdrop-blur-xl border border-glass-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto"
            >
              {options.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => handleSelect(opt.value)}
                  className={[
                    'px-4 py-3 cursor-pointer transition-colors flex items-center gap-2 font-body',
                    opt.value === value ? 'bg-accent-orange/20 text-white' : 'text-primary-muted hover:bg-white/10 hover:text-white'
                  ].join(' ')}
                >
                  {opt.content}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <span className="text-[12px] text-accent-rose mt-1 pl-1">{error}</span>}
    </div>
  )
}

export const PageOrbs = () => (
  <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
    {/* Existing subtle background blobs */}
    <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full animate-blob" style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, rgba(147,51,234,0) 70%)' }} />
    <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full animate-blob" style={{ animationDelay: '2s', background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0) 70%)' }} />
    
    {/* Prominent side glows as requested by user, now using safe radial gradients */}
    <div className="absolute top-[10%] left-[-15%] w-[45vw] h-[90vh] rounded-[100%] animate-blob" style={{ animationDelay: '1s', background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0) 70%)' }} />
    <div className="absolute top-[15%] right-[-15%] w-[45vw] h-[90vh] rounded-[100%] animate-blob" style={{ animationDelay: '3s', background: 'radial-gradient(ellipse at center, rgba(236,72,153,0.12) 0%, rgba(236,72,153,0) 70%)' }} />
  </div>
)
