import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Spinner, Avatar } from '../components/ui'
import { Heart, MessageCircle, Filter, DollarSign, Briefcase, User as UserIcon, X, MapPin } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Overlay, ModalHeader } from '../components/finance/AddExpenseModal'

export default function FindRoommatesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [roommates, setRoommates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    budgetMax: '',
    gender: '',
    occupation: ''
  })
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchRoommates = async (pageNum = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', pageNum)
      params.append('limit', 12)
      if (filters.budgetMax) params.append('budgetMax', filters.budgetMax)
      if (filters.gender) params.append('gender', filters.gender)
      if (filters.occupation) params.append('occupation', filters.occupation)

      const { data } = await api.get(`/matching/roommates?${params.toString()}`)
      setRoommates(data.roommates)
      setTotalPages(data.totalPages)
      setPage(data.currentPage)
    } catch (err) {
      console.error(err)
      toast.error('Could not load recommended roommates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoommates(1)
  }, [filters]) // Re-fetch on filter change

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="w-full px-4 md:px-[64px] pb-24 relative z-10 flex flex-col md:flex-row gap-8">
      
      {/* Mobile Filter Toggle */}
      <div className="md:hidden flex justify-end">
        <Button onClick={() => setShowFilters(!showFilters)} variant="secondary" className="flex items-center gap-2">
          <Filter size={16} /> Filters
        </Button>
      </div>

      {/* Filter Sidebar */}
      <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
        <div className="glass-panel p-6 rounded-3xl border border-glass-border sticky top-32">
          <h2 className="font-display text-xl text-white mb-6 flex items-center gap-2"><Filter size={18} className="text-accent-orange" /> Filters</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-label-caps text-primary-muted mb-2 uppercase tracking-[0.1em]">Max Budget</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-muted" />
                <input 
                  type="number" 
                  name="budgetMax"
                  value={filters.budgetMax}
                  onChange={handleFilterChange}
                  placeholder="e.g. 5000"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-8 pr-4 text-sm text-white focus:outline-none focus:border-accent-orange transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-label-caps text-primary-muted mb-2 uppercase tracking-[0.1em]">Gender</label>
              <select 
                name="gender" 
                value={filters.gender}
                onChange={handleFilterChange}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-accent-orange transition-colors appearance-none"
              >
                <option value="">Any Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-label-caps text-primary-muted mb-2 uppercase tracking-[0.1em]">Occupation</label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-muted" />
                <input 
                  type="text" 
                  name="occupation"
                  value={filters.occupation}
                  onChange={handleFilterChange}
                  placeholder="e.g. Student"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-8 pr-4 text-sm text-white focus:outline-none focus:border-accent-orange transition-colors"
                />
              </div>
            </div>
            
            <button 
              onClick={() => setFilters({ budgetMax: '', gender: '', occupation: '' })}
              className="w-full text-xs text-primary-muted hover:text-white transition-colors pt-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {/* Header */}
        <div className="mb-8">
          <div className="font-label-caps text-[12px] uppercase tracking-[0.15em] text-accent-orange mb-2">Algorithm Match</div>
          <h1 className="font-display text-[48px] md:text-[64px] font-bold text-white leading-[1.1] tracking-tight">Find Roommates<span className="text-accent-orange">.</span></h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size={32} /></div>
        ) : roommates.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center border border-glass-border">
            <div className="text-4xl mb-4">🏜️</div>
            <h3 className="font-display text-[24px] text-white mb-2">No users found</h3>
            <p className="text-primary-muted">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {roommates.map((r, i) => (
              <div 
                key={r._id} 
                className="group relative bg-obsidian border border-glass-border rounded-[32px] p-6 animate-fade-up overflow-hidden hover:border-accent-orange/40 transition-all duration-300"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/0 to-accent-rose/0 group-hover:from-accent-orange/5 group-hover:to-accent-rose/5 transition-all duration-500 rounded-[32px]" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar name={r.name} src={r.avatar} size={64} className="border-2 border-glass-border group-hover:border-accent-orange/50 transition-colors" />
                      <div>
                        <h3 className="font-display text-2xl font-bold text-white tracking-tight">{r.name}</h3>
                        {r.occupation && (
                          <div className="font-label-caps text-[10px] uppercase tracking-[0.1em] text-accent-orange/80 mt-1">{r.occupation}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="relative group/tooltip">
                        <div className="w-12 h-12 rounded-full border-2 border-accent-rose flex items-center justify-center bg-accent-rose/10 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                          <span className="font-mono text-sm font-bold text-white">{r.score}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-4 text-xs font-mono text-primary-muted">
                    {r.gender && (
                      <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg capitalize border border-white/10"><UserIcon size={12} /> {r.gender}</span>
                    )}
                    {r.budgetMax && (
                      <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10"><DollarSign size={12} /> Max ৳{r.budgetMax}</span>
                    )}
                  </div>
                  
                  <div className="text-sm text-primary-muted line-clamp-2 mb-6 h-10 flex-1">
                    {r.bio || 'This user prefers to let their compatibility score speak for them.'}
                  </div>

                  <div className="pt-4 border-t border-glass-border flex gap-3 mt-auto">
                    <Button 
                      variant="secondary"
                      onClick={() => setSelectedUser(r)}
                      className="flex-1 py-3 text-xs"
                    >
                      View Profile
                    </Button>
                    <Button 
                      onClick={() => navigate(`/chat/${r._id}`)}
                      className="flex-1 py-3 bg-white text-obsidian hover:bg-neutral-200 text-xs font-bold"
                    >
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            <Button disabled={page === 1} onClick={() => fetchRoommates(page - 1)} variant="outline" size="sm">Prev</Button>
            <span className="flex items-center px-4 font-mono text-primary-muted text-sm">Page {page} of {totalPages}</span>
            <Button disabled={page === totalPages} onClick={() => fetchRoommates(page + 1)} variant="outline" size="sm">Next</Button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <Overlay onClose={() => setSelectedUser(null)}>
          <div className="w-full max-w-lg glass-panel p-0 border border-glass-border shadow-glow rounded-3xl !overflow-hidden flex flex-col max-h-[85vh]">
            <ModalHeader title={`${selectedUser.name}'s Profile`} onClose={() => setSelectedUser(null)} />
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col items-center mb-6 text-center">
                <Avatar name={selectedUser.name} src={selectedUser.avatar} size={96} className="mb-4 shadow-xl border-4 border-glass-border" />
                <h2 className="font-display text-3xl font-bold text-white mb-1">{selectedUser.name}</h2>
                <p className="text-primary-muted text-sm max-w-md">{selectedUser.bio || 'No bio provided'}</p>
                
                <div className="flex gap-3 mt-4">
                  {selectedUser.occupation && <span className="text-xs font-label-caps uppercase text-accent-orange bg-accent-orange/10 px-3 py-1.5 rounded-full">{selectedUser.occupation}</span>}
                  {selectedUser.gender && <span className="text-xs font-label-caps uppercase text-primary-muted bg-white/10 px-3 py-1.5 rounded-full">{selectedUser.gender}</span>}
                  {selectedUser.budgetMax && <span className="text-xs font-label-caps uppercase text-accent-emerald bg-accent-emerald/10 px-3 py-1.5 rounded-full">Max ৳{selectedUser.budgetMax}</span>}
                </div>

                <div className="mt-6 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-accent-rose flex items-center justify-center bg-accent-rose/10 shadow-glow mb-2">
                    <span className="font-mono text-2xl font-bold text-white">{selectedUser.score}%</span>
                  </div>
                  <span className="font-label-caps text-[10px] text-accent-rose/70 uppercase tracking-[0.15em]">{selectedUser.label}</span>
                </div>
              </div>

              <div className="bg-black/30 rounded-2xl p-5 border border-white/5 mb-6">
                <h3 className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-primary-muted mb-4">Compatibility Breakdown</h3>
                <div className="space-y-4">
                  {Object.entries(selectedUser.breakdown || {}).map(([trait, score]) => (
                    <div key={trait} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white font-medium capitalize">{trait.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-primary-muted font-mono">{Math.round(score * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent-rose transition-all duration-1000 ease-out" 
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Button 
                  onClick={() => navigate(`/chat/${selectedUser._id}`)}
                  className="w-full flex items-center justify-center gap-2 py-4 shadow-xl"
                  size="lg"
                >
                  <MessageCircle size={20} /> Start Chat & Invite
                </Button>
              </div>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  )
}
