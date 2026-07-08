import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function LandingPage() {
  const navigate = useNavigate()
  const trackRef = useRef(null)
  const [openFaq, setOpenFaq] = useState(null)


  // Drag interaction for Testimonials Slider
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let isDown = false
    let startX
    let scrollLeft

    const handleMouseDown = (e) => {
      isDown = true
      startX = e.pageX - track.offsetLeft
      scrollLeft = track.scrollLeft
    }
    const handleMouseLeave = () => { isDown = false }
    const handleMouseUp = () => { isDown = false }
    const handleMouseMove = (e) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - track.offsetLeft
      const walk = (x - startX) * 2
      track.scrollLeft = scrollLeft - walk
    }

    track.addEventListener('mousedown', handleMouseDown)
    track.addEventListener('mouseleave', handleMouseLeave)
    track.addEventListener('mouseup', handleMouseUp)
    track.addEventListener('mousemove', handleMouseMove)

    return () => {
      track.removeEventListener('mousedown', handleMouseDown)
      track.removeEventListener('mouseleave', handleMouseLeave)
      track.removeEventListener('mouseup', handleMouseUp)
      track.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="bg-transparent min-h-screen font-body text-white overflow-x-hidden relative">
      
      {/* Ambient Shader Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40" />

      {/* Top Navigation Bar */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-50">
        <nav className="glass-panel rounded-full flex justify-between items-center px-8 py-3 shadow-[0_0_40px_rgba(138,43,226,0.15)]">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-accent-purple to-accent-orange flex items-center justify-center text-white text-[16px] font-bold shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              R
            </div>
            <span className="font-display text-xl font-bold tracking-tighter">RoomiQ</span>
          </div>
          <div className="hidden md:flex items-center gap-12">
            <a className="font-body font-bold hover:text-accent-orange transition-colors duration-300" href="#features">Features</a>
            <a className="font-body text-primary-muted hover:text-accent-orange transition-colors duration-300" href="#how-it-works">How it Works</a>
            <a className="font-body text-primary-muted hover:text-accent-orange transition-colors duration-300" href="#testimonials">Testimonials</a>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/login')} className="font-body text-primary-muted hover:text-white transition-colors">Sign In</button>
            <button onClick={() => navigate('/register')} className="bg-accent-purple text-white px-6 py-2.5 rounded-full font-bold hover:scale-105 active:scale-95 transition-transform shadow-glass">
              Get Started
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 pt-40">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 space-y-6">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-orange font-label-caps">
              <span className="mr-2 text-accent-orange animate-pulse">●</span> ROOMIQ MATCHING NOW LIVE
            </div>
            <h1 className="font-display text-5xl md:text-[72px] font-bold leading-[1.05] text-gradient tracking-tight">
              The smarter way to share a home.
            </h1>
            <p className="font-body text-lg md:text-xl text-primary-muted max-w-md">
              Say goodbye to awkward money conversations and chore disputes. Discover highly compatible homes, automate your chores, and instantly settle shared expenses.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <button onClick={() => navigate('/register')} className="bg-accent-purple text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-glass">
                Find Your House
              </button>
            </div>
          </div>
          
          <div className="md:col-span-6 relative h-[500px]">
             {/* Compatibility Card */}
             <motion.div 
               initial={{ opacity: 0, x: 50, y: 20 }}
               animate={{ opacity: 1, x: 0, y: 0 }}
               transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
               className="absolute left-1/2 md:left-auto md:right-0 top-10 -translate-x-1/2 md:translate-x-0 w-[90%] md:w-full max-w-[420px] bg-glass border border-glass-border rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-3xl p-8 flex flex-col justify-between overflow-hidden"
             >
                {/* Perpetual gradient sweep */}
                <motion.div 
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]"
                />

                <div className="relative z-10">
                  <div className="font-label-caps text-accent-orange mb-3 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse"></span>
                    THE COMPATIBILITY ENGINE
                  </div>
                  <div className="font-display text-[64px] text-white font-bold leading-none mb-3">94% Fit</div>
                  <p className="text-primary-muted text-[15px] mb-8 leading-relaxed">Analyzing sleep schedules, cleanliness levels, and social habits to find your perfect match.</p>
                  
                  <div className="space-y-5 mb-8">
                     <div>
                       <div className="flex justify-between text-xs text-white mb-2"><span className="font-bold">Cleanliness Alignment</span><span className="text-accent-orange">98%</span></div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '98%' }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-accent-orange rounded-full" /></div>
                     </div>
                     <div>
                       <div className="flex justify-between text-xs text-white mb-2"><span className="font-bold">Sleep Schedule</span><span className="text-accent-purple">88%</span></div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '88%' }} transition={{ duration: 1, delay: 0.7 }} className="h-full bg-accent-purple rounded-full" /></div>
                     </div>
                     <div>
                       <div className="flex justify-between text-xs text-white mb-2"><span className="font-bold">Social Battery</span><span className="text-accent-emerald">94%</span></div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 1, delay: 0.9 }} className="h-full bg-accent-emerald rounded-full" /></div>
                     </div>
                  </div>
                </div>

                <div className="flex relative z-10 items-center justify-center pt-6 border-t border-white/10 mt-auto">
                   <div className="flex items-center ml-10">
                     {[1, 2, 3].map((i) => (
                       <div key={i} className="w-12 h-12 rounded-full bg-obsidian border-2 border-white/10 relative z-10 shadow-lg flex items-center justify-center font-bold text-white/50" style={{ transform: `translateX(-${i * 15}px)` }}>
                         R{i}
                       </div>
                     ))}
                     <div className="w-14 h-14 rounded-full bg-accent-purple flex items-center justify-center text-white font-bold border-2 border-obsidian relative z-20 shadow-[0_0_20px_rgba(138,43,226,0.4)]" style={{ transform: `translateX(-45px)` }}>You</div>
                   </div>
                   <div className="text-xs text-primary-muted font-medium ml-[-20px]">Joining House...</div>
                </div>
             </motion.div>
             
             {/* Backglow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent-orange/10 blur-[100px] rounded-full z-0 pointer-events-none"></div>
          </div>
        </section>

        {/* Feature Marquee */}
        <section className="py-12 border-y border-glass-border bg-transparent overflow-hidden">
          <div className="animate-marquee gap-16 items-center">
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">Split Groceries</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">•</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">Track Chores</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">•</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">Find Roommates</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">•</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">Settle Debts</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">•</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">Set Rules</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">•</span>
            {/* Duplicate for seamless loop */}
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">Split Groceries</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">•</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">Track Chores</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">•</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">Find Roommates</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">•</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">Settle Debts</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">•</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">Set Rules</span>
            <span className="font-display text-2xl font-bold text-white/30 uppercase tracking-widest px-8">•</span>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Everything your home needs.</h2>
              <p className="font-body text-lg text-primary-muted">We built RoomiQ to eliminate disputes, automate the boring stuff, and help you focus on actually enjoying living together.</p>
            </div>
            <div className="pb-2">
              <button className="text-accent-orange font-bold flex items-center gap-1 group">
                Explore all features 
                <span className="group-hover:translate-x-1 transition-transform inline-block ml-1">→</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large Feature Card - Expense Splitting */}
            <div className="md:col-span-8 glass-panel rounded-3xl p-8 dot-grid relative overflow-hidden h-[450px] group interactive">
              <div className="relative z-20 h-full flex flex-col justify-between">
                <div>
                  <svg className="w-10 h-10 text-accent-orange mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <h3 className="font-display text-3xl font-bold mb-2 text-white">Fair Expense Splitting</h3>
                  <p className="text-primary-muted max-w-sm text-lg">Never argue over utility bills or toilet paper again. Add an expense, select who it's split between, and RoomiQ calculates the rest.</p>
                </div>
                <div className="flex -space-x-4 pt-4">
                  <div className="w-12 h-12 rounded-full border-2 border-obsidian bg-white/10 shadow-lg flex items-center justify-center text-xs">J</div>
                  <div className="w-12 h-12 rounded-full border-2 border-obsidian bg-white/10 shadow-lg flex items-center justify-center text-xs">S</div>
                  <div className="w-12 h-12 rounded-full border-2 border-obsidian bg-white/10 shadow-lg flex items-center justify-center text-xs">+</div>
                </div>
              </div>
              {/* Decorative element for card */}
              <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl group-hover:bg-accent-purple/20 transition-colors duration-1000"></div>
            </div>

            {/* Typographic Callout */}
            <div className="md:col-span-4 bg-accent-purple rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_5s_infinite]"></div>
              <span className="font-display text-7xl font-black text-white">0</span>
              <span className="font-label-caps tracking-[0.2em] text-white/80 mt-2">Awkward Chats</span>
              <p className="text-white/70 mt-6 font-medium">Automatic reminders for rent and chores keep the peace.</p>
            </div>

            {/* Small Animated Card */}
            <div className="md:col-span-4 glass-panel rounded-3xl p-8 h-[300px] flex flex-col justify-between interactive">
              <div>
                <h4 className="font-display text-2xl font-bold text-white">Household Balance</h4>
                <p className="text-primary-muted text-sm mt-1">See exactly who owes whom at a glance.</p>
              </div>
              <div className="h-32 w-full flex items-end gap-1.5 px-1 pt-4">
                {[50, 20, 80, 40].map((h, i) => (
                  <div key={i} className="flex-1 bg-accent-orange/20 rounded-t-md hover:bg-accent-orange transition-all cursor-pointer flex justify-center pb-2" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>

            {/* Detailed Card */}
            <div className="md:col-span-8 glass-panel rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center interactive">
              <div>
                <h4 className="font-display text-2xl font-bold mb-2 text-white">Rotating Chores</h4>
                <p className="text-primary-muted">Say goodbye to the passive-aggressive sticky notes. Set a schedule, assign roommates, and the system automatically rotates duties weekly.</p>
                <ul className="mt-6 space-y-3 text-white font-medium">
                  <li className="flex items-center gap-3"><span className="text-accent-orange">✓</span> Auto-rotation</li>
                  <li className="flex items-center gap-3"><span className="text-accent-orange">✓</span> Completion Tracking</li>
                </ul>
              </div>
              <div className="relative h-full min-h-[200px] rounded-2xl bg-obsidian border border-white/5 overflow-hidden flex flex-col p-4 justify-center gap-3">
                 <div className="w-full bg-white/5 rounded-lg p-3 flex justify-between items-center">
                    <div className="flex gap-2 items-center"><div className="w-2 h-2 rounded-full bg-accent-orange"></div> <span className="text-sm">Clean Kitchen</span></div>
                    <span className="text-xs text-primary-muted">Sarah</span>
                 </div>
                 <div className="w-full bg-white/5 rounded-lg p-3 flex justify-between items-center opacity-60">
                    <div className="flex gap-2 items-center"><div className="w-2 h-2 rounded-full bg-accent-purple"></div> <span className="text-sm">Take out Trash</span></div>
                    <span className="text-xs text-primary-muted">John</span>
                 </div>
                 <div className="w-full bg-white/5 rounded-lg p-3 flex justify-between items-center opacity-40">
                    <div className="flex gap-2 items-center"><div className="w-2 h-2 rounded-full bg-accent-emerald"></div> <span className="text-sm">Vacuum Floors</span></div>
                    <span className="text-xs text-primary-muted">Emma</span>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Demo Section */}
        <section id="how-it-works" className="bg-white/5 py-24 relative overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="max-w-7xl mx-auto px-6 text-center mb-12 relative z-10"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">A unified dashboard for your home.</h2>
            <p className="font-body text-lg text-primary-muted max-w-2xl mx-auto">Track expenses, tick off chores, check the noticeboard, and find your next roommate all from one beautiful interface.</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-5xl mx-auto px-6 relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-purple to-accent-orange opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-700"></div>
            <div className="relative glass-panel rounded-t-2xl overflow-hidden border-b-0 shadow-2xl">
              {/* Browser Bar */}
              <div className="bg-obsidian px-6 py-3 flex justify-between items-center border-b border-white/10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="bg-white/5 px-4 py-1.5 rounded-md text-xs text-primary-muted font-mono">roomiq.app/dashboard</div>
                <div className="flex gap-4 opacity-50">
                  <span>⋮</span>
                </div>
              </div>
              {/* Browser Content (Mock) */}
              <div className="aspect-video bg-obsidian relative overflow-hidden">
                {/* Detailed Mock Dashboard UI */}
                <div className="w-full h-full bg-[#0a0a0c] p-6 md:p-8 grid grid-cols-12 gap-6 relative">
                  {/* Sidebar */}
                  <div className="hidden md:flex col-span-3 lg:col-span-2 border-r border-white/5 h-full flex-col gap-6 pt-2">
                     <div className="flex items-center gap-2 mb-4">
                       <div className="w-6 h-6 rounded bg-gradient-to-r from-accent-purple to-accent-orange flex items-center justify-center text-xs font-bold text-white shadow-lg">R</div>
                       <div className="font-display font-bold tracking-tight text-white/90">RoomiQ</div>
                     </div>
                     <div className="space-y-3 flex-1">
                       {['Dashboard', 'Expenses', 'Chores', 'Notices', 'Settings'].map((item, i) => (
                         <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${i === 0 ? 'bg-white/10 text-white font-medium' : 'text-primary-muted hover:bg-white/5 hover:text-white'}`}>
                           <div className={`w-4 h-4 rounded-full ${i === 0 ? 'bg-accent-orange/80' : 'border border-white/20'}`}></div>
                           {item}
                         </div>
                       ))}
                     </div>
                     <div className="flex items-center gap-3 px-3 py-2 mt-auto border-t border-white/5 pt-4">
                       <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">JD</div>
                       <div className="text-xs text-primary-muted">John Doe</div>
                     </div>
                  </div>
                  {/* Main Content */}
                  <div className="col-span-12 md:col-span-9 lg:col-span-10 flex flex-col gap-6 h-full overflow-hidden">
                     {/* Header */}
                     <div className="flex justify-between items-end">
                       <div>
                         <h3 className="font-display text-2xl font-bold text-white">Welcome home, John</h3>
                         <p className="text-sm text-primary-muted">You have 2 chores due today.</p>
                       </div>
                       <div className="flex gap-2">
                         <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5 text-white/50 text-xs">🔔</div>
                       </div>
                     </div>
                     
                     {/* Top Cards */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 relative overflow-hidden group hover:border-white/20 transition-colors">
                           <div className="text-xs font-label-caps text-primary-muted mb-2">My Balance</div>
                           <div className="text-2xl font-display font-bold text-accent-orange group-hover:scale-105 transition-transform origin-left">+$142.50</div>
                           <div className="absolute right-0 bottom-0 w-16 h-16 bg-accent-orange/10 rounded-full blur-xl translate-x-1/2 translate-y-1/2"></div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 relative overflow-hidden group hover:border-white/20 transition-colors">
                           <div className="text-xs font-label-caps text-primary-muted mb-2">House Total</div>
                           <div className="text-2xl font-display font-bold text-white group-hover:scale-105 transition-transform origin-left">$2,450.00</div>
                           <div className="absolute right-0 bottom-0 w-16 h-16 bg-white/5 rounded-full blur-xl translate-x-1/2 translate-y-1/2"></div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 relative overflow-hidden group hover:border-white/20 transition-colors">
                           <div className="text-xs font-label-caps text-primary-muted mb-2">Chores Done</div>
                           <div className="text-2xl font-display font-bold text-accent-purple group-hover:scale-105 transition-transform origin-left">8/12</div>
                           <div className="absolute right-0 bottom-0 w-16 h-16 bg-accent-purple/10 rounded-full blur-xl translate-x-1/2 translate-y-1/2"></div>
                        </div>
                     </div>
                     
                     {/* Bottom Section */}
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1 min-h-0">
                        {/* Chores Feed */}
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex flex-col">
                           <div className="text-sm font-bold text-white mb-4">Upcoming Chores</div>
                           <div className="space-y-3 flex-1 overflow-hidden">
                             {[
                               { task: 'Take out recycling', due: 'Today', color: 'bg-red-500' },
                               { task: 'Clean kitchen counters', due: 'Tomorrow', color: 'bg-accent-orange' },
                               { task: 'Vacuum living room', due: 'Friday', color: 'bg-white/20' }
                             ].map((chore, i) => (
                               <div key={i} className="flex justify-between items-center bg-[#0a0a0c] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                 <div className="flex items-center gap-3">
                                   <div className={`w-3 h-3 rounded-full ${chore.color}`}></div>
                                   <span className="text-sm text-white/90">{chore.task}</span>
                                 </div>
                                 <span className="text-xs text-primary-muted">{chore.due}</span>
                               </div>
                             ))}
                           </div>
                        </div>
                        
                        {/* Expense Chart Mock */}
                        <div className="hidden sm:flex bg-white/5 rounded-2xl p-5 border border-white/5 flex-col">
                           <div className="flex justify-between items-center mb-4">
                             <div className="text-sm font-bold text-white">Expense Breakdown</div>
                             <div className="text-xs text-primary-muted bg-[#0a0a0c] px-2 py-1 rounded border border-white/5">This Month</div>
                           </div>
                           <div className="flex-1 flex items-end gap-2 pb-2 pt-6">
                              {[30, 70, 45, 90, 60, 20, 50].map((h, i) => (
                                <div key={i} className="flex-1 bg-gradient-to-t from-accent-orange/20 to-accent-orange/80 rounded-t-md hover:brightness-125 transition-all cursor-pointer relative group" style={{ height: `${h}%` }}>
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-obsidian text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-white/10 shadow-lg">
                                    ${h * 5}
                                  </div>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
                
                {/* Floating Tooltip Overlay */}
                <div className="absolute top-1/4 right-1/4 p-6 glass-panel rounded-xl shadow-2xl animate-float border-accent-orange/30 backdrop-blur-md">
                  <p className="font-label-caps text-accent-orange mb-2">COMPATIBILITY MATCH</p>
                  <p className="text-4xl font-display font-bold text-white">94% Fit</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Testimonials Slider */}
        <section id="testimonials" className="max-w-7xl mx-auto px-6 py-24 overflow-hidden">
          <h3 className="font-display text-4xl text-center mb-12 font-bold">What Roommates Are Saying</h3>
          <div className="flex gap-6 transition-transform duration-500 cursor-grab active:cursor-grabbing w-full overflow-x-auto pb-8 hide-scrollbars" ref={trackRef}>
            <div className="flex-shrink-0 w-[400px] glass-panel p-8 rounded-3xl relative pointer-events-none select-none">
              <span className="text-white/10 text-8xl font-serif absolute -top-4 right-4">"</span>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold">A</div>
                <div>
                  <p className="font-bold text-white text-lg">Alex M.</p>
                  <p className="text-sm text-primary-muted font-label-caps mt-1">Living in Brooklyn</p>
                </div>
              </div>
              <p className="text-white/80 text-lg leading-relaxed relative z-10">"RoomiQ completely eliminated the awkward 'who bought the toilet paper last' conversations. The balance tracker is a lifesaver."</p>
            </div>
            <div className="flex-shrink-0 w-[400px] glass-panel p-8 rounded-3xl relative pointer-events-none select-none">
              <span className="text-white/10 text-8xl font-serif absolute -top-4 right-4">"</span>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold">T</div>
                <div>
                  <p className="font-bold text-white text-lg">Taylor K.</p>
                  <p className="text-sm text-primary-muted font-label-caps mt-1">House Admin</p>
                </div>
              </div>
              <p className="text-white/80 text-lg leading-relaxed relative z-10">"I used to have to track down three different people for rent. Now, the system sends reminders automatically and tracks who paid what."</p>
            </div>
            <div className="flex-shrink-0 w-[400px] glass-panel p-8 rounded-3xl relative pointer-events-none select-none border-accent-orange/30">
              <span className="text-white/10 text-8xl font-serif absolute -top-4 right-4">"</span>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold">J</div>
                <div>
                  <p className="font-bold text-white text-lg">Jordan P.</p>
                  <p className="text-sm text-primary-muted font-label-caps mt-1">Found roommates via RoomiQ</p>
                </div>
              </div>
              <p className="text-white/80 text-lg leading-relaxed relative z-10">"The compatibility quiz actually works. I joined a public house with a 92% match score and it's the best living situation I've ever had."</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-6 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="font-display text-4xl font-bold mb-4">Frequently Asked Questions</h3>
            <p className="text-primary-muted text-lg">Everything you need to know about the platform.</p>
          </motion.div>
          
          <div className="space-y-4">
            {[
              {
                q: "Is RoomiQ free to use?",
                a: "Yes! RoomiQ's core features—expense splitting, chore tracking, and basic roommate matching—are completely free. We will soon offer a Premium tier for advanced analytics and priority support."
              },
              {
                q: "How does the matching engine work?",
                a: "Our algorithm compares your lifestyle profile (cleanliness, sleep schedule, social battery) against other users. It generates a compatibility percentage to help you find the perfect match."
              },
              {
                q: "Can I use RoomiQ with my current roommates?",
                a: "Absolutely. One person can create a 'House' and simply send a secure invite link to the rest of the roommates. Once they join, you can start tracking expenses and chores immediately."
              },
              {
                q: "How does the expense split calculator work?",
                a: "When you log an expense, you choose who it applies to. RoomiQ's engine automatically calculates the most efficient way to settle all debts in the house, minimizing the number of transactions needed."
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel rounded-2xl overflow-hidden border border-white/5 transition-all"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-bold text-lg text-white">{faq.q}</span>
                  <span className={`text-accent-orange transform transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 text-primary-muted"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="glass-panel p-16 md:p-24 rounded-[3rem] border-accent-purple/20 shadow-glass relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-accent-purple to-accent-orange"></div>
            <div className="relative z-10 space-y-8">
              <h2 className="font-display text-5xl font-bold tracking-tight text-white">Ready for a peaceful home?</h2>
              <p className="font-body text-xl text-primary-muted">Join thousands of roommates sharing their homes the smarter way on RoomiQ.</p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <button onClick={() => navigate('/register')} className="bg-accent-purple text-white px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-all shadow-glass">
                  Create an Account
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-transparent border-t border-glass-border pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2 md:col-span-1 space-y-6">
            <span className="font-display text-3xl text-accent-orange font-bold tracking-tighter">RoomiQ.</span>
            <p className="text-primary-muted font-body max-w-xs leading-relaxed">Built for a smarter, more peaceful shared living experience.</p>
          </div>
          <div className="space-y-6">
            <p className="font-bold text-white">Features</p>
            <ul className="space-y-4 text-primary-muted font-medium">
              <li><a className="hover:text-accent-orange transition-colors" href="#">Expense Splitting</a></li>
              <li><a className="hover:text-accent-orange transition-colors" href="#">Chore Tracking</a></li>
              <li><a className="hover:text-accent-orange transition-colors" href="#">Compatibility Matching</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <p className="font-bold text-white">Resources</p>
            <ul className="space-y-4 text-primary-muted font-medium">
              <li><a className="hover:text-accent-orange transition-colors" href="#">Roommate Guide</a></li>
              <li><a className="hover:text-accent-orange transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-accent-orange transition-colors" href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1 space-y-4">
            <p className="font-bold text-white">Newsletter</p>
            <p className="text-primary-muted text-sm">Get tips on co-living and household management.</p>
            <div className="flex gap-2 pt-2">
              <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm flex-grow focus:outline-none focus:ring-1 focus:ring-accent-orange" placeholder="email@roomiq.app" type="email"/>
              <button className="bg-accent-purple p-3 rounded-xl text-white hover:bg-accent-purple/80 transition-colors">
                →
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-glass-border pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-primary-muted/50">© 2024 RoomiQ Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <a className="text-sm text-primary-muted/50 hover:text-white transition-colors" href="#">Contact</a>
            <a className="text-sm text-primary-muted/50 hover:text-white transition-colors" href="#">Support</a>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbars::-webkit-scrollbar { display: none; }
        .hide-scrollbars { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
