'use client'

import { useState } from 'react'
import { GraduationCap, Calendar, BookOpen, ArrowRight, Clock, DollarSign, Star, Users, ChevronRight } from 'lucide-react'

const CARDS = [
  {
    id: 'upskill',
    icon: GraduationCap,
    category: 'Upskill',
    color: '#ff6633',
    bg: 'bg-[#fff1ec]',
    iconBg: 'bg-[#ff6633]',
    headline: 'Land the interview. Ace it.',
    desc: 'Resume reviews, mock interviews, and 1-on-1 career coaching from professionals who\'ve navigated the OPT → H-1B path.',
    items: [
      { icon: Star,        label: 'Resume Review',      meta: '30 min · $49' },
      { icon: Users,       label: 'Mock Interviews',    meta: '60 min · $99' },
      { icon: GraduationCap, label: 'Career Strategy',  meta: '45 min · $79 · Popular' },
    ],
    cta: 'Explore sessions',
  },
  {
    id: 'events',
    icon: Calendar,
    category: 'Events',
    color: '#6366f1',
    bg: 'bg-indigo-50',
    iconBg: 'bg-indigo-500',
    headline: 'Learn from those who made it.',
    desc: 'Live workshops on visa timelines, salary negotiation, and networking — hosted by engineers and attorneys who\'ve been through it.',
    items: [
      { icon: Calendar, label: 'H-1B Visa Workshop',     meta: 'Monthly · Free' },
      { icon: Users,    label: 'Recruiter Connect',      meta: 'Bi-weekly · Invite only' },
      { icon: Star,     label: 'Salary Negotiation AMA', meta: 'Quarterly · Free' },
    ],
    cta: 'Browse events',
  },
  {
    id: 'resources',
    icon: BookOpen,
    category: 'Resource Library',
    color: '#10b981',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-500',
    headline: 'Every guide you\'ll wish you had earlier.',
    desc: 'Curated articles, templates, and step-by-step playbooks — from OPT application to H-1B transfer to green card filing.',
    items: [
      { icon: BookOpen, label: 'OPT to H-1B Playbook',   meta: 'Free · 12 min read' },
      { icon: BookOpen, label: 'Salary Benchmarks 2026', meta: 'Free · Data guide' },
      { icon: BookOpen, label: 'H-1B Cap Tracker',       meta: 'Free · Updated daily' },
    ],
    cta: 'Browse library',
  },
]

export default function CareerSupportSection() {
  const [active, setActive] = useState(0)
  const card = CARDS[active]
  const Icon = card.icon

  return (
    <section className="bg-[#FBFAF7] py-20 sm:py-28 overflow-hidden" aria-label="Career support">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6633]" aria-hidden="true" />
              <span className="text-[#ff6633] text-xs font-bold tracking-[0.2em] uppercase">Coming Soon</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#131310] leading-[1.08] tracking-tight">
              More than a job board.{' '}
              <span className="font-serif-accent text-[#ff6633]">A career platform.</span>
            </h2>
          </div>
          <p className="text-[#475569] text-base leading-relaxed max-w-sm sm:text-right sm:pb-1">
            Everything international professionals need to land, grow, and stay in the US tech ecosystem.
          </p>
        </div>

        {/* Split layout */}
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 items-start">

          {/* Left — tab nav + detail */}
          <div>
            {/* Tab pills */}
            <div className="flex gap-2 mb-8">
              {CARDS.map((c, i) => {
                const TabIcon = c.icon
                return (
                  <button
                    key={c.id}
                    onClick={() => setActive(i)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      active === i
                        ? 'bg-[#131310] text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    {c.category}
                  </button>
                )
              })}
            </div>

            {/* Active card detail */}
            <div key={card.id} className={`${card.bg} rounded-3xl p-8`}>
              <div className={`w-12 h-12 ${card.iconBg} rounded-2xl flex items-center justify-center mb-5`}>
                <Icon className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold text-[#131310] mb-3 leading-snug">{card.headline}</h3>
              <p className="text-[#475569] text-base leading-relaxed mb-7">{card.desc}</p>

              {/* Item list */}
              <div className="space-y-3 mb-7">
                {card.items.map((item) => {
                  const ItemIcon = item.icon
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-white/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          <ItemIcon className="w-4 h-4 text-slate-500" aria-hidden="true" />
                        </div>
                        <span className="text-sm font-semibold text-[#0F172A]">{item.label}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{item.meta}</span>
                    </div>
                  )
                })}
              </div>

              <button
                disabled
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#131310] text-white text-sm font-semibold rounded-full opacity-50 cursor-not-allowed"
              >
                {card.cta}
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Right — stacked floating cards (all 3 visible, active on top) */}
          <div className="relative h-[480px] lg:h-auto hidden lg:block">
            {CARDS.map((c, i) => {
              const CardIcon = c.icon
              const isActive = i === active
              const offset = i - active
              // Stack cards: active on top, others peeking below
              const translateY = isActive ? 0 : offset > 0 ? (offset * 72) : (Math.abs(offset) * 72)
              const scale = isActive ? 1 : 0.96 - Math.abs(offset) * 0.02
              const zIndex = isActive ? 30 : 30 - Math.abs(offset) * 10
              const opacity = isActive ? 1 : 0.6

              return (
                <button
                  key={c.id}
                  onClick={() => setActive(i)}
                  className={`absolute inset-x-0 bg-white rounded-3xl border border-slate-200 p-7 text-left cursor-pointer transition-all duration-500 w-full ${
                    isActive ? 'shadow-xl shadow-slate-200/60' : 'hover:opacity-80'
                  }`}
                  style={{
                    transform: `translateY(${translateY}px) scale(${scale})`,
                    zIndex,
                    opacity,
                    top: 0,
                  }}
                  aria-pressed={isActive}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-11 h-11 ${c.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <CardIcon className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold tracking-wider uppercase" style={{ color: c.color }}>
                          {c.category}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-semibold rounded-full">
                          Coming Soon
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#131310] leading-snug">{c.headline}</h3>
                    </div>
                  </div>

                  {isActive && (
                    <div className="space-y-2.5">
                      {c.items.map((item) => {
                        const ItemIcon = item.icon
                        return (
                          <div key={item.label} className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2.5">
                              <ItemIcon className="w-4 h-4 text-slate-400" aria-hidden="true" />
                              <span className="text-sm text-[#0F172A] font-medium">{item.label}</span>
                            </div>
                            <span className="text-xs text-slate-400">{item.meta}</span>
                          </div>
                        )
                      })}
                      <div className="flex items-center justify-end pt-2">
                        <span className="text-sm font-semibold flex items-center gap-1" style={{ color: c.color }}>
                          {c.cta} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
