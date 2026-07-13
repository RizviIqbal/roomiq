import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Badge, Avatar, Button, Spinner, ProgressBar, EmptyState } from '../components/ui'
import api from '../services/api'
import { Heart, ChevronDown, ChevronUp, Users, AlertCircle, MessageCircle } from 'lucide-react'

const TRAIT_LABELS = {
  sleepSchedule:    { label: 'Sleep schedule',    weight: '25%' },
  cleanlinessLevel: { label: 'Cleanliness',       weight: '20%' },
  noiseTolerance:   { label: 'Noise tolerance',   weight: '15%' },
  guestPolicy:      { label: 'Guest policy',      weight: '15%' },
  smokingPolicy:    { label: 'Smoking policy',    weight: '10%' },
  petPolicy:        { label: 'Pet policy',        weight: '8%'  },
  studyHabits:      { label: 'Study habits',      weight: '5%'  },
  foodSharing:      { label: 'Food sharing',      weight: '2%'  },
}

const scoreColor = (score) =>
  score >= 80 ? '#00E5FF'  : // cyan
  score >= 60 ? '#10B981' : // emerald
  score >= 40 ? '#F59E0B' : // amber
  '#F43F5E'   // rose

const scoreBadgeColor = (score) =>
  score >= 80 ? 'accent'  :
  score >= 60 ? 'green' :
  score >= 40 ? 'yellow' :
  'red'

