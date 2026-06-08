import { createClient } from '@/lib/supabase/server'
import LandingPageClient from '@/components/landing/LandingPageClient'

export const revalidate = 3600

export default async function HomePage() {
  const supabase = await createClient()

  const [{ count: jobCount }, { count: companyCount }] = await Promise.all([
    supabase
      .from('job_postings')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('role_category', 'SWE'),
    supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('sponsor_flag', true),
  ])

  return <LandingPageClient jobCount={jobCount ?? 0} companyCount={companyCount ?? 31} />
}
