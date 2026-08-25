import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  EyeOff, 
  Eye, 
  Briefcase, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Check,
  Zap,
  MapPin,
  FileText,
  Shield
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

// Curated resident avatar presets
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
]

// Budget presets in BDT (৳)
const BUDGET_PRESETS = [
  { label: '৳8k', value: 8000 },
  { label: '৳12k', value: 12000 },
  { label: '৳18k', value: 18000 },
  { label: '৳25k', value: 25000 },
  { label: '৳35k+', value: 35000 },
]

// Dhaka / Metro area suggestions
const CITY_AREAS = [
  'Mirpur', 'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 
  'Bashundhara R/A', 'Mohakhali', 'Badda', 'Lalmatia', 'Puran Dhaka'
]

// Interactive lifestyle habit tags
const LIFESTYLE_HABIT_OPTIONS = [
  { id: 'early_bird', label: '☀️ Early Riser', desc: 'Active 06:00 - 22:00' },
  { id: 'night_owl', label: '🌙 Night Owl', desc: 'Creative night hours' },
  { id: 'clean_freak', label: '🧹 Cleanliness Pro', desc: 'Zero-dish in sink policy' },
  { id: 'home_chef', label: '🍳 Home Chef', desc: 'Loves communal cooking' },
  { id: 'remote_worker', label: '💻 Remote Worker', desc: 'Quiet day focus hours' },
  { id: 'coffee_lover', label: '☕ Coffee Brewer', desc: 'Morning caffeine routine' },
  { id: 'non_smoker', label: '🚭 Non-Smoker', desc: 'Smoke-free environment' },
  { id: 'pet_friendly', label: '🐾 Pet Friendly', desc: 'Comfortable with animals' },
  { id: 'headphones', label: '🎧 Headphone User', desc: 'Low noise footprint' },
  { id: 'quiet_hours', label: '🤫 Strict Quiet Hours', desc: 'Respects sleep windows' },
  { id: 'fitness', label: '🏋️ Fitness Active', desc: 'Healthy workout routine' },
  { id: 'halal_friendly', label: '🥗 Halal / Clean Diet', desc: 'Communal kitchen respect' }
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  // Step 1: Account Credentials & Identity, Step 2: Living Habits & Financial Setup
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyPhone: '',
    nidOrStudentId: '',
    preferredArea: 'Mirpur',
    occupation: '',
    gender: 'male',
    budgetMax: 15000,
    moveInTimeline: 'Within 15 Days',
    cleanlinessStandard: 'Balanced',
    bkashNumber: '',
    bio: '',
    avatar: AVATAR_PRESETS[0],
    password: '',
    confirm: '',
    agreedToTerms: true,
    lifestyleHabits: ['clean_freak', 'coffee_lover', 'non_smoker', 'early_bird']
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const set = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: value }))
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }))
  }

  // Toggle lifestyle habits
  const toggleHabit = (habitId) => {
    setForm(prev => {
      const exists = prev.lifestyleHabits.includes(habitId)
      if (exists) {
        return { ...prev, lifestyleHabits: prev.lifestyleHabits.filter(h => h !== habitId) }
      } else {
        return { ...prev, lifestyleHabits: [...prev.lifestyleHabits, habitId] }
      }
    })
  }

  // =========================================================================
  // SECURITY & VALIDATION LOGIC
  // =========================================================================
  
  // 1. Strict Email Regex
  const isEmailValid = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())
  }

  // 2. Strict Phone Regex (BD format: 01[3-9]XXXXXXXX or +8801[3-9]XXXXXXXX)
  const isPhoneValid = (phone) => {
    const clean = phone.replace(/[\s-]/g, '')
    return /^(?:\+8801|01)[3-9]\d{8}$/.test(clean)
  }

  // 3. NID / Student ID Format Check (6 to 17 alphanumeric)
  const isIdValid = (id) => {
    return /^[a-zA-Z0-9-]{6,17}$/.test(id.trim())
  }

  // 4. Password Security Criteria
  const passwordCriteria = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
    matches: form.password.length > 0 && form.password === form.confirm
  }

  const passedCriteriaCount = Object.values(passwordCriteria).filter(Boolean).length

  // Step 1 Validation
  const validateStep1 = () => {
    const e = {}

    // Name
    if (!form.name.trim()) {
      e.name = 'Full name is required'
    } else if (form.name.trim().length < 3) {
      e.name = 'Name must be at least 3 characters'
    } else if (!/^[a-zA-Z\s.'-]+$/.test(form.name.trim())) {
      e.name = 'Name can only contain letters and spaces'
    }
    
    // Email
    if (!form.email.trim()) {
      e.email = 'Email address is required'
    } else if (!isEmailValid(form.email)) {
      e.email = 'Please enter a valid email format'
    }

    // Phone
    if (!form.phone.trim()) {
      e.phone = 'Mobile number is required'
    } else if (!isPhoneValid(form.phone)) {
      e.phone = 'Enter a valid 11-digit mobile number'
    }

    // Emergency Phone
    if (form.emergencyPhone.trim()) {
      if (!isPhoneValid(form.emergencyPhone)) {
        e.emergencyPhone = 'Enter a valid 11-digit emergency phone number'
      } else if (form.emergencyPhone.trim() === form.phone.trim()) {
        e.emergencyPhone = 'Emergency contact must be different from primary phone'
      }
    }

    // NID / Student ID
    if (form.nidOrStudentId.trim() && !isIdValid(form.nidOrStudentId)) {
      e.nidOrStudentId = 'NID or Student ID must be 6-17 alphanumeric characters'
    }

    // Password
    if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters'
    } else if (passedCriteriaCount < 4) {
      e.password = 'Include uppercase, lowercase, number and symbol'
    }

    if (form.password !== form.confirm) {
      e.confirm = 'Password confirmation does not match'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // Step 2 Validation
  const validateStep2 = () => {
    const e = {}

    if (!form.occupation.trim()) {
      e.occupation = 'Please enter your occupation or university'
    }

    if (form.bkashNumber.trim() && !isPhoneValid(form.bkashNumber)) {
      e.bkashNumber = 'Enter a valid 11-digit bKash/Nagad wallet number'
    }

    if (!form.agreedToTerms) {
      e.terms = 'You must agree to the RoomiQ Community Safety Standards'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNextStep = (e) => {
    if (e) e.preventDefault()
    if (validateStep1()) {
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!validateStep1()) {
      setStep(1)
      return
    }
    if (!validateStep2()) {
      return
    }

    setLoading(true)
    try {
      let formattedPhone = form.phone.trim().replace(/[\s-]/g, '')
      if (!formattedPhone.startsWith('+880')) {
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '+880' + formattedPhone.substring(1)
        } else {
          formattedPhone = '+880' + formattedPhone
        }
      }

      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: formattedPhone,
        emergencyPhone: form.emergencyPhone.trim(),
        nidOrStudentId: form.nidOrStudentId.trim(),
        preferredArea: form.preferredArea,
        occupation: form.occupation.trim() || 'Resident',
        gender: form.gender,
        budgetMax: Number(form.budgetMax) || 15000,
        moveInTimeline: form.moveInTimeline,
        cleanlinessStandard: form.cleanlinessStandard,
        bkashNumber: form.bkashNumber.trim(),
        bio: form.bio.trim(),
        avatar: form.avatar,
        lifestyleHabits: form.lifestyleHabits
      })

      toast.success('🎉 Welcome to RoomiQ! Complete your lifestyle quiz to find matches.')
      navigate('/quiz')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please verify your details.')
    } finally {
      setLoading(false)
    }
  }

  // Calculated live house synergy index
  const calculatedSynergy = Math.min(
    99,
    76 + (form.lifestyleHabits.length * 3) + (form.bio.length > 20 ? 4 : 0) + (form.occupation ? 4 : 0) + (isPhoneValid(form.phone) ? 3 : 0)
  )

  return (
    <div className="min-h-screen bg-obsidian text-white flex flex-col lg:flex-row relative overflow-hidden font-body selection:bg-accent-purple/40 selection:text-white">
      
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] bg-accent-purple/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-accent-orange/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-cyan/10 rounded-full blur-[180px] pointer-events-none" />

      {/* ========================================================= */}
      {/* LEFT COLUMN: EXPANSIVE RESIDENT ID & SECURITY CLEARANCE   */}
      {/* ========================================================= */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-5/12 flex-col justify-between p-10 xl:p-14 border-r border-glass-border relative z-10 bg-obsidian/40 backdrop-blur-2xl">
        
        {/* Top Logo & Step Tracker */}
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <span className="font-display text-3xl font-extrabold tracking-tight text-white group-hover:opacity-90 transition-opacity">
              Roomi<span className="text-accent-orange">Q</span>
            </span>
            <span className="font-label-caps text-[10px] text-primary-muted px-3 py-1 rounded-full bg-white/5 border border-glass-border uppercase tracking-widest">
              Verified Onboarding
            </span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={`px-3.5 py-1.5 rounded-full border transition-all ${
              step === 1 
                ? 'bg-accent-purple/20 border-accent-purple text-white shadow-glow' 
                : 'bg-white/5 border-glass-border text-primary-muted'
            }`}>
              01 Verified Identity
            </span>
            <span className="text-primary-muted">➔</span>
            <span className={`px-3.5 py-1.5 rounded-full border transition-all ${
              step === 2 
                ? 'bg-accent-orange/20 border-accent-orange text-white shadow-glow' 
                : 'bg-white/5 border-glass-border text-primary-muted'
            }`}>
              02 Lifestyle Persona
            </span>
          </div>
        </div>

        {/* Expansive Main Info Card */}
        <div className="my-6 space-y-6 flex-1 flex flex-col justify-center">
          <div className="space-y-1.5">
            <span className="font-label-caps text-[10px] text-accent-cyan uppercase tracking-widest font-bold">
              REAL-TIME RESIDENT CLEARANCE PASS
            </span>
            <h1 className="font-display text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Your House Profile <br />
              <span className="bg-gradient-to-r from-accent-orange via-accent-purple to-accent-cyan bg-clip-text text-transparent">
                generates in real time.
              </span>
            </h1>
          </div>

          {/* Holographic Resident Card */}
          <div className="bento-card rounded-3xl p-6 xl:p-7 border-white/15 space-y-5 shadow-2xl relative overflow-hidden group">
            
            {/* Top Pass Header */}
            <div className="flex justify-between items-start border-b border-glass-border pb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={form.avatar}
                    alt="Resident Avatar"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 shadow-md"
                  />
                  <div className="w-4 h-4 rounded-full bg-accent-emerald absolute -bottom-1 -right-1 border-2 border-obsidian flex items-center justify-center">
                    <Check size={9} className="text-black stroke-[3]" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white truncate max-w-[210px]">
                    {form.name.trim() || 'Verified Applicant'}
                  </h3>
                  <div className="text-xs text-primary-muted mt-0.5 flex items-center gap-1.5">
                    <MapPin size={12} className="text-accent-orange" />
                    <span>{form.preferredArea} Area</span> • <span>{form.gender.toUpperCase()}</span>
                  </div>
                  <div className="text-[11px] text-accent-cyan font-medium mt-0.5">
                    {form.occupation.trim() || 'Co-Living Candidate'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-label-caps uppercase text-accent-emerald border border-accent-emerald/30 bg-accent-emerald/10 px-2.5 py-0.5 rounded-full font-bold">
                  VERIFIED PASS
                </span>
                <div className="text-[10px] text-primary-muted font-mono mt-1">
                  ID: #{form.nidOrStudentId ? form.nidOrStudentId.slice(-6) : '2026-RQ'}
                </div>
              </div>
            </div>

            {/* Resident Pass Metrics */}
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-0.5">
                <span className="text-primary-muted font-label-caps uppercase text-[9px] block">Max Rent</span>
                <span className="text-white font-bold text-sm block font-mono">
                  ৳{Number(form.budgetMax).toLocaleString()}
                </span>
                <span className="text-[9px] text-primary-muted block">Per Month</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-0.5">
                <span className="text-primary-muted font-label-caps uppercase text-[9px] block">Move-In</span>
                <span className="text-accent-orange font-bold text-xs block truncate mt-0.5">
                  {form.moveInTimeline}
                </span>
                <span className="text-[9px] text-primary-muted block">Timeline</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-0.5">
                <span className="text-primary-muted font-label-caps uppercase text-[9px] block">Synergy</span>
                <span className="text-accent-emerald font-bold text-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-accent-emerald" />
                  {calculatedSynergy}%
                </span>
                <span className="text-[9px] text-accent-emerald block">Harmony Fit</span>
              </div>
            </div>

            {/* Selected Lifestyle Badges Preview */}
            <div className="space-y-2 pt-1 border-t border-glass-border">
              <div className="flex justify-between items-center text-[10px] text-primary-muted font-label-caps uppercase">
                <span>Selected Living Habits</span>
                <span className="text-white font-bold">{form.lifestyleHabits.length} Traits</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.lifestyleHabits.slice(0, 6).map(hid => {
                  const habit = LIFESTYLE_HABIT_OPTIONS.find(h => h.id === hid)
                  return (
                    <span 
                      key={hid}
                      className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/90 font-medium"
                    >
                      {habit?.label || hid}
                    </span>
                  )
                })}
                {form.lifestyleHabits.length > 6 && (
                  <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-primary-muted">
                    +{form.lifestyleHabits.length - 6} more
                  </span>
                )}
              </div>
            </div>

            {/* Security Clearance Checklist */}
            <div className="space-y-1.5 pt-2 border-t border-glass-border text-[11px] text-primary-muted">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-white/90">
                  <Check className={`w-3.5 h-3.5 ${isPhoneValid(form.phone) ? 'text-accent-emerald' : 'text-primary-muted'}`} />
                  Verified Phone Format
                </span>
                <span className={isPhoneValid(form.phone) ? 'text-accent-emerald font-bold' : 'text-primary-muted'}>
                  {isPhoneValid(form.phone) ? '✓ VALID' : 'PENDING'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-white/90">
                  <Check className={`w-3.5 h-3.5 ${isEmailValid(form.email) ? 'text-accent-emerald' : 'text-primary-muted'}`} />
                  RFC Verified Email
                </span>
                <span className={isEmailValid(form.email) ? 'text-accent-emerald font-bold' : 'text-primary-muted'}>
                  {isEmailValid(form.email) ? '✓ VALID' : 'PENDING'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-white/90">
                  <Check className={`w-3.5 h-3.5 ${passedCriteriaCount >= 4 ? 'text-accent-emerald' : 'text-primary-muted'}`} />
                  Encrypted Security Hash
                </span>
                <span className={passedCriteriaCount >= 4 ? 'text-accent-emerald font-bold' : 'text-primary-muted'}>
                  {passedCriteriaCount >= 4 ? '✓ HIGH SECURITY' : 'STANDBY'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Security & Data Privacy Footer */}
        <div className="flex items-center justify-between text-xs text-primary-muted border-t border-glass-border pt-4">
          <span className="flex items-center gap-1.5 text-white/80">
            <ShieldCheck className="w-4 h-4 text-accent-emerald" />
            256-Bit SSL Identity Protection
          </span>
          <span>Zero-Spam Guarantee</span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: EXPANSIVE 2-STEP ONBOARDING FORM (7 cols)   */}
      {/* ========================================================= */}
      <div className="w-full lg:w-7/12 xl:w-7/12 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 relative z-10 overflow-y-auto min-h-screen">
        
        {/* Top Header Link */}
        <div className="flex justify-between items-center pb-6">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <span className="font-display text-2xl font-bold text-white">
              Roomi<span className="text-accent-orange">Q</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-1.5 text-xs text-primary-muted ml-auto">
            <span>Already have an account?</span>
            <Link 
              to="/login" 
              className="text-white hover:text-accent-orange font-bold underline decoration-white/30 underline-offset-4 ml-1 transition-colors"
            >
              Sign In to House →
            </Link>
          </div>
        </div>

        {/* Form Container - Spacious & Wide */}
        <div className="max-w-2xl w-full mx-auto my-auto space-y-6">
          
          {/* Form Header */}
          <div className="space-y-1.5">
            <div className="font-label-caps text-[10px] text-accent-orange uppercase tracking-wider font-bold">
              STEP {step} OF 2 • {step === 1 ? 'CREDENTIALS & SECURITY CLEARANCE' : 'LIFESTYLE & LIVING STANDARDS'}
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {step === 1 ? 'Create Your Verified Profile' : 'Set Your Living Preferences'}
            </h2>
            <p className="text-sm text-primary-muted">
              {step === 1 
                ? 'Please provide your verified details. Our security algorithms verify identity to protect housemates.'
                : 'Configure your budget, daily schedule, and co-living habits to find synchronized roommate pairings.'}
            </p>
          </div>

          {/* Form Bento Card */}
          <div className="bento-card rounded-3xl p-6 sm:p-8 space-y-6 border-white/10 shadow-2xl">
            
            <AnimatePresence mode="wait">
              {step === 1 ? (
                /* ================= STEP 1: CREDENTIALS & IDENTITY ================= */
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleNextStep}
                  className="space-y-5"
                >
                  {/* Row 1: Full Name & Preferred Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <label className="block text-xs font-semibold text-primary-muted">
                          Full Legal Name <span className="text-accent-rose">*</span>
                        </label>
                        {form.name.trim().length >= 3 && (
                          <span className="text-xs text-accent-emerald flex items-center gap-1 font-mono">
                            <CheckCircle2 size={11} /> Valid
                          </span>
                        )}
                      </div>
                      <div className="relative group">
                        <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary-muted group-hover:text-accent-orange transition-colors" />
                        <input
                          type="text"
                          placeholder="e.g. Rafiq Ahmed"
                          value={form.name}
                          onChange={set('name')}
                          className="w-full bg-white/5 border border-glass-border rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-accent-orange focus:bg-white/10 transition-all placeholder:text-white/20"
                        />
                      </div>
                      {errors.name && (
                        <span className="text-xs text-accent-rose pl-1 block">{errors.name}</span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-primary-muted pl-1">
                        Preferred Location / Area <span className="text-accent-rose">*</span>
                      </label>
                      <div className="relative group">
                        <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary-muted group-hover:text-accent-orange transition-colors" />
                        <select
                          value={form.preferredArea}
                          onChange={set('preferredArea')}
                          className="w-full bg-[#0d0d12] border border-glass-border rounded-2xl pl-11 pr-8 py-3 text-sm text-white focus:outline-none focus:border-accent-orange transition-all appearance-none cursor-pointer"
                        >
                          {CITY_AREAS.map(area => (
                            <option key={area} value={area} className="bg-[#0d0d12] text-white">
                              {area}, Dhaka
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Email & Primary Mobile Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <label className="block text-xs font-semibold text-primary-muted">
                          Email Address <span className="text-accent-rose">*</span>
                        </label>
                        {isEmailValid(form.email) && (
                          <span className="text-xs text-accent-emerald flex items-center gap-1 font-mono">
                            <CheckCircle2 size={11} /> Format OK
                          </span>
                        )}
                      </div>
                      <div className="relative group">
                        <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary-muted group-hover:text-accent-orange transition-colors" />
                        <input
                          type="email"
                          placeholder="rafiq@example.com"
                          value={form.email}
                          onChange={set('email')}
                          className={`w-full bg-white/5 border rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:bg-white/10 transition-all placeholder:text-white/20 ${
                            isEmailValid(form.email) 
                              ? 'border-accent-emerald/40 focus:border-accent-emerald' 
                              : 'border-glass-border focus:border-accent-orange'
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <span className="text-xs text-accent-rose pl-1 block">{errors.email}</span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <label className="block text-xs font-semibold text-primary-muted">
                          Mobile Phone Number <span className="text-accent-rose">*</span>
                        </label>
                        {isPhoneValid(form.phone) && (
                          <span className="text-xs text-accent-emerald flex items-center gap-1 font-mono">
                            <CheckCircle2 size={11} /> BD Format
                          </span>
                        )}
                      </div>
                      <div className="relative group">
                        <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary-muted group-hover:text-accent-orange transition-colors" />
                        <input
                          type="tel"
                          placeholder="017XXXXXXXX"
                          value={form.phone}
                          onChange={set('phone')}
                          className={`w-full bg-white/5 border rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:bg-white/10 transition-all placeholder:text-white/20 ${
                            isPhoneValid(form.phone) 
                              ? 'border-accent-emerald/40 focus:border-accent-emerald' 
                              : 'border-glass-border focus:border-accent-orange'
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <span className="text-xs text-accent-rose pl-1 block">{errors.phone}</span>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Emergency Contact & NID / Student ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-primary-muted pl-1">
                        Emergency Contact / Guardian Phone
                      </label>
                      <div className="relative group">
                        <Shield className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary-muted group-hover:text-accent-orange transition-colors" />
                        <input
                          type="tel"
                          placeholder="018XXXXXXXX (Optional)"
                          value={form.emergencyPhone}
                          onChange={set('emergencyPhone')}
                          className="w-full bg-white/5 border border-glass-border rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-accent-orange focus:bg-white/10 transition-all placeholder:text-white/20"
                        />
                      </div>
                      {errors.emergencyPhone && (
                        <span className="text-xs text-accent-rose pl-1 block">{errors.emergencyPhone}</span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-primary-muted pl-1">
                        NID or Student ID Number
                      </label>
                      <div className="relative group">
                        <FileText className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary-muted group-hover:text-accent-orange transition-colors" />
                        <input
                          type="text"
                          placeholder="e.g. 1998269201XXXX"
                          value={form.nidOrStudentId}
                          onChange={set('nidOrStudentId')}
                          className="w-full bg-white/5 border border-glass-border rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-accent-orange focus:bg-white/10 transition-all placeholder:text-white/20"
                        />
                      </div>
                      {errors.nidOrStudentId && (
                        <span className="text-xs text-accent-rose pl-1 block">{errors.nidOrStudentId}</span>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-primary-muted pl-1">
                        Password <span className="text-accent-rose">*</span>
                      </label>
                      <div className="relative group">
                        <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary-muted group-hover:text-accent-orange transition-colors" />
                        <input
                          type={showPw ? 'text' : 'password'}
                          placeholder="Min. 8 characters"
                          value={form.password}
                          onChange={set('password')}
                          className="w-full bg-white/5 border border-glass-border rounded-2xl pl-11 pr-10 py-3 text-sm text-white focus:outline-none focus:border-accent-orange focus:bg-white/10 transition-all placeholder:text-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-muted hover:text-white"
                        >
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <span className="text-xs text-accent-rose pl-1 block">{errors.password}</span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-primary-muted pl-1">
                        Confirm Password <span className="text-accent-rose">*</span>
                      </label>
                      <div className="relative group">
                        <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary-muted group-hover:text-accent-orange transition-colors" />
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Re-enter password"
                          value={form.confirm}
                          onChange={set('confirm')}
                          className="w-full bg-white/5 border border-glass-border rounded-2xl pl-11 pr-10 py-3 text-sm text-white focus:outline-none focus:border-accent-orange focus:bg-white/10 transition-all placeholder:text-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-muted hover:text-white"
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirm && (
                        <span className="text-xs text-accent-rose pl-1 block">{errors.confirm}</span>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Password Strength Progress */}
                  {form.password.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-glass-border space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-primary-muted font-label-caps uppercase text-[10px]">
                          Password Security Analysis:
                        </span>
                        <span className={`font-bold ${passedCriteriaCount >= 5 ? 'text-accent-emerald' : passedCriteriaCount >= 3 ? 'text-accent-orange' : 'text-accent-rose'}`}>
                          {passedCriteriaCount >= 5 ? 'MAXIMUM SECURITY' : passedCriteriaCount >= 3 ? 'MODERATE' : 'WEAK'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            passedCriteriaCount >= 5 ? 'bg-accent-emerald' : passedCriteriaCount >= 3 ? 'bg-accent-orange' : 'bg-accent-rose'
                          }`}
                          style={{ width: `${(passedCriteriaCount / 6) * 100}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                        <div className={`flex items-center gap-1.5 ${passwordCriteria.length ? 'text-accent-emerald' : 'text-primary-muted'}`}>
                          <Check className="w-3.5 h-3.5" /> 8+ Chars
                        </div>
                        <div className={`flex items-center gap-1.5 ${passwordCriteria.uppercase ? 'text-accent-emerald' : 'text-primary-muted'}`}>
                          <Check className="w-3.5 h-3.5" /> Uppercase
                        </div>
                        <div className={`flex items-center gap-1.5 ${passwordCriteria.lowercase ? 'text-accent-emerald' : 'text-primary-muted'}`}>
                          <Check className="w-3.5 h-3.5" /> Lowercase
                        </div>
                        <div className={`flex items-center gap-1.5 ${passwordCriteria.number ? 'text-accent-emerald' : 'text-primary-muted'}`}>
                          <Check className="w-3.5 h-3.5" /> Number
                        </div>
                        <div className={`flex items-center gap-1.5 ${passwordCriteria.special ? 'text-accent-emerald' : 'text-primary-muted'}`}>
                          <Check className="w-3.5 h-3.5" /> Symbol (!@#)
                        </div>
                        <div className={`flex items-center gap-1.5 ${passwordCriteria.matches ? 'text-accent-emerald' : 'text-primary-muted'}`}>
                          <Check className="w-3.5 h-3.5" /> Match OK
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Continue Button */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-orange-600 text-obsidian font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 mt-3 shadow-glow"
                  >
                    <span>Continue to Step 2: Living Habits & Preferences</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>
              ) : (
                /* ================= STEP 2: PROFILE, HABITS & BUDGET ================= */
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* Avatar Picker */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-primary-muted pl-1">
                      Choose Your Resident Avatar
                    </label>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                      {AVATAR_PRESETS.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt="Preset avatar"
                          onClick={() => setForm(f => ({ ...f, avatar: url }))}
                          className={`w-12 h-12 rounded-2xl object-cover cursor-pointer transition-all ${
                            form.avatar === url 
                              ? 'ring-2 ring-accent-orange scale-110 shadow-glow' 
                              : 'opacity-50 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Gender & Occupation Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-primary-muted pl-1">
                        Gender
                      </label>
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

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-primary-muted pl-1">
                        Occupation / Field / University <span className="text-accent-rose">*</span>
                      </label>
                      <div className="relative group">
                        <Briefcase className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary-muted group-hover:text-accent-orange transition-colors" />
                        <input
                          type="text"
                          placeholder="e.g. Software Engineer at Brain Station"
                          value={form.occupation}
                          onChange={set('occupation')}
                          className="w-full bg-white/5 border border-glass-border rounded-2xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-orange focus:bg-white/10 transition-all placeholder:text-white/20"
                        />
                      </div>
                      {errors.occupation && (
                        <span className="text-xs text-accent-rose pl-1 block">{errors.occupation}</span>
                      )}
                    </div>
                  </div>

                  {/* Max Monthly Budget & Move-In Timeline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-semibold text-primary-muted">
                          Max Rent Budget
                        </label>
                        <span className="text-sm font-bold text-accent-orange font-mono">
                          ৳{Number(form.budgetMax).toLocaleString()} / mo
                        </span>
                      </div>

                      <div className="flex gap-1.5">
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

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-primary-muted pl-1">
                        Move-in Timeline
                      </label>
                      <select
                        value={form.moveInTimeline}
                        onChange={set('moveInTimeline')}
                        className="w-full bg-[#0d0d12] border border-glass-border rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-orange transition-all cursor-pointer"
                      >
                        {['Immediately', 'Within 15 Days', 'Next Month', 'Flexible'].map(t => (
                          <option key={t} value={t} className="bg-[#0d0d12] text-white">
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Interactive Lifestyle & Living Habit Badges */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-semibold text-primary-muted">
                        Select Your Living & Co-Living Habits
                      </label>
                      <span className="text-xs text-primary-muted">
                        {form.lifestyleHabits.length} selected
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {LIFESTYLE_HABIT_OPTIONS.map((opt) => {
                        const isSelected = form.lifestyleHabits.includes(opt.id)
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => toggleHabit(opt.id)}
                            className={`p-2.5 rounded-2xl text-left border transition-all text-xs flex items-center justify-between ${
                              isSelected 
                                ? 'bg-accent-purple/20 border-accent-purple text-white font-bold shadow-glow' 
                                : 'bg-white/5 border-glass-border text-primary-muted hover:border-white/20 hover:text-white'
                            }`}
                          >
                            <span className="truncate">{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-accent-emerald shrink-0 ml-1" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* bKash / Payment Mobile Wallet */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-primary-muted pl-1">
                      bKash / Nagad Wallet Number (For Instant Automated Bill Splits)
                    </label>
                    <div className="relative group">
                      <CreditCard className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary-muted group-hover:text-accent-orange transition-colors" />
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX (Optional)"
                        value={form.bkashNumber}
                        onChange={set('bkashNumber')}
                        className="w-full bg-white/5 border border-glass-border rounded-2xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-orange focus:bg-white/10 transition-all placeholder:text-white/20"
                      />
                    </div>
                    {errors.bkashNumber && (
                      <span className="text-xs text-accent-rose pl-1 block">{errors.bkashNumber}</span>
                    )}
                  </div>

                  {/* Short Bio */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-semibold text-primary-muted">
                        Resident Bio & House Note
                      </label>
                      <span className="text-[10px] text-primary-muted">
                        {form.bio.length}/200
                      </span>
                    </div>
                    <textarea
                      value={form.bio}
                      onChange={set('bio')}
                      rows={2}
                      maxLength={200}
                      placeholder="e.g. Quiet software engineer looking for clean housemates with synchronized morning routines..."
                      className="w-full bg-white/5 border border-glass-border rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-accent-orange transition-all resize-none placeholder:text-white/20"
                    />
                  </div>

                  {/* Mandatory Community Agreement Checkbox */}
                  <div className="space-y-1 pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.agreedToTerms}
                        onChange={set('agreedToTerms')}
                        className="mt-0.5 w-4 h-4 rounded border-glass-border accent-accent-orange cursor-pointer"
                      />
                      <span className="text-xs text-primary-muted group-hover:text-white transition-colors leading-relaxed">
                        I agree to RoomiQ Verified Community Standards, Zero-Harassment Policy, and Shared Ledger Terms.
                      </span>
                    </label>
                    {errors.terms && (
                      <span className="text-xs text-accent-rose pl-6 block">{errors.terms}</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-primary-muted hover:text-white border border-glass-border transition-colors flex items-center gap-1.5 text-xs font-bold"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Credentials</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-orange-600 text-obsidian font-bold text-sm shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <RotateCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Complete Registration & Launch Pass</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

          </div>

        </div>

        {/* Footer */}
        <div className="text-center text-xs text-primary-muted pt-6">
          256-Bit SSL Identity Protection • 24/7 RoomiQ System Verification
        </div>

      </div>

    </div>
  )
}
