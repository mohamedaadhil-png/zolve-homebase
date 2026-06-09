'use client'

import { ShieldCheck, Gauge, Briefcase, Sparkles, ArrowUpRight } from 'lucide-react'

function SponsorScoreDial() {
  // Decorative donut echoing the product's Sponsor Score
  const score = 92
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#ff6633"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-navy">{score}</span>
        <span className="text-[10px] text-navy-400 font-medium">/ 100</span>
      </div>
    </div>
  )
}

interface FeatureBentoProps {
  /** Overrides the header CTA label (e.g. "Join the waitlist"). */
  ctaLabel?: string
  /** When provided, the header CTA becomes a button calling this instead of
   *  linking to /jobs (used in waitlist mode to scroll to the form). */
  onCta?: () => void
}

export default function FeatureBento({ ctaLabel, onCta }: FeatureBentoProps = {}) {
  return (
    <section className="bg-[#FBFAF7] py-20 sm:py-28" aria-label="Features">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy leading-[1.08] tracking-tight max-w-xl">
            Crafted to de-risk your{' '}
            <span className="font-serif-accent text-[#ff6633]">job hunt</span>
          </h2>
          {onCta ? (
            <button
              onClick={onCta}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#131310] text-white text-sm font-semibold rounded-full hover:bg-[#1f1f1c] transition-colors duration-200 cursor-pointer self-start sm:self-auto"
            >
              {ctaLabel ?? 'Join the waitlist'} <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <a
              href="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#131310] text-white text-sm font-semibold rounded-full hover:bg-[#1f1f1c] transition-colors duration-200 cursor-pointer self-start sm:self-auto"
            >
              Browse jobs <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          )}
        </div>

        {/* Bento grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 — large, dark */}
          <div className="sm:col-span-2 lg:row-span-1 bg-[#131310] rounded-3xl p-7 text-white relative overflow-hidden min-h-[240px] flex flex-col justify-between">
            <div
              className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#ff6633]/20 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-[#ff6633]" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-2">Government-verified sponsorship</h3>
              <p className="text-white/60 text-sm leading-relaxed max-w-md">
                We process USCIS H-1B Employer Data and DOL LCA disclosures so every sponsor claim is
                backed by federal records — never recruiter marketing.
              </p>
            </div>
            <div className="relative flex items-center gap-2 mt-6">
              <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 text-xs font-semibold rounded-full">
                USCIS
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 text-xs font-semibold rounded-full">
                DOL OFLC
              </span>
            </div>
          </div>

          {/* Card 2 — Sponsor Score with dial */}
          <div className="bg-white rounded-3xl p-7 border border-navy-100 flex flex-col items-center justify-center text-center min-h-[240px]">
            <SponsorScoreDial />
            <h3 className="text-base font-bold text-navy mt-4">Sponsor Score</h3>
            <p className="text-navy-500 text-xs mt-1 leading-snug">
              Approval rate, volume & recency in one number
            </p>
          </div>

          {/* Card 3 — SWE focus */}
          <div className="bg-white rounded-3xl p-7 border border-navy-100 flex flex-col justify-between min-h-[240px]">
            <div className="w-11 h-11 rounded-xl bg-[#fff1ec] flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-[#ff6633]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy">Software roles only</h3>
              <p className="text-navy-500 text-sm mt-1.5 leading-snug">
                Curated SWE, ML, infra & data jobs — no noise from unrelated postings.
              </p>
            </div>
          </div>

          {/* Card 4 — wide bottom */}
          <div className="sm:col-span-2 bg-gradient-to-br from-[#fff1ec] to-[#FBFAF7] rounded-3xl p-7 border border-[#ff6633]/15 flex items-center gap-6 min-h-[180px]">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Gauge className="w-6 h-6 text-[#ff6633]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy">Ranked by sponsorship strength</h3>
              <p className="text-navy-600 text-sm mt-1 leading-relaxed">
                Search results boost employers with the strongest, most recent sponsorship history —
                so the best-fit roles surface first.
              </p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="sm:col-span-2 bg-white rounded-3xl p-7 border border-navy-100 flex items-center gap-6 min-h-[180px]">
            <div className="w-12 h-12 rounded-xl bg-[#131310] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-[#ff6633]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy">AI-assisted profile</h3>
              <p className="text-navy-600 text-sm mt-1 leading-relaxed">
                Upload your resume once — we auto-fill your education and work history so you can apply
                in minutes, not hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
