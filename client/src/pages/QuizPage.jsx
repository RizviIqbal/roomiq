import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, ProgressBar, Badge } from '../components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, ArrowRight, ArrowLeft, ShieldCheck, Heart, Zap } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const QUESTIONS = [
  {
    key:   'sleepSchedule',
    title: 'What is your regular sleep schedule?',
    sub:   'Sleep alignment prevents midnight noise conflicts and syncs wake cycles.',
    icon:  '🌙',
    category: 'Daily Rhythm',
    options: [
      { value: 'early_bird', label: '🌅 Early Bird',  desc: 'In bed by 10 PM, up early by 6 AM for work/study.' },
      { value: 'night_owl',  label: '🦉 Night Owl',   desc: 'Productive after midnight, wake up late morning.' },
      { value: 'flexible',   label: '🔄 Flexible',    desc: 'Adaptive schedule depending on weekdays and workload.' },
    ],
  },
  {
    key:   'cleanlinessLevel',
    title: 'How do you maintain shared living areas?',
    sub:   'Cleanliness standards in the kitchen, bathrooms, and living room.',
    icon:  '🧹',
    category: 'Hygiene & Cleanliness',
    options: [
      { value: 5, label: '✨ Spotless Proactive (5/5)', desc: 'Clean up immediately after cooking, spotless counters at all times.' },
      { value: 4, label: '🧼 Tidy & Prompt (4/5)',      desc: 'Clean up within a few hours, do dishes daily.' },
      { value: 3, label: '🙂 Moderate Routine (3/5)',   desc: 'Clean on scheduled days, moderate tolerance for daily items.' },
      { value: 2, label: '😅 Relaxed (2/5)',            desc: 'A bit messy during busy weekdays, deep clean on weekends.' },
      { value: 1, label: '🤷 Very Relaxed (1/5)',       desc: 'Casual approach, not strict about daily organization.' },
    ],
  },
  {
    key:   'guestPolicy',
    title: 'How often do you host guests and visitors?',
    sub:   'Setting mutual expectations for friends and overnight visitors.',
    icon:  '👥',
    category: 'Social Habits',
    options: [
      { value: 'never',     label: '🚫 Private Space Only', desc: 'Prefer a quiet home with minimal outside visitors.' },
      { value: 'rarely',    label: '🤏 Occasional Guests',  desc: 'Only with prior notice and consent from roommates.' },
      { value: 'sometimes', label: '👥 Weekend Gatherings',  desc: 'Friends over on weekends for study or dinners.' },
      { value: 'often',     label: '🎉 Social Open House',  desc: 'Love an active house with friends hanging out regularly.' },
    ],
  },
  {
    key:   'noiseTolerance',
    title: 'What is your noise tolerance level?',
    sub:   'Ambient music, gaming, calls, and study acoustics in shared spaces.',
    icon:  '🎧',
    category: 'Acoustics & Study',
    options: [
      { value: 'silent',   label: '🤫 Absolute Quiet',    desc: 'Need pin-drop silence for sleep, reading, and deep work.' },
      { value: 'low',      label: '🔈 Low Ambient Noise',  desc: 'Soft background music or quiet speech is fine.' },
      { value: 'moderate', label: '🔉 Normal Household',   desc: 'Average TV, cooking, and conversation volume is fine.' },
      { value: 'high',     label: '🔊 High Tolerance',    desc: 'Unbothered by lively discussions, music, or video games.' },
    ],
  },
  {
    key:   'smokingPolicy',
    title: 'What is your preference on smoking?',
    sub:   'Rules regarding smoking inside the apartment vs balconies/outside.',
    icon:  '🚭',
    category: 'Health & Lifestyle',
    options: [
      { value: 'no_smoking',   label: '🚭 Strictly Smoke-Free', desc: 'No smoking or vaping anywhere inside or on premises.' },
      { value: 'outside_only', label: '🚪 Balcony/Outside Only',desc: 'Designated outdoor areas or balconies are acceptable.' },
      { value: 'anywhere',     label: '🚬 Open Policy',         desc: 'No restrictions on smoking inside common areas.' },
    ],
  },
  {
    key:   'petPolicy',
    title: 'Are you comfortable sharing a home with pets?',
    sub:   'Accommodates pet lovers and considerations for pet allergies.',
    icon:  '🐾',
    category: 'Pets & Allergies',
    options: [
      { value: 'no_pets',    label: '🚫 Pet-Free Home',    desc: 'Prefer no pets due to allergies or personal preference.' },
      { value: 'small_pets', label: '🐱 Small Pets (Cats/Fish)', desc: 'Friendly cats, fish, or caged pets are welcome.' },
      { value: 'any_pets',   label: '🐕 Pet Enthusiast',    desc: 'Dogs, cats, and any well-behaved animals welcome.' },
    ],
  },
  {
    key:   'studyHabits',
    title: 'Where do you primarily work or study?',
    sub:   'Helps match roommates who share similar work-from-home demands.',
    icon:  '💻',
    category: 'Work Routine',
    options: [
      { value: 'at_home', label: '🏠 Remote / Home Office', desc: 'Spend most weekdays working or studying from home.' },
      { value: 'library', label: '📚 Office / University',  desc: 'Out of the house for most of the daytime.' },
      { value: 'mixed',   label: '🔀 Hybrid Schedule',      desc: 'Mix of on-site days and remote study days.' },
    ],
  },
  {
    key:   'foodSharing',
    title: 'How do you prefer handling groceries and cooking?',
    sub:   'Helps automate the shopping checklist and expense splits.',
    icon:  '🍳',
    category: 'Kitchen & Groceries',
    options: [
      { value: false, label: '🙅 Separate Pantries', desc: 'Cook separately and manage individual grocery supplies.' },
      { value: true,  label: '🤝 Communal Groceries', desc: 'Open to shared grocery lists and splitting common meals.' },
    ],
  },
]

