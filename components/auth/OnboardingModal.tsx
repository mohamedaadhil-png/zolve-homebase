'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import Button from '@/components/ui/Button'

interface OnboardingAnswers {
  status?: string
  visaStatus?: string
  optSubStatus?: string
  graduationYear?: number
  preferredRole?: string
}

interface OnboardingModalProps {
  open: boolean
  onClose?: () => void
  onComplete: (answers: OnboardingAnswers) => void
}

// Radio card component
function RadioCard({
  label,
  selected,
  onClick,
  description,
}: {
  label: string
  selected: boolean
  onClick: () => void
  description?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150',
        selected
          ? 'border-[#ff6633] bg-[#fff1ec]'
          : 'border-navy-200 bg-white hover:border-navy-400'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150',
            selected ? 'border-[#ff6633]' : 'border-navy-300'
          )}
        >
          {selected && (
            <div className="w-2 h-2 rounded-full bg-[#ff6633]" />
          )}
        </div>
        <div>
          <p
            className={cn(
              'text-sm font-semibold',
              selected ? 'text-[#ff6633]' : 'text-navy-800'
            )}
          >
            {label}
          </p>
          {description && (
            <p className="text-xs text-navy-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
    </button>
  )
}

// Progress dots
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all duration-200',
            i < current
              ? 'w-6 h-2 bg-[#ff6633]'
              : i === current
              ? 'w-6 h-2 bg-[#ff6633]/60'
              : 'w-2 h-2 bg-navy-200'
          )}
        />
      ))}
    </div>
  )
}

const TOTAL_STEPS = 4

export default function OnboardingModal({
  open,
  onClose,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const [showOPTSub, setShowOPTSub] = useState(false)
  const [answers, setAnswers] = useState<OnboardingAnswers>({})

  if (!open) return null

  function update(key: keyof OnboardingAnswers, value: string | number) {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  function handleNext() {
    if (step === 1 && answers.visaStatus === 'OPT' && !showOPTSub) {
      setShowOPTSub(true)
      return
    }
    setShowOPTSub(false)
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1)
  }

  function handleBack() {
    if (showOPTSub) {
      setShowOPTSub(false)
      return
    }
    if (step > 0) setStep((s) => s - 1)
  }

  function handleFinish() {
    onComplete(answers)
  }

  const isLastStep = step === TOTAL_STEPS - 1
  const canProceed = (() => {
    if (step === 0) return !!answers.status
    if (step === 1 && !showOPTSub) return !!answers.visaStatus
    if (step === 1 && showOPTSub) return !!answers.optSubStatus
    if (step === 2) return !!answers.graduationYear
    if (step === 3) return !!answers.preferredRole
    return true
  })()

  const STATUS_OPTIONS = [
    { label: 'Student', description: 'Currently enrolled in a degree program' },
    { label: 'Working Professional', description: 'Employed or recently employed' },
    { label: 'Dependent', description: 'On a dependent visa (H-4, F-2, etc.)' },
  ]

  const VISA_OPTIONS = [
    { label: 'F-1', description: 'Student visa' },
    { label: 'OPT', description: 'Optional Practical Training' },
    { label: 'H-1B', description: 'Specialty occupation visa' },
    { label: 'Other', description: 'Other visa status' },
  ]

  const OPT_SUB_OPTIONS = [
    { label: 'Pre-OPT', description: 'Applied, not started yet' },
    { label: 'Standard OPT', description: '12-month OPT period' },
    { label: 'STEM OPT', description: '24-month STEM extension' },
    { label: 'OPT Cap-Gap', description: 'H-1B selected, OPT extended' },
  ]

  const ROLE_OPTIONS = [
    { label: 'Software Engineer', description: 'General SWE roles' },
    { label: 'Backend Engineer', description: 'APIs, databases, infrastructure' },
    { label: 'Frontend Engineer', description: 'UI, React, web development' },
    { label: 'Full-Stack Engineer', description: 'End-to-end development' },
    { label: 'ML / AI Engineer', description: 'Machine learning, AI, data science' },
    { label: 'Other', description: 'Other engineering roles' },
  ]

  const YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i)

  const steps = [
    {
      title: "What's your status?",
      subtitle: 'Tell us where you are in your career journey',
    },
    {
      title: showOPTSub ? "What's your OPT status?" : "What's your visa status?",
      subtitle: showOPTSub
        ? 'Select your current OPT period'
        : 'Select your current visa type',
    },
    {
      title: "What's your graduation year?",
      subtitle: 'Select your graduation year (actual or expected)',
    },
    {
      title: "What's your preferred role?",
      subtitle: "We'll personalize job matches for you",
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md bg-white border border-navy-200 rounded-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div />
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-navy-400 hover:text-navy-700 hover:bg-navy-100 cursor-pointer transition-all duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <ProgressDots total={TOTAL_STEPS} current={step} />

          <div className="mt-5">
            <h2 className="text-lg font-bold text-navy-800">
              {steps[step].title}
            </h2>
            <p className="text-sm text-navy-500 mt-1">{steps[step].subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-2.5 max-h-[50vh] overflow-y-auto">
          {/* Step 0: Status */}
          {step === 0 &&
            STATUS_OPTIONS.map((opt) => (
              <RadioCard
                key={opt.label}
                label={opt.label}
                description={opt.description}
                selected={answers.status === opt.label}
                onClick={() => update('status', opt.label)}
              />
            ))}

          {/* Step 1: Visa */}
          {step === 1 && !showOPTSub &&
            VISA_OPTIONS.map((opt) => (
              <RadioCard
                key={opt.label}
                label={opt.label}
                description={opt.description}
                selected={answers.visaStatus === opt.label}
                onClick={() => update('visaStatus', opt.label)}
              />
            ))}

          {/* Step 1 OPT sub-step */}
          {step === 1 && showOPTSub &&
            OPT_SUB_OPTIONS.map((opt) => (
              <RadioCard
                key={opt.label}
                label={opt.label}
                description={opt.description}
                selected={answers.optSubStatus === opt.label}
                onClick={() => update('optSubStatus', opt.label)}
              />
            ))}

          {/* Step 2: Year picker */}
          {step === 2 && (
            <div className="grid grid-cols-3 gap-2">
              {YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => update('graduationYear', year)}
                  className={cn(
                    'py-3 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all duration-150',
                    answers.graduationYear === year
                      ? 'border-[#ff6633] bg-[#fff1ec] text-[#ff6633]'
                      : 'border-navy-200 text-navy-700 hover:border-navy-400'
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Role */}
          {step === 3 &&
            ROLE_OPTIONS.map((opt) => (
              <RadioCard
                key={opt.label}
                label={opt.label}
                description={opt.description}
                selected={answers.preferredRole === opt.label}
                onClick={() => update('preferredRole', opt.label)}
              />
            ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-navy-100 flex items-center justify-between gap-3">
          {step > 0 || showOPTSub ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-800 cursor-pointer transition-colors duration-150"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {isLastStep ? (
            <Button
              variant="primary"
              size="md"
              disabled={!canProceed}
              onClick={handleFinish}
            >
              Finish
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              disabled={!canProceed}
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
