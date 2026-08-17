import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Badge, Avatar, Button, Spinner, ProgressBar, EmptyState, PageTransition, AnimatedNumber, fadeSlideUp } from '../components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import { 
  Heart, ChevronDown, ChevronUp, Users, AlertCircle, MessageCircle, 
  Sparkles, ShieldCheck, Scale, Zap, Info, ArrowRight, FileText, Check, 
  RefreshCw, Sliders, Layers
} from 'lucide-react'

const TRAIT_DEFINITIONS = {
  sleepSchedule: {
    label: 'Sleep Schedule',
    weight: '25%',
    weightNum: 25,
    icon: '😴',
    options: {
      early_bird: 'Early Bird (10 PM - 6 AM)',
      night_owl:  'Night Owl (Late night)',
      flexible:   'Flexible schedule',
    }
  },
  cleanlinessLevel: {
    label: 'Cleanliness',
    weight: '20%',
    weightNum: 20,
    icon: '🧹',
    options: {
      5: 'Spotless (5/5)',
      4: 'Pretty Clean (4/5)',
      3: 'Moderate (3/5)',
      2: 'Relaxed (2/5)',
      1: 'Very Relaxed (1/5)',
    }
  },
  noiseTolerance: {
    label: 'Noise Tolerance',
    weight: '15%',
    weightNum: 15,
    icon: '🔉',
    options: {
      silent:   'Silence needed',
      low:      'Low noise tolerance',
      moderate: 'Moderate ambient noise',
      high:     'High noise tolerance',
    }
  },
  guestPolicy: {
    label: 'Guest Policy',
    weight: '15%',
    weightNum: 15,
    icon: '👥',
    options: {
      never:     'No overnight guests',
      rarely:    'Rare guests (with notice)',
      sometimes: 'Weekend guests',
      often:     'Frequent visitors',
    }
  },
  smokingPolicy: {
    label: 'Smoking Policy',
    weight: '10%',
    weightNum: 10,
    icon: '🚭',
    options: {
      no_smoking:   'Strictly non-smoking',
      outside_only: 'Outside balcony only',
      anywhere:     'Smoking allowed',
    }
  },
  petPolicy: {
    label: 'Pet Policy',
    weight: '8%',
    weightNum: 8,
    icon: '🐾',
    options: {
      no_pets:    'No pets preferred',
      small_pets: 'Small pets allowed',
      any_pets:   'Pet friendly',
    }
  },
  studyHabits: {
    label: 'Work / Study Habits',
    weight: '5%',
    weightNum: 5,
    icon: '📚',
    options: {
      at_home: 'Works from home',
      library: 'Works outside/office',
      mixed:   'Hybrid schedule',
    }
  },
  foodSharing: {
    label: 'Food Sharing',
    weight: '2%',
    weightNum: 2,
    icon: '🍲',
    options: {
      true:  'Shared cooking & groceries',
      false: 'Separate individual food',
    }
  },
}

const scoreColor = (score) =>
  score >= 80 ? '#00E5FF' : // Cyan
  score >= 65 ? '#10B981' : // Emerald
  score >= 45 ? '#F59E0B' : // Amber
  '#F43F5E'                 // Rose

const scoreBadgeColor = (score) =>
  score >= 80 ? 'accent'  :
  score >= 65 ? 'green'   :
  score >= 45 ? 'yellow'  :
  'red'

