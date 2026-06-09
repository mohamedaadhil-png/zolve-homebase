'use client'

import { useState } from 'react'
import { MapPin, Clock, DollarSign, Building2, ChevronRight, ExternalLink } from 'lucide-react'
import { formatSalary, timeAgo } from '@/lib/utils'

interface PreviewJob {
  id: string
  title: string
  company_name: string
  company_logo?: string | null
  locations: Array<{ city?: string | null; state?: string | null; is_remote?: boolean }>
  salary_min?: number | null
  salary_max?: number | null
  posted_at?: string | null
  sponsor_score?: number | null
  tags: string[]
  source_url: string
  seniority?: string | null
}

interface JobPreviewSectionProps {
  jobs: PreviewJob[]
  totalCount: number
  onEnroll: () => void
  /** Overrides the CTA label (e.g. "Join the waitlist"). */
  ctaLabel?: string
}

function CompanyLogo({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  const [errored, setErrored] = useState(false)
  if (logoUrl && !errored) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="w-10 h-10 rounded-lg object-contain bg-white p-1 border border-gray-100"
        onError={() => setErrored(true)}
      />
    )
  }
  return (
    <div className="w-10 h-10 rounded-lg bg-navy-100 border border-navy-200 flex items-center justify-center text-navy-700 font-bold text-sm">
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}

function JobSnapCard({
  job,
  isSelected,
  onClick,
}: {
  job: PreviewJob
  isSelected: boolean
  onClick: () => void
}) {
  const location = job.locations?.[0]
  const locationStr = location?.is_remote
    ? 'Remote'
    : [location?.city, location?.state].filter(Boolean).join(', ')

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
        isSelected
          ? 'border-[#ff6633] bg-[#fff1ec]'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <CompanyLogo name={job.company_name} logoUrl={job.company_logo} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-navy text-sm leading-snug truncate">{job.title}</p>
          <p className="text-navy-600 text-xs mt-0.5">{job.company_name}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {locationStr && (
              <span className="text-navy-500 text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                {locationStr}
              </span>
            )}
            {job.sponsor_score && job.sponsor_score >= 60 && (
              <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                ✓ H-1B Sponsor
              </span>
            )}
          </div>
        </div>
        {isSelected && (
          <ChevronRight className="w-4 h-4 text-[#ff6633] flex-shrink-0 mt-1" aria-hidden="true" />
        )}
      </div>
    </button>
  )
}

function JobDetailPreview({ job, onEnroll, ctaLabel }: { job: PreviewJob; onEnroll: () => void; ctaLabel?: string }) {
  const location = job.locations?.[0]
  const locationStr = location?.is_remote
    ? 'Remote'
    : [location?.city, location?.state].filter(Boolean).join(', ')

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 h-full">
      <div className="flex items-start gap-4 mb-4">
        <CompanyLogo name={job.company_name} logoUrl={job.company_logo} />
        <div>
          <h3 className="font-bold text-navy text-lg leading-snug">{job.title}</h3>
          <p className="text-navy-600 text-sm">{job.company_name}</p>
        </div>
      </div>

      {/* Sponsor verified banner */}
      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
        <span className="text-emerald-600 font-bold text-sm">✓ H-1B Sponsorship History Verified</span>
        {job.sponsor_score && (
          <span className="ml-auto px-2.5 py-1 bg-[#ff6633] text-white text-xs font-bold rounded-lg">
            Score {job.sponsor_score}/100
          </span>
        )}
      </div>

      {/* Quick facts */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {locationStr && (
          <div className="flex items-center gap-2 text-sm text-navy-600">
            <MapPin className="w-4 h-4 text-navy-400" aria-hidden="true" />
            {locationStr}
          </div>
        )}
        {(job.salary_min || job.salary_max) && (
          <div className="flex items-center gap-2 text-sm text-navy-600">
            <DollarSign className="w-4 h-4 text-navy-400" aria-hidden="true" />
            {formatSalary(job.salary_min, job.salary_max)}
          </div>
        )}
        {job.posted_at && (
          <div className="flex items-center gap-2 text-sm text-navy-600">
            <Clock className="w-4 h-4 text-navy-400" aria-hidden="true" />
            {timeAgo(job.posted_at)}
          </div>
        )}
        {job.seniority && (
          <div className="flex items-center gap-2 text-sm text-navy-600">
            <Building2 className="w-4 h-4 text-navy-400" aria-hidden="true" />
            <span className="capitalize">{job.seniority}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {job.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="px-2.5 py-1 bg-navy-100 text-navy-700 text-xs font-medium rounded-full">
            {tag}
          </span>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onEnroll}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#ff6633] hover:bg-[#e5572b] text-white font-bold rounded-xl transition-colors duration-200 cursor-pointer"
      >
        {ctaLabel ?? 'Enroll to Apply'}
        <ExternalLink className="w-4 h-4" aria-hidden="true" />
      </button>
      <p className="text-center text-navy-400 text-xs mt-2">Free to join · Government-verified data</p>
    </div>
  )
}

export default function JobPreviewSection({ jobs, totalCount, onEnroll, ctaLabel }: JobPreviewSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const displayJobs = jobs.slice(0, 6)
  const selectedJob = displayJobs[selectedIndex]

  return (
    <section className="py-20 bg-navy-50" aria-label="Job preview">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-3">
            Search{' '}
            <span className="text-[#ff6633]">{totalCount.toLocaleString()}+</span> jobs using Zolve Home Base
          </h2>
          <p className="text-navy-600 text-lg">Every job verified for H-1B sponsorship history</p>
        </div>

        {/* Split view */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Left: job snap cards */}
          <div className="space-y-3">
            {displayJobs.map((job, i) => (
              <JobSnapCard
                key={job.id}
                job={job}
                isSelected={i === selectedIndex}
                onClick={() => setSelectedIndex(i)}
              />
            ))}

            {/* CTA below cards */}
            <button
              onClick={onEnroll}
              className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#ff6633] hover:bg-[#e5572b] text-white font-bold rounded-xl transition-colors duration-200 cursor-pointer"
            >
              {ctaLabel ?? "Enroll today — it's free"}
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Right: detail preview */}
          {selectedJob && (
            <div className="lg:sticky lg:top-24">
              <JobDetailPreview job={selectedJob} onEnroll={onEnroll} ctaLabel={ctaLabel} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
