import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Select, Spinner, Badge, Avatar } from '../components/ui'
import { 
  Home, Hash, DollarSign, MapPin, Search, MessageCircle, 
  Heart, X, Image as ImageIcon, ChevronLeft, ChevronRight, 
  Sparkles, ShieldCheck, Users, Plus, UploadCloud, CheckCircle2, ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Overlay, ModalHeader } from '../components/finance/AddExpenseModal'

const RENT_PRESETS = [
  { label: '৳20k', value: 20000 },
  { label: '৳35k', value: 35000 },
  { label: '৳45k', value: 45000 },
  { label: '৳60k+', value: 60000 },
]

export default function HouseSetupPage() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  // Redirect if no compatibility profile
  useEffect(() => {
    if (user && !user.compatibilityProfile?.sleepSchedule) {
      toast('Please complete the compatibility quiz first.', { icon: '🧠' })
      navigate('/quiz')
    }
  }, [user, navigate])

  const [mode, setMode]       = useState(null) // 'create' | 'join'
  const [loading, setLoading] = useState(false)

  // Create form
  const [createForm, setCreateForm] = useState({
    name: '',
    address: '',
    totalRooms: '3',
    monthlyRent: '35000',
    maxMembers: '4',
    currency: 'BDT',
    isPublic: true
  })
  const [createErrors, setCreateErrors] = useState({})
  const [images, setImages] = useState([]) // Array of File objects
  const [imagePreviews, setImagePreviews] = useState([])

  // Join form & Public Houses
  const [inviteCode, setInviteCode] = useState('')
  const [publicHouses, setPublicHouses] = useState([])
  const [loadingHouses, setLoadingHouses] = useState(false)
  const [selectedHouse, setSelectedHouse] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const setC = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setCreateForm(f => ({ ...f, [k]: val }))
    setCreateErrors(er => ({ ...er, [k]: undefined }))
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 4) {
      toast.error('Maximum 4 images allowed')
      return
    }
    const newImages = [...images, ...files]
    setImages(newImages)
    
    // Generate previews
    const previews = newImages.map(file => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newImages.map(file => URL.createObjectURL(file)))
  }

  const validateCreate = () => {
    const e = {}
    if (!createForm.name.trim())    e.name        = 'House name is required'
    if (!createForm.address.trim()) e.address     = 'Address / location is required'
    if (!createForm.totalRooms)     e.totalRooms  = 'Number of rooms is required'
    if (!createForm.monthlyRent)    e.monthlyRent = 'Monthly rent is required'
    setCreateErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = async (e) => {
    if (e) e.preventDefault()
    if (!validateCreate()) return
    setLoading(true)
    try {
      let uploadedImageUrls = []
      if (images.length > 0) {
        const uploadPromises = images.map(file => {
          const formData = new FormData()
          formData.append('image', file)
          return api.post('/upload', formData)
        })
        const res = await Promise.all(uploadPromises)
        uploadedImageUrls = res.map(r => r.data.url)
      }

      await api.post('/houses', {
        ...createForm,
        totalRooms:  Number(createForm.totalRooms),
        monthlyRent: Number(createForm.monthlyRent),
        maxMembers:  Number(createForm.maxMembers),
        images: uploadedImageUrls
      })
      await refreshUser()
      toast.success('🎉 House profile created! Welcome to your dashboard.')
      navigate('/app/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create house')
    } finally {
      setLoading(false)
    }
  }

  const fetchPublicHouses = async () => {
    setLoadingHouses(true)
    try {
      const { data } = await api.get('/houses/public?limit=6')
      setPublicHouses(data.houses || [])
    } catch (err) {
      console.error(err)
      toast.error('Could not load public houses')
    } finally {
      setLoadingHouses(false)
    }
  }

  useEffect(() => {
    if (mode === 'join') {
      fetchPublicHouses()
    }
  }, [mode])

  const handleJoinByCode = async (codeToUse) => {
    const targetCode = codeToUse || inviteCode
    if (!targetCode?.trim()) { 
      toast.error('Please enter an 8-character invite code')
      return 
    }
    setLoading(true)
    try {
      await api.post('/houses/join', { inviteCode: targetCode.trim().toUpperCase() })
      await refreshUser()
      toast.success('🎉 Joined house successfully! Welcome to your new home.')
      navigate('/app/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired invite code')
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // 1. LANDING MODE SELECTION (CREATE VS JOIN)
  // =========================================================
  if (!mode) return (
    <div className="min-h-screen bg-obsidian flex flex-col justify-center items-center px-4 sm:px-8 py-16 relative overflow-hidden text-white font-body">
      
      {/* Background Glows */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-accent-orange/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-accent-purple/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-accent-orange font-label-caps text-[10px] uppercase tracking-wider">
            <Sparkles size={12} className="animate-pulse" /> Step 2: Living Space Onboarding
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            How would you like to <span className="text-gradient">begin?</span>
          </h1>

          <p className="font-body text-base text-primary-muted max-w-lg mx-auto leading-relaxed">
            Set up a brand new shared house with your current roommates, or discover compatible public apartments in Dhaka.
          </p>
        </div>

        {/* 2 Big Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Create House Card */}
          <div
            onClick={() => setMode('create')}
            className="bento-card rounded-3xl p-8 sm:p-10 border-white/10 hover:border-accent-orange/50 cursor-pointer group transition-all duration-300 hover:shadow-[0_0_35px_rgba(249,115,22,0.2)] flex flex-col justify-between space-y-8 bg-white/[0.02] backdrop-blur-xl"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center text-3xl text-accent-orange group-hover:scale-110 transition-transform shadow-glow">
                🏠
              </div>
              <h3 className="font-display text-2xl font-bold text-white group-hover:text-accent-orange transition-colors">
                Create a New House
              </h3>
              <p className="text-sm text-primary-muted leading-relaxed">
                Set up a house profile, configure monthly rent and rooms, and generate an 8-character invite code for your roommates.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-accent-orange group-hover:translate-x-1 transition-transform">
              <span>Start House Setup</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Join House Card */}
          <div
            onClick={() => setMode('join')}
            className="bento-card rounded-3xl p-8 sm:p-10 border-white/10 hover:border-accent-purple/50 cursor-pointer group transition-all duration-300 hover:shadow-[0_0_35px_rgba(124,58,237,0.2)] flex flex-col justify-between space-y-8 bg-white/[0.02] backdrop-blur-xl"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-3xl text-accent-purple group-hover:scale-110 transition-transform shadow-glow">
                🔍
              </div>
              <h3 className="font-display text-2xl font-bold text-white group-hover:text-accent-purple transition-colors">
                Join or Discover Houses
              </h3>
              <p className="text-sm text-primary-muted leading-relaxed">
                Enter an invite code from your house admin or browse public house listings ranked by compatibility with your lifestyle quiz.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-accent-purple group-hover:translate-x-1 transition-transform">
              <span>Enter Code or Browse</span>
              <ArrowRight size={15} />
            </div>
          </div>

        </div>

      </div>

    </div>
  )

  // =========================================================
  // 2. CREATE HOUSE FORM MODE
  // =========================================================
  if (mode === 'create') return (
    <div className="min-h-screen bg-obsidian py-12 px-4 sm:px-8 lg:px-12 text-white font-body relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-orange/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMode(null)}
            className="flex items-center gap-1.5 text-xs text-primary-muted hover:text-white font-label-caps uppercase tracking-wider transition-colors p-2 rounded-xl hover:bg-white/5"
          >
            <ChevronLeft size={16} /> Back to options
          </button>
          
          <span className="text-xs text-primary-muted font-mono">Step 2 • House Setup</span>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Create House Profile
          </h1>
          <p className="text-sm text-primary-muted">
            Configure your apartment details. You can invite your roommates immediately after creation.
          </p>
        </div>

        {/* Bento Form */}
        <form onSubmit={handleCreate} className="bento-card rounded-3xl p-6 sm:p-10 border-white/10 shadow-2xl space-y-6">
          
          {/* Row 1: Name & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="House / Apartment Name *"
              placeholder='e.g. "Mirpur Nest", "Banani Loft"'
              value={createForm.name}
              onChange={setC('name')}
              error={createErrors.name}
              icon={<Home size={16} />}
              className="bg-white/5 border-glass-border text-white text-sm"
            />

            <Input
              label="Address / Neighborhood *"
              placeholder='e.g. "House 42, Road 11, Mirpur 2, Dhaka"'
              value={createForm.address}
              onChange={setC('address')}
              error={createErrors.address}
              icon={<MapPin size={16} />}
              className="bg-white/5 border-glass-border text-white text-sm"
            />
          </div>

          {/* Row 2: Rooms, Rent & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Total Bedrooms *"
              type="number"
              min="1"
              max="15"
              placeholder="3"
              value={createForm.totalRooms}
              onChange={setC('totalRooms')}
              error={createErrors.totalRooms}
              className="bg-white/5 border-glass-border text-white text-sm"
            />

            <Input
              label="Monthly Rent (BDT) *"
              type="number"
              min="1000"
              step="500"
              placeholder="35000"
              value={createForm.monthlyRent}
              onChange={setC('monthlyRent')}
              error={createErrors.monthlyRent}
              className="bg-white/5 border-glass-border text-white text-sm font-mono"
            />

            <Input
              label="Max Roommate Capacity *"
              type="number"
              min="2"
              max="12"
              placeholder="4"
              value={createForm.maxMembers}
              onChange={setC('maxMembers')}
              className="bg-white/5 border-glass-border text-white text-sm"
            />
          </div>

          {/* Monthly Rent Preset Chips */}
          <div className="space-y-1.5">
            <label className="text-xs text-primary-muted font-medium block">Quick Rent Presets</label>
            <div className="flex gap-2">
              {RENT_PRESETS.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setCreateForm(f => ({ ...f, monthlyRent: String(r.value) }))}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-mono transition-all ${
                    Number(createForm.monthlyRent) === r.value
                      ? 'bg-accent-orange text-obsidian font-bold shadow-glow'
                      : 'bg-white/5 text-primary-muted hover:text-white border border-white/5'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Gallery Upload Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-primary-muted font-medium">House Photos (Up to 4 images)</label>
              <span className="text-[10px] text-primary-muted font-mono">{images.length}/4 selected</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-accent-rose text-white transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {images.length < 4 && (
                <label className="aspect-video rounded-2xl border-2 border-dashed border-white/10 hover:border-accent-orange/50 bg-white/[0.02] hover:bg-white/[0.05] flex flex-col items-center justify-center cursor-pointer transition-all">
                  <UploadCloud size={20} className="text-primary-muted mb-1" />
                  <span className="text-[11px] text-primary-muted">Add Image</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Public Discovery Switch */}
          <div 
            onClick={() => setCreateForm(f => ({ ...f, isPublic: !f.isPublic }))}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Public Discovery Listing</span>
                {createForm.isPublic && <Badge color="accent" className="text-[9px]">Live on Feed</Badge>}
              </div>
              <p className="text-[11px] text-primary-muted">
                Allow prospective roommates in Dhaka to discover this house profile and apply
              </p>
            </div>

            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${
              createForm.isPublic ? 'bg-accent-orange' : 'bg-white/10'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-obsidian transition-transform ${
                createForm.isPublic ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setMode(null)}
              className="py-3 px-6 text-xs"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              loading={loading}
              className="flex-1 py-3 text-xs bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-orange-600 text-obsidian font-bold shadow-glow"
            >
              Create House & Launch Dashboard →
            </Button>
          </div>

        </form>

      </div>

    </div>
  )

  // =========================================================
  // 3. JOIN OR DISCOVERY MODE
  // =========================================================
  return (
    <div className="min-h-screen bg-obsidian py-12 px-4 sm:px-8 lg:px-12 text-white font-body relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-purple/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMode(null)}
            className="flex items-center gap-1.5 text-xs text-primary-muted hover:text-white font-label-caps uppercase tracking-wider transition-colors p-2 rounded-xl hover:bg-white/5"
          >
            <ChevronLeft size={16} /> Back to options
          </button>

          <span className="text-xs text-primary-muted font-mono">Step 2 • Join or Discover</span>
        </div>

        {/* 2-Column Layout (Private Code Box + Public Listings Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: 8-Char Invite Code Fast Pass (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bento-card rounded-3xl p-6 sm:p-8 border-white/10 shadow-2xl space-y-4 sticky top-8">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple font-label-caps text-[10px] uppercase tracking-wider">
                  <Hash size={12} /> Direct Private Invite
                </div>
                <h3 className="font-display text-xl font-bold text-white">Have an Invite Code?</h3>
                <p className="text-xs text-primary-muted leading-relaxed">
                  Enter the 8-character invite code provided by your house admin.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Input
                  placeholder="e.g. ROOM4B21"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  icon={<Hash size={16} />}
                  className="uppercase tracking-[0.25em] font-mono font-bold text-base text-center bg-white/5 border-glass-border"
                />

                <Button
                  onClick={() => handleJoinByCode()}
                  loading={loading}
                  fullWidth
                  className="py-3 text-xs bg-gradient-to-r from-accent-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold shadow-glow"
                >
                  Join House Now →
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Public Discovery Houses (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                  Public Houses in Dhaka
                </h2>
                <p className="text-xs text-primary-muted mt-0.5">
                  Ranked by compatibility with your 8-trait lifestyle quiz.
                </p>
              </div>

              <Badge color="accent" className="font-mono text-xs">{publicHouses.length} Available</Badge>
            </div>

            {loadingHouses ? (
              <div className="flex justify-center py-20">
                <Spinner size={36} color="#00E5FF" />
              </div>
            ) : publicHouses.length === 0 ? (
              <div className="bento-card rounded-3xl p-12 text-center border-white/10 space-y-3">
                <div className="text-4xl">🏠</div>
                <h4 className="font-display text-lg font-bold text-white">No Public Houses Currently Listed</h4>
                <p className="text-xs text-primary-muted max-w-sm mx-auto">
                  Be the first to create an open house profile or join your roommates via private invite code!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publicHouses.map((house) => {
                  const score = house.compatibilityScore || 90
                  return (
                    <div
                      key={house._id}
                      onClick={() => {
                        setSelectedHouse(house)
                        setCurrentImageIndex(0)
                      }}
                      className="bento-card rounded-3xl border-white/10 hover:border-accent-orange/40 p-5 cursor-pointer group transition-all duration-300 hover:shadow-glow flex flex-col justify-between space-y-4 bg-white/[0.02]"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-display text-lg font-bold text-white group-hover:text-accent-orange transition-colors truncate">
                              {house.name}
                            </h4>
                            <p className="text-xs text-primary-muted flex items-center gap-1 mt-0.5 truncate">
                              <MapPin size={12} className="shrink-0" /> {house.address}
                            </p>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-accent-rose/10 border border-accent-rose/20 text-accent-rose font-mono text-xs font-bold flex items-center gap-1 shrink-0">
                            <Heart size={12} className="fill-accent-rose" /> {score}%
                          </span>
                        </div>

                        {/* Metric Chips */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-label-caps uppercase text-primary-muted block">Members</span>
                            <span className="text-xs font-bold text-white font-mono">
                              {house.memberCount || house.members?.length || 1} / {house.maxMembers || 4}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-label-caps uppercase text-primary-muted block">Rent / mo</span>
                            <span className="text-xs font-bold text-accent-orange font-mono">
                              ৳{Number(house.monthlyRent || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors">
                        View House Details →
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* House Details Modal */}
      {selectedHouse && (
        <Overlay onClose={() => setSelectedHouse(null)}>
          <div className="bento-card bg-obsidian/95 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] rounded-3xl overflow-hidden relative max-h-[85vh] flex flex-col">
            
            <ModalHeader
              icon="🏠"
              title={selectedHouse.name}
              subtitle={selectedHouse.address}
              onClose={() => setSelectedHouse(null)}
            />

            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar">
              
              {/* Photo Carousel or House Banner */}
              {selectedHouse.images && selectedHouse.images.length > 0 ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group">
                  <img 
                    src={selectedHouse.images[currentImageIndex]} 
                    alt="House preview" 
                    className="w-full h-full object-cover" 
                  />
                  {selectedHouse.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCurrentImageIndex(i => i === 0 ? selectedHouse.images.length - 1 : i - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentImageIndex(i => i === selectedHouse.images.length - 1 ? 0 : i + 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {selectedHouse.images.map((_, idx) => (
                          <div 
                            key={idx} 
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/40'
                            }`} 
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-accent-purple/10 to-accent-orange/10 border border-white/5 flex items-center gap-3.5">
                  <div className="text-3xl">🏡</div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Spacious Apartment in {selectedHouse.address.split(',')[0]}</h4>
                    <p className="text-xs text-primary-muted">{selectedHouse.totalRooms || 3} Bedroom Flat with communal amenities</p>
                  </div>
                </div>
              )}

              {/* Stats & Financial Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <span className="text-[10px] font-label-caps uppercase text-primary-muted block">Total Rent</span>
                  <span className="text-sm font-bold text-accent-orange font-mono">
                    ৳{Number(selectedHouse.monthlyRent || 0).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <span className="text-[10px] font-label-caps uppercase text-primary-muted block">Estimated / Person</span>
                  <span className="text-sm font-bold text-accent-cyan font-mono">
                    ৳{Math.round(Number(selectedHouse.monthlyRent || 0) / (selectedHouse.maxMembers || 4)).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <span className="text-[10px] font-label-caps uppercase text-primary-muted block">Occupancy</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {selectedHouse.memberCount || selectedHouse.members?.length || 1} / {selectedHouse.maxMembers || 4}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <span className="text-[10px] font-label-caps uppercase text-primary-muted block">Synergy Match</span>
                  <span className="text-sm font-bold text-accent-rose font-mono flex items-center justify-center gap-1">
                    <Heart size={12} className="fill-accent-rose text-accent-rose" />
                    {selectedHouse.compatibilityScore || 90}%
                  </span>
                </div>
              </div>

              {/* Current Housemate Roster */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-primary-muted">
                  <span className="font-medium text-white">Current Housemates ({selectedHouse.members?.length || 1})</span>
                  <span className="font-mono text-[10px]">
                    {(selectedHouse.maxMembers || 4) - (selectedHouse.memberCount || selectedHouse.members?.length || 1)} Vacancies Open
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {selectedHouse.members && selectedHouse.members.length > 0 ? (
                    selectedHouse.members.map((member) => (
                      <div 
                        key={member._id}
                        className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={member.name} src={member.avatar} size={36} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-white truncate">{member.name}</h5>
                              {member.role === 'admin' && (
                                <Badge color="accent" className="text-[9px] py-0 px-1.5">Admin</Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-primary-muted truncate">{member.occupation || 'Resident'}</p>
                          </div>
                        </div>

                        {member.compatibilityScore && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-accent-rose font-bold shrink-0">
                            <Heart size={11} className="fill-accent-rose" /> {member.compatibilityScore}%
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-2xl bg-white/5 text-xs text-primary-muted">
                      Admin: {selectedHouse.adminName || 'House Manager'}
                    </div>
                  )}
                </div>
              </div>

              {/* Living Perks & Amenities */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-white block">House Amenities & Governance</span>
                <div className="flex flex-wrap gap-1.5">
                  {['📶 High-Speed WiFi', '🍳 Shared Kitchen & Dining', '💸 Auto bKash Ledger', '🧹 Rotating Chores Duty', '📜 Democratic House Rules', '🔒 24/7 Security'].map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/5 text-[11px] text-primary-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* House Admin Consultation & Invite Code Notice */}
              <div className="p-4 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple shrink-0 mt-0.5">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Private House Verification Required</h5>
                    <p className="text-[11px] text-primary-muted leading-relaxed mt-0.5">
                      To protect community harmony and house security, direct joins are restricted. Please message the House Admin ({selectedHouse.adminName || 'Admin'}) to introduce yourself and request their unique 8-character invite code.
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    fullWidth
                    onClick={() => {
                      if (selectedHouse.adminId) {
                        navigate(`/app/chat/${selectedHouse.adminId}`)
                      } else {
                        navigate('/app/messages')
                      }
                    }}
                    className="py-3.5 text-xs bg-gradient-to-r from-accent-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold shadow-glow flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={15} />
                    <span>Message Admin to Consult & Request Invite →</span>
                  </Button>
                </div>
              </div>

            </div>

          </div>
        </Overlay>
      )}

    </div>
  )
}
