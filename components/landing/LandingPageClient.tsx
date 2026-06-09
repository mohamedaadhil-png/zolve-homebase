'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LoggedOutNav from '@/components/layout/LoggedOutNav'
import HeroSection from './HeroSection'
import PartnersMarquee from './PartnersMarquee'
import JobPreviewSection from './JobPreviewSection'
import CareerPlatformPinnedSection from './CareerPlatformPinnedSection'
import VideoSection from './VideoSection'
import FeatureBento from './FeatureBento'
import JourneyFeatures from './JourneyFeatures'
import ZolveCrossSell from './ZolveCrossSell'
import TestimonialSection from './TestimonialSection'
import FooterSection from './FooterSection'
import WaitlistForm from './WaitlistForm'

interface LandingPageClientProps {
  jobCount: number
  companyCount?: number
  /** 'app' = normal product CTAs (default). 'waitlist' = CTAs scroll to the
   *  waitlist form and are relabelled "Join the waitlist". */
  mode?: 'app' | 'waitlist'
}

export default function LandingPageClient({
  jobCount,
  companyCount = 31,
  mode = 'app',
}: LandingPageClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [previewJobs, setPreviewJobs] = useState<any[]>([])
  const isWaitlist = mode === 'waitlist'
  // Section CTAs keep their app-mode defaults (e.g. "Enroll today"); only the
  // nav button gets an explicit label so it reads "Get Started" / "Join the waitlist".
  const ctaLabel = isWaitlist ? 'Join the waitlist' : undefined
  const navLabel = isWaitlist ? 'Join the waitlist' : 'Get Started'

  useEffect(() => {
    async function fetchPreviewJobs() {
      const { data } = await supabase
        .from('job_postings')
        .select(`
          id, title, locations, salary_min, salary_max, posted_at,
          tags, source_url, seniority,
          companies (canonical_name, logo_url, sponsor_score)
        `)
        .eq('is_active', true)
        .eq('country', 'US')
        .order('posted_at', { ascending: false })
        .limit(6)

      if (data) {
        const normalized = data.map((j: any) => ({
          ...j,
          company_name: j.companies?.canonical_name ?? 'Unknown',
          company_logo: j.companies?.logo_url ?? null,
          sponsor_score: j.companies?.sponsor_score ?? null,
        }))
        setPreviewJobs(normalized)
      }
    }
    fetchPreviewJobs()
  }, [])

  const handleEnroll = async () => {
    if (isWaitlist) {
      document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    const { data } = await supabase.auth.getSession()
    router.push(data.session ? '/dashboard' : '/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <LoggedOutNav onSignIn={handleEnroll} ctaLabel={navLabel} />
      {/* 1 — Hero */}
      <HeroSection
        jobCount={jobCount}
        onEnroll={handleEnroll}
        ctaLabel={ctaLabel}
        hideSecondaryCta={isWaitlist}
      />
      {/* 2 — Hiring partners + real recruiter logos */}
      <PartnersMarquee jobCount={jobCount} companyCount={companyCount} />
      {/* 3 — Live job preview */}
      <JobPreviewSection jobs={previewJobs} totalCount={jobCount} onEnroll={handleEnroll} ctaLabel={ctaLabel} />
      {/* 4 — Pinned scroll: Upskill / Events / Resources */}
      <CareerPlatformPinnedSection />
      {/* 5 — Product demo video */}
      <VideoSection />
      {/* 5 — Feature bento */}
      <FeatureBento {...(isWaitlist ? { ctaLabel, onCta: handleEnroll } : {})} />
      {/* 6 — Visa journey, 3-column */}
      <JourneyFeatures />
      {/* 7 — Zolve product cross-sell */}
      <ZolveCrossSell />
      {/* 8 — Testimonial */}
      <TestimonialSection />
      {/* Waitlist capture — only in waitlist mode, just before the footer */}
      {isWaitlist && <WaitlistForm />}
      {/* 9 — Footer */}
      <FooterSection />
    </div>
  )
}
