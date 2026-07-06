import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Select, Spinner } from '../components/ui'
import { Home, Hash, DollarSign, MapPin, Search, MessageCircle, Heart, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Overlay, ModalHeader } from '../components/finance/AddExpenseModal'

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
    name: '', address: '', totalRooms: '', monthlyRent: '', maxMembers: '6', currency: 'BDT', isPublic: false
  })
  const [createErrors, setCreateErrors] = useState({})
  const [images, setImages] = useState([]) // Array of File objects

  // Join form & Public Houses
  const [inviteCode, setInviteCode] = useState('')
  const [publicHouses, setPublicHouses] = useState([])
  const [loadingHouses, setLoadingHouses] = useState(false)
  const [selectedHouse, setSelectedHouse] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const setC = (k) => (e) => setCreateForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 4) {
      toast.error('Maximum 4 images allowed')
      return
    }
    setImages(prev => [...prev, ...files])
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const validateCreate = () => {
    const e = {}
    if (!createForm.name.trim())  e.name       = 'House name is required'
    if (!createForm.address.trim())e.address   = 'Address is required'
    if (!createForm.totalRooms)   e.totalRooms = 'Required'
    if (!createForm.monthlyRent)  e.monthlyRent= 'Required'
    setCreateErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = async () => {
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
      toast.success('House created!')
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
      const { data } = await api.get('/houses/public?limit=4')
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

  const handleJoinByCode = async () => {
    if (!inviteCode.trim()) { toast.error('Enter an invite code'); return }
    setLoading(true)
    try {
      await api.post('/houses/join', { inviteCode: inviteCode.trim().toUpperCase() })
      await refreshUser()
      toast.success('Joined house!')
      navigate('/app/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid invite code')
    } finally {
      setLoading(false)
    }
  }

  // ── Landing — pick mode ──────────────────────────────────
  if (!mode) return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6 md:px-[64px]">
      <div className="w-full max-w-2xl py-16">
        <div className="text-center mb-16">
          <div className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-accent-orange mb-4">[ ONBOARDING // STEP 02 OF 02 ]</div>
          <h1 className="font-display text-[48px] font-bold tracking-tight text-white leading-tight mb-4 animate-fade-up">
            Set up your home<span className="text-gradient">.</span>
          </h1>
          <p className="font-body text-[16px] text-primary-muted max-w-md mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Create a new house or discover highly compatible public houses to join.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => setMode('create')}
            className="text-center p-10 rounded-3xl glass-panel border border-glass-border hover:bg-white/10 hover:border-accent-orange/50 transition-all group"
          >
            <div className="text-[48px] mb-6 drop-shadow-md grayscale group-hover:grayscale-0 transition-all">🏠</div>
            <div className="font-display text-[22px] font-medium text-white mb-3">Create a house</div>
            <div className="font-body text-[14px] text-primary-muted leading-relaxed">
              Set up a new shared home and invite your roommates.
            </div>
          </button>

          <button
            onClick={() => setMode('join')}
            className="text-center p-10 rounded-3xl glass-panel border border-glass-border hover:bg-white/10 hover:border-accent-orange/50 transition-all group"
          >
            <div className="text-[48px] mb-6 drop-shadow-md grayscale group-hover:grayscale-0 transition-all">🔍</div>
            <div className="font-display text-[22px] font-medium text-white mb-3">Join a house</div>
            <div className="font-body text-[14px] text-primary-muted leading-relaxed">
              Browse public houses by compatibility or use a private invite code.
            </div>
          </button>
        </div>
      </div>
    </div>
  )

  // ── Join mode (Discovery & Private) ────────────────────────────────────────────
  if (mode === 'join') return (
    <div className="min-h-screen bg-obsidian flex flex-col md:flex-row px-6 md:px-[64px] py-20 gap-10">
      
      {/* Left Col: Private Join */}
      <div className="w-full md:w-1/3 flex flex-col gap-8 sticky top-20 h-fit">
        <div>
          <button onClick={() => setMode(null)} className="text-primary-muted hover:text-white font-label-caps mb-4">← Back</button>
          <div className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-accent-orange mb-2">[ PRIVATE JOIN ]</div>
          <h1 className="font-display text-[32px] font-bold tracking-tight text-white mb-2">Have a code?</h1>
          <p className="font-body text-[15px] text-primary-muted">Enter the 8-character invite code from your house admin.</p>
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-glow border border-glass-border">
          <Input
            placeholder="e.g. ROOM4B21"
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value.toUpperCase())}
            icon={<Hash size={16} />}
            className="uppercase tracking-[0.3em] font-mono font-bold text-[18px] text-center mb-4"
          />
          <Button onClick={handleJoinByCode} loading={loading} fullWidth className="shadow-[0_0_15px_rgba(6,182,212,0.2)]">Join house</Button>
        </div>
      </div>

      {/* Right Col: Public Discovery Feed */}
      <div className="w-full md:w-2/3">
        <div className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-accent-rose mb-2">[ DISCOVERY FEED ]</div>
        <h2 className="font-display text-[32px] font-bold tracking-tight text-white mb-8">Public Houses</h2>
        
        {loadingHouses ? (
          <div className="flex justify-center py-20"><Spinner size={32} /></div>
        ) : publicHouses.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center border border-glass-border">
            <div className="text-4xl mb-4">🏜️</div>
            <h3 className="font-display text-[24px] text-white mb-2">No public houses available</h3>
            <p className="text-primary-muted">Be the first to create one and set it to public!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {publicHouses.map((house, i) => (
              <div 
                key={house._id} 
                onClick={() => { setSelectedHouse(house); setCurrentImageIndex(0); }}
                className="glass-panel rounded-3xl border border-glass-border flex flex-col overflow-hidden animate-fade-up group cursor-pointer hover:border-accent-orange/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all" 
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Cover Image */}
                {house.images && house.images.length > 0 ? (
                  <div className="w-full h-32 bg-black/50 relative overflow-hidden shrink-0 border-b border-glass-border">
                    <img src={api.defaults.baseURL.replace('/api', '') + house.images[0]} alt="house cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-black/20 flex items-center justify-center shrink-0 border-b border-glass-border">
                    <Home size={32} className="text-white/10" />
                  </div>
                )}

                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-display text-2xl font-bold text-white group-hover:text-accent-orange transition-colors">{house.name}</h3>
                        <div className="flex items-center gap-1 text-primary-muted text-sm mt-1">
                          <MapPin size={12} /> {house.address}
                        </div>
                      </div>
                      {house.compatibilityScore !== null && (
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1 font-mono text-[20px] font-bold text-accent-rose bg-accent-rose/10 px-2 py-1 rounded-lg border border-accent-rose/20">
                            <Heart size={14} className="fill-accent-rose text-accent-rose" /> {house.compatibilityScore}%
                          </div>
                          <span className="font-label-caps text-[8px] text-accent-rose/70 mt-1">{house.compatibilityLabel}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-4 mb-2">
                      <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="font-label-caps text-[9px] text-primary-muted mb-1">Members</div>
                        <div className="font-display text-xl text-white">{house.memberCount} <span className="text-primary-muted text-sm">/ {house.maxMembers}</span></div>
                      </div>
                      <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="font-label-caps text-[9px] text-primary-muted mb-1">Rent</div>
                        <div className="font-mono text-lg text-white">{house.monthlyRent}<span className="text-xs text-primary-muted">{house.currency}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* House Details Modal */}
      {selectedHouse && (
        <Overlay onClose={() => setSelectedHouse(null)}>
          <div className="w-full max-w-2xl glass-panel p-0 border border-glass-border shadow-glow rounded-3xl !overflow-hidden">
            <ModalHeader title="House Details" onClose={() => setSelectedHouse(null)} />
            
            <div className="flex flex-col max-h-[75vh] overflow-y-auto">
              {/* Image Gallery */}
              {selectedHouse.images && selectedHouse.images.length > 0 ? (
                <div className="relative w-full h-72 bg-black/50 shrink-0">
                  <img src={api.defaults.baseURL.replace('/api', '') + selectedHouse.images[currentImageIndex]} alt="house" className="w-full h-full object-cover" />
                  
                  {selectedHouse.images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setCurrentImageIndex(i => (i === 0 ? selectedHouse.images.length - 1 : i - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black border border-glass-border transition-colors shadow-md"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={() => setCurrentImageIndex(i => (i === selectedHouse.images.length - 1 ? 0 : i + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black border border-glass-border transition-colors shadow-md"
                      >
                        <ChevronRight size={20} />
                      </button>
                      
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                        {selectedHouse.images.map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i === currentImageIndex ? 'bg-white shadow-[0_0_5px_white]' : 'bg-white/30'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-48 bg-black/20 flex items-center justify-center shrink-0 border-b border-glass-border">
                  <Home size={48} className="text-white/10" />
                </div>
              )}

              {/* Details */}
              <div className="p-8 flex flex-col gap-6">
                <div>
                  <h2 className="font-display text-3xl font-bold text-white mb-2">{selectedHouse.name}</h2>
                  <div className="flex items-center gap-1 text-primary-muted text-sm">
                    <MapPin size={16} /> {selectedHouse.address}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="font-label-caps text-[10px] text-primary-muted mb-1">Rent</div>
                    <div className="font-mono text-xl text-white">{selectedHouse.monthlyRent} <span className="text-sm text-primary-muted">{selectedHouse.currency}</span></div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="font-label-caps text-[10px] text-primary-muted mb-1">Capacity</div>
                    <div className="font-display text-xl text-white">{selectedHouse.memberCount} <span className="text-sm text-primary-muted">/ {selectedHouse.maxMembers}</span></div>
                  </div>
                </div>

                {selectedHouse.compatibilityScore !== null && (
                  <div className="bg-accent-rose/10 p-5 rounded-xl border border-accent-rose/20 flex justify-between items-center">
                    <div>
                      <div className="font-display text-white font-bold text-lg mb-1">Compatibility Score</div>
                      <div className="font-body text-sm text-accent-rose/80">{selectedHouse.compatibilityLabel}</div>
                    </div>
                    <div className="font-mono text-3xl font-bold text-accent-rose flex items-center gap-2 drop-shadow-[0_0_10px_rgba(225,29,72,0.5)]">
                      <Heart size={24} className="fill-accent-rose" /> {selectedHouse.compatibilityScore}%
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={() => selectedHouse.adminId ? navigate(`/chat/${selectedHouse.adminId}`) : toast.error('No admin available')} 
                  size="lg" 
                  className="mt-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                >
                  Message Admin to Join
                </Button>
              </div>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  )

  // ── Create mode ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6 md:px-[64px] py-20">
      <div className="w-full max-w-xl">
        <div className="text-center mb-12">
          <div className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-accent-orange mb-4">[ ONBOARDING // CREATE ]</div>
          <h1 className="font-display text-[40px] font-bold tracking-tight text-white mb-4">Create your house</h1>
          <p className="font-body text-[15px] text-primary-muted">You will be the admin. Share the invite code with your roommates.</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-glow">
          <div className="flex flex-col gap-6">
            <Input
              label="House name"
              placeholder='e.g. "Flat 4B - Dhanmondi"'
              value={createForm.name}
              onChange={setC('name')}
              error={createErrors.name}
              icon={<Home size={16} />}
            />
            <Input
              label="Address"
              placeholder="Full address"
              value={createForm.address}
              onChange={setC('address')}
              error={createErrors.address}
              icon={<MapPin size={16} />}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Total rooms"
                type="number"
                min="1"
                placeholder="4"
                value={createForm.totalRooms}
                onChange={setC('totalRooms')}
                error={createErrors.totalRooms}
              />
              <Input
                label="Max members"
                type="number"
                min="2"
                placeholder="6"
                value={createForm.maxMembers}
                onChange={setC('maxMembers')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Monthly rent"
                type="number"
                placeholder="30000"
                value={createForm.monthlyRent}
                onChange={setC('monthlyRent')}
                error={createErrors.monthlyRent}
                icon={<DollarSign size={16} />}
              />
              <Select
                label="Currency"
                value={createForm.currency}
                onChange={setC('currency')}
              >
                <option value="BDT" className="bg-obsidian text-white">BDT ৳</option>
                <option value="USD" className="bg-obsidian text-white">USD $</option>
                <option value="EUR" className="bg-obsidian text-white">EUR €</option>
                <option value="GBP" className="bg-obsidian text-white">GBP £</option>
                <option value="INR" className="bg-obsidian text-white">INR ₹</option>
              </Select>
            </div>
            
            <label className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-glass-border cursor-pointer hover:bg-white/10 transition-colors">
              <input 
                type="checkbox" 
                checked={createForm.isPublic}
                onChange={setC('isPublic')}
                className="w-5 h-5 rounded border-glass-border bg-transparent text-accent-orange focus:ring-accent-orange focus:ring-offset-obsidian"
              />
              <div>
                <div className="font-display text-white font-medium">Make house public</div>
                <div className="font-body text-xs text-primary-muted">List this house in the public discovery feed so others can join based on compatibility.</div>
              </div>
            </label>

            {/* Image Upload UI */}
            <div className="bg-white/5 p-4 rounded-2xl border border-glass-border">
              <div className="font-label-caps text-xs text-primary-muted mb-3">House Photos (Max 4)</div>
              <div className="flex flex-wrap gap-4">
                {images.map((file, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-glass-border shadow-md">
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:text-accent-rose transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {images.length < 4 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-glass-border flex flex-col items-center justify-center cursor-pointer hover:border-accent-orange hover:text-accent-orange text-primary-muted transition-colors">
                    <ImageIcon size={20} className="mb-1" />
                    <span className="text-[10px] font-label-caps uppercase">Add</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleCreate} loading={loading} fullWidth size="lg" className="mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                Create house
              </Button>
              <Button variant="ghost" onClick={() => setMode(null)} fullWidth className="text-primary-muted hover:text-white">← Back</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
