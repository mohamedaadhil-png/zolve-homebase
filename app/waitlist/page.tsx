import { createClient } from '@/lib/supabase/server'
import LandingPageClient from '@/components/landing/LandingPageClient'

export const revalidate = 3600

// Public pre-launch waitlist. Renders the exact landing page in "waitlist" mode:
// every CTA scrolls to the signup form just above the footer.
export default async function WaitlistPage() {
  const supabase = await createClient()

  const [{ count: jobCount }, { count: companyCount }] = await Promise.all([
    supabase
      .from('job_postings')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('country', 'US'),
    supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('sponsor_flag', true),
  ])

  return (
    <LandingPageClient
      jobCount={jobCount ?? 0}
      companyCount={companyCount ?? 31}
      mode="waitlist"
    />
  )
}