export default function QuizPage() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState(() => {
    if (user?.compatibilityProfile && typeof user.compatibilityProfile === 'object') {
      const { completedAt, ...profile } = user.compatibilityProfile
      return profile
    }
    return {}
  })
  const [loading, setLoading] = useState(false)

  const q        = QUESTIONS[step]
  const progress = Math.round(((step + 1) / QUESTIONS.length) * 100)
  const selected = answers[q.key]
  const isLast   = step === QUESTIONS.length - 1

  const choose = (value) => setAnswers(a => ({ ...a, [q.key]: value }))

  const next = async () => {
    if (selected === undefined) {
      toast.error('Please choose an option to proceed')
      return
    }
    if (!isLast) { 
      setStep(s => s + 1)
      return 
    }

    setLoading(true)
    try {
      await api.put('/auth/compatibility', answers)
      const updatedUser = await refreshUser()
      toast.success('🎉 Compatibility profile saved!')
      
      // If user is already in a house, redirect directly back to the house matching/dashboard
      if (updatedUser?.currentHouse || user?.currentHouse) {
        navigate('/app/matching')
      } else {
        navigate('/house-setup')
      }
    } catch (err) {
      toast.error('Failed to save compatibility profile')
    } finally {
      setLoading(false)
    }
  }

  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-obsidian flex flex-col justify-between p-4 sm:p-8 lg:p-12 relative overflow-hidden text-white font-body">
      
      {/* Background Ambient Glows */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[160px] pointer-events-none transition-all duration-700 opacity-40"
        style={{
          background: `radial-gradient(circle, rgba(249,115,22,0.2) 0%, rgba(124,58,237,0.15) ${progress}%, transparent 70%)`
        }}
      />

      {/* Top Header Row */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-accent-purple to-accent-orange flex items-center justify-center text-white font-display font-bold shadow-glow">
            R
          </div>
          <div>
            <div className="font-display font-bold text-base text-white">RoomiQ Synergy Quiz</div>
            <div className="text-[10px] text-primary-muted font-mono">8-Trait Living Habit Matcher</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user?.currentHouse && (
            <button
              type="button"
              onClick={() => navigate('/app/matching')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-primary-muted hover:text-white transition-colors"
            >
              <ArrowLeft size={13} /> Exit Quiz
            </button>
          )}

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full font-label-caps text-xs">
            <Sparkles size={13} className="text-accent-orange" />
            <span>Question {step + 1} of {QUESTIONS.length}</span>
            <span className="font-mono text-accent-cyan font-bold ml-1">({progress}%)</span>
          </div>
        </div>
      </div>

      {/* Main Quiz Bento Container */}
      <div className="w-full max-w-3xl mx-auto my-8 relative z-10">
        
        {/* Progress Bar Strip */}
        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-8 border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-orange via-amber-400 to-accent-purple shadow-glow"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="bento-card rounded-3xl p-6 sm:p-10 border-white/10 shadow-2xl relative space-y-6"
          >
            {/* Category Pill */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-accent-orange font-label-caps text-[10px] uppercase tracking-wider">
                <span>{q.icon}</span>
                <span>{q.category}</span>
              </div>
              <span className="text-[11px] text-primary-muted font-mono">{answeredCount}/8 completed</span>
            </div>

            {/* Question Title & Description */}
            <div className="space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                {q.title}
              </h2>
              <p className="text-sm text-primary-muted leading-relaxed">
                {q.sub}
              </p>
            </div>

            {/* Interactive Options List */}
            <div className="space-y-3 pt-2">
              {q.options.map((opt) => {
                const isSelected = String(answers[q.key]) === String(opt.value)
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => choose(opt.value)}
                    className={`w-full p-4 sm:p-5 rounded-2xl text-left border transition-all flex items-center justify-between group active:scale-[0.99] ${
                      isSelected
                        ? 'bg-accent-orange/10 border-accent-orange shadow-[0_0_25px_rgba(249,115,22,0.2)]'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1 pr-4">
                      <div className={`font-display text-base font-bold flex items-center gap-2 ${
                        isSelected ? 'text-white' : 'text-white/90 group-hover:text-white'
                      }`}>
                        <span>{opt.label}</span>
                      </div>
                      <p className="text-xs text-primary-muted leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>

                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected 
                        ? 'border-accent-orange bg-accent-orange text-obsidian shadow-glow' 
                        : 'border-white/20 bg-transparent group-hover:border-white/40'
                    }`}>
                      {isSelected && <Check size={14} className="stroke-[3]" />}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Navigation Row */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              {step > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setStep(s => s - 1)}
                  className="py-3 px-5 text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Back
                </Button>
              )}

              <Button
                onClick={next}
                loading={loading}
                disabled={selected === undefined}
                className="flex-1 py-3 text-xs bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-orange-600 text-obsidian font-bold shadow-glow disabled:opacity-40"
              >
                {isLast ? 'Complete Profile & Setup House →' : 'Next Trait →'}
              </Button>
            </div>

          </motion.div>
        </AnimatePresence>

      </div>

      {/* Footer Info */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between text-xs text-primary-muted z-10">
        <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-accent-emerald" /> 100% Private & Changeable Later</span>
        <span>Step {step + 1} of 8</span>
      </div>

    </div>
  )
}