export default function MatchingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [scores,    setScores]    = useState([])
  const [summary,   setSummary]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [expanded,  setExpanded]  = useState(null)
  const [noProfile, setNoProfile] = useState(false)

  const houseId = user?.currentHouse?._id || user?.currentHouse

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

  if (!houseId) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <EmptyState icon="🏠" title="No house" description="JOIN A HOUSE FIRST" />
      <Button onClick={() => navigate('/house-setup')} className="mt-4">Set up house</Button>
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <Spinner size={32} color="#00E5FF" />
    </div>
  )

  if (noProfile) return (
    <div className="max-w-md mx-auto py-24 px-4 text-center bento-card rounded-3xl mt-12">
      <div className="text-4xl mb-5 grayscale">📋</div>
      <h1 className="text-2xl font-display font-bold tracking-tight text-white mb-2">Complete your quiz first</h1>
      <p className="text-[15px] font-body text-primary-muted mb-7">Your compatibility profile is needed to calculate scores against your roommates.</p>
      <Button onClick={() => navigate('/quiz')} className="bg-accent-orange text-obsidian font-bold">Take the quiz</Button>
    </div>
  )

  return (
    <div className="w-full px-4 md:px-[64px] pb-24 relative z-10">
      
      {/* Hero Bento Card */}
      <div className="bento-card rounded-3xl p-8 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-purple/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-accent-orange/10 transition-all duration-700" />
        <div className="relative z-10">
          <div className="font-label-caps text-accent-orange mb-3">Roommate Matching</div>
          <h1 className="font-display text-[48px] md:text-[64px] font-bold text-white leading-[1.1] tracking-tight mb-2">Compatibility<span className="text-accent-orange">.</span></h1>
          <p className="font-body text-[16px] text-primary-muted max-w-xl">Scores are calculated from 8 weighted lifestyle traits. Higher is better.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* House summary */}
        {summary?.overallScore != null && (
          <div className="bento-card rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: scoreColor(summary.overallScore) }} />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div>
                <div className="font-label-caps text-[11px] mb-4 flex items-center gap-2 tracking-[0.15em] text-primary-muted uppercase">
                  <Users size={14} className="text-white" /> House harmony score
                </div>
                <div className="font-display text-[72px] md:text-[96px] font-bold tracking-tight leading-none text-white drop-shadow-md">
                  {summary.overallScore}
                  <span className="text-[24px] md:text-[32px] text-primary-muted font-medium ml-2">/100</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                <Badge color={scoreBadgeColor(summary.overallScore)} className="shadow-glow px-5 py-2.5 text-[15px] tracking-wide font-bold">{summary.label}</Badge>
                {summary.membersWithoutQuiz > 0 && (
                  <div className="flex items-center gap-2 font-label-caps text-[10px] uppercase tracking-[0.15em] text-accent-rose bg-accent-rose/10 px-3 py-1.5 rounded-full border border-accent-rose/20">
                    <AlertCircle size={12} />
                    {summary.membersWithoutQuiz} missing quiz
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Individual scores */}
        {scores.length === 0 ? (
          <div className="bento-card rounded-3xl p-12 text-center">
            <EmptyState icon="👥" title="No scores yet" description="ROOMMATES NEED TO COMPLETE THE QUIZ FIRST" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {scores.map((s) => {
              const isOpen = expanded === s.user._id
              return (
                <div key={s.user._id} className="bento-card interactive rounded-3xl overflow-hidden transition-all duration-300">
                  {/* Row */}
                  <button
                    onClick={() => toggleExpand(s.user._id)}
                    className="flex flex-col sm:flex-row sm:items-center gap-6 w-full p-6 md:p-8 text-left relative z-10"
                  >
                    <div className="flex items-center gap-6 flex-1 w-full">
                      <Avatar name={s.user.name} size={64} src={s.user.avatar} className="shadow-lg border-2 border-white/10" />

                      <div className="flex-1 min-w-0">
                        <div className="font-display text-[24px] font-bold text-white mb-2 tracking-tight truncate">{s.user.name}</div>
                        <ProgressBar value={s.score} color={scoreColor(s.score)} height={4} className="bg-white/5" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-8 sm:gap-6 mt-4 sm:mt-0">
                      <div className="text-left sm:text-right flex-shrink-0">
                        <div className="font-display text-[40px] font-bold tracking-tight leading-none text-white drop-shadow-md mb-1">
                          {s.score}
                        </div>
                        <Badge color={scoreBadgeColor(s.score)} className="font-bold tracking-wider text-[10px] px-2 py-0.5">{s.label}</Badge>
                      </div>

                      <div className="flex gap-2 items-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/chat/${s.user._id}`); }}
                          className="bg-accent-purple text-white hover:scale-105 active:scale-95 p-3 rounded-full border border-accent-purple/50 shadow-[0_0_15px_rgba(138,43,226,0.3)] transition-all"
                        >
                          <MessageCircle size={20} />
                        </button>
                        <div className="text-white flex-shrink-0 bg-white/5 p-3 rounded-full border border-glass-border shadow-inner group-hover:bg-white/10 transition-colors">
                          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Breakdown */}
                  {isOpen && (
                    <div className="px-6 md:px-8 pb-8 pt-2 relative z-10">
                      <div className="font-label-caps text-[11px] mb-6 tracking-[0.2em] text-accent-orange uppercase border-t border-glass-border pt-6">Trait breakdown</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8">
                        {Object.entries(s.breakdown || {}).map(([trait, rawScore]) => {
                          const pct   = Math.round(rawScore * 100)
                          const info  = TRAIT_LABELS[trait]
                          const color = pct >= 80 ? '#00E5FF' : pct >= 50 ? '#F59E0B' : '#F43F5E'
                          return (
                            <div key={trait}>
                              <div className="flex justify-between items-end mb-2">
                                <span className="font-body font-medium text-[15px] text-white">
                                  {info?.label}
                                  <span className="text-primary-muted ml-2 font-mono text-[11px] tracking-[0.1em]">({info?.weight})</span>
                                </span>
                                <span className="font-mono font-bold text-[14px]" style={{ color }}>{pct}%</span>
                              </div>
                              <ProgressBar value={pct} color={color} height={4} className="bg-black/40 shadow-inner" />
                            </div>
                          )
                        })}
                      </div>

                      {/* Compatibility insight */}
                      <div className="border-l-4 border-accent-orange bg-white/5 p-5 rounded-r-2xl font-body text-[16px] text-white/90 leading-relaxed shadow-inner">
                        {s.score >= 80 && 'Excellent match. You share most lifestyle preferences. Very few friction points expected.'}
                        {s.score >= 60 && s.score < 80 && 'Good match. Compatible on most things. Minor differences should be easy to discuss.'}
                        {s.score >= 40 && s.score < 60 && 'Moderate match. Some differences exist. Establishing clear house rules will be beneficial.'}
                        {s.score < 40  && 'Low compatibility. Significant lifestyle differences exist. Consider a detailed house agreement.'}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 mt-8 border-t border-glass-border">
          {/* Algorithm note */}
          <div className="font-body text-[14px] text-primary-muted leading-relaxed max-w-xl text-left bg-black/20 p-5 rounded-2xl border border-glass-border shadow-inner flex-1">
            <span className="font-bold text-white block mb-1 font-label-caps text-[10px] tracking-[0.15em] uppercase">Algorithm Mechanics</span>
            Traits are weighted by their real-world impact on cohabitation.
            Sleep schedule carries the highest weight (25%). Scores above 60 indicate harmony. Smoking and pet policies act as strict constraints.
          </div>
          
          {/* Retake quiz */}
          <Button variant="secondary" onClick={() => navigate('/quiz')} className="bg-white/5 hover:bg-white/10 border-glass-border shadow-glass font-bold px-6 py-4 flex-shrink-0">
            Retake Quiz
          </Button>
        </div>
      </div>
    </div>
  )
}
