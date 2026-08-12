import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Spinner, EmptyState, Avatar } from '../components/ui'
import api from '../services/api'
import { Activity, DollarSign, CheckSquare, Wrench, AlertTriangle, FileText, Users, ArrowDown, Sparkles, TrendingUp, Trophy } from 'lucide-react'

// Internal component for progress bars
const StatBar = ({ icon, label, count, total, color, textClass }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2">
          <div className={`${textClass}`}>{icon}</div>
          <span className="text-white text-sm font-medium">{label}</span>
        </div>
        <span className="font-mono text-xs text-primary-muted">{count} <span className="text-white/30">({percentage}%)</span></span>
      </div>
      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

export default function ActivityPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const houseId = user?.currentHouse?._id || user?.currentHouse
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [stats, setStats] = useState({ total: 0 })

  const fetchActivities = useCallback(async (pageNum = 1, isLoadMore = false) => {
    if (!houseId) return
    
    if (isLoadMore) setLoadingMore(true)
    else setLoading(true)

    try {
      const { data } = await api.get(`/activities/house/${houseId}?page=${pageNum}&limit=20`)
      
      if (isLoadMore) {
        setActivities(prev => [...prev, ...(data.activities || [])])
      } else {
        setActivities(data.activities || [])
      }
      
      setHasMore(pageNum < data.totalPages)
      setStats({ total: data.totalActivities })
      
    } catch (error) {
      console.error("Failed to load activities", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [houseId])

  useEffect(() => {
    fetchActivities(1, false)
  }, [fetchActivities])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchActivities(nextPage, true)
  }

  // Helper to safely get icon and color based on action type
  const getStyling = (type) => {
    if (!type) return { icon: <Activity size={18} />, color: "text-primary-muted", bg: "bg-glass-panel border-glass-border" }
    
    if (type.includes('expense')) return { 
      icon: <DollarSign size={18} />, 
      color: "text-accent-emerald", 
      bg: "bg-accent-emerald/10 border-accent-emerald/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
    }
    if (type.includes('chore')) return { 
      icon: <CheckSquare size={18} />, 
      color: "text-accent-purple", 
      bg: "bg-accent-purple/10 border-accent-purple/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
    }
    if (type.includes('maintenance')) return { 
      icon: <Wrench size={18} />, 
      color: "text-accent-rose", 
      bg: "bg-accent-rose/10 border-accent-rose/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]" 
    }
    if (type.includes('complaint')) return { 
      icon: <AlertTriangle size={18} />, 
      color: "text-accent-orange", 
      bg: "bg-accent-orange/10 border-accent-orange/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]" 
    }
    if (type.includes('rule')) return { 
      icon: <FileText size={18} />, 
      color: "text-accent-cyan", 
      bg: "bg-accent-cyan/10 border-accent-cyan/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]" 
    }
    if (type.includes('member')) return { 
      icon: <Users size={18} />, 
      color: "text-white", 
      bg: "bg-white/10 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.15)]" 
    }
    
    return { icon: <Activity size={18} />, color: "text-primary-muted", bg: "bg-glass-panel border-glass-border" }
  }

  // Format date grouping (e.g. "Today", "Yesterday", "Oct 24, 2024")
  const groupedActivities = useMemo(() => {
    const groups = {}
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    activities.forEach(activity => {
      const date = new Date(activity.createdAt)
      date.setHours(0, 0, 0, 0)
      
      let dateLabel = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      if (date.getTime() === today.getTime()) dateLabel = "Today"
      else if (date.getTime() === yesterday.getTime()) dateLabel = "Yesterday"
      
      if (!groups[dateLabel]) groups[dateLabel] = []
      groups[dateLabel].push(activity)
    })
    
    return groups
  }, [activities])

  const analytics = useMemo(() => {
    let chores = 0
    let expenses = 0
    let maintenance = 0
    let rules = 0

    activities.forEach(a => {
      if (a.actionType?.includes('chore')) chores++
      if (a.actionType?.includes('expense')) expenses++
      if (a.actionType?.includes('maintenance')) maintenance++
      if (a.actionType?.includes('rule')) rules++
    })

    return { chores, expenses, maintenance, rules }
  }, [activities])

  const topContributors = useMemo(() => {
    const counts = {}
    activities.forEach(a => {
      if (!a.user) return
      const id = a.user._id || a.user
      if (!counts[id]) counts[id] = { user: a.user, count: 0 }
      counts[id].count++
    })
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5)
  }, [activities])

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No house" description="JOIN A HOUSE FIRST" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  return (
    <div className="w-full px-6 md:px-[64px] pb-24">
      {/* Compact Stats Row */}
      {stats.total > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-[24px] font-bold text-white">{stats.total}</span>
          <span className="font-label-caps text-primary-muted">Total Activities</span>
        </div>
      )}

      {loading && !activities.length ? (
        <div className="flex justify-center py-20"><Spinner size={40} color="#06B6D4" /></div>
      ) : activities.length === 0 ? (
        <div className="glass-panel rounded-[32px] p-12 max-w-3xl text-center border border-glass-border">
          <EmptyState icon="📝" title="No activities yet" description="THINGS ARE QUIET AROUND HERE" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Timeline (Left Side) */}
          <div className="lg:col-span-8 relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-[39px] md:left-[43px] top-4 bottom-0 w-[2px] bg-glass-border" />

          <div className="space-y-10 relative">
            {Object.entries(groupedActivities).map(([dateLabel, dayActivities]) => (
              <div key={dateLabel} className="relative z-10">
                {/* Date Header Segment */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-[80px] md:w-[88px] flex justify-center">
                    <div className="px-4 py-1.5 rounded-full bg-glass-panel border border-glass-border shadow-md backdrop-blur-md whitespace-nowrap">
                      <span className="font-label-caps text-[11px] font-bold uppercase tracking-widest text-white">
                        {dateLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-glass-border to-transparent" />
                </div>

                {/* Day's Activities */}
                <div className="space-y-6">
                  {dayActivities.map(activity => {
                    const style = getStyling(activity.actionType)
                    
                    return (
                      <div key={activity._id} className="flex gap-6 md:gap-8 group">
                        
                        {/* Timeline Icon Node */}
                        <div className="flex flex-col items-center pt-2 w-[80px] md:w-[88px] shrink-0">
                          <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${style.bg} ${style.color}`}>
                            {style.icon}
                          </div>
                          <span className="font-mono text-[10px] text-primary-muted mt-2 opacity-70 group-hover:opacity-100 transition-opacity">
                            {new Date(activity.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </span>
                        </div>

                        {/* Activity Content Card */}
                        <div className="flex-1 glass-panel p-5 md:p-6 rounded-3xl border border-glass-border group-hover:border-white/20 transition-all duration-300 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] group-hover:-translate-y-1">
                          
                          <div className="flex items-start gap-4">
                            <div className="relative shrink-0">
                              <Avatar name={activity.user?.name} src={activity.user?.avatar} size={48} className="border border-white/10" />
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${style.bg} ${style.color}`}>
                                {/* Tiny version of the icon in the avatar corner */}
                                <div className="scale-[0.5]">{style.icon}</div>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display text-[18px] md:text-[20px] font-semibold text-white leading-tight mb-1">
                                {activity.title}
                              </h3>
                              
                              {activity.description && (
                                <p className="font-body text-[14px] md:text-[15px] text-primary-muted mb-3">
                                  {activity.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-3">
                                <span className="font-label-caps text-[10px] uppercase tracking-widest text-white/50 bg-white/5 px-2 py-1 rounded">
                                  {activity.user?.name || "Unknown User"}
                                </span>
                                
                                <span className={`font-label-caps text-[10px] uppercase tracking-widest px-2 py-1 rounded ${style.color} bg-black/20`}>
                                  {activity.actionType?.replace('_', ' ') || 'activity'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-12 mb-8 relative z-10 pl-[80px] md:pl-[88px]">
              <Button 
                onClick={loadMore} 
                disabled={loadingMore}
                variant="outline"
                className="rounded-full px-8 py-6 group"
              >
                {loadingMore ? <Spinner size={20} /> : (
                  <div className="flex items-center gap-2">
                    <span className="font-label-caps tracking-widest">Load More History</span>
                    <ArrowDown size={16} className="text-primary-muted group-hover:text-white transition-colors group-hover:translate-y-1 duration-300" />
                  </div>
                )}
              </Button>
            </div>
          )}
          </div>

          {/* Right Sidebar Analytics */}
          <div className="lg:col-span-4 sticky top-24 space-y-6 hidden lg:block">
            
            {/* House Pulse */}
            <div className="glass-panel p-6 rounded-3xl border border-glass-border">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={18} className="text-accent-orange" />
                <h3 className="font-display text-[22px] font-bold text-white">House Pulse</h3>
              </div>
              
              <div className="space-y-6">
                <StatBar 
                  icon={<DollarSign size={14} />} 
                  label="Expenses Logged" 
                  count={analytics.expenses} 
                  total={activities.length} 
                  color="bg-accent-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                  textClass="text-accent-emerald"
                />
                <StatBar 
                  icon={<CheckSquare size={14} />} 
                  label="Chores Completed" 
                  count={analytics.chores} 
                  total={activities.length} 
                  color="bg-accent-purple shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                  textClass="text-accent-purple"
                />
                <StatBar 
                  icon={<FileText size={14} />} 
                  label="Rules Proposed" 
                  count={analytics.rules} 
                  total={activities.length} 
                  color="bg-accent-cyan shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                  textClass="text-accent-cyan"
                />
                <StatBar 
                  icon={<Wrench size={14} />} 
                  label="Maintenance Reported" 
                  count={analytics.maintenance} 
                  total={activities.length} 
                  color="bg-accent-rose shadow-[0_0_10px_rgba(244,63,94,0.5)]" 
                  textClass="text-accent-rose"
                />
              </div>
            </div>

            {/* Top Contributors */}
            <div className="glass-panel p-6 rounded-3xl border border-glass-border">
              <div className="flex items-center gap-2 mb-6">
                <Trophy size={18} className="text-accent-orange" />
                <h3 className="font-display text-[22px] font-bold text-white">Top Contributors</h3>
              </div>
              
              <div className="space-y-4">
                {topContributors.map((contributor, index) => (
                  <div key={contributor.user?._id || index} className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar name={contributor.user?.name} src={contributor.user?.avatar} size={40} />
                        {index === 0 && (
                          <div className="absolute -top-2 -right-2 text-xl filter drop-shadow-lg">👑</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate max-w-[120px]">{contributor.user?.name || "Unknown"}</p>
                        <p className="text-primary-muted text-[10px] uppercase font-label-caps tracking-widest">{contributor.count} Actions</p>
                      </div>
                    </div>
                    <div className="font-mono text-xl font-bold text-white/20">
                      #{index + 1}
                    </div>
                  </div>
                ))}
                
                {topContributors.length === 0 && (
                  <p className="text-sm text-primary-muted text-center py-4">No data yet.</p>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}
