import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue } from 'framer-motion'
import Lenis from 'lenis'
import { 
  ArrowUpRight, 
  Sparkles, 
  ShieldCheck, 
  Sliders, 
  Layers, 
  Users, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  ChevronDown, 
  Volume2, 
  Building2,
  Cpu,
  ArrowRight,
  Sun,
  Moon,
  Receipt,
  RotateCw,
  Bell,
  HeartHandshake,
  Check,
  Plus,
  Home,
  MessageSquare,
  DollarSign
} from 'lucide-react'

// -------------------------------------------------------------
// Curated Architectural Living Spaces
// -------------------------------------------------------------
const ARCHITECTURAL_SPACES = [
  {
    id: 'tribeca',
    title: 'The Tribeca Loft Collective',
    location: 'New York, USA',
    residents: '4 Roommates',
    matchScore: 98,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    category: 'Converted Industrial',
    specs: '3,200 sq.ft • 4 Private Suites • Shared Chef Kitchen',
    description: 'Tech & design founders living in synchronized circadian peace with automatic expense sharing.'
  },
  {
    id: 'shoreditch',
    title: 'Shoreditch Minimalist Villa',
    location: 'London, UK',
    residents: '3 Roommates',
    matchScore: 95,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',
    category: 'Modernist Atelier',
    specs: '2,400 sq.ft • 3 Suites • Rooftop Garden',
    description: 'Zero chore arguments for 14 straight months thanks to rotating automated schedules.'
  },
  {
    id: 'daikanyama',
    title: 'Daikanyama Timber Townhouse',
    location: 'Tokyo, Japan',
    residents: '3 Roommates',
    matchScore: 99,
    image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=85',
    category: 'Biophilic Residence',
    specs: '1,950 sq.ft • 3 Suites • Tea Pavilion',
    description: 'Perfect sleep schedule alignment with automated 23:00 quiet hours mode.'
  },
  {
    id: 'kreuzberg',
    title: 'Kreuzberg Concrete Studio',
    location: 'Berlin, Germany',
    residents: '4 Roommates',
    matchScore: 94,
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85',
    category: 'Brutalist Penthouse',
    specs: '2,800 sq.ft • 4 Suites • Sound Studio',
    description: 'Instant group debt simplification for groceries, rent, and studio utilities.'
  }
]

// -------------------------------------------------------------
// Meaningful 24-Hour House Synchronizer Stages
// -------------------------------------------------------------
const HOUSE_RHYTHM_STAGES = [
  {
    time: '08:00',
    phase: 'Morning Routine',
    title: 'Quiet Hours Lifted & Morning Handoff',
    icon: Sun,
    highlight: 'Sarah made fresh coffee & emptied the dishwasher (+15 House Karma)',
    status: 'Quiet hours completed with 0 noise reports.',
    room: 'Kitchen & Dining',
    badge: 'CHORE VERIFIED',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  },
  {
    time: '14:30',
    phase: 'Shared Provisions',
    title: 'Trader Joe\'s Grocery Receipt Auto-Split',
    icon: Receipt,
    highlight: '$154.20 organic groceries split equally across 4 roommates ($38.55 each).',
    status: 'Instantly synced to split ledger. 0 Venmo reminders needed.',
    room: 'Household Ledger',
    badge: 'EXPENSE AUTO-SETTLED',
    badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
  },
  {
    time: '19:45',
    phase: 'Evening Harmony',
    title: 'Dinner Cleanup & Trash Cycle Rotation',
    icon: RotateCw,
    highlight: 'Chore rotation automatically shifted to Alex for tomorrow.',
    status: 'Alex checked off recycling disposal with 1 tap.',
    room: 'Living & Terrace',
    badge: 'STREAK: 18 DAYS',
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  },
  {
    time: '23:00',
    phase: 'Night Protocol',
    title: 'Automated House Quiet Hours Engage',
    icon: Moon,
    highlight: 'House status set to Rest Mode. Guest notice verified for Friday.',
    status: 'Circadian sync active. All residents notified seamlessly.',
    room: 'Private Suites',
    badge: 'REST MODE ON',
    badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
  }
]