export default function MatchingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [scores,    setScores]    = useState([])
  const [summary,   setSummary]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [expanded,  setExpanded]  = useState(null)
  const [noProfile, setNoProfile] = useState(false)
  const [viewMode,  setViewMode]  = useState('roommates') // 'roommates' | 'matrix' | 'formula'

  const houseId = user?.currentHouse?._id || user?.currentHouse
  const myProfile = user?.compatibilityProfile || {}

  useEffect(() => {
    if (!houseId) { setLoading(false); return }
    Promise.all([
      api.get(`/matching/house/${houseId}`),
      api.get(`/matching/house/${houseId}/summary`),
    ]).then(([s, sum]) => {
      setScores(s.data)
      setSummary(sum.data)
    }).catch(err => {
      if (err.response?.status === 400) setNoProfile(true)
    }).finally(() => setLoading(false))
  }, [houseId])

  const toggleExpand = (id) => setExpanded(e => e === id ? null : id)

  // Calculate house-wide trait strengths and potential friction points
  const houseAnalysis = useMemo(() => {
    if (!scores.length) return { strengths: [], friction: [] }
    
    const traitAverages = {}
    Object.keys(TRAIT_DEFINITIONS).forEach(trait => {
      let sum = 0
      let count = 0
      scores.forEach(s => {
        if (s.breakdown && s.breakdown[trait] !== undefined) {
          sum += s.breakdown[trait]
          count++
        }
      })
      traitAverages[trait] = count > 0 ? (sum / count) * 100 : 0
    })

    const sortedTraits = Object.entries(traitAverages).sort((a, b) => b[1] - a[1])
    
    return {
      strengths: sortedTraits.filter(([_, score]) => score >= 75).slice(0, 3),
      friction:  sortedTraits.filter(([_, score]) => score < 60).slice(0, 2),
    }
  }, [scores])

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No House Joined" description="JOIN OR CREATE A HOUSE FIRST TO VIEW HARMONY SCORES" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set Up House</Button>
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center h-[70vh]">
      <Spinner size={32} color="#00E5FF" />
    </div>
  )

  if (noProfile) return (
    <div className="max-w-md mx-auto py-20 px-6 text-center bento-card rounded-3xl mt-12 space-y-4">
      <div className="text-4xl">🧠</div>
      <h1 className="text-2xl font-display font-bold tracking-tight text-white">Complete Your Quiz First</h1>
      <p className="text-sm font-body text-primary-muted leading-relaxed">
        Your 8-dimension lifestyle assessment is needed to calculate compatibility against your housemates.
      </p>
      <Button onClick={() => navigate('/quiz')} className="bg-accent-orange text-obsidian font-bold shadow-glow">
        Take Compatibility Quiz →
      </Button>
    </div>
  )

  return (
    <PageTransition className="w-full px-4 lg:px-8 xl:px-10 pb-24 space-y-8">
      
      {/* ========================================================= */}
      {/* 1. HOUSE HARMONY HEALTH HERO BENTO */}
      {/* ========================================================= */}
      {summary?.overallScore != null && (
        <motion.div variants={fadeSlideUp} className="bento-card rounded-3xl p-8 lg:p-10 relative overflow-hidden group">
          <div 
            className="absolute top-0 left-0 right-0 h-1.5" 
            style={{ backgroundColor: scoreColor(summary.overallScore) }} 
          />
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-orange/10 rounded-full blur-[90px] pointer-events-none group-hover:bg-accent-orange/20 transition-all duration-700" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Overall Harmony Score */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div className="font-label-caps text-xs mb-3 flex items-center gap-2 tracking-widest text-primary-muted uppercase">
                <Users size={14} className="text-accent-orange" /> Collective House Harmony Score
              </div>
              
              <div className="flex items-baseline gap-3">
                <div className="font-display text-[72px] lg:text-[92px] font-bold tracking-tight leading-none text-white drop-shadow-md">
                  <AnimatedNumber value={summary.overallScore} />
                </div>
                <div className="font-display text-2xl lg:text-3xl text-primary-muted font-medium">/ 100</div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Badge color={scoreBadgeColor(summary.overallScore)} className="shadow-glow px-4 py-2 text-sm font-bold tracking-wide">
                  {summary.label}
                </Badge>
                
                {summary.membersWithoutQuiz > 0 && (
                  <div className="flex items-center gap-1.5 font-label-caps text-[10px] uppercase tracking-wider text-accent-rose bg-accent-rose/10 px-3 py-1.5 rounded-full border border-accent-rose/20">
                    <AlertCircle size={12} />
                    {summary.membersWithoutQuiz} missing quiz
                  </div>
                )}
              </div>
            </div>

            {/* Right: Harmony Synergy Matrix (Strengths & Friction) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* House Strengths */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="font-label-caps text-[10px] uppercase text-accent-emerald tracking-widest flex items-center gap-1.5">
                  <Sparkles size={13} /> House Synergy Points
                </div>
                {houseAnalysis.strengths.length > 0 ? (
                  <div className="space-y-2">
                    {houseAnalysis.strengths.map(([trait, score]) => (
                      <div key={trait} className="flex items-center justify-between text-xs">
                        <span className="text-white flex items-center gap-1.5">
                          <span>{TRAIT_DEFINITIONS[trait]?.icon}</span>
                          <span className="truncate">{TRAIT_DEFINITIONS[trait]?.label}</span>
                        </span>
                        <span className="font-mono font-bold text-accent-emerald">{Math.round(score)}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-primary-muted">Calculating house synergies...</p>
                )}
              </div>

              {/* Potential Friction Watch */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="font-label-caps text-[10px] uppercase text-accent-rose tracking-widest flex items-center gap-1.5">
                  <Zap size={13} /> Living Habit Nuances
                </div>
                {houseAnalysis.friction.length > 0 ? (
                  <div className="space-y-2">
                    {houseAnalysis.friction.map(([trait, score]) => (
                      <div key={trait} className="flex items-center justify-between text-xs">
                        <span className="text-white flex items-center gap-1.5">
                          <span>{TRAIT_DEFINITIONS[trait]?.icon}</span>
                          <span className="truncate">{TRAIT_DEFINITIONS[trait]?.label}</span>
                        </span>
                        <span className="font-mono font-bold text-accent-rose">{Math.round(score)}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-primary-muted text-accent-emerald flex items-center gap-1">
                    <Check size={13} /> High alignment across all living habits!
                  </p>
                )}
              </div>

            </div>

          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* 2. NAVIGATION TABS (Roommate Scores, Pair Matrix, Formula) */}
      {/* ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-glass-border pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('roommates')}
            className={`px-4 py-2 rounded-full font-label-caps text-xs uppercase tracking-wider transition-all ${
              viewMode === 'roommates'
                ? 'bg-white text-obsidian font-bold shadow-glow'
                : 'bg-white/5 text-primary-muted hover:text-white hover:bg-white/10'
            }`}
          >
            <Users size={13} className="inline mr-1.5 -mt-0.5" /> Roommate Comparisons ({scores.length})
          </button>

          {summary?.pairScores?.length > 0 && (
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-4 py-2 rounded-full font-label-caps text-xs uppercase tracking-wider transition-all ${
                viewMode === 'matrix'
                  ? 'bg-white text-obsidian font-bold shadow-glow'
                  : 'bg-white/5 text-primary-muted hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers size={13} className="inline mr-1.5 -mt-0.5" /> All-House Pair Matrix
            </button>
          )}

          <button
            onClick={() => setViewMode('formula')}
            className={`px-4 py-2 rounded-full font-label-caps text-xs uppercase tracking-wider transition-all ${
              viewMode === 'formula'
                ? 'bg-white text-obsidian font-bold shadow-glow'
                : 'bg-white/5 text-primary-muted hover:text-white hover:bg-white/10'
            }`}
          >
            <Scale size={13} className="inline mr-1.5 -mt-0.5" /> Algorithm Weights (8 Traits)
          </button>
        </div>

        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => navigate('/quiz')} 
          className="text-xs"
        >
          <RefreshCw size={13} className="mr-1.5" /> Retake My Quiz
        </Button>
      </div>

      {/* ========================================================= */}
      {/* 3. VIEW MODE 1: INDIVIDUAL ROOMMATE COMPARISON CARDS */}
      {/* ========================================================= */}
      {viewMode === 'roommates' && (
        scores.length === 0 ? (
          <div className="bento-card rounded-3xl p-12 text-center">
            <EmptyState icon="👥" title="No Roommate Scores Yet" description="ROOMMATES NEED TO COMPLETE THE COMPATIBILITY QUIZ" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {scores.map((s) => {
              const isOpen = expanded === s.user._id
              const theirProfile = s.user.compatibilityProfile || {}

              return (
                <div 
                  key={s.user._id} 
                  className="bento-card interactive rounded-3xl overflow-hidden transition-all duration-300 border border-glass-border hover:border-white/20"
                >
                  {/* Card Header Row */}
                  <button
                    onClick={() => toggleExpand(s.user._id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 w-full p-6 md:p-8 text-left relative z-10 group/row"
                  >
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <Avatar 
                        name={s.user.name} 
                        size={60} 
                        src={s.user.avatar} 
                        className="shadow-lg ring-2 ring-white/10 shrink-0" 
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-xl md:text-2xl font-bold text-white tracking-tight truncate">
                            {s.user.name}
                          </h3>
                          {s.user.occupation && (
                            <span className="font-label-caps text-[9px] uppercase tracking-wider text-accent-orange bg-accent-orange/10 px-2 py-0.5 rounded-full border border-accent-orange/20">
                              {s.user.occupation}
                            </span>
                          )}
                        </div>

                        {/* Top habit badges */}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-primary-muted">
                          {theirProfile.sleepSchedule && (
                            <span className="flex items-center gap-1">
                              {TRAIT_DEFINITIONS.sleepSchedule.icon} {TRAIT_DEFINITIONS.sleepSchedule.options[theirProfile.sleepSchedule]}
                            </span>
                          )}
                          {theirProfile.cleanlinessLevel && (
                            <span className="flex items-center gap-1">
                              {TRAIT_DEFINITIONS.cleanlinessLevel.icon} {TRAIT_DEFINITIONS.cleanlinessLevel.options[theirProfile.cleanlinessLevel]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Score & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                      <div className="text-left sm:text-right">
                        <div 
                          className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-none drop-shadow-md"
                          style={{ color: scoreColor(s.score) }}
                        >
                          {s.score}%
                        </div>
                        <Badge color={scoreBadgeColor(s.score)} className="mt-1 font-bold text-[9px] uppercase tracking-wider">
                          {s.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/app/chat/${s.user._id}`); }}
                          title={`Chat with ${s.user.name}`}
                          className="p-3 rounded-full bg-accent-purple/20 text-accent-purple hover:bg-accent-purple hover:text-white border border-accent-purple/30 transition-all active:scale-95 shadow-sm"
                        >
                          <MessageCircle size={18} />
                        </button>
                        
                        <div className="p-3 rounded-full bg-white/5 text-primary-muted group-hover/row:text-white group-hover/row:bg-white/10 border border-glass-border transition-colors">
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Detailed Breakdown */}
                  {isOpen && (
                    <div className="px-6 md:px-8 pb-8 pt-2 relative z-10 border-t border-glass-border animate-fade-in space-y-6">
                      
                      {/* Compatibility Insight Note */}
                      <div className="p-5 rounded-2xl bg-white/[0.03] border-l-4 border-accent-orange text-sm text-white/90 leading-relaxed space-y-2">
                        <div className="font-display font-bold text-white flex items-center gap-2">
                          <ShieldCheck size={16} className="text-accent-orange" /> Cohabitation Compatibility Analysis
                        </div>
                        <p className="text-primary-muted text-xs leading-relaxed">
                          {s.score >= 80 && 'Exceptional harmony. You and this roommate share almost identical lifestyle rhythms, cleanliness standards, and noise preferences.'}
                          {s.score >= 65 && s.score < 80 && 'Good match. You share the primary core values. Minor variations in guest policies or schedules can easily be discussed.'}
                          {s.score >= 45 && s.score < 65 && 'Moderate alignment. Some habit differences exist. Establishing explicit house rules regarding quiet hours and kitchen cleaning will ensure smooth living.'}
                          {s.score < 45  && 'Distinct lifestyles. Noticeable differences in schedules and noise tolerances. We recommend agreeing on house guidelines early.'}
                        </p>
                      </div>

                      {/* Side-by-Side Trait Grid */}
                      <div>
                        <div className="font-label-caps text-[10px] uppercase tracking-widest text-accent-orange mb-4">
                          Side-by-Side Habit Breakdown
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(s.breakdown || {}).map(([trait, rawScore]) => {
                            const def = TRAIT_DEFINITIONS[trait]
                            const pct = Math.round(rawScore * 100)
                            const color = scoreColor(pct)

                            const myVal = myProfile[trait]
                            const theirVal = theirProfile[trait]

                            const myLabel = def?.options ? (def.options[myVal] || String(myVal)) : '—'
                            const theirLabel = def?.options ? (def.options[theirVal] || String(theirVal)) : '—'

                            return (
                              <div key={trait} className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{def?.icon || '•'}</span>
                                    <span className="font-body font-semibold text-sm text-white">{def?.label}</span>
                                    <span className="font-mono text-[10px] text-primary-muted">({def?.weight})</span>
                                  </div>
                                  <span className="font-mono font-bold text-xs" style={{ color }}>{pct}% Match</span>
                                </div>

                                <ProgressBar value={pct} color={color} height={4} className="bg-white/5" />

                                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                                  <div className="p-2 rounded-xl bg-white/[0.02]">
                                    <span className="font-label-caps text-[8px] text-primary-muted uppercase block">You</span>
                                    <span className="text-white font-medium truncate block">{myLabel}</span>
                                  </div>
                                  <div className="p-2 rounded-xl bg-white/[0.02]">
                                    <span className="font-label-caps text-[8px] text-primary-muted uppercase block">{s.user.name.split(' ')[0]}</span>
                                    <span className="text-white font-medium truncate block">{theirLabel}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Quick Rule Proposal Action */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs">
                        <div className="text-primary-muted">
                          Want to establish house guidelines based on these match insights?
                        </div>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => navigate('/app/rules')}
                          className="shrink-0 text-xs"
                        >
                          <FileText size={13} className="mr-1.5" /> Propose a House Rule →
                        </Button>
                      </div>

                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {/* ========================================================= */}
      {/* 4. VIEW MODE 2: ALL-HOUSE PAIR COMPATIBILITY MATRIX */}
      {/* ========================================================= */}
      {viewMode === 'matrix' && summary?.pairScores && (
        <div className="bento-card rounded-3xl p-8 space-y-6 animate-fade-in">
          <div>
            <h3 className="font-display text-xl font-bold text-white">All-House Pair Compatibility Matrix</h3>
            <p className="text-xs text-primary-muted mt-1">Cross-roommate compatibility ratings between all active members of your house.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.pairScores.map((pair, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-body font-bold text-sm text-white flex items-center gap-1.5 truncate">
                    <span>{pair.users[0]}</span>
                    <span className="text-primary-muted font-normal text-xs">&</span>
                    <span>{pair.users[1]}</span>
                  </div>
                  <span 
                    className="font-mono text-lg font-bold"
                    style={{ color: scoreColor(pair.score) }}
                  >
                    {pair.score}%
                  </span>
                </div>

                <ProgressBar value={pair.score} color={scoreColor(pair.score)} height={4} className="bg-white/5" />
                <Badge color={scoreBadgeColor(pair.score)} className="text-[9px] uppercase tracking-wider">
                  {pair.label}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. VIEW MODE 3: ALGORITHM WEIGHTS FORMULA EXPLAINER */}
      {/* ========================================================= */}
      {viewMode === 'formula' && (
        <div className="bento-card rounded-3xl p-8 space-y-6 animate-fade-in">
          <div>
            <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Scale size={20} className="text-accent-orange" /> How Compatibility is Calculated
            </h3>
            <p className="text-xs text-primary-muted mt-1 leading-relaxed">
              RoomIQ uses a weighted Euclidean compatibility model. Each trait is assigned a coefficient based on empirical cohabitation friction studies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(TRAIT_DEFINITIONS).map(([key, trait]) => (
              <div key={key} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{trait.icon}</span>
                  <span className="font-mono font-bold text-sm text-accent-orange">{trait.weight}</span>
                </div>
                <div className="font-body font-bold text-sm text-white">{trait.label}</div>
                <ProgressBar value={trait.weightNum * 4} color="#FF6B00" height={3} className="bg-white/5" />
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-black/20 border border-white/5 text-xs text-primary-muted leading-relaxed space-y-1">
            <span className="font-bold text-white block mb-1 font-label-caps text-[10px] uppercase tracking-wider">Scoring Thresholds</span>
            <div>• <strong className="text-accent-cyan">80% – 100%:</strong> Highly Compatible House. Minimal friction points; shared lifestyle rhythms.</div>
            <div>• <strong className="text-accent-emerald">65% – 79%:</strong> Generally Compatible. Minor differences easily resolved through clear expectations.</div>
            <div>• <strong className="text-amber-400">45% – 64%:</strong> Moderate Alignment. Requires mutual respect and explicit house rules.</div>
            <div>• <strong className="text-accent-rose">0% – 44%:</strong> High Friction Risk. Significant divergence in sleep schedules or cleanliness expectations.</div>
          </div>
        </div>
      )}

    </PageTransition>
  )
}
