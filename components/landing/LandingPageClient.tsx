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

interface LandingPageClientProps {
  jobCount: number
  companyCount?: number
}

export default function LandingPageClient({ jobCount, companyCount = 31 }: LandingPageClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [previewJobs, setPreviewJobs] = useState<any[]>([])

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
        .eq('role_category', 'SWE')
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
    const { data } = await supabase.auth.getSession()
    router.push(data.session ? '/dashboard' : '/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <LoggedOutNav />
      {/* 1 — Hero */}
      <HeroSection jobCount={jobCount} onEnroll={handleEnroll} />
      {/* 2 — Hiring partners + real recruiter logos */}
      <PartnersMarquee jobCount={jobCount} companyCount={companyCount} />
      {/* 3 — Live job preview */}
      <JobPreviewSection jobs={previewJobs} totalCount={jobCount} onEnroll={handleEnroll} />
      {/* 4 — Pinned scroll: Upskill / Events / Resources */}
      <CareerPlatformPinnedSection />
      {/* 5 — Product demo video */}
      <VideoSection />
      {/* 5 — Feature bento */}
      <FeatureBento />
      {/* 6 — Visa journey, 3-column */}
      <JourneyFeatures />
      {/* 7 — Zolve product cross-sell */}
      <ZolveCrossSell />
      {/* 8 — Testimonial */}
      <TestimonialSection />
      {/* 9 — Footer */}
      <FooterSection />
    </div>
  )
}