// -------------------------------------------------------------
// Interactive Living Network Canvas
// -------------------------------------------------------------
const LivingNetworkCanvas = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const particleCount = Math.min(Math.floor(width / 40), 40)
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 1
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 130) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 * (1 - dist / 130)})`
            ctx.lineWidth = 0.75
            ctx.stroke()
          }
        }
      }

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[1] opacity-35" 
    />
  )
}

// -------------------------------------------------------------
// Rolling Text Component
// -------------------------------------------------------------
const RollingText = ({ text, className = '' }) => {
  return (
    <span className={`roll-container ${className}`}>
      <span className="roll-item roll-item-1">{text}</span>
      <span className="roll-item roll-item-2 absolute top-full left-0">{text}</span>
    </span>
  )
}

// -------------------------------------------------------------
// Masked Text Line Reveal
// -------------------------------------------------------------
const MaskedLine = ({ children, delay = 0, className = '' }) => {
  return (
    <div className="ln-mask">
      <motion.div
        initial={{ y: '115%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.8, delay, ease: [0.17, 0.84, 0.44, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  
  // Page Scroll Progress Tracker for .yap bar
  const { scrollYProgress } = useScroll()
  const scaleXProgress = useSpring(scrollYProgress, { stiffness: 300, damping: 30 })

  // Preloader State
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Custom Magnetic Cursor State
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)
  const springX = useSpring(mouseX, { stiffness: 450, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 450, damping: 30 })
  const [cursorText, setCursorText] = useState('')
  const [cursorActive, setCursorActive] = useState(false)
  const [cursorHidden, setCursorHidden] = useState(true)

  // World Clocks State
  const [currentTime, setCurrentTime] = useState({
    nyc: '',
    lon: '',
    tyo: ''
  })

  // Meaningful 24/7 House Synchronizer Active Tab
  const [activeRhythmStage, setActiveRhythmStage] = useState(0)

  // Interactive Product Simulator Active Tab
  const [activeTab, setActiveTab] = useState('split') // 'split' | 'chores' | 'match' | 'rules'

  // Interactive Match Simulator State
  const [cleanliness, setCleanliness] = useState(90)
  const [sleepSchedule, setSleepSchedule] = useState(85)
  const [socialBattery, setSocialBattery] = useState(70)
  const [expenseRigor, setExpenseRigor] = useState(95)

  // Interactive Split Matrix State
  const [expenseAmount, setExpenseAmount] = useState(480)
  const [activeSplitMembers, setActiveSplitMembers] = useState(4)

  // Interactive Chore Board State
  const [completedChores, setCompletedChores] = useState({
    kitchen: true,
    living: false,
    recycling: true,
    terrace: false
  })

  // Accordion State
  const [openFaq, setOpenFaq] = useState(0)

  // Lenis Smooth Scroll Engine
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  // Mouse Move Cursor Tracker
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorHidden(false)
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)

      const target = e.target.closest('[data-cursor]')
      if (target) {
        setCursorText(target.getAttribute('data-cursor') || '')
        setCursorActive(true)
      } else {
        setCursorText('')
        setCursorActive(false)
      }
    }

    const handleMouseLeave = () => setCursorHidden(true)
    const handleMouseEnter = () => setCursorHidden(false)

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [mouseX, mouseY])

  // Preloader Simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => setIsLoaded(true), 350)
          return 100
        }
        const step = Math.floor(Math.random() * 18) + 12
        return Math.min(prev + step, 100)
      })
    }, 40)

    return () => clearInterval(timer)
  }, [])

  // Auto-Cycle 24-Hour Rhythm Stages
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRhythmStage((prev) => (prev + 1) % HOUSE_RHYTHM_STAGES.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  // World Clocks Updater
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date()
      const format = (tz) => 
        new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(now)

      setCurrentTime({
        nyc: format('America/New_York'),
        lon: format('Europe/London'),
        tyo: format('Asia/Tokyo')
      })
    }

    updateClocks()
    const interval = setInterval(updateClocks, 1000)
    return () => clearInterval(interval)
  }, [])

  // Dynamic Harmony Calculation
  const calculatedHarmony = Math.round(
    cleanliness * 0.35 + sleepSchedule * 0.25 + socialBattery * 0.2 + expenseRigor * 0.2
  )

  const currentRhythm = HOUSE_RHYTHM_STAGES[activeRhythmStage]
  const CurrentRhythmIcon = currentRhythm.icon

  return (
    <div className="bg-[#08080a] min-h-screen text-[#fcfcfc] selection:bg-white selection:text-black font-sans relative overflow-x-hidden grain-overlay">
      
      {/* ------------------------------------------------------------- */}
      {/* TOP SCROLL PROGRESS BAR (.yap)                                */}
      {/* ------------------------------------------------------------- */}
      <motion.div 
        style={{ scaleX: scaleXProgress }}
        className="yap-progress"
      />

      {/* ------------------------------------------------------------- */}
      {/* 0. INTERACTIVE LIVING NETWORK CANVAS                          */}
      {/* ------------------------------------------------------------- */}
      <LivingNetworkCanvas />

      {/* ------------------------------------------------------------- */}
      {/* 0. CUSTOM MAGNETIC DIFFERENCE CURSOR                          */}
      {/* ------------------------------------------------------------- */}
      {!cursorHidden && (
        <motion.div
          style={{
            x: springX,
            y: springY
          }}
          className={`cursor-follower hidden md:flex items-center justify-center rounded-full transition-[width,height] duration-300 pointer-events-none ${
            cursorActive
              ? 'w-24 h-24 bg-white text-black font-mono text-xs font-bold tracking-widest uppercase'
              : 'w-3.5 h-3.5 bg-white'
          }`}
        >
          {cursorActive && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center px-1"
            >
              {cursorText}
            </motion.span>
          )}
        </motion.div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. ARCHITECTURAL PRELOADER                                    */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.17, 0.84, 0.44, 1] } }}
            className="fixed inset-0 z-[10000] bg-[#08080a] flex flex-col justify-between p-8 md:p-16 border-b border-white/10"
          >
            <div className="flex justify-between items-start">
              <div className="font-mono text-sm text-neutral-300 tracking-[0.25em] uppercase font-semibold">
                RoomiQ / Shared Living Operating System
              </div>
              <div className="font-mono text-sm text-emerald-400 flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                SYSTEM INITIALIZING
              </div>
            </div>

            <div className="my-auto">
              <div className="font-mono text-sm text-neutral-400 mb-3 tracking-widest uppercase">
                House Harmony Synchronization Index
              </div>
              <div className="text-7xl md:text-[130px] font-light font-serif tracking-tight leading-none flex items-baseline">
                <span>{String(loadingProgress).padStart(3, '0')}</span>
                <span className="text-3xl md:text-5xl font-sans text-neutral-500 ml-2">%</span>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-white/10 pt-6">
              <div className="font-mono text-xs text-neutral-400 space-y-1 hidden sm:block">
                <p>ZERO-ARGUMENT EXPENSES • AUTOMATED CHORES • COMPATIBILITY MATCHING</p>
              </div>
              <div className="w-48 h-[3px] bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-150 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* 2. TOP MASTHEAD NAVIGATION                                     */}
      {/* ------------------------------------------------------------- */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#08080a]/90 backdrop-blur-md hairline-b transition-all duration-300">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          
          {/* Logo & Identity */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            data-cursor="TOP"
            className="cursor-pointer group flex items-baseline gap-3"
          >
            <span className="font-serif text-2xl md:text-3xl tracking-tight font-medium text-white">RoomiQ</span>
            <span className="font-mono text-xs tracking-[0.2em] text-neutral-400 uppercase hidden sm:inline-block border-l border-white/15 pl-3">
              Roommate Operating System
            </span>
          </div>

          {/* Navigation Directory with Rolling Text */}
          <nav className="hidden lg:flex items-center gap-8 font-mono text-xs tracking-wider text-neutral-300 font-medium">
            <a href="#how-it-works" className="group text-neutral-300 hover:text-white" data-cursor="VIEW">
              <span className="text-neutral-400 mr-1.5">[01]</span>
              <RollingText text="HOW IT WORKS" />
            </a>
            <a href="#rhythm" className="group text-neutral-300 hover:text-white" data-cursor="EXPLORE">
              <span className="text-neutral-400 mr-1.5">[02]</span>
              <RollingText text="24/7 RHYTHM" />
            </a>
            <a href="#suite" className="group text-neutral-300 hover:text-white" data-cursor="APP">
              <span className="text-neutral-400 mr-1.5">[03]</span>
              <RollingText text="HOUSE SUITE" />
            </a>
            <a href="#protocols" className="group text-neutral-300 hover:text-white" data-cursor="SPECS">
              <span className="text-neutral-400 mr-1.5">[04]</span>
              <RollingText text="HOUSE RULES" />
            </a>
            <a href="#spaces" className="group text-neutral-300 hover:text-white" data-cursor="SPACES">
              <span className="text-neutral-400 mr-1.5">[05]</span>
              <RollingText text="RESIDENCES" />
            </a>
          </nav>

          {/* World Time & Quick Actions */}
          <div className="flex items-center gap-6">
            <div className="hidden xl:flex items-center gap-4 font-mono text-xs text-neutral-400 border-r border-white/10 pr-6">
              <span>NYC {currentTime.nyc || '14:24'}</span>
              <span>•</span>
              <span>LON {currentTime.lon || '19:24'}</span>
              <span>•</span>
              <span>TYO {currentTime.tyo || '04:24'}</span>
            </div>

            <button
              onClick={() => navigate('/login')}
              data-cursor="SIGN IN"
              className="text-xs font-mono tracking-wider font-semibold text-neutral-300 hover:text-white transition-colors"
            >
              SIGN IN
            </button>

            <button
              onClick={() => navigate('/register')}
              data-cursor="JOIN"
              className="group relative px-5 py-2.5 bg-white text-black font-mono text-xs tracking-wider uppercase font-semibold transition-all duration-300 hover:bg-neutral-200"
            >
              <span className="relative z-10 flex items-center gap-2">
                Join Free <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 3. HERO SECTION: CLEAR VALUE PROPOSITION                       */}
      {/* ------------------------------------------------------------- */}
      <section className="relative pt-36 md:pt-48 pb-20 md:pb-28 px-6 md:px-12 max-w-[1600px] mx-auto min-h-screen flex flex-col justify-between">
        
        {/* Top Tagline Pill */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hairline-b pb-6">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-wider font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Eliminating Awkward Roommate Arguments Forever</span>
          </div>

          <div className="font-mono text-xs text-neutral-300 tracking-wider uppercase font-semibold">
            AUTOMATED BILL SPLITTING • ROTATING CHORES • LIFESTYLE MATCHING
          </div>
        </div>

        {/* Monumental Headline with Masked Stagger */}
        <div className="py-10 md:py-16">
          <MaskedLine delay={0.1}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[95px] font-normal leading-[1.0] tracking-tight">
              Live with Roommates.
            </h1>
          </MaskedLine>
          <MaskedLine delay={0.25}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[95px] font-normal leading-[1.0] tracking-tight mt-1">
              <span className="font-serif italic font-normal text-white">Without the Drama.</span>
            </h1>
          </MaskedLine>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-10 md:mt-14 items-end">
            <div className="md:col-span-7 lg:col-span-6">
              <MaskedLine delay={0.4}>
                <p className="text-lg md:text-2xl text-neutral-200 font-light leading-relaxed">
                  RoomiQ automates household expenses, fair chore rotation, and lifestyle compatibility so you never have to send another passive-aggressive text message.
                </p>
              </MaskedLine>
            </div>

            <div className="md:col-span-5 lg:col-span-6 flex flex-wrap gap-4 md:justify-end">
              <button
                onClick={() => navigate('/register')}
                data-cursor="GET STARTED"
                className="px-8 py-4 bg-white text-black font-mono text-xs tracking-wider uppercase font-bold hover:bg-neutral-200 transition-colors flex items-center gap-3 shadow-xl"
              >
                <span>Create House — It's Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => navigate('/login')}
                data-cursor="DEMO"
                className="px-8 py-4 bg-white/10 border border-white/20 hover:bg-white/20 font-mono text-xs tracking-wider uppercase text-white font-semibold transition-colors flex items-center gap-3"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Explore Live Demo House</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Interactive App Mockup Video Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.3, ease: [0.17, 0.84, 0.44, 1] }}
          data-cursor="EXPLORE"
          className="relative w-full h-[420px] sm:h-[550px] md:h-[650px] overflow-hidden hairline-box group cursor-pointer"
          onClick={() => navigate('/register')}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=90"
            className="w-full h-full object-cover grayscale-[10%] group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.17,0.84,0.44,1)]"
          >
            <source 
              src="https://assets.mixkit.co/videos/preview/mixkit-modern-architecture-building-with-a-glass-facade-42223-large.mp4" 
              type="video/mp4" 
            />
          </video>

          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/40 to-transparent" />

          {/* Real Live House Stats Widget */}
          <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="bg-[#08080a]/95 backdrop-blur-md p-6 md:p-8 hairline-box max-w-lg">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                VERIFIED ACTIVE HOUSEHOLD
              </div>
              <div className="font-serif text-2xl md:text-3xl text-white font-normal mb-2">
                The Brooklyn Loft Collective
              </div>
              <p className="text-sm text-neutral-300 font-light leading-relaxed">
                4 Roommates • $0 Unpaid Debts • 100% On-Time Chores for 6 Months • 0 Disputes
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#08080a]/95 backdrop-blur-md px-6 py-4 hairline-box">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
              <div className="font-mono text-xs text-white uppercase tracking-wider">
                HOUSEHOLD STATUS: <span className="text-emerald-400 font-bold">100% EQUILIBRIUM</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. HOW ROOMIQ WORKS IN 3 STEPS                                */}
      {/* ------------------------------------------------------------- */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto hairline-t">
        <div className="max-w-3xl mb-16">
          <div className="font-mono text-xs text-neutral-400 tracking-[0.2em] uppercase mb-3 font-semibold">
            [01] / THREE-STEP WORKFLOW
          </div>
          <h2 className="text-3xl sm:text-5xl font-normal tracking-tight text-white">
            How RoomiQ solves the <br />
            <span className="font-serif italic text-neutral-200">#1 cause of roommate stress.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="p-8 md:p-10 hairline-box bg-[#0c0c10] space-y-6" data-cursor="STEP 1">
            <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center font-mono text-lg font-bold text-white">
              01
            </div>
            <h3 className="text-2xl font-serif text-white">Create or Join a House</h3>
            <p className="text-base text-neutral-300 font-light leading-relaxed">
              Create a house profile in 60 seconds and invite your current roommates with a private code, or find new roommates who match your sleep and cleanliness standards.
            </p>
            <div className="font-mono text-xs text-emerald-400 pt-4 border-t border-white/10 uppercase tracking-wider font-semibold">
              ✓ 60-Second Setup • No Credit Card
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-8 md:p-10 hairline-box bg-[#0c0c10] space-y-6" data-cursor="STEP 2">
            <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center font-mono text-lg font-bold text-white">
              02
            </div>
            <h3 className="text-2xl font-serif text-white">Automate Bills & Chores</h3>
            <p className="text-base text-neutral-300 font-light leading-relaxed">
              Snap receipts or log rent with 1 tap. RoomiQ simplifies all group debts into the minimum direct payments and automatically rotates cleaning chores every week.
            </p>
            <div className="font-mono text-xs text-blue-400 pt-4 border-t border-white/10 uppercase tracking-wider font-semibold">
              ✓ Zero Math • Zero Manual Reminders
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-8 md:p-10 hairline-box bg-[#0c0c10] space-y-6" data-cursor="STEP 3">
            <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center font-mono text-lg font-bold text-white">
              03
            </div>
            <h3 className="text-2xl font-serif text-white">Live in Total Harmony</h3>
            <p className="text-base text-neutral-300 font-light leading-relaxed">
              Stay in sync with automated quiet hours, guest announcements, and clear digital house rules so everyone enjoys their home without awkward confrontation.
            </p>
            <div className="font-mono text-xs text-amber-400 pt-4 border-t border-white/10 uppercase tracking-wider font-semibold">
              ✓ 99.4% Resident Satisfaction
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. MEANINGFUL 24/7 HOUSE RHYTHM ANIMATION (REPLACED SPIN)     */}
      {/* ------------------------------------------------------------- */}
      <section id="rhythm" className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto hairline-t">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <div className="font-mono text-xs text-neutral-400 tracking-[0.2em] uppercase mb-3 font-semibold">
              [02] / 24-HOUR HOUSEHOLD RHYTHM ENGINE
            </div>
            <h2 className="text-3xl sm:text-5xl font-normal tracking-tight text-white">
              A Day in the Life of a <br />
              <span className="font-serif italic text-neutral-200">RoomiQ Powered Home</span>
            </h2>
          </div>
          <p className="text-base text-neutral-300 max-w-md font-light">
            Watch how RoomiQ automatically coordinates household duties, bill settlements, and quiet hours around the clock.
          </p>
        </div>

        {/* 24/7 Interactive Timeline Simulator */}
        <div className="hairline-box bg-[#0c0c10] p-8 md:p-12">
          
          {/* Time Selector Stage Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {HOUSE_RHYTHM_STAGES.map((stage, idx) => {
              const StageIcon = stage.icon
              const isActive = activeRhythmStage === idx
              return (
                <button
                  key={idx}
                  onClick={() => setActiveRhythmStage(idx)}
                  data-cursor="TIME"
                  className={`p-5 text-left transition-all hairline-box flex flex-col justify-between h-32 ${
                    isActive 
                      ? 'bg-white text-black border-white shadow-2xl scale-[1.02]' 
                      : 'bg-[#08080a] text-white hover:border-white/30'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-mono text-sm font-bold">{stage.time}</span>
                    <StageIcon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-neutral-400'}`} />
                  </div>
                  <div>
                    <div className={`text-xs font-mono uppercase tracking-wider ${isActive ? 'text-black/60' : 'text-neutral-400'}`}>
                      {stage.phase}
                    </div>
                    <div className="font-serif text-base font-medium truncate mt-0.5">
                      {stage.room}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Active Stage Display Panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRhythmStage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#08080a] p-8 md:p-10 hairline-box items-center"
            >
              <div className="lg:col-span-8 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider border ${currentRhythm.badgeColor}`}>
                    {currentRhythm.badge}
                  </span>
                  <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
                    ACTIVE ROOM: {currentRhythm.room}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-serif text-white font-normal">
                  {currentRhythm.title}
                </h3>

                <p className="text-lg text-neutral-200 font-light leading-relaxed">
                  {currentRhythm.highlight}
                </p>

                <div className="font-mono text-sm text-emerald-400 flex items-center gap-2 pt-4 border-t border-white/10">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{currentRhythm.status}</span>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 bg-[#0c0c10] hairline-box text-center space-y-3">
                <CurrentRhythmIcon className="w-12 h-12 text-white" />
                <div className="font-mono text-2xl font-bold text-white tracking-widest">
                  {currentRhythm.time}
                </div>
                <div className="font-mono text-xs text-neutral-400 uppercase tracking-wider">
                  HOUSE CLOCK SYNCHRONIZED
                </div>
                <button
                  onClick={() => navigate('/register')}
                  data-cursor="JOIN"
                  className="w-full py-3 mt-4 bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
                >
                  Enable for Your House
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. INTERACTIVE 4-IN-1 HOUSE SUITE SIMULATOR                   */}
      {/* ------------------------------------------------------------- */}
      <section id="suite" className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto hairline-t">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <div className="font-mono text-xs text-neutral-400 tracking-[0.2em] uppercase mb-3 font-semibold">
              [03] / INTERACTIVE HOUSE SUITE
            </div>
            <h2 className="text-3xl sm:text-5xl font-normal tracking-tight text-white">
              Everything Your House Needs. <br />
              <span className="font-serif italic text-neutral-200">Built into One Platform.</span>
            </h2>
          </div>
          <p className="text-base text-neutral-300 max-w-md font-light">
            Test the live features below to experience how RoomiQ manages expenses, chores, and roommate harmony.
          </p>
        </div>

        {/* Tab Selector Bar */}
        <div className="flex flex-wrap gap-2 mb-8 hairline-b pb-4">
          {[
            { id: 'split', label: '1. Fair Bill Splitter', icon: DollarSign },
            { id: 'chores', label: '2. Rotating Chores', icon: RotateCw },
            { id: 'match', label: '3. Compatibility Radar', icon: Sliders },
            { id: 'rules', label: '4. Digital House Rules', icon: ShieldCheck }
          ].map((tab) => {
            const TabIcon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-cursor="SWITCH"
                className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2.5 ${
                  isActive 
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Interactive Feature Panel */}
        <div className="hairline-box bg-[#0c0c10] p-8 md:p-12">
          
          {/* TAB 1: FAIR BILL SPLITTER */}
          {activeTab === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider">
                    SMART EXPENSE LEDGER
                  </span>
                  <h3 className="text-2xl md:text-3xl font-serif text-white mt-1">
                    Zero-Math Group Expense Splitting
                  </h3>
                  <p className="text-sm md:text-base text-neutral-300 font-light mt-2 leading-relaxed">
                    Adjust the slider to simulate an expense (groceries, WiFi, electricity) and watch RoomiQ automatically divide and settle it without debt chains.
                  </p>
                </div>

                <div className="space-y-4 bg-[#08080a] p-6 hairline-box">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-neutral-400 uppercase">Expense Total</span>
                    <span className="text-3xl font-serif text-white">${expenseAmount}.00</span>
                  </div>

                  <input
                    type="range"
                    min="60"
                    max="1200"
                    step="20"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/20 appearance-none cursor-pointer accent-white"
                  />

                  <div className="flex justify-between font-mono text-xs text-neutral-400">
                    <span>$60 Groceries</span>
                    <span>$1,200 Rent & Utilities</span>
                  </div>
                </div>

                <div className="font-mono text-xs text-neutral-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Each roommate owes exactly ${(expenseAmount / activeSplitMembers).toFixed(2)} with 0 transaction fees.</span>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-3">
                <div className="font-mono text-xs text-neutral-400 uppercase tracking-wider mb-2">
                  SETTLEMENT BREAKDOWN (4 ROOMMATES)
                </div>
                {[
                  { name: 'Alex M. (Payer)', share: (expenseAmount / 4).toFixed(2), status: 'Paid in Full', isPayer: true },
                  { name: 'Sarah K.', share: (expenseAmount / 4).toFixed(2), status: 'Auto-Settled via RoomiQ' },
                  { name: 'David L.', share: (expenseAmount / 4).toFixed(2), status: 'Auto-Settled via RoomiQ' },
                  { name: 'Elena V.', share: (expenseAmount / 4).toFixed(2), status: 'Auto-Settled via RoomiQ' }
                ].map((member, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-[#08080a] hairline-box">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${member.isPayer ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                      <span className="text-sm font-medium text-white">{member.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-white">${member.share}</div>
                      <div className="text-xs text-neutral-400 font-mono">{member.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ROTATING CHORES */}
          {activeTab === 'chores' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
                    AUTOMATIC CHORE CHOREOGRAPHY
                  </span>
                  <h3 className="text-2xl md:text-3xl font-serif text-white mt-1">
                    No More Dirty Dish Confrontations
                  </h3>
                  <p className="text-sm md:text-base text-neutral-300 font-light mt-2 leading-relaxed">
                    Chores rotate automatically every Monday. Click the checkboxes below to see how roommates verify completed tasks with 1 tap.
                  </p>
                </div>

                <div className="p-6 bg-[#08080a] hairline-box space-y-3 font-mono text-xs">
                  <div className="flex justify-between text-neutral-300">
                    <span>WEEKLY COMPLETION RATE:</span>
                    <span className="text-emerald-400 font-bold">
                      {Object.values(completedChores).filter(Boolean).length} of 4 Completed
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 transition-all duration-300"
                      style={{ width: `${(Object.values(completedChores).filter(Boolean).length / 4) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-3">
                {[
                  { key: 'kitchen', title: 'Deep Clean Kitchen Counters & Sink', assignee: 'Alex M.', day: 'Monday' },
                  { key: 'recycling', title: 'Sort & Take Out Recycling / Trash', assignee: 'Sarah K.', day: 'Wednesday' },
                  { key: 'living', title: 'Vacuum Common Room & Living Area', assignee: 'David L.', day: 'Friday' },
                  { key: 'terrace', title: 'Water Plants & Tidy Balcony', assignee: 'Elena V.', day: 'Sunday' }
                ].map((chore) => {
                  const isDone = completedChores[chore.key]
                  return (
                    <div 
                      key={chore.key}
                      data-cursor="TOGGLE"
                      onClick={() => setCompletedChores(prev => ({ ...prev, [chore.key]: !prev[chore.key] }))}
                      className={`flex justify-between items-center p-4 cursor-pointer transition-colors hairline-box ${
                        isDone ? 'bg-[#08080a] border-emerald-500/30' : 'bg-[#08080a] hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <button 
                          className={`w-6 h-6 flex items-center justify-center border transition-all ${
                            isDone ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-white/30 bg-transparent'
                          }`}
                        >
                          {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>
                        <div>
                          <div className={`text-sm md:text-base font-medium ${isDone ? 'line-through text-neutral-500' : 'text-white'}`}>
                            {chore.title}
                          </div>
                          <div className="text-xs text-neutral-400 mt-0.5 font-mono">
                            Assigned to {chore.assignee} • Due {chore.day}
                          </div>
                        </div>
                      </div>

                      <span className={`font-mono text-xs font-bold uppercase tracking-wider ${isDone ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isDone ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 3: COMPATIBILITY RADAR */}
          {activeTab === 'match' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="font-mono text-xs text-purple-400 font-bold uppercase tracking-wider">
                    LIFESTYLE ALGORITHM
                  </span>
                  <h3 className="text-2xl md:text-3xl font-serif text-white mt-1">
                    Roommate Compatibility Matcher
                  </h3>
                  <p className="text-sm md:text-base text-neutral-300 font-light mt-2 leading-relaxed">
                    Slide your personal lifestyle preferences to calculate your roommate compatibility index in real time.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Cleanliness */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-neutral-300">
                      <span>01 / Cleanliness Standard</span>
                      <span className="text-white font-bold">{cleanliness}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={cleanliness}
                      onChange={(e) => setCleanliness(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/20 appearance-none cursor-pointer accent-white"
                    />
                  </div>

                  {/* Sleep Schedule */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-neutral-300">
                      <span>02 / Sleep Schedule Alignment</span>
                      <span className="text-white font-bold">{sleepSchedule}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={sleepSchedule}
                      onChange={(e) => setSleepSchedule(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/20 appearance-none cursor-pointer accent-white"
                    />
                  </div>

                  {/* Social vs Sanctuary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-neutral-300">
                      <span>03 / Social vs Sanctuary Priority</span>
                      <span className="text-white font-bold">{socialBattery}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={socialBattery}
                      onChange={(e) => setSocialBattery(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/20 appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#08080a] p-8 hairline-box flex flex-col justify-between text-center space-y-6">
                <div>
                  <div className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
                    COMPUTED HARMONY INDEX
                  </div>
                  <div className="text-6xl font-serif font-light text-white mt-2">
                    {calculatedHarmony}%
                  </div>
                  <p className="text-xs text-emerald-400 font-mono uppercase mt-1 font-bold">
                    HIGH COMPATIBILITY MATCH
                  </p>
                </div>

                <div className="font-mono text-xs text-neutral-300 space-y-2 text-left border-t border-white/10 pt-4">
                  <div className="flex justify-between">
                    <span>Cleanliness Fit:</span>
                    <span className="text-white font-bold">Excellent</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Circadian Alignment:</span>
                    <span className="text-white font-bold">Synchronized</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dispute Probability:</span>
                    <span className="text-emerald-400 font-bold">&lt; 1.2%</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/register')}
                  data-cursor="JOIN"
                  className="w-full py-3.5 bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
                >
                  Find Matching Roommates
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: DIGITAL HOUSE RULES */}
          {activeTab === 'rules' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="font-mono text-xs text-blue-400 font-bold uppercase tracking-wider">
                    DIGITAL CONSTITUTION
                  </span>
                  <h3 className="text-2xl md:text-3xl font-serif text-white mt-1">
                    Clear House Rules Everyone Agrees To
                  </h3>
                  <p className="text-sm md:text-base text-neutral-300 font-light mt-2 leading-relaxed">
                    Set up digital house guidelines on move-in day. All roommates tap to agree, establishing total mutual respect and transparency from day one.
                  </p>
                </div>

                <div className="p-6 bg-[#08080a] hairline-box space-y-2 font-mono text-xs">
                  <div className="text-emerald-400 font-bold">✓ 100% OF RESIDENTS HAVE SIGNED</div>
                  <div className="text-neutral-400">Last updated: October 2026 • Verified on RoomiQ</div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-3">
                {[
                  { title: 'Quiet Hours: 23:00 - 07:00', desc: 'Headphones required in common spaces after 11 PM.' },
                  { title: 'Overnight Guests: 24h Advance Notice', desc: 'Quick heads-up on the house board before having visitors stay over.' },
                  { title: 'Sink Zero-Dishes Policy', desc: 'Dishes must be placed in the dishwasher immediately after meals.' },
                  { title: 'Shared Supplies Budget', desc: 'Paper towels, soap, and olive oil auto-split from communal fund.' }
                ].map((rule, idx) => (
                  <div key={idx} className="p-4 bg-[#08080a] hairline-box flex items-start gap-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm md:text-base font-medium text-white">{rule.title}</div>
                      <div className="text-xs text-neutral-400 mt-1">{rule.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. HIGH-CONTRAST INVERTING PROTOCOL ROWS                       */}
      {/* ------------------------------------------------------------- */}
      <section id="protocols" className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto hairline-t">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          <div className="md:col-span-4 space-y-4">
            <div className="font-mono text-xs text-neutral-400 tracking-[0.2em] uppercase font-semibold">
              [04] / HOUSEHOLD STANDARDS
            </div>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-white">
              The 5 Ground Rules of <br />
              <span className="font-serif italic text-neutral-200">Zero-Drama Living</span>
            </h2>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              Standardized agreements built into RoomiQ to guarantee quiet, cleanliness, and financial peace.
            </p>
          </div>

          <div className="md:col-span-8">
            <div className="divide-y divide-white/10 hairline-box">
              {[
                { code: '01', title: 'Automated 48-Hour Bill Settlement', category: 'Financial Solvency', spec: 'No roommate ever waits more than 48 hours for shared expense reimbursement' },
                { code: '02', title: 'Verified Chore Streak Protocol', category: 'Household Cleanliness', spec: 'Rotated cleaning checklist with transparent green-tick completion' },
                { code: '03', title: 'Circadian Quiet Hours Buffer', category: 'Acoustic Peace', spec: 'Automated 23:00 - 07:00 quiet hours notification across house devices' },
                { code: '04', title: 'Digital House Noticeboard', category: 'Guest Transparency', spec: 'Instant 24-hour advance digital notice for gatherings and visitors' },
                { code: '05', title: 'Lease Solvency & Sublet Matcher', category: 'Roommate Transition', spec: 'Find vetted, lifestyle-compatible replacement roommates seamlessly' }
              ].map((row, idx) => (
                <div
                  key={idx}
                  data-cursor="INSPECT"
                  className="invert-row p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer group"
                >
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-xs text-neutral-400 group-hover:text-black font-bold tracking-widest transition-colors">
                      [{row.code}]
                    </span>
                    <div>
                      <h3 className="text-lg md:text-xl font-medium tracking-tight text-white group-hover:text-black transition-colors">
                        {row.title}
                      </h3>
                      <p className="text-xs text-neutral-400 group-hover:text-neutral-700 font-mono transition-colors mt-0.5">
                        {row.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right w-full md:w-auto justify-between md:justify-end">
                    <span className="text-xs text-neutral-300 group-hover:text-black font-mono transition-colors">
                      {row.spec}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-white group-hover:text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. CURATED RESIDENCES: 4-COLUMN STAGGERED GRID                */}
      {/* ------------------------------------------------------------- */}
      <section id="spaces" className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto hairline-t">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <div className="font-mono text-xs text-neutral-400 tracking-[0.2em] uppercase mb-3 font-semibold">
              [05] / REAL CO-LIVING RESIDENCES
            </div>
            <h2 className="text-3xl sm:text-5xl font-normal tracking-tight text-white">
              Homes Powered by <span className="font-serif italic text-neutral-200">RoomiQ</span>
            </h2>
          </div>
          <p className="text-base text-neutral-300 max-w-md font-light">
            Real roommate communities living in seamless financial and chore harmony.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ARCHITECTURAL_SPACES.map((space, idx) => {
            const staggerClasses = ['lg:mt-0', 'lg:mt-8', 'lg:mt-16', 'lg:mt-4']
            return (
              <motion.div
                key={space.id}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4, ease: [0.17, 0.84, 0.44, 1] }}
                data-cursor="VIEW"
                className={`group hairline-box bg-[#0c0c10] overflow-hidden flex flex-col justify-between cursor-pointer ${staggerClasses[idx % 4]}`}
                onClick={() => navigate('/register')}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={space.image}
                    alt={space.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.17,0.84,0.44,1)]"
                  />
                  <div className="absolute top-3 right-3 bg-[#08080a]/90 backdrop-blur-sm px-3 py-1 font-mono text-xs text-white font-bold">
                    {space.matchScore}% HARMONY
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="font-mono text-xs text-neutral-400 tracking-wider uppercase mb-1 font-semibold">
                      {space.location} • {space.residents}
                    </div>
                    <h3 className="font-serif text-xl font-normal text-white group-hover:text-amber-200 transition-colors">
                      {space.title}
                    </h3>
                    <p className="text-xs text-neutral-300 mt-2 font-light line-clamp-2">
                      {space.description}
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-4 font-mono text-xs text-neutral-400 space-y-1">
                    <p>{space.specs}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. PROVEN METRICS & STATS TABLE                               */}
      {/* ------------------------------------------------------------- */}
      <section className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto hairline-t">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="p-8 hairline-box bg-[#0c0c10] space-y-3" data-cursor="0.0%">
            <div className="font-mono text-xs text-neutral-400 tracking-widest uppercase font-semibold">01 / DISPUTE RATE</div>
            <div className="text-5xl font-serif font-light text-white">0.0%</div>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              Monetary and chore arguments eliminated through automated ledger calculations.
            </p>
          </div>

          <div className="p-8 hairline-box bg-[#0c0c10] space-y-3" data-cursor="$2.8M">
            <div className="font-mono text-xs text-neutral-400 tracking-widest uppercase font-semibold">02 / SETTLED TOTAL</div>
            <div className="text-5xl font-serif font-light text-white">$2.8M+</div>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              In shared rent, groceries, and utilities settled transparently across modern co-living homes.
            </p>
          </div>

          <div className="p-8 hairline-box bg-[#0c0c10] space-y-3" data-cursor="99.4%">
            <div className="font-mono text-xs text-neutral-400 tracking-widest uppercase font-semibold">03 / CHORE FIDELITY</div>
            <div className="text-5xl font-serif font-light text-white">99.4%</div>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              On-time chore completion rate with our autonomous schedule rotation.
            </p>
          </div>

          <div className="p-8 hairline-box bg-[#0c0c10] space-y-3" data-cursor="4.9/5">
            <div className="font-mono text-xs text-neutral-400 tracking-widest uppercase font-semibold">04 / HARMONY RATING</div>
            <div className="text-5xl font-serif font-light text-white">4.9/5</div>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              Average resident satisfaction score across verified RoomiQ roommate pairings.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 10. EDITORIAL FAQ ACCORDION                                   */}
      {/* ------------------------------------------------------------- */}
      <section id="faq" className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto hairline-t">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-4">
            <div className="font-mono text-xs text-neutral-400 tracking-[0.2em] uppercase mb-3 font-semibold">
              [06] / FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-white">
              Common Questions <br />
              <span className="font-serif italic text-neutral-200">About RoomiQ</span>
            </h2>
            <p className="text-sm text-neutral-300 font-light mt-4 leading-relaxed">
              Everything you need to know about setting up a harmonious, dispute-free shared residence on RoomiQ.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-4">
            {[
              {
                index: '01',
                question: 'Can I use RoomiQ with my existing roommates right now?',
                answer: 'Yes! One roommate simply creates a House profile and shares a private invite link. Once joined, your house immediately has access to the split bill ledger, rotating chore board, shared noticeboard, and house constitution.'
              },
              {
                index: '02',
                question: 'How does the RoomiQ compatibility algorithm work?',
                answer: 'Our engine evaluates four key behavioral vectors: Circadian Rhythms (sleep & wake schedules), Cleanliness Standards, Social vs. Sanctuary Priorities, and Financial Expense Rigor to produce a weighted synchronicity score.'
              },
              {
                index: '03',
                question: 'How does debt simplification prevent payment arguments?',
                answer: 'Instead of Person A paying Person B who owes Person C, our mathematical graph solver reduces multi-roommate debts into the absolute minimum direct payments. Everyone sees exactly what they owe in real time.'
              },
              {
                index: '04',
                question: 'Is RoomiQ completely free to use?',
                answer: 'Yes! The entire RoomiQ roommate suite—including expense tracking, chore rotation, house noticeboard, and roommate matching—is 100% free with zero hidden fees.'
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                className="hairline-box bg-[#0c0c10] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  data-cursor="EXPAND"
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-xs text-neutral-400 tracking-widest font-bold">{faq.index} /</span>
                    <span className="text-base md:text-lg font-medium text-white">{faq.question}</span>
                  </div>
                  <span className={`font-mono text-xs text-neutral-400 transform transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-white' : ''}`}>
                    [+]
                  </span>
                </button>

                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 text-base text-neutral-300 font-light leading-relaxed border-t border-white/5 pt-4"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 11. MONOLITHIC CALL TO ACTION                                 */}
      {/* ------------------------------------------------------------- */}
      <section className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto hairline-t text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="font-mono text-xs text-neutral-400 tracking-[0.25em] uppercase font-semibold">
            GET STARTED IN 60 SECONDS • 100% FREE
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-[1.05] text-white">
            Transform your household into <br />
            <span className="font-serif italic text-neutral-200">a sanctuary of peace.</span>
          </h2>

          <p className="text-lg md:text-xl text-neutral-300 font-light max-w-2xl mx-auto leading-relaxed">
            Join thousands of roommates who have eliminated awkward arguments, unfair chores, and messy spreadsheets.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button
              onClick={() => navigate('/register')}
              data-cursor="JOIN"
              className="w-full sm:w-auto px-10 py-5 bg-white text-black font-mono text-xs tracking-wider uppercase font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-3 shadow-2xl"
            >
              <span>Create Free House Account</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/login')}
              data-cursor="DEMO"
              className="w-full sm:w-auto px-10 py-5 bg-white/10 border border-white/20 hover:bg-white/20 font-mono text-xs tracking-wider uppercase text-white font-semibold transition-colors"
            >
              Explore Live House Demo
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 12. TECHNICAL ARCHITECTURAL FOOTER                            */}
      {/* ------------------------------------------------------------- */}
      <footer className="hairline-t bg-[#060608] py-16 px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 hairline-b">
          
          <div className="md:col-span-5 space-y-6">
            <div className="font-serif text-3xl tracking-tight text-white">RoomiQ</div>
            <p className="text-sm text-neutral-400 font-light leading-relaxed max-w-sm">
              The operating system for modern shared living. Designed to foster harmony, financial transparency, and chore synchronization.
            </p>
            <div className="font-mono text-xs text-neutral-400 tracking-wider uppercase">
              SYSTEM STATUS: <span className="text-emerald-400 font-bold">ONLINE & OPERATIONAL</span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 font-mono text-xs">
            <div className="text-neutral-400 uppercase tracking-widest font-bold">Platform</div>
            <ul className="space-y-2.5 text-neutral-300">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#rhythm" className="hover:text-white transition-colors">24/7 Rhythm</a></li>
              <li><a href="#suite" className="hover:text-white transition-colors">House Suite</a></li>
              <li><a href="#protocols" className="hover:text-white transition-colors">House Rules</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4 font-mono text-xs">
            <div className="text-neutral-400 uppercase tracking-widest font-bold">Security</div>
            <ul className="space-y-2.5 text-neutral-300">
              <li><a href="#" className="hover:text-white transition-colors">Data Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">House Constitution</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community Standards</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-4 font-mono text-xs">
            <div className="text-neutral-400 uppercase tracking-widest font-bold">Global Hubs</div>
            <p className="text-neutral-300 text-xs leading-relaxed">
              New York • London • Tokyo • Berlin • Amsterdam • San Francisco
            </p>
            <div className="pt-2 text-neutral-400 text-xs">
              ROOMIQ RESIDENTIAL SYSTEM 2026
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-xs text-neutral-400">
          <div>
            © {new Date().getFullYear()} RoomiQ Inc. All rights reserved.
          </div>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            data-cursor="TOP"
            className="hover:text-white transition-colors uppercase font-bold"
          >
            [BACK TO TOP ↑]
          </button>
        </div>
      </footer>

    </div>
  )
}
