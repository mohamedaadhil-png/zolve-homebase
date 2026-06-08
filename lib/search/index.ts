/**
 * Search layer — wraps Postgres FTS + pg_trgm.
 * Interface is designed so a future swap to Typesense/Meilisearch is drop-in.
 */
import { createClient } from '@/lib/supabase/server'

export interface SearchFilters {
  q: string
  visa_types?: string[]
  job_types?: string[]
  seniority?: string[]
  remote?: string
  limit?: number
  offset?: number
}

export interface JobSearchResult {
  id: string
  company_id: string
  title: string
  normalized_title: string | null
  locations: Array<{ city?: string; state?: string; is_remote?: boolean }>
  employment_type: string | null
  remote: string | null
  salary_min: number | null
  salary_max: number | null
  tags: string[]
  posted_at: string | null
  source_url: string
  seniority: string | null
  role_category: string | null
  company_name: string
  company_logo: string | null
  sponsor_score: number | null
  rank: number
}

export interface GlobalSearchResult {
  jobs: JobSearchResult[]
  companies: Array<{
    id: string
    canonical_name: string
    logo_url: string | null
    sponsor_score: number | null
    industry: string | null
  }>
  coming_soon: Array<{ title: string; category: string; description: string }>
}

export async function searchJobs(filters: SearchFilters): Promise<{
  results: JobSearchResult[]
  total: number
}> {
  const supabase = await createClient()
  const limit = filters.limit ?? 20
  const offset = filters.offset ?? 0

  const { data, error } = await supabase.rpc('search_jobs', {
    query: filters.q || '',
    p_visa_types: filters.visa_types?.length ? filters.visa_types : null,
    p_job_types: filters.job_types?.length ? filters.job_types : null,
    p_seniority: filters.seniority?.length ? filters.seniority : null,
    p_remote: filters.remote || null,
    p_limit: limit,
    p_offset: offset,
  })

  if (error) throw error

  // Get total count (separate query for pagination)
  const { count } = await supabase
    .from('job_postings')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return { results: (data as JobSearchResult[]) || [], total: count ?? 0 }
}

export async function globalSearch(q: string, limit = 5): Promise<GlobalSearchResult> {
  if (!q.trim()) {
    return { jobs: [], companies: [], coming_soon: [] }
  }

  const supabase = await createClient()

  const [jobsRes, companiesRes] = await Promise.all([
    supabase.rpc('search_jobs', {
      query: q,
      p_visa_types: null,
      p_job_types: null,
      p_seniority: null,
      p_remote: null,
      p_limit: limit,
      p_offset: 0,
    }),
    supabase
      .from('companies')
      .select('id, canonical_name, logo_url, sponsor_score, industry')
      .ilike('canonical_name', `%${q}%`)
      .limit(limit),
  ])

  const COMING_SOON = [
    { title: 'Resume Review', category: 'Upskill', description: '30-min session, $49' },
    { title: 'Mock Interviews', category: 'Upskill', description: '60-min session, $99' },
    { title: 'OPT/H-1B Guidance', category: 'Upskill', description: '45-min session, $69' },
    { title: 'Career Strategy Session', category: 'Upskill', description: '45-min session, $79' },
    { title: 'Networking Events', category: 'Events', description: 'Coming soon' },
    { title: 'Mentor Matching', category: 'Networking', description: 'Coming soon' },
  ]

  const matchingComingSoon = COMING_SOON.filter(
    (item) =>
      item.title.toLowerCase().includes(q.toLowerCase()) ||
      item.category.toLowerCase().includes(q.toLowerCase())
  )

  return {
    jobs: (jobsRes.data as JobSearchResult[]) || [],
    companies: companiesRes.data || [],
    coming_soon: matchingComingSoon,
  }
}
