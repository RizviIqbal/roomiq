import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, ProgressBar } from '../components/ui'
import api from '../services/api'
import toast from 'react-hot-toast'

const QUESTIONS = [
  {
    key:   'sleepSchedule',
    title: 'What is your sleep schedule?',
    sub:   'This is the single biggest factor in roommate compatibility.',
    options: [
      { value: 'early_bird', label: '🌅 Early bird',  desc: 'In bed by 10 PM, up by 6 AM' },
      { value: 'night_owl',  label: '🦉 Night owl',   desc: 'Sleep after midnight, up late' },
      { value: 'flexible',   label: '🔄 Flexible',    desc: 'Adapts to the situation'       },
    ],
  },
  {
    key:   'cleanlinessLevel',
    title: 'How clean do you keep shared spaces?',
    sub:   'Rate your typical cleanliness in shared areas.',
    options: [
      { value: 5, label: '✨ Very clean',    desc: 'Spotless at all times. I clean proactively.' },
      { value: 4, label: '🧹 Pretty clean',  desc: 'Clean up after myself promptly.'             },
      { value: 3, label: '🙂 Moderate',      desc: 'Clean but not obsessive.'                    },
      { value: 2, label: '😅 Relaxed',       desc: 'Mess is fine for a few days.'                },
      { value: 1, label: '🤷 Very relaxed',  desc: 'Cleanliness is not a priority for me.'       },
    ],
  },
  {
    key:   'guestPolicy',
    title: 'How often do you have guests over?',
    sub:   'Think overnight guests and frequent visitors.',
    options: [
      { value: 'never',     label: '🚫 Never',     desc: 'I keep guests out of shared spaces.'   },
      { value: 'rarely',    label: '🤏 Rarely',    desc: 'Occasional guests, always ask first.'  },
      { value: 'sometimes', label: '👥 Sometimes', desc: 'Friends over on weekends.'             },
      { value: 'often',     label: '🎉 Often',     desc: 'I love having people around.'         },
    ],
  },
  {
    key:   'noiseTolerance',
    title: 'What is your noise tolerance?',
    sub:   'How much ambient noise can you handle at home?',
    options: [
      { value: 'silent',   label: '🤫 Silence needed', desc: 'I need quiet to sleep and focus.'  },
      { value: 'low',      label: '🔈 Low noise',       desc: 'Soft sounds are fine.'            },
      { value: 'moderate', label: '🔉 Moderate',        desc: 'Normal household noise is okay.'  },
      { value: 'high',     label: '🔊 High tolerance',  desc: 'Noise does not bother me much.'  },
    ],
  },
  {
    key:   'smokingPolicy',
    title: 'What is your policy on smoking?',
    sub:   'Inside or near the home.',
    options: [
      { value: 'no_smoking',   label: '🚭 No smoking',      desc: 'Absolutely no smoking anywhere near home.' },
      { value: 'outside_only', label: '🚪 Outside only',    desc: 'Smoking is fine, but outside only.'       },
      { value: 'anywhere',     label: '🚬 No restriction',  desc: 'Smoking anywhere is fine with me.'        },
    ],
  },
  {
    key:   'petPolicy',
    title: 'Are you comfortable with pets?',
    sub:   'Consider allergies and personal preferences.',
    options: [
      { value: 'no_pets',    label: '🚫 No pets',       desc: 'Allergies or personal preference.' },
      { value: 'small_pets', label: '🐱 Small pets OK', desc: 'Cats, small dogs, fish — fine.'         },
      { value: 'any_pets',   label: '🐕 Any pets',      desc: 'The more animals the better.'           },
    ],
  },
  {
    key:   'studyHabits',
    title: 'Where do you usually study or work?',
    sub:   'This affects how quiet the home needs to be.',
    options: [
      { value: 'at_home', label: '🏠 At home',       desc: 'I study from home, need focus time.'  },
      { value: 'library', label: '📚 Library/café',  desc: 'I prefer to work outside.'            },
      { value: 'mixed',   label: '🔀 Mixed',         desc: 'Depends on the day.'                  },
    ],
  },
  {
    key:   'foodSharing',
    title: 'Are you open to sharing food?',
    sub:   'Communal groceries vs separate.',
    options: [
      { value: false, label: '🙅 Keep it separate', desc: 'I buy and cook my own food.' },
      { value: true,  label: '🤝 Open to sharing',  desc: 'Happy to split groceries and cook together.' },
    ],
  },
]

