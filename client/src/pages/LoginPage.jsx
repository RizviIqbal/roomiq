import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input } from '../components/ui'
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      navigate(user.currentHouse ? '/app/dashboard' : '/house-setup')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit() }

  const fillDemo = (email) => setForm({ email, password: 'password123' })

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-obsidian relative overflow-hidden">
      {/* Left Panel - Feature Highlight */}
      <div className="hidden lg:flex flex-col justify-between p-12 lg:p-24 relative z-10 border-r border-glass-border overflow-hidden">
        {/* Premium Image Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop" 
            alt="Modern home interior" 
            className="w-full h-full object-cover opacity-40 scale-105 animate-[slow-pan_20s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-obsidian/90 via-obsidian/70 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-80" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-orange/30 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-purple/30 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

        <div className="relative z-10">
          <Link to="/" className="inline-flex font-display font-bold text-2xl items-center gap-3 mb-16 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-accent-purple to-accent-orange flex items-center justify-center text-white text-lg shadow-[0_0_20px_rgba(0,229,255,0.3)]">R</div>
            Roomi<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-accent-purple">Q</span>
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-6xl font-bold leading-[1.1] text-white mb-6 drop-shadow-lg"
          >
            Share a home,<br/>not the stress.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-body text-xl text-white/80 max-w-md drop-shadow-md"
          >
            Log in to manage your house, track shared expenses, and check off your chores for the week.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="bento-card p-8 rounded-[2rem] border border-white/20 bg-black/40 backdrop-blur-xl relative overflow-hidden max-w-lg mt-12 shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-orange to-accent-purple" />
          <p className="font-body text-lg text-white/90 leading-relaxed mb-8">"RoomiQ completely eliminated the awkward 'who bought the toilet paper last' conversations. The balance tracker is an absolute lifesaver."</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-white shadow-inner border border-white/30">AM</div>
            <div>
              <div className="text-white font-bold font-body">Alex M.</div>
              <div className="text-accent-orange text-[10px] font-label-caps tracking-[0.2em] mt-1 drop-shadow-md">Living in Brooklyn</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-col justify-center p-6 lg:p-16 xl:p-24 relative z-10 bg-obsidian overflow-hidden">
        
        {/* Dynamic Abstract Background Layer */}
        <div className="absolute inset-0 z-0 opacity-60">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent-orange/30 rounded-full blur-[120px] mix-blend-screen animate-[spin_20s_linear_infinite]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] bg-accent-purple/30 rounded-full blur-[150px] mix-blend-screen animate-[spin_25s_linear_infinite_reverse]" />
          <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-accent-rose/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        </div>

        {/* Technical Grid Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(circle at center, black, transparent 80%)', WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)' }} 
        />
        
        {/* Noise Texture for Premium Feel */}
        <div className="absolute inset-0 z-0 opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
        
        {/* Darkening Gradient to preserve legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-transparent to-obsidian/80 pointer-events-none z-0" />
        
        <div className="w-full max-w-[420px] mx-auto relative z-10">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-flex font-display font-bold text-4xl items-center gap-2 mb-3">
              Roomi<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-accent-purple">Q</span>
            </Link>
            <div className="font-label-caps text-[10px] uppercase tracking-[0.2em] text-primary-muted">Welcome to your shared home</div>
          </div>

          {/* Form Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="mb-10 hidden lg:block"
          >
            <h2 className="font-display text-4xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="font-body text-primary-muted">Enter your credentials to access your house dashboard.</p>
          </motion.div>

          {/* Form Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
            className="bento-card rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group border border-white/10 bg-black/40 backdrop-blur-3xl overflow-hidden"
          >
            <div className="absolute inset-0 rounded-[32px] ring-1 ring-white/10 group-hover:ring-accent-orange/30 transition-all duration-500 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

            <div className="flex flex-col gap-5 relative z-10">
              <Input
                label="Email Address"
                type="email"
                placeholder="alice@test.com"
                value={form.email}
                onChange={set('email')}
                onKeyDown={handleKeyDown}
                error={errors.email}
                icon={<Mail size={18} />}
                className="bg-black/60 border-white/10 text-white font-body"
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  onKeyDown={handleKeyDown}
                  error={errors.password}
                  icon={<Lock size={18} />}
                  className="bg-black/60 border-white/10 text-white font-body pr-12"
                />
                <button
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-4 top-[36px] text-primary-muted hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button 
                onClick={handleSubmit} 
                loading={loading} 
                fullWidth 
                size="lg" 
                className="mt-4 !rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-shadow text-[15px] font-bold tracking-wide font-body"
              >
                Sign In
              </Button>
            </div>

            <div className="my-8 flex items-center justify-center relative z-10">
              <div className="h-px bg-white/10 flex-1" />
              <span className="px-4 font-label-caps text-[10px] tracking-[0.2em] text-primary-muted uppercase flex items-center gap-2">
                <Sparkles size={12} className="text-accent-purple" /> Seeded Accounts
              </span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              {[
                { name: 'Rafiq (Admin)', email: 'rafiq@test.com' },
                { name: 'Aisha', email: 'aisha@test.com' },
                { name: 'Farhan', email: 'farhan@test.com' },
                { name: 'Zara', email: 'zara@test.com' },
                { name: 'Kamil', email: 'kamil@test.com' },
              ].map(a => (
                <button
                  key={a.email}
                  onClick={() => fillDemo(a.email)}
                  className="px-4 py-3 bg-black/40 border border-white/10 rounded-2xl font-label-caps text-[10px] tracking-[0.1em] uppercase text-primary-muted hover:border-accent-orange/50 hover:bg-accent-orange/10 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all text-left group/btn"
                >
                  <div className="text-white font-body font-bold group-hover/btn:text-accent-orange transition-colors">{a.name}</div>
                  <div className="mt-1 opacity-60 text-[9px] font-mono">{a.email}</div>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-10 font-body text-[15px] text-primary-muted"
          >
            New to RoomiQ?{' '}
            <Link to="/register" className="text-white font-bold hover:text-accent-orange transition-colors underline decoration-white/30 underline-offset-4 hover:decoration-accent-orange">
              Create an account
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  )
}
