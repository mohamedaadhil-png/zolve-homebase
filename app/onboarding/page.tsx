'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'

interface Option {
  value: string
  label: string
  desc?: string
}

interface Step {
  id: number
  title: string
  field: 'status_type' | 'visa_status' | 'grad_year' | 'preferred_role'
  options: Option[]
}














// Values match the DB CHECK constraints + API Zod schema exactly.
const STEPS: Step[] = [
  {
    id: 1,
    title: 'What best describes you?',
    field: 'status_type',
    options: [
      { value: 'student', label: 'Student', desc: 'Currently enrolled in a US university' },
      { value: 'wp', label: 'Working Professional', desc: 'Currently employed in the US' },
      { value: 'dependent', label: 'Dependent', desc: 'On a dependent visa (e.g. H-4, F-2)' },
    ],
  },
  {
    id: 2,
    title: 'What is your current visa status?',
    field: 'visa_status',
    options: [
      { value: 'F-1', label: 'F-1', desc: 'Student visa' },
      { value: 'OPT', label: 'OPT', desc: 'Optional Practical Training' },
      { value: 'H-1B', label: 'H-1B', desc: 'Specialty occupation work visa' },
      { value: 'other', label: 'Other', desc: 'Different visa type' },
    ],
  },
  {
    id: 3,
    title: 'When did you / will you graduate?',
    field: 'grad_year',
    options: [
      { value: '2023', label: '2023' },
      { value: '2024', label: '2024' },
      { value: '2025', label: '2025' },
      { value: '2026', label: '2026' },
      { value: '2027', label: '2027' },
      { value: '2028', label: '2028 or later' },
    ],
  },
  {
    id: 4,
    title: 'What role are you targeting?',
    field: 'preferred_role',
    options: [
      { value: 'Software Engineer', label: 'Software Engineer', desc: 'General SWE' },
      { value: 'Backend Engineer', label: 'Backend Engineer', desc: 'APIs, services, infra' },
      { value: 'Frontend Engineer', label: 'Frontend Engineer', desc: 'UI, web apps' },
      { value: 'Full-Stack Engineer', label: 'Full-Stack Engineer', desc: 'End-to-end development' },
      { value: 'ML Engineer', label: 'ML / AI Engineer', desc: 'Machine learning, data science' },
      { value: 'Other', label: 'Other', desc: 'Different engineering role' },
    ],
  },
]

const OPT_SUBSTATUS: Option[] = [
  { value: 'pre_completion', label: 'Pre-completion OPT', desc: 'Before graduation' },
  { value: 'post_completion', label: 'Post-completion OPT', desc: 'After graduation' },
  { value: 'stem_extension', label: 'STEM OPT Extension', desc: '24-month extension' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const step = STEPS[currentStep]
  const isLast = currentStep === STEPS.length - 1
  const selectedValue = answers[step.field]
  const showOptSubstatus = step.field === 'visa_status' && answers.visa_status === 'OPT'
  const optSelected = answers.opt_status

  // Can advance? Require the main answer, plus opt_status when OPT is chosen.
  const canContinue = selectedValue && (!showOptSubstatus || optSelected)

  const handleSelect = (value: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [step.field]: value }
      // Clear OPT sub-status if visa changes away from OPT
      if (step.field === 'visa_status' && value !== 'OPT') delete next.opt_status
      return next
    })
  }

  const handleNext = async () => {
    if (!canContinue) return
    if (isLast) {
      await handleSubmit()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status_type: answers.status_type,
          visa_status: answers.visa_status,
          opt_status: answers.opt_status || undefined,
          preferred_role: answers.preferred_role,
          grad_year: parseInt(answers.grad_year, 10),
        }),
      })
      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        const body = await res.json().catch(() => ({}))
        setError(
          typeof body.error === 'string'
            ? body.error
            : 'Something went wrong saving your answers. Please try again.'
        )
        setSubmitting(false)
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
      setSubmitting(false)
    }
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#ff6633] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Z</span>
          </div>
          <span className="text-[#0F172A] font-bold text-lg tracking-tight">
            ZOLVE <span className="text-[#ff6633]">HomeBase</span>
          </span>
        </div>

        {/* Progress */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full mb-8">
          <div
            className="h-full bg-[#ff6633] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <h2 className="text-xl font-bold text-[#0F172A] mb-6">{step.title}</h2>

          <div className="space-y-3">
            {step.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedValue === option.value
                    ? 'border-[#ff6633] bg-orange-50'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#0F172A]">{option.label}</p>
                    {option.desc && <p className="text-sm text-slate-500 mt-0.5">{option.desc}</p>}
                  </div>
                  {selectedValue === option.value && (
                    <CheckCircle2 className="w-5 h-5 text-[#ff6633] shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* OPT sub-status (conditional) */}
          {showOptSubstatus && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-sm font-semibold text-[#0F172A] mb-3">Which OPT status?</p>
              <div className="space-y-2">
                {OPT_SUBSTATUS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAnswers((prev) => ({ ...prev, opt_status: option.value }))}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                      optSelected === option.value
                        ? 'border-[#ff6633] bg-orange-50'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#0F172A] text-sm">{option.label}</p>
                        {option.desc && <p className="text-xs text-slate-500 mt-0.5">{option.desc}</p>}
                      </div>
                      {optSelected === option.value && (
                        <CheckCircle2 className="w-4 h-4 text-[#ff6633] shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm mt-4" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-8">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-[#0F172A] transition-colors cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canContinue || submitting}
              className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-[#ff6633] text-white font-semibold rounded-xl hover:bg-[#e5572b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Setting up...' : isLast ? 'Get Started' : 'Continue'}
              {!submitting && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