export default function QuizPage() {
  const { refreshUser } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)

  const q        = QUESTIONS[step]
  const progress = ((step) / QUESTIONS.length) * 100
  const selected = answers[q.key]
  const isLast   = step === QUESTIONS.length - 1

  const choose = (value) => setAnswers(a => ({ ...a, [q.key]: value }))

  const next = async () => {
    if (selected === undefined) {
      toast.error('Please select an option')
      return
    }
    if (!isLast) { setStep(s => s + 1); return }

    setLoading(true)
    try {
      await api.put('/auth/compatibility', answers)
      await refreshUser()
      toast.success('Profile saved!')
      navigate('/house-setup')
    } catch (err) {
      toast.error('Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const stepLabel = String(step + 1).padStart(2, '0')
  const totalLabel = String(QUESTIONS.length).padStart(2, '0')

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background element based on progress */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full blur-[150px] pointer-events-none transition-all duration-1000 ease-in-out"
        style={{
          background: `radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(225,29,72,0.05) ${progress}%, transparent 70%)`,
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${0.8 + (progress / 100) * 0.4})`
        }}
      />

      <div className="w-full max-w-2xl py-16 relative z-10">

        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-accent-orange mb-3">Compatibility Quiz</div>
            <h1 className="font-display text-[32px] md:text-[40px] font-bold tracking-tight text-white leading-tight">
              {q.title}
            </h1>
          </div>
          <div className="font-label-caps text-[10px] tracking-[0.15em] text-primary-muted whitespace-nowrap pb-1 border border-glass-border px-3 py-1.5 rounded-full bg-white/5">
            STEP {stepLabel} <span className="opacity-50">/ {totalLabel}</span>
          </div>
        </div>

        <ProgressBar value={progress} max={100} height={4} className="bg-white/5" />

        <div className="mt-8 mb-10">
          <p className="font-body text-[16px] text-primary-muted leading-relaxed">{q.sub}</p>
        </div>

        {/* Options */}
        <div className="mb-12 space-y-4">
          {q.options.map((opt) => {
            const isSelected = String(answers[q.key]) === String(opt.value)
            return (
              <button
                key={String(opt.value)}
                onClick={() => choose(opt.value)}
                className={[
                  'w-full text-left p-6 transition-all flex items-center justify-between rounded-2xl font-medium group',
                  isSelected 
                    ? 'border border-accent-orange bg-accent-orange/10 shadow-[0_0_30px_rgba(6,182,212,0.15)]' 
                    : 'border border-glass-border bg-white/5 hover:bg-white/10 hover:border-white/20',
                ].join(' ')}
              >
                <div>
                  <div className={isSelected ? 'font-display text-[18px] text-white font-medium mb-1 flex items-center gap-2' : 'font-display text-[18px] text-white/80 font-medium mb-1 flex items-center gap-2'}>
                    {opt.label}

                  </div>
                  <div className="font-body text-[14px] text-primary-muted">
                    {opt.desc}
                  </div>
                </div>
                <div className={[
                  'w-6 h-6 rounded-full border-2 flex-shrink-0 ml-4 flex items-center justify-center transition-all',
                  isSelected ? 'border-accent-orange bg-accent-orange' : 'border-glass-border group-hover:border-white/40 bg-transparent',
                ].join(' ')}>
                  {isSelected && <div className="w-2.5 h-2.5 bg-obsidian rounded-full" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(s => s - 1)} className="flex-1 border-glass-border hover:bg-white/5 text-primary-muted hover:text-white">
              Back
            </Button>
          )}
          <Button
            onClick={next}
            loading={loading}
            disabled={selected === undefined}
            className={`flex-1 ${selected !== undefined ? 'shadow-[0_0_20px_rgba(6,182,212,0.3)]' : ''}`}
          >
            {isLast ? 'Save my profile' : 'Next'}
          </Button>
        </div>

        <p className="text-center mt-8 font-label-caps text-[10px] tracking-[0.15em] uppercase text-white/30">
          You can update your answers anytime from your profile
        </p>
      </div>
    </div>
  )
}
