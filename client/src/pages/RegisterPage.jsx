import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Badge, Avatar } from '../components/ui'
import { 
  User, Mail, Lock, Phone, EyeOff, Eye, Briefcase, 
  CreditCard, Sparkles, CheckCircle2, ShieldCheck, ArrowRight,
  DollarSign, FileText, ArrowLeft, Heart, Compass
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
]

const BUDGET_PRESETS = [
  { label: '৳8k', value: 8000 },
  { label: '৳12k', value: 12000 },
  { label: '৳15k', value: 15000 },
  { label: '৳20k', value: 20000 },
  { label: '৳25k+', value: 25000 },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: Credentials, 2: Profile & Matching Details

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    occupation: '',
    gender: 'male',
    budgetMax: 12000,
    bkashNumber: '',
    bio: '',
    avatar: AVATAR_PRESETS[0],
    password: '',
    confirm: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Too Weak', color: 'bg-accent-rose' })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  // Calculate password strength dynamically
  useEffect(() => {
    const p = form.password
    let score = 0
    if (p.length >= 6) score += 1
    if (p.length >= 8) score += 1
    if (/[A-Z]/.test(p)) score += 1
    if (/[0-9]/.test(p)) score += 1
    if (/[^A-Za-z0-9]/.test(p)) score += 1

    let label = 'Too Weak'
    let color = 'bg-accent-rose'

    if (p.length === 0) {
      score = 0
      label = ''
      color = 'bg-white/10'
    } else if (score <= 2) {
      label = 'Weak'
      color = 'bg-accent-rose'
    } else if (score === 3 || score === 4) {
      label = 'Good'
      color = 'bg-accent-orange'
    } else if (score >= 5) {
      label = 'Strong'
      color = 'bg-accent-emerald'
    }

    setPasswordStrength({ score, label, color })
  }, [form.password])

  // Validate Step 1
  const validateStep1 = () => {
    const e = {}
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (!form.name.trim()) e.name = 'Full name is required'
    
    if (!form.email) {
      e.email = 'Email address is required'
    } else if (!emailRegex.test(form.email)) {
      e.email = 'Please enter a valid email address'
    }

    if (!form.phone.trim()) {
      e.phone = 'Phone number is required'
    }

    if (form.password.length < 6) {
      e.password = 'Password must be at least 6 characters'
    }

    if (form.password !== form.confirm) {
      e.confirm = 'Passwords do not match'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNextStep = (e) => {
    if (e) e.preventDefault()
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!validateStep1()) {
      setStep(1)
      return
    }

    setLoading(true)
    try {
      // Normalize phone number format
      let formattedPhone = form.phone.trim()
      if (formattedPhone.startsWith('+880')) {
        // already formatted
      } else if (formattedPhone.startsWith('0')) {
        formattedPhone = '+880' + formattedPhone.substring(1)
      } else {
        formattedPhone = '+880' + formattedPhone
      }

      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: formattedPhone,
        occupation: form.occupation.trim() || 'Roommate',
        gender: form.gender,
        budgetMax: Number(form.budgetMax) || 12000,
        bkashNumber: form.bkashNumber.trim(),
        bio: form.bio.trim(),
        avatar: form.avatar
      })

      toast.success('🎉 Welcome to RoomiQ! Complete your lifestyle quiz to find matches.')
      navigate('/quiz')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-obsidian relative overflow-hidden text-white font-body">
      
      {/* ========================================================= */}
      {/* LEFT COLUMN: BRANDING & LIVE PROFILE PREVIEW (5 cols) */}
      {/* ========================================================= */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 xl:p-16 relative z-10 border-r border-glass-border bg-white/[0.01] backdrop-blur-2xl">
        
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-accent-orange/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-accent-purple/20 rounded-full blur-[130px] pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-accent-purple to-accent-orange flex items-center justify-center text-white text-base shadow-glow">
              R
            </div>
            <span>Roomi<span className="text-accent-orange">Q</span></span>
          </Link>

          <div className="mt-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-accent-orange font-label-caps text-[10px] uppercase tracking-wider">
              <Sparkles size={12} className="animate-pulse" /> Step {step} of 2 • {step === 1 ? 'Credentials' : 'Roommate Profile'}
            </div>

            <h1 className="font-display text-4xl xl:text-5xl font-bold text-white tracking-tight leading-[1.1]">
              Find your ideal<br />
              <span className="text-gradient">living community.</span>
            </h1>

            <p className="font-body text-sm text-primary-muted max-w-sm leading-relaxed">
              Create your profile once. Match with verified roommates, split bills automatically, and track chores in harmony.
            </p>
          </div>
        </div>

        {/* Live Dynamic Roommate Card Preview */}
        <div className="bento-card rounded-3xl p-6 relative overflow-hidden z-10 border-white/10 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between text-[10px] font-label-caps uppercase tracking-wider text-accent-orange">
            <span>Live Profile Preview</span>
            <Badge color="accent" className="text-[9px]">New Member</Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img 
                src={form.avatar} 
                alt="Avatar" 
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-accent-orange/40 shadow-glow" 
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-obsidian" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-display text-base font-bold text-white truncate">
                {form.name.trim() || 'Your Name'}
              </div>
              <div className="text-xs text-primary-muted truncate">
                {form.occupation.trim() || 'Roommate / Student'}
              </div>
              <div className="text-[11px] text-accent-cyan font-mono mt-0.5">
                Budget: ৳{Number(form.budgetMax || 0).toLocaleString()}/mo
              </div>
            </div>
          </div>

          {form.bio && (
            <p className="text-xs text-white/80 bg-white/5 p-3 rounded-xl border border-white/5 line-clamp-2">
              "{form.bio}"
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-primary-muted">
            <span className="capitalize">Gender: {form.gender}</span>
            <span>📱 {form.phone || 'Phone verified'}</span>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 flex items-center justify-between text-xs text-primary-muted">
          <span>© 2026 RoomiQ Platform</span>
          <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-accent-emerald" /> 100% Privacy Protected</span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: DYNAMIC 2-STEP REGISTRATION WIZARD (7 cols) */}
      {/* ========================================================= */}
      <div className="lg:col-span-7 flex flex-col justify-center p-6 sm:p-10 lg:p-12 xl:p-16 relative z-10 overflow-y-auto">
        
        {/* Ambient Glows */}
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-accent-purple/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-accent-orange/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-[540px] mx-auto space-y-6 relative z-10">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 font-display text-3xl font-bold">
              Roomi<span className="text-accent-orange">Q</span>
            </Link>
            <p className="text-xs text-primary-muted font-label-caps uppercase tracking-wider">
              Step {step} of 2 • {step === 1 ? 'Credentials' : 'Roommate Profile'}
            </p>
          </div>

          {/* Stepper Pill Indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(1)}
              className={`flex-1 py-2 rounded-xl text-xs font-label-caps uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                step === 1
                  ? 'bg-accent-orange text-obsidian font-bold shadow-glow'
                  : 'bg-white/5 text-primary-muted border border-white/10 hover:text-white'
              }`}
            >
              <span>1.</span> Account & Security
            </button>

            <button
              onClick={() => {
                if (validateStep1()) setStep(2)
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-label-caps uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                step === 2
                  ? 'bg-accent-orange text-obsidian font-bold shadow-glow'
                  : 'bg-white/5 text-primary-muted border border-white/10 hover:text-white'
              }`}
            >
              <span>2.</span> Living & Preferences
            </button>
          </div>

          {/* Form Card with AnimatePresence */}
          <div className="bento-card rounded-3xl p-6 sm:p-8 border-white/10 shadow-2xl relative">
            
            <AnimatePresence mode="wait">
              {step === 1 ? (
                /* ================= STEP 1: ACCOUNT & SECURITY ================= */
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleNextStep}
                  className="space-y-4"
                >
                  <div className="space-y-1 pb-2">
                    <h3 className="font-display text-xl font-bold text-white">Account Details</h3>
                    <p className="text-xs text-primary-muted">Your primary login credentials and contact details.</p>
                  </div>

                  {/* Row 1: Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name *"
                      placeholder="e.g. Tanvir Hasan"
                      value={form.name}
                      onChange={set('name')}
                      error={errors.name}
                      icon={<User size={16} />}
                      className="bg-white/5 border-glass-border text-white text-sm"
                    />

                    <Input
                      label="Email Address *"
                      type="email"
                      placeholder="tanvir@test.com"
                      value={form.email}
                      onChange={set('email')}
                      error={errors.email}
                      icon={<Mail size={16} />}
                      className="bg-white/5 border-glass-border text-white text-sm"
                    />
                  </div>

                  {/* Row 2: Phone */}
                  <Input
                    label="Phone Number (SMS & Security) *"
                    type="tel"
                    placeholder="01712345678"
                    value={form.phone}
                    onChange={set('phone')}
                    error={errors.phone}
                    icon={<Phone size={16} />}
                    className="bg-white/5 border-glass-border text-white text-sm"
                  />

                  {/* Row 3: Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <Input
                        label="Password *"
                        type={showPw ? 'text' : 'password'}
                        placeholder="Min. 6 characters"
                        value={form.password}
                        onChange={set('password')}
                        error={errors.password}
                        icon={<Lock size={16} />}
                        className="bg-white/5 border-glass-border text-white text-sm pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(s => !s)}
                        className="absolute right-3.5 top-[38px] text-primary-muted hover:text-white transition-colors"
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        label="Confirm Password *"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Repeat password"
                        value={form.confirm}
                        onChange={set('confirm')}
                        error={errors.confirm}
                        icon={<Lock size={16} />}
                        className="bg-white/5 border-glass-border text-white text-sm pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(s => !s)}
                        className="absolute right-3.5 top-[38px] text-primary-muted hover:text-white transition-colors"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {form.password.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5 animate-fade-up">
                      <div className="flex justify-between items-center text-[10px] font-label-caps uppercase tracking-wider text-primary-muted">
                        <span>Password Strength</span>
                        <span className={`font-bold ${passwordStrength.color.replace('bg-', 'text-')}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="flex gap-1 h-1.5 w-full">
                        <div className={`flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-white/10'} transition-all`} />
                        <div className={`flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-white/10'} transition-all`} />
                        <div className={`flex-1 rounded-full ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-white/10'} transition-all`} />
                        <div className={`flex-1 rounded-full ${passwordStrength.score >= 5 ? passwordStrength.color : 'bg-white/10'} transition-all`} />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    className="bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-orange-600 text-obsidian font-bold text-sm shadow-glow mt-4"
                  >
                    Next: Roommate Preferences →
                  </Button>
                </motion.form>
              ) : (
                /* ================= STEP 2: LIFESTYLE & PROFILE PREFERENCES ================= */
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-1 pb-2">
                    <h3 className="font-display text-xl font-bold text-white">Roommate Preferences</h3>
                    <p className="text-xs text-primary-muted">This helps our 8-trait algorithm calculate house synergy.</p>
                  </div>

                  {/* Avatar Picker */}
                  <div className="space-y-2">
                    <label className="text-xs text-primary-muted font-medium">Choose an Avatar</label>
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
                      {AVATAR_PRESETS.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Avatar preset"
                          onClick={() => setForm(f => ({ ...f, avatar: url }))}
                          className={`w-11 h-11 rounded-2xl object-cover cursor-pointer transition-all ${
                            form.avatar === url 
                              ? 'ring-2 ring-accent-orange scale-110 shadow-glow' 
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Row: Gender & Occupation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-primary-muted font-medium">Gender</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['male', 'female', 'other'].map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, gender: g }))}
                            className={`py-2 rounded-xl text-xs font-label-caps uppercase tracking-wider transition-all ${
                              form.gender === g
                                ? 'bg-white text-obsidian font-bold shadow-glow scale-[1.02]'
                                : 'bg-white/5 text-primary-muted hover:text-white border border-white/10'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Input
                      label="Occupation"
                      placeholder="e.g. Software Engineer"
                      value={form.occupation}
                      onChange={set('occupation')}
                      icon={<Briefcase size={16} />}
                      className="bg-white/5 border-glass-border text-white text-sm"
                    />
                  </div>

                  {/* Monthly Budget Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-primary-muted font-medium">Max Monthly Rent Budget</label>
                      <span className="font-mono text-sm font-bold text-accent-orange">
                        ৳{Number(form.budgetMax).toLocaleString()} / month
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {BUDGET_PRESETS.map(b => (
                        <button
                          key={b.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, budgetMax: b.value }))}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-mono transition-all ${
                            form.budgetMax === b.value
                              ? 'bg-accent-orange text-obsidian font-bold shadow-glow'
                              : 'bg-white/5 text-primary-muted hover:text-white border border-white/10'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* bKash Wallet */}
                  <Input
                    label="bKash Wallet Number (Optional for Auto-Splits)"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={form.bkashNumber}
                    onChange={set('bkashNumber')}
                    icon={<CreditCard size={16} />}
                    className="bg-white/5 border-glass-border text-white text-sm"
                  />

                  {/* Short Bio */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-primary-muted font-medium">About You (Bio)</label>
                    <textarea
                      value={form.bio}
                      onChange={set('bio')}
                      rows={2}
                      maxLength={200}
                      placeholder="e.g. Clean & quiet software developer looking for a friendly apartment in Mirpur..."
                      className="w-full bg-white/5 border border-glass-border rounded-2xl p-3 text-xs text-white placeholder-primary-muted/50 focus:outline-none focus:border-accent-orange transition-all resize-none"
                    />
                  </div>

                  {/* Buttons Row */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-primary-muted hover:text-white border border-white/10 transition-colors flex items-center gap-1.5 text-xs font-bold"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>

                    <Button
                      type="submit"
                      loading={loading}
                      fullWidth
                      size="lg"
                      className="bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-orange-600 text-obsidian font-bold text-sm shadow-glow"
                    >
                      Complete Registration →
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

          </div>

          {/* Footer Sign-in Link */}
          <p className="text-center text-sm text-primary-muted">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-white font-bold hover:text-accent-orange transition-colors underline decoration-white/30 underline-offset-4 hover:decoration-accent-orange"
            >
              Sign in here
            </Link>
          </p>

        </div>

      </div>

    </div>
  )
}
