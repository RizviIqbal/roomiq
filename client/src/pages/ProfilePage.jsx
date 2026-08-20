import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Select, Avatar, Badge, ProgressBar } from '../components/ui'
import { Overlay, ModalHeader } from '../components/finance/AddExpenseModal'
import api from '../services/api'
import toast from 'react-hot-toast'
import { 
  User, Phone, Image as ImageIcon, Heart, LogOut, Mail, Camera, 
  Home, DollarSign, Briefcase, Shield, Key, Copy, Check, 
  Sparkles, Moon, Sun, Volume2, Users, Cigarette, Dog, BookOpen, Utensils, 
  Wallet, RefreshCw, X, AlertTriangle, AlertOctagon, CheckCircle2, ArrowRight
} from 'lucide-react'

const TRAIT_LABELS = {
  sleepSchedule: {
    early_bird: { label: 'Early Bird', icon: '🌅' },
    night_owl:  { label: 'Night Owl',  icon: '🦉' },
    flexible:   { label: 'Flexible',   icon: '🔄' },
  },
  cleanlinessLevel: {
    5: { label: 'Spotless (5/5)', icon: '✨' },
    4: { label: 'Pretty Clean (4/5)', icon: '🧹' },
    3: { label: 'Moderate (3/5)', icon: '🙂' },
    2: { label: 'Relaxed (2/5)', icon: '😅' },
    1: { label: 'Very Relaxed (1/5)', icon: '🤷' },
  },
  guestPolicy: {
    never:     { label: 'No Guests', icon: '🚫' },
    rarely:    { label: 'Rare Guests', icon: '🤏' },
    sometimes: { label: 'Weekend Guests', icon: '👥' },
    often:     { label: 'Frequent Guests', icon: '🎉' },
  },
  noiseTolerance: {
    silent:   { label: 'Silent Needed', icon: '🤫' },
    low:      { label: 'Low Noise', icon: '🔈' },
    moderate: { label: 'Moderate Noise', icon: '🔉' },
    high:     { label: 'High Noise Tolerance', icon: '🔊' },
  },
  smokingPolicy: {
    no_smoking:   { label: 'Strictly No Smoking', icon: '🚭' },
    outside_only: { label: 'Outside Smoking Only', icon: '🚪' },
    anywhere:     { label: 'Smoking Allowed', icon: '🚬' },
  },
  petPolicy: {
    no_pets:    { label: 'No Pets Allowed', icon: '🚫' },
    small_pets: { label: 'Small Pets OK', icon: '🐱' },
    any_pets:   { label: 'Pet Friendly', icon: '🐕' },
  },
  studyHabits: {
    at_home: { label: 'Works from Home', icon: '🏠' },
    library: { label: 'Works Outside/Office', icon: '📚' },
    mixed:   { label: 'Hybrid Schedule', icon: '🔀' },
  }
}

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name:        user?.name || '',
    phone:       user?.phone || '',
    bio:         user?.bio || '',
    avatar:      user?.avatar || '',
    occupation:  user?.occupation || '',
    gender:      user?.gender || '',
    budgetMax:   user?.budgetMax ? String(user.budgetMax) : '',
    bkashNumber: user?.bkashNumber || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [showPasswordSection, setShowPasswordSection] = useState(false)

  // Sync user state when loaded
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name:        user.name || '',
        phone:       user.phone || '',
        bio:         user.bio || '',
        avatar:      user.avatar || '',
        occupation:  user.occupation || '',
        gender:      user.gender || '',
        budgetMax:   user.budgetMax ? String(user.budgetMax) : '',
        bkashNumber: user.bkashNumber || '',
      }))
    }
  }, [user])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const dirty = 
    form.name !== (user?.name || '') ||
    form.phone !== (user?.phone || '') ||
    form.bio !== (user?.bio || '') ||
    form.occupation !== (user?.occupation || '') ||
    form.gender !== (user?.gender || '') ||
    form.budgetMax !== (user?.budgetMax ? String(user.budgetMax) : '') ||
    form.bkashNumber !== (user?.bkashNumber || '') ||
    form.newPassword.length > 0

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Full name cannot be empty'); return }
    if (form.newPassword) {
      if (!form.currentPassword) {
        toast.error('Please enter your current password to change password')
        return
      }
      if (form.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters')
        return
      }
      if (form.newPassword !== form.confirmPassword) {
        toast.error('New passwords do not match')
        return
      }
    }

    setLoading(true)
    try {
      const payload = {
        name:        form.name.trim(),
        phone:       form.phone.trim(),
        bio:         form.bio.trim(),
        avatar:      form.avatar,
        occupation:  form.occupation.trim(),
        gender:      form.gender,
        budgetMax:   form.budgetMax ? Number(form.budgetMax) : null,
        bkashNumber: form.bkashNumber.trim(),
      }

      if (form.newPassword) {
        payload.currentPassword = form.currentPassword
        payload.newPassword = form.newPassword
      }

      await api.put('/auth/me', payload)
      await refreshUser()
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
      setShowPasswordSection(false)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    setUploading(true)
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const avatarUrl = res.data.url
      setForm(f => ({ ...f, avatar: avatarUrl }))
      await api.put('/auth/me', { avatar: avatarUrl })
      await refreshUser()
      toast.success('Profile photo updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = null
    }
  }

  const handleCopyInviteCode = () => {
    const code = user?.currentHouse?.inviteCode
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    toast.success('House invite code copied!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [checkingDebts, setCheckingDebts] = useState(false)
  const [debtCheck, setDebtCheck] = useState({ totalOwed: 0, debts: [] })

  const openLeaveHouseModal = async () => {
    setShowLeaveModal(true)
    setCheckingDebts(true)
    try {
      const houseId = user?.currentHouse?._id || user?.currentHouse
      const { data } = await api.get(`/expenses/house/${houseId}/balances`)
      const myDebts = (Array.isArray(data) ? data : []).filter(d => {
        const debtorId = d.debtor?._id || d.debtor
        return debtorId?.toString() === user._id.toString()
      })
      const totalOwed = myDebts.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
      setDebtCheck({ totalOwed, debts: myDebts })
    } catch (err) {
      setDebtCheck({ totalOwed: 0, debts: [] })
    } finally {
      setCheckingDebts(false)
    }
  }

  const handleConfirmLeaveHouse = async () => {
    setLeaving(true)
    try {
      const houseId = user.currentHouse._id || user.currentHouse
      await api.post(`/houses/${houseId}/leave`)
      await refreshUser()
      toast.success('🎉 You have departed the house. Your profile is now set to free agent.')
      setShowLeaveModal(false)
      navigate('/house-setup')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave house')
    } finally {
      setLeaving(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const profile = user?.compatibilityProfile || {}
  const quizDone = !!profile?.completedAt

  return (
    <div className="w-full px-4 lg:px-8 xl:px-10 pb-24">
      
      {/* Symmetrical Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN (lg:col-span-5) - IDENTITY, QUIZ & HOUSE CARDS */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* User Identity Hero Bento Card */}
          <div className="bento-card rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent-orange/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-accent-orange/20 transition-all duration-700" />
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
              
              {/* Avatar with Camera Overlay */}
              <div 
                className="relative cursor-pointer group/avatar rounded-full overflow-hidden shrink-0 ring-2 ring-white/10 hover:ring-accent-orange transition-all shadow-xl" 
                onClick={() => fileInputRef.current?.click()}
                title="Click to upload profile photo"
              >
                <Avatar name={form.name || user?.name} size={90} src={form.avatar} />
                <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity ${uploading ? 'opacity-100' : ''}`}>
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-accent-orange rounded-full animate-spin" />
                  ) : (
                    <>
                      <Camera size={20} className="text-accent-orange mb-1" />
                      <span className="text-[9px] font-label-caps uppercase text-white tracking-wider">Change</span>
                    </>
                  )}
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />

              {/* Identity Info */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <h2 className="font-display text-2xl font-bold text-white tracking-tight leading-tight truncate">
                  {form.name || user?.name}
                </h2>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5">
                  <span className="text-xs font-label-caps text-accent-orange uppercase tracking-wider">
                    {form.occupation || 'Roommate'}
                  </span>
                  {user?.currentHouse && (
                    <Badge color="green">
                      <Home size={10} className="mr-1" /> {user.currentHouse.name}
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-primary-muted flex items-center justify-center sm:justify-start gap-1.5 mt-3 truncate">
                  <Mail size={13} className="text-white/40 shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-white/5 text-center">
              <div className="p-2 rounded-2xl bg-white/[0.03]">
                <div className="font-label-caps text-[9px] text-primary-muted uppercase tracking-widest">Max Budget</div>
                <div className="font-mono text-sm font-bold text-white mt-0.5">
                  {form.budgetMax ? `৳${Number(form.budgetMax).toLocaleString()}` : '—'}
                </div>
              </div>
              <div className="p-2 rounded-2xl bg-white/[0.03]">
                <div className="font-label-caps text-[9px] text-primary-muted uppercase tracking-widest">Gender</div>
                <div className="font-mono text-sm font-bold text-white mt-0.5 capitalize">
                  {form.gender || 'Unset'}
                </div>
              </div>
              <div className="p-2 rounded-2xl bg-white/[0.03]">
                <div className="font-label-caps text-[9px] text-primary-muted uppercase tracking-widest">bKash Linked</div>
                <div className="font-mono text-sm font-bold text-white mt-0.5">
                  {form.bkashNumber ? '✓ Active' : 'No'}
                </div>
              </div>
            </div>
          </div>

          {/* Lifestyle Compatibility Summary Card */}
          <div className="bento-card rounded-3xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-display text-lg font-bold text-white">
                <Heart size={18} className="text-accent-rose" /> Lifestyle Match Profile
              </div>
              <Badge color={quizDone ? 'green' : 'yellow'}>
                {quizDone ? '✓ Verified' : 'Pending'}
              </Badge>
            </div>

            {quizDone ? (
              <div className="space-y-4">
                <p className="text-xs text-primary-muted leading-relaxed">
                  Calculated from your 8-dimension lifestyle assessment completed on{' '}
                  <span className="text-white font-medium">
                    {new Date(profile.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>.
                </p>

                {/* 8 Lifestyle Trait Badges Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {profile.sleepSchedule && (
                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2">
                      <span className="text-base">{TRAIT_LABELS.sleepSchedule[profile.sleepSchedule]?.icon || '😴'}</span>
                      <div className="min-w-0">
                        <div className="font-label-caps text-[8px] text-primary-muted uppercase">Sleep</div>
                        <div className="font-medium text-white truncate">{TRAIT_LABELS.sleepSchedule[profile.sleepSchedule]?.label || profile.sleepSchedule}</div>
                      </div>
                    </div>
                  )}

                  {profile.cleanlinessLevel && (
                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2">
                      <span className="text-base">{TRAIT_LABELS.cleanlinessLevel[profile.cleanlinessLevel]?.icon || '🧹'}</span>
                      <div className="min-w-0">
                        <div className="font-label-caps text-[8px] text-primary-muted uppercase">Cleanliness</div>
                        <div className="font-medium text-white truncate">{TRAIT_LABELS.cleanlinessLevel[profile.cleanlinessLevel]?.label || `${profile.cleanlinessLevel}/5`}</div>
                      </div>
                    </div>
                  )}

                  {profile.noiseTolerance && (
                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2">
                      <span className="text-base">{TRAIT_LABELS.noiseTolerance[profile.noiseTolerance]?.icon || '🔉'}</span>
                      <div className="min-w-0">
                        <div className="font-label-caps text-[8px] text-primary-muted uppercase">Noise</div>
                        <div className="font-medium text-white truncate">{TRAIT_LABELS.noiseTolerance[profile.noiseTolerance]?.label || profile.noiseTolerance}</div>
                      </div>
                    </div>
                  )}

                  {profile.guestPolicy && (
                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2">
                      <span className="text-base">{TRAIT_LABELS.guestPolicy[profile.guestPolicy]?.icon || '👥'}</span>
                      <div className="min-w-0">
                        <div className="font-label-caps text-[8px] text-primary-muted uppercase">Guests</div>
                        <div className="font-medium text-white truncate">{TRAIT_LABELS.guestPolicy[profile.guestPolicy]?.label || profile.guestPolicy}</div>
                      </div>
                    </div>
                  )}

                  {profile.smokingPolicy && (
                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2">
                      <span className="text-base">{TRAIT_LABELS.smokingPolicy[profile.smokingPolicy]?.icon || '🚭'}</span>
                      <div className="min-w-0">
                        <div className="font-label-caps text-[8px] text-primary-muted uppercase">Smoking</div>
                        <div className="font-medium text-white truncate">{TRAIT_LABELS.smokingPolicy[profile.smokingPolicy]?.label || profile.smokingPolicy}</div>
                      </div>
                    </div>
                  )}

                  {profile.petPolicy && (
                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2">
                      <span className="text-base">{TRAIT_LABELS.petPolicy[profile.petPolicy]?.icon || '🐾'}</span>
                      <div className="min-w-0">
                        <div className="font-label-caps text-[8px] text-primary-muted uppercase">Pets</div>
                        <div className="font-medium text-white truncate">{TRAIT_LABELS.petPolicy[profile.petPolicy]?.label || profile.petPolicy}</div>
                      </div>
                    </div>
                  )}

                  {profile.studyHabits && (
                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2">
                      <span className="text-base">{TRAIT_LABELS.studyHabits[profile.studyHabits]?.icon || '📚'}</span>
                      <div className="min-w-0">
                        <div className="font-label-caps text-[8px] text-primary-muted uppercase">Work/Study</div>
                        <div className="font-medium text-white truncate">{TRAIT_LABELS.studyHabits[profile.studyHabits]?.label || profile.studyHabits}</div>
                      </div>
                    </div>
                  )}

                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2">
                    <span className="text-base">{profile.foodSharing ? '🍲' : '🥡'}</span>
                    <div className="min-w-0">
                      <div className="font-label-caps text-[8px] text-primary-muted uppercase">Food Sharing</div>
                      <div className="font-medium text-white truncate">{profile.foodSharing ? 'Shared Cooking' : 'Individual Food'}</div>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="secondary" 
                  fullWidth 
                  size="sm"
                  onClick={() => navigate('/quiz')}
                  className="mt-2 text-xs"
                >
                  <RefreshCw size={13} className="mr-1.5" /> Retake Compatibility Quiz
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-primary-muted">Take the 2-minute quiz to unlock roommate matching scores and house compatibility ratings.</p>
                <Button onClick={() => navigate('/quiz')} size="sm" fullWidth className="bg-accent-orange text-obsidian font-bold">
                  Take the Quiz Now →
                </Button>
              </div>
            )}
          </div>

          {/* Current House Card */}
          {user?.currentHouse ? (
            <div className="bento-card rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-display text-lg font-bold text-white">
                  <Home size={18} className="text-accent-emerald" /> House Membership
                </div>
                <Badge color="green">Active</Badge>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <div className="font-display text-base font-bold text-white">{user.currentHouse.name}</div>
                {user.currentHouse.address && (
                  <p className="text-xs text-primary-muted leading-relaxed">{user.currentHouse.address}</p>
                )}
                
                {/* Invite Code Pill */}
                {user.currentHouse.inviteCode && (
                  <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs">
                    <span className="text-primary-muted font-label-caps text-[10px] uppercase">Invite Code</span>
                    <button 
                      onClick={handleCopyInviteCode}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white font-mono font-bold tracking-wider transition-colors"
                      title="Click to copy invite code"
                    >
                      {copiedCode ? <Check size={12} className="text-accent-emerald" /> : <Copy size={12} />}
                      {user.currentHouse.inviteCode}
                    </button>
                  </div>
                )}
              </div>

              <Button 
                variant="danger" 
                fullWidth 
                size="sm"
                onClick={openLeaveHouseModal}
                className="text-xs !border-accent-rose/30 hover:!bg-accent-rose hover:!text-white"
              >
                Leave This House
              </Button>
            </div>
          ) : (
            <div className="bento-card rounded-3xl p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-primary-muted">
                <Home size={18} />
              </div>
              <div className="font-display text-base font-bold text-white">No House Joined</div>
              <p className="text-xs text-primary-muted">Create your own shared home or join an existing house with an invite code.</p>
              <Button onClick={() => navigate('/house-setup')} size="sm" fullWidth>
                Set Up House →
              </Button>
            </div>
          )}

          {/* Sign Out Card */}
          <div className="bento-card rounded-3xl p-5 flex items-center justify-between gap-4 border-accent-rose/10 bg-accent-rose/[0.02]">
            <div>
              <div className="text-sm font-medium text-white">Account Session</div>
              <div className="text-xs text-primary-muted">Sign out of this browser</div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose text-xs font-bold border border-accent-rose/20 transition-all active:scale-95"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (lg:col-span-7) - COMPLETE EDIT PROFILE FORM */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Personal Information Form */}
          <div className="bento-card rounded-3xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-glass-border pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-white">Edit Profile Details</h3>
                <p className="text-xs text-primary-muted mt-0.5">Keep your identity and roommate preferences up to date</p>
              </div>
              {dirty && (
                <span className="font-label-caps text-[9px] text-accent-orange bg-accent-orange/10 px-2.5 py-1 rounded-full border border-accent-orange/20 animate-pulse">
                  Unsaved Changes
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Full Name */}
              <Input
                label="Full Name"
                placeholder="Your legal or preferred name"
                value={form.name}
                onChange={set('name')}
                icon={<User size={16} />}
              />

              {/* Phone Number */}
              <Input
                label="Phone Number"
                placeholder="+8801700000000"
                value={form.phone}
                onChange={set('phone')}
                icon={<Phone size={16} />}
              />

              {/* Occupation */}
              <Input
                label="Occupation / Role"
                placeholder="e.g. Software Engineer, Doctor, Student"
                value={form.occupation}
                onChange={set('occupation')}
                icon={<Briefcase size={16} />}
              />

              {/* Gender */}
              <Select
                label="Gender"
                value={form.gender}
                onChange={set('gender')}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Non-Binary</option>
              </Select>

              {/* Max Monthly Budget */}
              <Input
                label="Max Monthly Budget (BDT)"
                type="number"
                placeholder="e.g. 30000"
                value={form.budgetMax}
                onChange={set('budgetMax')}
                icon={<DollarSign size={16} />}
              />

              {/* bKash Wallet Number */}
              <Input
                label="bKash Wallet (For Expense Settlement)"
                placeholder="01711..."
                value={form.bkashNumber}
                onChange={set('bkashNumber')}
                icon={<Wallet size={16} />}
              />

            </div>

            {/* Roommate Bio */}
            <div>
              <div className="flex items-center justify-between mb-2 pl-1">
                <label className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-primary-muted">
                  About Me / Roommate Bio
                </label>
                <span className="font-mono text-[10px] text-primary-muted">
                  {form.bio.length}/300
                </span>
              </div>
              <textarea
                value={form.bio}
                onChange={set('bio')}
                placeholder="Introduce yourself to future roommates (habits, schedule, what you appreciate in a flatmate)..."
                rows={4}
                maxLength={300}
                className="w-full px-4 py-3.5 bg-white/5 border border-glass-border rounded-2xl text-[14px] text-white resize-y outline-none focus:border-accent-orange focus:bg-white/10 transition-colors placeholder:text-white/20"
              />
            </div>

          </div>

          {/* Password & Security Card */}
          <div className="bento-card rounded-3xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Key size={18} className="text-accent-cyan" /> Security & Password
                </h3>
                <p className="text-xs text-primary-muted mt-0.5">Manage your account authentication credentials</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="font-label-caps text-[10px] uppercase text-accent-cyan hover:underline tracking-wider"
              >
                {showPasswordSection ? 'Hide' : 'Change Password'}
              </button>
            </div>

            {showPasswordSection && (
              <div className="space-y-4 pt-4 border-t border-glass-border animate-fade-in">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  value={form.currentPassword}
                  onChange={set('currentPassword')}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={form.newPassword}
                    onChange={set('newPassword')}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="Repeat new password"
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Save Action Sticky Bar */}
          <div className="flex items-center justify-end gap-4 p-4 rounded-3xl bg-white/[0.02] border border-glass-border backdrop-blur-xl">
            {dirty && (
              <button
                type="button"
                onClick={() => {
                  setForm({
                    name:        user?.name || '',
                    phone:       user?.phone || '',
                    bio:         user?.bio || '',
                    avatar:      user?.avatar || '',
                    occupation:  user?.occupation || '',
                    gender:      user?.gender || '',
                    budgetMax:   user?.budgetMax ? String(user.budgetMax) : '',
                    bkashNumber: user?.bkashNumber || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  })
                }}
                className="px-5 py-3 rounded-2xl text-xs font-label-caps uppercase text-primary-muted hover:text-white transition-colors"
              >
                Reset
              </button>
            )}

            <Button 
              onClick={handleSave} 
              loading={loading} 
              disabled={!dirty}
              size="lg"
              className={`px-8 shadow-glow ${dirty ? 'bg-accent-orange text-obsidian font-bold hover:scale-[1.02] active:scale-[0.98]' : 'opacity-40 cursor-not-allowed'}`}
            >
              Save Profile Changes
            </Button>
          </div>

        </div>

      </div>

      {/* Financial Clearance & Leave House Modal */}
      {showLeaveModal && (
        <Overlay onClose={() => setShowLeaveModal(false)}>
          <div className="bento-card bg-obsidian/95 border border-accent-rose/30 shadow-[0_25px_60px_rgba(225,29,72,0.25)] rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-rose via-red-500 to-accent-orange" />
            
            <ModalHeader
              icon="🚪"
              title="Exit House Verification"
              subtitle="Financial & Governance Clearance Check"
              onClose={() => setShowLeaveModal(false)}
            />

            <div className="p-6 sm:p-8 space-y-6">
              {checkingDebts ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-accent-rose border-t-transparent animate-spin" />
                  <p className="text-xs text-primary-muted font-mono">Auditing financial ledger & chore rosters...</p>
                </div>
              ) : (
                <>
                  {/* Financial Debt Status Strip */}
                  {debtCheck.totalOwed > 0 ? (
                    <div className="p-4 rounded-2xl bg-accent-rose/10 border border-accent-rose/30 space-y-2">
                      <div className="flex items-center gap-2 text-accent-rose font-bold text-sm">
                        <AlertOctagon size={18} />
                        <span>Outstanding Debt: ৳{debtCheck.totalOwed.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-primary-muted leading-relaxed">
                        You cannot leave this house until all shared expense balances are settled with your roommates.
                      </p>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowLeaveModal(false)
                            navigate('/app/finance')
                          }}
                          className="px-4 py-2 rounded-xl bg-accent-rose text-white text-xs font-bold shadow-glow flex items-center gap-1.5"
                        >
                          <span>Go to Finance & Settle Dues</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/30 flex items-center gap-3">
                      <CheckCircle2 size={24} className="text-accent-emerald shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-accent-emerald">Zero Outstanding Dues (৳0.00)</div>
                        <p className="text-[11px] text-primary-muted">You have cleared all shared financial balances in this house.</p>
                      </div>
                    </div>
                  )}

                  {/* Checklist Summary */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-white block">Exit Verification Checklist:</span>
                    <div className="space-y-1.5 text-xs text-primary-muted">
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <span className={debtCheck.totalOwed === 0 ? "text-accent-emerald font-bold" : "text-accent-rose font-bold"}>
                          {debtCheck.totalOwed === 0 ? "✓" : "✗"}
                        </span>
                        <span>Financial balance clearance ({debtCheck.totalOwed === 0 ? "Settled" : `Owes ৳${debtCheck.totalOwed.toFixed(2)}`})</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-accent-emerald font-bold">✓</span>
                        <span>Pending chores reassigned automatically to house admin</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-accent-cyan font-bold">ℹ</span>
                        <span>Profile converts to Free Agent (eligible to join other houses)</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setShowLeaveModal(false)} className="flex-1 py-3 text-xs">
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleConfirmLeaveHouse}
                      loading={leaving}
                      disabled={debtCheck.totalOwed > 0}
                      className="flex-[2] py-3 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                    >
                      Confirm Departure
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Overlay>
      )}

    </div>
  )
}
