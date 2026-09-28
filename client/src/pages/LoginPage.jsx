import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Home, 
  CheckCircle2, 
  RotateCw,
  Users,
  CreditCard,
  Clock,
  Check
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

// Curated resident showcase avatars
const SHOWCASE_AVATARS = [
  { name: 'Resident 1', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { name: 'Resident 2', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { name: 'Resident 3', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Resident 4', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' }
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)


  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }))
  }

  // Strict email format validation
  const validateEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())
  }

  const validate = () => {
    const e = {}
    if (!form.email.trim()) {
      e.email = 'Email address is required'
    } else if (!validateEmail(form.email.trim())) {
      e.email = 'Please enter a valid email format'
    }

    if (!form.password) {
      e.password = 'Password is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleLoginSubmit = async (customEmail, customPassword) => {
    const emailToUse = customEmail || form.email
    const passwordToUse = customPassword || form.password

    if (!customEmail && !validate()) return
    setLoading(true)

    try {
      const user = await login(emailToUse.trim().toLowerCase(), passwordToUse)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      if (user.currentHouse) {
        navigate('/dashboard')
      } else {
        navigate('/house-setup')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password. Please try again.')
      setErrors({ auth: 'Authentication failed. Please verify your email and password.' })
    } finally {
      setLoading(false)
    }
  }



  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLoginSubmit()
    }
  }

  return (
    <div className="min-h-screen bg-obsidian text-white flex flex-col lg:flex-row relative overflow-hidden font-body selection:bg-accent-purple/40 selection:text-white">
      
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] bg-accent-purple/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-accent-orange/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-cyan/10 rounded-full blur-[180px] pointer-events-none" />

      {/* ========================================================= */}
      {/* LEFT COLUMN: EXPANSIVE LIVING HOUSEHOLD SHOWCASE (5 cols)  */}
      {/* ========================================================= */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-5/12 flex-col justify-between p-10 xl:p-14 border-r border-glass-border relative z-10 bg-obsidian/40 backdrop-blur-2xl">
        
        {/* Top Logo & House Status */}
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <span className="font-display text-3xl font-extrabold tracking-tight text-white group-hover:opacity-90 transition-opacity">
              Roomi<span className="text-accent-orange">Q</span>
            </span>
            <span className="font-label-caps text-[10px] text-primary-muted px-3 py-1 rounded-full bg-white/5 border border-glass-border uppercase tracking-widest">
              Shared Living OS
            </span>
          </Link>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald text-xs font-semibold w-fit">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <span>24/7 Household Sync • 100% Operational</span>
          </div>
        </div>

        {/* Spacious Main Info Box */}
        <div className="my-6 space-y-6 flex-1 flex flex-col justify-center">
          <div className="space-y-2">
            <h1 className="font-display text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Shared living, <br />
              <span className="bg-gradient-to-r from-accent-orange via-accent-purple to-accent-cyan bg-clip-text text-transparent">
                in complete harmony.
              </span>
            </h1>
            <p className="text-base text-primary-muted leading-relaxed">
              Automated expense splitting, rotating chore schedules, and quiet hour enforcement for modern roommate communities.
            </p>
          </div>

          {/* Expansive Bento Card - Rich Live Household Metrics */}
          <div className="bento-card rounded-3xl p-6 xl:p-7 border-white/10 space-y-5 shadow-2xl relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-caps text-[10px] text-accent-orange uppercase tracking-widest font-bold">
                  ACTIVE HOUSEHOLD SYNC
                </span>
                <h3 className="font-display text-xl xl:text-2xl font-bold text-white mt-1">
                  Oakwood Co-Living Residence
                </h3>
                <p className="text-xs text-primary-muted mt-0.5">Verified Household • 4 Active Residents</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-accent-emerald/15 border border-accent-emerald/30 text-xs font-mono text-accent-emerald font-bold">
                100% Equilibrium
              </span>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 py-2 border-y border-glass-border">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="text-[10px] text-primary-muted font-label-caps uppercase">Ledger Debt</div>
                <div className="text-accent-emerald font-bold text-base">৳0.00</div>
                <div className="text-[10px] text-accent-emerald/80 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Auto-Settled
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="text-[10px] text-primary-muted font-label-caps uppercase">Chore Fidelity</div>
                <div className="text-accent-cyan font-bold text-base">100%</div>
                <div className="text-[10px] text-accent-cyan/80 flex items-center gap-1">
                  <Clock size={10} /> Kitchen Done
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="text-[10px] text-primary-muted font-label-caps uppercase">Quiet Mode</div>
                <div className="text-accent-purple font-bold text-base">23:00</div>
                <div className="text-[10px] text-accent-purple/80 flex items-center gap-1">
                  <ShieldCheck size={10} /> Zero Noise
                </div>
              </div>
            </div>

            {/* Roommate Stack */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-primary-muted">
                <span>Verified House Members</span>
                <span className="text-white font-medium">4 of 4 Active</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center -space-x-2">
                  {SHOWCASE_AVATARS.map((acc, idx) => (
                    <img
                      key={idx}
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-9 h-9 rounded-full border-2 border-obsidian object-cover shadow-sm"
                    />
                  ))}
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-accent-orange">14-Month Streak</div>
                  <div className="text-[10px] text-primary-muted">0 Disputes Recorded</div>
                </div>
              </div>
            </div>

            {/* Security Highlights */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-primary-muted">
              <div className="flex items-center gap-1.5 text-white/90">
                <Check className="w-3.5 h-3.5 text-accent-emerald" /> NID Verified House
              </div>
              <div className="flex items-center gap-1.5 text-white/90">
                <Check className="w-3.5 h-3.5 text-accent-emerald" /> Digital House Bylaws
              </div>
            </div>
          </div>
        </div>

        {/* Security & Verification Footer */}
        <div className="flex items-center justify-between text-xs text-primary-muted border-t border-glass-border pt-4">
          <span className="flex items-center gap-1.5 text-white/80">
            <ShieldCheck className="w-4 h-4 text-accent-emerald" />
            256-Bit Financial Encryption
          </span>
          <span>SOC-2 Certified</span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: AUTHENTICATION FORM (7 cols)                 */}
      {/* ========================================================= */}
      <div className="w-full lg:w-7/12 xl:w-7/12 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 relative z-10 overflow-y-auto min-h-screen">
        
        {/* Top Bar Header */}
        <div className="flex justify-between items-center pb-6">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <span className="font-display text-2xl font-bold text-white">
              Roomi<span className="text-accent-orange">Q</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-1.5 text-xs text-primary-muted ml-auto">
            <span>Don't have an account yet?</span>
            <Link 
              to="/register" 
              className="text-white hover:text-accent-orange font-bold underline decoration-white/30 underline-offset-4 ml-1 transition-colors"
            >
              Register Here →
            </Link>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-xl w-full mx-auto my-auto space-y-6">
          
          {/* Headline */}
          <div className="space-y-1.5">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Sign In to Your Household
            </h2>
            <p className="text-sm text-primary-muted">
              Enter your credentials to access your household dashboard.
            </p>
          </div>

          {/* Form Bento Card */}
          <div className="bento-card rounded-3xl p-6 sm:p-8 space-y-5 border-white/10 shadow-2xl">
            
            {errors.auth && (
              <div className="p-3.5 rounded-2xl bg-accent-rose/10 border border-accent-rose/30 text-accent-rose text-xs flex items-center gap-2">
                <span>⚠</span>
                <span>{errors.auth}</span>
              </div>
            )}

            {/* Email Field with Live Checkmark */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-xs font-semibold text-primary-muted">
                  Email Address
                </label>
                {validateEmail(form.email) && (
                  <span className="text-xs text-accent-emerald flex items-center gap-1 font-mono">
                    <CheckCircle2 size={12} /> Valid Format
                  </span>
                )}
              </div>
              <div className="relative group">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary-muted group-hover:text-accent-orange transition-colors" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={set('email')}
                  onKeyDown={handleKeyDown}
                  className={`w-full bg-white/5 border rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:bg-white/10 transition-all placeholder:text-white/20 ${
                    errors.email 
                      ? 'border-accent-rose focus:border-accent-rose' 
                      : validateEmail(form.email) 
                        ? 'border-accent-emerald/50 focus:border-accent-emerald' 
                        : 'border-glass-border focus:border-accent-orange'
                  }`}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-accent-rose pl-1 block">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-primary-muted">
                  Password
                </label>
                <span className="text-xs text-primary-muted hover:text-white cursor-pointer transition-colors">
                  Forgot Password?
                </span>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary-muted group-hover:text-accent-orange transition-colors" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-white/5 border border-glass-border rounded-2xl pl-11 pr-11 py-3.5 text-sm text-white focus:outline-none focus:border-accent-orange focus:bg-white/10 transition-all placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-muted hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-accent-rose pl-1 block">{errors.password}</span>
              )}
            </div>

            {/* Gradient Sign-In Button */}
            <button
              onClick={() => handleLoginSubmit()}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-accent-purple via-purple-600 to-accent-orange hover:opacity-95 active:scale-[0.99] text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 mt-2 shadow-glow disabled:opacity-50"
            >
              {loading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In to Household</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Platform Highlights */}
            <div className="pt-5 border-t border-glass-border space-y-3">
              <span className="font-label-caps text-[10px] text-primary-muted uppercase tracking-wider font-bold flex items-center gap-1.5 px-1">
                <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
                Why Households Love RoomiQ
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: CreditCard, label: 'Auto Split Expenses', desc: 'Zero arguments', color: 'text-accent-emerald' },
                  { icon: Clock, label: 'Smart Chore Rotation', desc: 'Fair & automated', color: 'text-accent-purple' },
                  { icon: Users, label: 'Roommate Matching', desc: '8-trait algorithm', color: 'text-accent-orange' },
                ].map((feat, i) => (
                  <motion.div
                    key={feat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-glass-border text-center space-y-2 hover:bg-white/[0.06] hover:border-white/10 transition-all group"
                  >
                    <feat.icon className={`w-5 h-5 mx-auto ${feat.color} group-hover:scale-110 transition-transform`} />
                    <div className="text-xs font-bold text-white">{feat.label}</div>
                    <div className="text-[10px] text-primary-muted">{feat.desc}</div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar Info */}
        <div className="text-center text-xs text-primary-muted pt-6">
          Encrypted Authentication • 24/7 RoomiQ System Verification
        </div>

      </div>

    </div>
  )
}
