import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Badge } from '../components/ui'
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const DEMO_ACCOUNTS = [
  { name: 'Rafiq Ahmed', role: 'House Admin', email: 'rafiq@test.com', desc: 'Mirpur Nest Manager', icon: '👑' },
  { name: 'Aisha Rahman', role: 'Resident', email: 'aisha@test.com', desc: 'Active Roommate', icon: '🏠' },
  { name: 'Farhan Kabir', role: 'Resident', email: 'farhan@test.com', desc: 'Active Roommate', icon: '🏠' },
  { name: 'Kamil Hossain', role: 'Free Agent', email: 'kamil@test.com', desc: 'Looking for a House', icon: '🔍' },
]

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

  const handleLoginSubmit = async (customEmail, customPassword) => {
    const emailToUse = customEmail || form.email
    const passwordToUse = customPassword || form.password

    if (!customEmail && !validate()) return
    setLoading(true)
    try {
      const user = await login(emailToUse, passwordToUse)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      navigate(user.currentHouse ? '/app/dashboard' : '/house-setup')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleLoginSubmit() }

  const handleQuickDemoLogin = (email) => {
    setForm({ email, password: 'password123' })
    handleLoginSubmit(email, 'password123')
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-obsidian relative overflow-hidden text-white font-body">
      
      {/* ========================================================= */}
      {/* LEFT COLUMN: BRANDING & PRODUCT SHOWCASE (5 cols) */}
      {/* ========================================================= */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 xl:p-16 relative z-10 border-r border-glass-border bg-white/[0.01] backdrop-blur-2xl">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-accent-purple/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-accent-orange/20 rounded-full blur-[130px] pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-accent-purple to-accent-orange flex items-center justify-center text-white text-base shadow-glow">
              R
            </div>
            <span>Roomi<span className="text-accent-orange">Q</span></span>
          </Link>

          <div className="mt-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple font-label-caps text-[10px] uppercase tracking-wider">
              <Sparkles size={12} className="animate-pulse text-accent-orange" /> Smart Shared Living Platform
            </div>

            <h1 className="font-display text-5xl font-bold text-white tracking-tight leading-[1.1]">
              Shared living,<br />
              <span className="text-gradient">reimagined.</span>
            </h1>

            <p className="font-body text-base text-primary-muted max-w-sm leading-relaxed">
              Track shared expenses, automate chore duties, and resolve disputes without the awkward conversations.
            </p>
          </div>
        </div>

        {/* Testimonial Bento */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden z-10 border-white/10 space-y-4">
          <p className="text-sm text-white/90 leading-relaxed">
            "RoomiQ transformed our 5-person apartment. Expenses are auto-split, chore rotations are clear, and everyone stays accountable."
          </p>
          
          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-orange to-accent-purple flex items-center justify-center text-white font-bold text-xs shadow-inner">
              RN
            </div>
            <div>
              <div className="text-xs font-bold text-white">Rafiq Ahmed</div>
              <div className="text-[10px] text-primary-muted font-mono">Mirpur Nest House Admin</div>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 flex items-center justify-between text-xs text-primary-muted">
          <span>© 2026 RoomiQ Platform</span>
          <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-accent-emerald" /> 256-bit Encrypted</span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: LOGIN FORM & FAST DEMO LAUNCHER (7 cols) */}
      {/* ========================================================= */}
      <div className="lg:col-span-7 flex flex-col justify-center p-6 sm:p-10 lg:p-16 xl:p-20 relative z-10 overflow-y-auto">
        
        {/* Background Ambient Orbs */}
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-accent-orange/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-accent-purple/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-[440px] mx-auto space-y-8 relative z-10">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 font-display text-3xl font-bold">
              Roomi<span className="text-accent-orange">Q</span>
            </Link>
            <p className="text-xs text-primary-muted font-label-caps uppercase tracking-wider">Welcome back to your house</p>
          </div>

          {/* Form Header */}
          <div className="hidden lg:block space-y-1">
            <h2 className="font-display text-3xl font-bold text-white tracking-tight">Sign In to RoomiQ</h2>
            <p className="text-sm text-primary-muted">Enter your credentials or click any demo account below.</p>
          </div>

          {/* Login Form Bento Card */}
          <div className="bento-card rounded-3xl p-6 sm:p-8 space-y-5 border-white/10 shadow-2xl">
            
            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="rafiq@test.com"
                value={form.email}
                onChange={set('email')}
                onKeyDown={handleKeyDown}
                error={errors.email}
                icon={<Mail size={17} />}
                className="bg-white/5 border-glass-border text-white text-sm"
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
                  icon={<Lock size={17} />}
                  className="bg-white/5 border-glass-border text-white text-sm pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3.5 top-[38px] text-primary-muted hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <Button
                onClick={() => handleLoginSubmit()}
                loading={loading}
                fullWidth
                size="lg"
                className="bg-gradient-to-r from-accent-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-sm shadow-glow mt-2"
              >
                Sign In →
              </Button>
            </div>

            {/* Fast-Pass Seeded Demo Accounts */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-[10px] uppercase tracking-widest text-primary-muted flex items-center gap-1.5">
                  <Zap size={13} className="text-accent-orange" /> 1-Click Demo Launcher
                </span>
                <span className="text-[10px] text-primary-muted font-mono">pw: password123</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => handleQuickDemoLogin(acc.email)}
                    disabled={loading}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-glass-border text-left transition-all group flex flex-col justify-between hover:border-accent-orange/40 hover:shadow-glow"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{acc.icon}</span>
                      <span className="text-[9px] font-label-caps uppercase px-1.5 py-0.5 rounded-full bg-white/5 text-primary-muted group-hover:text-accent-orange">
                        {acc.role}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-bold text-white group-hover:text-accent-orange transition-colors truncate">
                        {acc.name}
                      </div>
                      <div className="text-[10px] text-primary-muted font-mono truncate opacity-60">
                        {acc.email}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Footer Registration Link */}
          <p className="text-center text-sm text-primary-muted">
            Don't have an account yet?{' '}
            <Link 
              to="/register" 
              className="text-white font-bold hover:text-accent-orange transition-colors underline decoration-white/30 underline-offset-4 hover:decoration-accent-orange"
            >
              Create Account
            </Link>
          </p>

        </div>

      </div>

    </div>
  )
}
