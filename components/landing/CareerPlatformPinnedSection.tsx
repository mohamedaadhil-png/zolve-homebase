'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { GraduationCap, Calendar, BookOpen, ArrowRight, ChevronRight } from 'lucide-react'

const TOPICS = [
  {
    id: 'upskill',
    label: 'Upskill',
    icon: GraduationCap,
    eyebrow: 'UPSKILL',
    color: '#ff6633',
    headline: 'Land the interview. Ace it.',
    desc: "Resume reviews, mock interviews, and 1-on-1 career coaching from professionals who've navigated the OPT to H-1B path.",
    items: [
      { label: 'Resume Review',   meta: '30 min · $49' },
      { label: 'Mock Interviews', meta: '60 min · $99' },
      { label: 'Career Strategy', meta: '45 min · $79 · Popular' },
    ],
    cta: 'Explore sessions',
    image: '/images/homebase/upskill.png',
    imageAlt: 'Professional career coaching session for international tech professionals',
  },
  {
    id: 'events',
    label: 'Events',
    icon: Calendar,
    eyebrow: 'EVENTS',
    color: '#6366f1',
    headline: 'Meet the people who can open doors.',
    desc: 'Discover networking events, recruiter sessions, career fairs, and industry meetups built for international professionals.',
    items: [
      { label: 'Recruiter Sessions', meta: 'Coming Soon' },
      { label: 'Career Fairs',       meta: 'Coming Soon' },
      { label: 'Industry Meetups',   meta: 'Coming Soon' },
    ],
    cta: 'Explore events',
    image: '/images/homebase/events.png',
    imageAlt: 'Networking event for international tech professionals',
  },
  {
    id: 'resources',
    label: 'Resource Library',
    icon: BookOpen,
    eyebrow: 'RESOURCE LIBRARY',
    color: '#10b981',
    headline: 'Everything you need to make smarter moves.',
    desc: 'Access guides for OPT, H-1B, resumes, interviews, sponsorship strategy, salary negotiation, and career planning.',
    items: [
      { label: 'OPT & CPT Guides',              meta: 'Free' },
      { label: 'H-1B Sponsorship Guides',        meta: 'Free' },
      { label: 'Resume & Interview Playbooks',   meta: 'Free' },
    ],
    cta: 'Explore resources',
    image: '/images/homebase/resource-library.png',
    imageAlt: 'Resource library with guides for H-1B and OPT professionals',
  },
] as const

type TopicId = typeof TOPICS[number]['id']

// ── Desktop expanded card ────────────────────────────────────────────────────
function ExpandedCard({ topic, onCta }: { topic: typeof TOPICS[number]; onCta?: () => void }) {
  const Icon = topic.icon
  return (
    <div
      className="rounded-3xl p-7 border border-slate-200 bg-white shadow-sm"
      style={{ borderLeftColor: topic.color, borderLeftWidth: 3 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${topic.color}18` }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color: topic.color, width: 18, height: 18 }} aria-hidden="true" />
        </div>
        <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: topic.color }}>
          {topic.eyebrow}
        </span>
        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-semibold rounded-full">
          Coming Soon
        </span>
      </div>

      <h3 className="text-xl font-bold text-[#131310] mb-2.5 leading-snug">{topic.headline}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-5">{topic.desc}</p>

      <div className="space-y-2 mb-6">
        {topic.items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-xl"
          >
            <span className="text-sm font-medium text-[#131310]">{item.label}</span>
            <span className="text-xs text-slate-400 font-medium">{item.meta}</span>
          </div>
        ))}
      </div>

      <button
        disabled
        className="inline-flex items-center gap-1.5 text-sm font-semibold opacity-40 cursor-not-allowed"
        style={{ color: topic.color }}
      >
        {topic.cta} <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  )
}

// ── Desktop collapsed row ────────────────────────────────────────────────────
function CollapsedRow({
  topic,
  onClick,
}: {
  topic: typeof TOPICS[number]
  onClick: () => void
}) {
  const Icon = topic.icon
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors duration-150 cursor-pointer text-left"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${topic.color}18` }}
        >
          <Icon className="w-4 h-4" style={{ color: topic.color }} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#131310]">{topic.label}</p>
          <p className="text-xs text-slate-400 leading-snug">{topic.desc.slice(0, 55)}…</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
    </button>
  )
}

