import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Spinner } from '../components/ui'
import { Home, MapPin, MessageCircle, Heart, ChevronLeft, ChevronRight, Search, SlidersHorizontal, DoorOpen } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Overlay, ModalHeader } from '../components/finance/AddExpenseModal'

export default function DiscoverPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [publicHouses, setPublicHouses] = useState([])
  const [loadingHouses, setLoadingHouses] = useState(true)
  const [selectedHouse, setSelectedHouse] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Pagination & Filtering State
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  
  const [filters, setFilters] = useState({
    search: '',
    rentMax: '',
    roomsMin: ''
  })
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    rentMax: '',
    roomsMin: ''
  })

  const fetchPublicHouses = useCallback(async (currentPage, currentFilters) => {
    setLoadingHouses(true)
    try {
      const query = new URLSearchParams()
      query.append('page', currentPage)
      query.append('limit', 12)
      
      if (currentFilters.search) query.append('search', currentFilters.search)
      if (currentFilters.rentMax) query.append('rentMax', currentFilters.rentMax)
      if (currentFilters.roomsMin) query.append('roomsMin', currentFilters.roomsMin)

      const { data } = await api.get(`/houses/public?${query.toString()}`)
      setPublicHouses(data.houses || [])
      setTotalPages(data.totalPages || 1)
      setTotalResults(data.totalResults || 0)
    } catch (err) {
      console.error(err)
      toast.error('Could not load public houses')
    } finally {
      setLoadingHouses(false)
    }
  }, [])

  useEffect(() => {
    fetchPublicHouses(page, appliedFilters)
  }, [page, appliedFilters, fetchPublicHouses])

  const handleApplyFilters = () => {
    setPage(1)
    setAppliedFilters({ ...filters })
  }

  const handleClearFilters = () => {
    const emptyFilters = { search: '', rentMax: '', roomsMin: '' }
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setPage(1)
  }

  return (
    <div className="w-full px-4 md:px-[64px] pb-24 relative z-10">
      
      {/* Compact Stats Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[24px] font-bold text-white">{totalResults}</span>
          <span className="font-label-caps text-primary-muted">Houses Found</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Filter Sidebar */}
        <div className="lg:col-span-3 sticky top-24 glass-panel p-6 rounded-3xl border border-glass-border space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <SlidersHorizontal size={18} className="text-accent-orange" />
            <h3 className="font-display text-[22px] font-bold text-white">Filters</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-label-caps text-[10px] text-primary-muted mb-2">Search Name or Address</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                  type="text" 
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-accent-rose focus:ring-1 focus:ring-accent-rose outline-none transition-all"
                  placeholder="e.g. Downtown"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-[10px] text-primary-muted mb-2">Max Monthly Rent</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">$</span>
                <input 
                  type="number" 
                  value={filters.rentMax}
                  onChange={(e) => setFilters({...filters, rentMax: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white text-sm focus:border-accent-rose focus:ring-1 focus:ring-accent-rose outline-none transition-all"
                  placeholder="Any"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-[10px] text-primary-muted mb-2">Min Total Rooms</label>
              <div className="relative">
                <DoorOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                  type="number" 
                  value={filters.roomsMin}
                  onChange={(e) => setFilters({...filters, roomsMin: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-accent-rose focus:ring-1 focus:ring-accent-rose outline-none transition-all"
                  placeholder="Any"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
            <Button onClick={handleApplyFilters} className="w-full">Apply Filters</Button>
            <Button onClick={handleClearFilters} variant="outline" className="w-full opacity-60 hover:opacity-100 border-white/10 hover:border-white/30">Clear All</Button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-9 space-y-8">
          {loadingHouses ? (
            <div className="flex justify-center py-20"><Spinner size={40} color="#E11D48" /></div>
          ) : publicHouses.length === 0 ? (
            <div className="glass-panel rounded-3xl p-16 text-center border border-glass-border">
              <div className="text-5xl mb-6">🏜️</div>
              <h3 className="font-display text-[28px] font-bold text-white mb-3">No houses match</h3>
              <p className="text-primary-muted text-lg">Try adjusting your filters to see more results.</p>
              <Button onClick={handleClearFilters} variant="outline" className="mt-6 border-white/20">Clear Filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {publicHouses.map((house, i) => (
                  <div 
                    key={house._id} 
                    onClick={() => { setSelectedHouse(house); setCurrentImageIndex(0); }}
                    className="glass-panel rounded-3xl border border-glass-border flex flex-col overflow-hidden animate-fade-up group cursor-pointer hover:border-accent-orange/50 hover:shadow-[0_0_20px_rgba(225,29,72,0.15)] transition-all" 
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {/* Cover Image */}
                    {house.images && house.images.length > 0 ? (
                      <div className="w-full h-40 bg-black/50 relative overflow-hidden shrink-0 border-b border-glass-border">
                        <img src={api.defaults.baseURL.replace('/api', '') + house.images[0]} alt="house cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-black/20 flex items-center justify-center shrink-0 border-b border-glass-border">
                        <Home size={32} className="text-white/10 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}

                    <div className="p-5 flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <div className="min-w-0">
                            <h3 className="font-display text-xl font-bold text-white group-hover:text-accent-rose transition-colors truncate">{house.name}</h3>
                            <div className="flex items-center gap-1 text-primary-muted text-xs mt-1 truncate">
                              <MapPin size={12} className="shrink-0" /> <span className="truncate">{house.address}</span>
                            </div>
                          </div>
                          {house.compatibilityScore !== null && (
                            <div className="flex flex-col items-end shrink-0">
                              <div className="flex items-center gap-1 font-mono text-[16px] font-bold text-accent-rose bg-accent-rose/10 px-2 py-1 rounded-lg border border-accent-rose/20 shadow-[0_0_10px_rgba(225,29,72,0.2)]">
                                <Heart size={12} className="fill-accent-rose text-accent-rose" /> {house.compatibilityScore}%
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                            <div className="font-label-caps text-[9px] text-primary-muted mb-1">Members</div>
                            <div className="font-display text-lg text-white leading-none">{house.memberCount} <span className="text-primary-muted text-xs">/ {house.maxMembers}</span></div>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                            <div className="font-label-caps text-[9px] text-primary-muted mb-1">Rent</div>
                            <div className="font-mono text-base text-white leading-none">{house.monthlyRent}<span className="text-[10px] text-primary-muted ml-0.5">{house.currency}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-6 pt-6 border-t border-white/5">
                  <Button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                    variant="outline"
                    className="p-3 rounded-xl border-white/10"
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  <span className="font-mono text-sm text-primary-muted">
                    Page <span className="text-white font-bold">{page}</span> of {totalPages}
                  </span>
                  <Button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages}
                    variant="outline"
                    className="p-3 rounded-xl border-white/10"
                  >
                    <ChevronRight size={20} />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* House Details Modal */}
      {selectedHouse && (
        <Overlay onClose={() => setSelectedHouse(null)}>
          <div className="w-full max-w-2xl glass-panel p-0 border border-glass-border shadow-[0_0_30px_rgba(225,29,72,0.15)] rounded-3xl !overflow-hidden">
            <ModalHeader title="House Details" onClose={() => setSelectedHouse(null)} />
            
            <div className="flex flex-col max-h-[75vh] overflow-y-auto">
              {/* Image Gallery */}
              {selectedHouse.images && selectedHouse.images.length > 0 ? (
                <div className="relative w-full h-72 bg-black/50 shrink-0 group">
                  <img src={api.defaults.baseURL.replace('/api', '') + selectedHouse.images[currentImageIndex]} alt="house" className="w-full h-full object-cover" />
                  
                  {selectedHouse.images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setCurrentImageIndex(i => (i === 0 ? selectedHouse.images.length - 1 : i - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black border border-glass-border transition-colors shadow-md opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={() => setCurrentImageIndex(i => (i === selectedHouse.images.length - 1 ? 0 : i + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black border border-glass-border transition-colors shadow-md opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight size={20} />
                      </button>
                      
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
                        {selectedHouse.images.map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? 'bg-white shadow-[0_0_5px_white]' : 'bg-white/30 hover:bg-white/50 cursor-pointer'}`} onClick={() => setCurrentImageIndex(i)} />
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

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="font-label-caps text-[10px] text-primary-muted mb-1">Rent</div>
                    <div className="font-mono text-xl text-white">{selectedHouse.monthlyRent} <span className="text-sm text-primary-muted">{selectedHouse.currency}</span></div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="font-label-caps text-[10px] text-primary-muted mb-1">Total Rooms</div>
                    <div className="font-mono text-xl text-white">{selectedHouse.totalRooms || '?'}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 col-span-2 md:col-span-1">
                    <div className="font-label-caps text-[10px] text-primary-muted mb-1">Capacity</div>
                    <div className="font-display text-xl text-white">{selectedHouse.memberCount} <span className="text-sm text-primary-muted">/ {selectedHouse.maxMembers}</span></div>
                  </div>
                </div>

                {selectedHouse.compatibilityScore !== null && (
                  <div className="bg-accent-rose/10 p-5 rounded-2xl border border-accent-rose/20 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-rose/20 rounded-full blur-[40px] pointer-events-none" />
                    <div className="relative z-10">
                      <div className="font-display text-white font-bold text-lg mb-1">Compatibility Match</div>
                      <div className="font-body text-sm text-accent-rose/80">{selectedHouse.compatibilityLabel}</div>
                    </div>
                    <div className="relative z-10 font-mono text-4xl font-bold text-accent-rose flex items-center gap-2 drop-shadow-[0_0_15px_rgba(225,29,72,0.6)]">
                      <Heart size={28} className="fill-accent-rose" /> {selectedHouse.compatibilityScore}%
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={() => selectedHouse.adminId ? navigate(`/app/chat/${selectedHouse.adminId}`) : toast.error('No admin available')} 
                  size="lg" 
                  className="mt-4 shadow-[0_0_20px_rgba(225,29,72,0.2)] hover:shadow-[0_0_25px_rgba(225,29,72,0.4)] transition-shadow text-lg"
                  style={{ backgroundColor: '#E11D48' }} // Hardcoded primary red button for this specific action
                >
                  <MessageCircle size={20} className="mr-2" /> Message Admin to Join
                </Button>
              </div>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  )
}
