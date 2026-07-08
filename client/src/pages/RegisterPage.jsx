import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input } from '../components/ui'
import { User, Mail, Lock, Phone, EyeOff, Eye, Briefcase, CreditCard } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', phone: '', occupation: '', bkashNumber: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: 'bg-white/10' })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  // Calculate password strength dynamically
  useEffect(() => {
    const p = form.password;
    let score = 0;
    if (p.length > 5) score += 1;
    if (p.length >= 8) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;

    let label = '';
    let color = 'bg-white/10';

    if (p.length === 0) {
      score = 0;
    } else if (score <= 2) {
      label = 'Weak';
      color = 'bg-accent-rose';
    } else if (score === 3 || score === 4) {
      label = 'Medium';
      color = 'bg-accent-orange';
    } else if (score >= 5) {
      label = 'Strong';
      color = 'bg-accent-emerald';
    }

    setPasswordStrength({ score, label, color });
  }, [form.password]);

  // Real-time email and phone validation
  useEffect(() => {
    setErrors(prev => {
      const next = { ...prev };

      // Email
      if (form.email.length > 0) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(form.email)) {
          next.email = 'Please enter a valid email address';
        } else {
          next.email = undefined;
        }
      } else {
        next.email = undefined;
      }

      // Phone (Bangladesh format: 10 digits after +880)
      if (form.phone.length > 0) {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(form.phone)) {
          next.phone = 'Enter exactly 10 digits';
        } else {
          next.phone = undefined;
        }
      } else {
        next.phone = undefined;
      }

      return next;
    });
  }, [form.email, form.phone]);

  const validate = () => {
    const e = { ...errors }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\d{10}$/;

    if (!form.name.trim()) e.name = 'Name is required';
    else e.name = undefined;

    if (!form.email) {
      e.email = 'Email is required';
    } else if (!emailRegex.test(form.email)) {
      e.email = 'Please enter a valid email address';
    } else {
      e.email = undefined;
    }

    if (!form.phone.trim()) {
      e.phone = 'Phone number is required for security';
    } else if (!phoneRegex.test(form.phone)) {
      e.phone = 'Enter exactly 10 digits';
    } else {
      e.phone = undefined;
    }

    if (form.password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    } else if (passwordStrength.score <= 2) {
      e.password = 'Password is too weak. Add numbers or symbols.';
    } else e.password = undefined;

    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    else e.confirm = undefined;

    // Clean up undefined
    Object.keys(e).forEach(k => e[k] === undefined && delete e[k]);
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, `+880${form.phone}`, form.occupation, form.bkashNumber)
      toast.success('Account created! Please complete the setup quiz.')
      navigate('/quiz')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-obsidian relative overflow-hidden">
      {/* Left Panel - Feature Highlights */}
      <div className="hidden lg:flex flex-col justify-between p-12 lg:p-24 relative z-10 border-r border-glass-border overflow-hidden">
        {/* Premium Image Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000&auto=format&fit=crop" 
            alt="Modern home interior" 
            className="w-full h-full object-cover opacity-40 scale-105 animate-[slow-pan_25s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-obsidian/90 via-obsidian/70 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-80" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-rose/30 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-orange/30 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '9s' }} />

        <div className="relative z-10">
          <Link to="/" className="inline-flex font-display font-bold text-2xl items-center gap-3 mb-16 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-accent-purple to-accent-orange flex items-center justify-center text-white text-lg shadow-[0_0_20px_rgba(0,229,255,0.3)]">R</div>
            Roomi<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-rose to-accent-orange">Q</span>
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-6xl font-bold leading-[1.1] text-white mb-6"
          >
            Your shared<br />life, organized.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-body text-xl text-primary-muted max-w-md"
          >
            Create an account to join an existing house or start a new one with your roommates.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-col gap-4 mt-12 relative z-10"
        >
          {[
            { icon: '💸', title: 'Smart Finance Tracking', desc: 'Automatically split bills and settle debts.' },
            { icon: '📋', title: 'Automated Chore Wheels', desc: 'Fair, rotating chore assignments that actually work.' },
            { icon: '🧩', title: 'Compatibility Matching', desc: 'Find your perfect roommates using our smart quiz.' }
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl shadow-inner border border-white/5">{feature.icon}</div>
              <div>
                <div className="text-white font-bold font-display">{feature.title}</div>
                <div className="text-primary-muted text-sm font-body">{feature.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex flex-col justify-center p-6 lg:p-16 xl:p-24 relative z-10 bg-obsidian overflow-y-auto overflow-x-hidden">
        
        {/* Dynamic Abstract Background Layer */}
        <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-accent-rose/30 rounded-full blur-[120px] mix-blend-screen animate-[spin_25s_linear_infinite]" />
          <div className="absolute bottom-[20%] right-[-10%] w-[700px] h-[700px] bg-accent-orange/30 rounded-full blur-[150px] mix-blend-screen animate-[spin_30s_linear_infinite_reverse]" />
          <div className="absolute top-[50%] right-[30%] w-[400px] h-[400px] bg-accent-purple/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '5s' }} />
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

        <div className="w-full max-w-[460px] mx-auto py-8 relative z-10">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-flex font-display font-bold text-4xl items-center gap-2 mb-3">
              Roomi<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-rose to-accent-orange">Q</span>
            </Link>
            <div className="font-label-caps text-[10px] uppercase tracking-[0.2em] text-primary-muted">Create your secure account</div>
          </div>

          {/* Form Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="mb-10 hidden lg:block"
          >
            <h2 className="font-display text-4xl font-bold text-white mb-2">Get Started</h2>
            <p className="font-body text-primary-muted">Create a free account to manage your shared home.</p>
          </motion.div>

          {/* Form Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
            className="bento-card rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group border border-white/10 bg-black/40 backdrop-blur-3xl overflow-hidden"
          >
            <div className="absolute inset-0 rounded-[32px] ring-1 ring-white/10 group-hover:ring-accent-rose/30 transition-all duration-500 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

            <div className="flex flex-col gap-5 relative z-10">
              <Input
                label="Full Name"
                placeholder="Alice Johnson"
                value={form.name}
                onChange={set('name')}
                error={errors.name}
                icon={<User size={18} />}
                className="bg-black/60 border-white/10 text-white font-body"
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="alice@example.com"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
                icon={<Mail size={18} />}
                className="bg-black/60 border-white/10 text-white font-body"
              />

              <Input
                label="Phone Number (Security/2FA)"
                type="tel"
                prefix="+880"
                placeholder="1700000000"
                maxLength="10"
                value={form.phone}
                onChange={set('phone')}
                error={errors.phone}
                icon={<Phone size={18} />}
                className="bg-black/60 border-white/10 text-white font-body"
              />

              <Input
                label="Occupation"
                placeholder="Software Engineer, Student, etc."
                value={form.occupation}
                onChange={set('occupation')}
                error={errors.occupation}
                icon={<Briefcase size={18} />}
                className="bg-black/60 border-white/10 text-white font-body"
              />

              <Input
                label="bKash Number (For Finance)"
                type="tel"
                placeholder="01700000000"
                maxLength="11"
                value={form.bkashNumber}
                onChange={set('bkashNumber')}
                error={errors.bkashNumber}
                icon={<CreditCard size={18} />}
                className="bg-black/60 border-white/10 text-white font-body"
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 chars, letters & numbers"
                  value={form.password}
                  onChange={set('password')}
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

                {/* Password Strength Indicator */}
                {form.password.length > 0 && (
                  <div className="mt-3 bg-black/40 p-3 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-primary-muted font-label-caps">Strength</span>
                      <span className={`text-[10px] uppercase font-bold tracking-widest font-label-caps ${passwordStrength.color.replace('bg-', 'text-')}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="flex gap-1 h-1.5 w-full">
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-white/10'} transition-colors shadow-sm`} />
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-white/10'} transition-colors shadow-sm`} />
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-white/10'} transition-colors shadow-sm`} />
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 5 ? passwordStrength.color : 'bg-white/10'} transition-colors shadow-sm`} />
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Same as above"
                  value={form.confirm}
                  onChange={set('confirm')}
                  error={errors.confirm}
                  icon={<Lock size={18} />}
                  className="bg-black/60 border-white/10 text-white font-body pr-12"
                />
                <button
                  onClick={() => setShowConfirm(s => !s)}
                  className="absolute right-4 top-[36px] text-primary-muted hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button
                onClick={handleSubmit}
                loading={loading}
                fullWidth
                size="lg"
                className="mt-4 !rounded-2xl shadow-[0_0_20px_rgba(225,29,72,0.2)] hover:shadow-[0_0_30px_rgba(225,29,72,0.4)] transition-shadow text-[15px] font-bold tracking-wide border-0 bg-gradient-to-r from-accent-rose to-accent-orange text-white font-body"
              >
                Create Account
              </Button>
            </div>
          </motion.div>

          {/* Footer Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-10 font-body text-[15px] text-primary-muted"
          >
            Already have an account?{' '}
            <Link to="/login" className="text-white font-bold hover:text-accent-rose transition-colors underline decoration-white/30 underline-offset-4 hover:decoration-accent-rose">
              Sign in
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  )
}
