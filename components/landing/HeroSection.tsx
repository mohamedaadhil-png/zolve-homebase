'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  jobCount: number
  onEnroll: () => void
  /** Overrides the primary CTA label (e.g. "Join the waitlist"). */
  ctaLabel?: string
  /** Hides the secondary "Browse jobs" link (used in waitlist mode). */
  hideSecondaryCta?: boolean
}

function AnimatedCount({ target }: { target: number }) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const step = Math.ceil(target / 60)
    const interval = setInterval(() => {
      setCurrent((prev) => {
        if (prev + step >= target) {
          clearInterval(interval)
          return target
        }
        return prev + step
      })
    }, 16)
    return () => clearInterval(interval)
  }, [target])
  return <span>{current.toLocaleString()}</span>
}

export default function HeroSection({ jobCount, onEnroll, ctaLabel, hideSecondaryCta }: HeroSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToNext = () => {
    const next = scrollRef.current?.nextElementSibling as HTMLElement
    next?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={scrollRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/homebase-hero.png)' }}
        aria-hidden="true"
      />

      {/* Dark gradient overlay — stronger at bottom, lighter at top */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.35) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-32 pb-24">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#ff6633] animate-pulse" aria-hidden="true" />
            <span className="text-white/90 text-sm font-medium">For International Tech Professionals</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
            Find Your Dream Tech Job.{' '}
            <span className="text-[#ff6633]">Guaranteed</span>{' '}
            Sponsorship Data.
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-white/80 mb-4 leading-relaxed max-w-2xl">
            Government-verified H-1B sponsorship records from USCIS & DOL.
            Thousands of software engineering roles at top tech companies — all sponsor-confirmed.
          </p>

          {/* Live job count */}
          {jobCount > 0 && (
            <p className="text-white/60 text-base mb-10">
              Discover{' '}
              <span className="text-white font-semibold">
                <AnimatedCount target={jobCount} />+
              </span>{' '}
              sponsored jobs today
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <button
              onClick={onEnroll}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#ff6633] hover:bg-[#e5572b] text-white font-bold text-base rounded-xl transition-colors duration-200 cursor-pointer shadow-lg"
            >
              {ctaLabel ?? 'Enroll today'}
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
            {!hideSecondaryCta && (
              <a
                href="/jobs"
                className="inline-flex items-center gap-1.5 px-6 py-4 text-white/90 hover:text-white font-semibold text-base underline-offset-4 hover:underline transition-colors duration-200 cursor-pointer"
              >
                Browse jobs →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors duration-200 cursor-pointer group"
        aria-label="Scroll to next section"
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <ArrowDown className="w-5 h-5 animate-bounce" aria-hidden="true" />
      </button>
    </section>
  )
}