// ── Mobile card (all three stacked) ─────────────────────────────────────────
function MobileCard({ topic }: { topic: typeof TOPICS[number] }) {
  const Icon = topic.icon
  return (
    <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* Image */}
      <div className="aspect-[16/9] w-full overflow-hidden">
        <img
          src={topic.image}
          alt={topic.imageAlt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${topic.color}18` }}
          >
            <Icon className="w-4 h-4" style={{ color: topic.color }} aria-hidden="true" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: topic.color }}>
            {topic.eyebrow}
          </span>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-semibold rounded-full ml-auto">
            Coming Soon
          </span>
        </div>
        <h3 className="text-lg font-bold text-[#131310] mb-2 leading-snug">{topic.headline}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-4">{topic.desc}</p>
        <div className="space-y-2 mb-4">
          {topic.items.map((item) => (
            <div key={item.label} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-[#131310]">{item.label}</span>
              <span className="text-xs text-slate-400">{item.meta}</span>
            </div>
          ))}
        </div>
        <button
          disabled
          className="inline-flex items-center gap-1.5 text-sm font-semibold opacity-40 cursor-not-allowed"
          style={{ color: topic.color }}
        >
          {topic.cta} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CareerPlatformPinnedSection() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [imgVisible, setImgVisible] = useState(true)
  const outerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const changeActive = useCallback(
    (next: number) => {
      if (next === activeIdx) return
      if (prefersReducedMotion) {
        setActiveIdx(next)
        return
      }
      setImgVisible(false)
      setTimeout(() => {
        setActiveIdx(next)
        setImgVisible(true)
      }, 200)
    },
    [activeIdx, prefersReducedMotion]
  )

  // Scroll-jacking on desktop only
  useEffect(() => {
    const outer = outerRef.current
    if (!outer) return

    const onScroll = () => {
      const rect = outer.getBoundingClientRect()
      const outerH = outer.offsetHeight
      // How far we've scrolled into the 300vh wrapper
      const scrolled = -rect.top
      const progress = Math.max(0, Math.min(1, scrolled / (outerH - window.innerHeight)))
      const next = Math.min(TOPICS.length - 1, Math.floor(progress * TOPICS.length))
      changeActive(next)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [changeActive])

  const topic = TOPICS[activeIdx]

  return (
    <section aria-label="Career platform features" className="bg-[#FBFAF7]">

      {/* ── DESKTOP: pinned scroll container ── */}
      <div
        ref={outerRef}
        className="hidden lg:block"
        style={{ height: '300vh' }}
      >
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
          <div className="max-w-6xl mx-auto px-6 w-full flex flex-col h-full py-16">

            {/* Top header */}
            <div className="mb-10 flex-shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6633]" aria-hidden="true" />
                <span className="text-[#ff6633] text-xs font-bold tracking-[0.2em] uppercase">Coming Soon</span>
              </div>
              <div className="flex items-end justify-between gap-6">
                <h2 className="text-4xl xl:text-5xl font-bold text-[#131310] leading-[1.08] tracking-tight max-w-xl">
                  More than a job board.{' '}
                  <span className="font-serif-accent text-[#ff6633]">A career platform.</span>
                </h2>
                <p className="text-slate-500 text-base leading-relaxed max-w-sm text-right pb-1 hidden xl:block">
                  Everything international professionals need to land, grow, and stay in the US tech ecosystem.
                </p>
              </div>

            </div>

            {/* Split: left 45% + right 55% */}
            <div className="grid grid-cols-[44%_56%] gap-6 flex-1 min-h-0">

              {/* Left — accordion */}
              <div className="flex flex-col gap-3 overflow-auto pr-2">
                {TOPICS.map((t, i) =>
                  i === activeIdx ? (
                    <ExpandedCard key={t.id} topic={t} />
                  ) : (
                    <CollapsedRow key={t.id} topic={t} onClick={() => changeActive(i)} />
                  )
                )}
              </div>

              {/* Right — image */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-slate-100">
                <img
                  key={topic.id}
                  src={topic.image}
                  alt={topic.imageAlt}
                  className="w-full h-full object-cover"
                  style={{
                    transition: prefersReducedMotion ? 'none' : 'opacity 0.3s ease, transform 0.4s ease',
                    opacity: imgVisible ? 1 : 0,
                    transform: imgVisible ? 'scale(1)' : 'scale(1.03)',
                  }}
                />
                {/* Progress dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {TOPICS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => changeActive(i)}
                      aria-label={`Go to ${TOPICS[i].label}`}
                      className={`rounded-full transition-all duration-300 cursor-pointer ${
                        i === activeIdx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Scroll hint */}
            <div className="flex justify-center mt-4 flex-shrink-0">
              <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                <div className="flex gap-1.5">
                  {TOPICS.map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-300 ${
                        i === activeIdx ? 'w-5 h-1.5 bg-[#ff6633]' : 'w-1.5 h-1.5 bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span>Scroll to explore</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE: stacked cards ── */}
      <div className="lg:hidden py-16 px-6">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6633]" aria-hidden="true" />
            <span className="text-[#ff6633] text-xs font-bold tracking-[0.2em] uppercase">Coming Soon</span>
          </div>
          <h2 className="text-3xl font-bold text-[#131310] leading-[1.08] tracking-tight mb-3">
            More than a job board.{' '}
            <span className="font-serif-accent text-[#ff6633]">A career platform.</span>
          </h2>
          <p className="text-slate-500 text-base leading-relaxed">
            Everything international professionals need to land, grow, and stay in the US tech ecosystem.
          </p>
        </div>
        <div className="space-y-6">
          {TOPICS.map((t) => (
            <MobileCard key={t.id} topic={t} />
          ))}
        </div>
      </div>

    </section>
  )
}
