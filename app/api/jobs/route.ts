import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RpcRow {
  id: string
  title: string
  locations: Array<{ city?: string; state?: string; is_remote?: boolean }> | null
  employment_type: string | null
  remote: string | null
  salary_min: number | null
  salary_max: number | null
  tags: string[] | null
  posted_at: string | null
  source_url: string
  seniority: string | null
  role_category: string | null
  company_name: string | null
  company_logo: string | null
  sponsor_score: number | null
}

function toLocationString(locations: RpcRow['locations']): string {
  const loc = locations?.[0]
  if (!loc) return 'United States'
  if (loc.is_remote) return 'Remote'
  return [loc.city, loc.state].filter(Boolean).join(', ') || 'United States'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const q = searchParams.get('q') || ''
    const visaTypes = (searchParams.get('visa_types') || '').split(',').filter(Boolean)
    const jobTypes = (searchParams.get('job_types') || '').split(',').filter(Boolean)
    const seniority = (searchParams.get('seniority') || '').split(',').filter(Boolean)
    const roleCategories = (searchParams.get('roles') || '').split(',').filter(Boolean)
    const states = (searchParams.get('states') || '').split(',').filter(Boolean)
    const remote = searchParams.get('remote') || undefined
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20', 10))
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const supabase = await createClient()

    const { data, error } = await supabase.rpc('search_jobs', {
      query: q,
      p_visa_types: visaTypes.length ? visaTypes : null,
      p_job_types: jobTypes.length ? jobTypes : null,
      p_seniority: seniority.length ? seniority : null,
      p_remote: remote || null,
      p_limit: limit,
      p_offset: offset,
      p_role_categories: roleCategories.length ? roleCategories : null,
      p_country: 'US',
      p_states: states.length ? states : null,
    })

    if (error) throw error

    // Map the RPC's flat rows into the shape JobCard expects.
    const jobs = ((data as RpcRow[]) || []).map((r) => ({
      id: r.id,
      title: r.title,
      location: toLocationString(r.locations),
      salary_min: r.salary_min,
      salary_max: r.salary_max,
      tags: r.tags ?? [],
      posted_at: r.posted_at,
      seniority: r.seniority,
      remote: r.remote,
      employment_type: r.employment_type,
      role_category: r.role_category,
      sponsor_score: r.sponsor_score,
      companies: {
        canonical_name: r.company_name ?? 'Unknown',
        logo_url: r.company_logo ?? undefined,
        sponsor_score: r.sponsor_score ?? undefined,
      },
    }))

    let countQuery = supabase
      .from('job_postings')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('country', 'US')
    if (roleCategories.length) countQuery = countQuery.in('role_category', roleCategories)
    if (states.length) countQuery = countQuery.in('state', states)
    const { count } = await countQuery

    return NextResponse.json({ jobs, results: jobs, total: count ?? 0 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
