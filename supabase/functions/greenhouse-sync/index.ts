// ============================================================
// Zolve HomeBase — Edge Function: greenhouse-sync
// Syncs SWE job postings from Greenhouse ATS boards.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================
// Types
// ============================================================
interface Company {
  id: string
  canonical_name: string
  ats_board_token: string
  logo_url: string | null
  domain: string | null
  sponsor_flag: boolean
  sponsor_score: number | null
}

interface GreenhouseDepartment {
  id: number
  name: string
}

interface GreenhouseOffice {
  id: number
  name: string
  location: string | null
}

interface GreenhouseJob {
  id: number
  title: string
  absolute_url: string
  location: { name: string }
  updated_at: string
  content?: string
  departments: GreenhouseDepartment[]
  offices: GreenhouseOffice[]
  metadata?: Array<{ id: number; name: string; value: string | null }>
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[]
}

interface NormalizedLocation {
  raw: string
  city: string | null
  state: string | null
  country: string
  is_remote: boolean
}

interface JobPostingUpsert {
  company_id: string
  source_ats: string
  source_job_id: string
  title: string
  normalized_title: string
  role_category: string
  seniority: string
  track: string
  description_html: string
  locations: NormalizedLocation[]
  employment_type: string
  remote: string
  source_url: string
  tags: string[]
  jsonld: object
  is_active: boolean
  inactive_since: string | null
  posted_at: string
  updated_at: string
}

// ============================================================
// SWE role classifier
// ============================================================
function isSWERole(title: string, departments: GreenhouseDepartment[]): boolean {
  const t = title.toLowerCase()
  const d = departments.map(dep => dep.name).join(' ').toLowerCase()
  const combined = `${t} ${d}`

  const includeKeywords = [
    'software engineer',
    'software developer',
    ' swe',
    'backend',
    'back-end',
    'back end',
    'frontend',
    'front-end',
    'front end',
    'full stack',
    'fullstack',
    'full-stack',
    'infrastructure engineer',
    'platform engineer',
    'ml engineer',
    'machine learning engineer',
    'machine learning',
    'mobile engineer',
    'ios engineer',
    'android engineer',
    'site reliability',
    ' sre ',
    'devops',
    'data engineer',
    'security engineer',
    'systems engineer',
    'embedded engineer',
    'firmware engineer',
    'ui engineer',
    'api engineer',
    'cloud engineer',
    'distributed systems',
  ]

  const excludeKeywords = [
    'sales engineer',
    'solutions engineer',
    'support engineer',
    'customer success',
    'recruiter',
    'recruiting',
    'designer',
    'product manager',
    'marketing',
    'finance analyst',
    'legal',
    'operations manager',
    'hr ',
    'human resources',
    'program manager',
    'business analyst',
    'account manager',
    'account executive',
  ]

  const hasInclude = includeKeywords.some(kw => combined.includes(kw))
  const hasExclude = excludeKeywords.some(kw => combined.includes(kw))

  return hasInclude && !hasExclude
}

// ============================================================
// Seniority extractor
// ============================================================
function extractSeniority(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('intern') || t.includes('co-op') || t.includes('coop')) return 'intern'
  if (t.includes('new grad') || t.includes('entry level') || t.includes('entry-level') || t.includes('university grad')) return 'new-grad'
  if (t.includes('junior') || / jr[. ]/.test(t) || t.endsWith(' jr')) return 'junior'
  if (t.includes('principal') || t.includes('distinguished') || t.includes('fellow')) return 'principal'
  if (t.includes('staff')) return 'staff'
  if (t.includes('senior') || / sr[. ]/.test(t) || t.endsWith(' sr')) return 'senior'
  if (t.includes(' lead') || t.includes('tech lead') || t.includes('manager')) return 'lead'
  return 'mid'
}

// ============================================================
// Track extractor
// ============================================================
function extractTrack(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('machine learning') || t.includes(' ml ') || t.startsWith('ml ') || t.endsWith(' ml') || t.includes(' ai ') || t.includes('deep learning') || t.includes('nlp')) return 'ml'
  if (t.includes('ios') || t.includes('android') || t.includes('mobile') || t.includes('react native') || t.includes('flutter')) return 'mobile'
  if (t.includes('frontend') || t.includes('front-end') || t.includes('front end') || t.includes('react') || t.includes('angular') || t.includes('vue') || t.includes('ui engineer')) return 'frontend'
  if (t.includes('fullstack') || t.includes('full-stack') || t.includes('full stack')) return 'fullstack'
  if (t.includes('backend') || t.includes('back-end') || t.includes('back end') || t.includes('api') || t.includes('server-side')) return 'backend'
  if (t.includes('infra') || t.includes('platform') || t.includes(' sre') || t.includes('reliability') || t.includes('devops') || t.includes('cloud') || t.includes('kubernetes') || t.includes('distributed')) return 'infra'
  if (t.includes('data engineer') || t.includes('analytics engineer') || t.includes('etl') || t.includes('data pipeline')) return 'data'
  if (t.includes('security') || t.includes('embedded') || t.includes('firmware') || t.includes('systems')) return 'systems'
  return 'general'
}

// ============================================================
// Location normalizer
// ============================================================
function normalizeLocations(locationStr: string): NormalizedLocation[] {
  if (!locationStr || locationStr.trim() === '') {
    return [{ raw: '', city: null, state: null, country: 'US', is_remote: false }]
  }

  const isRemote = /remote/i.test(locationStr)

  // Handle "Remote - US" or "Remote (United States)" patterns
  if (isRemote && !locationStr.includes(',')) {
    return [{ raw: locationStr, city: null, state: null, country: 'US', is_remote: true }]
  }

  const parts = locationStr.split(/,\s*/)
  return [{
    raw:       locationStr,
    city:      parts[0]?.trim() || null,
    state:     parts[1]?.trim() || null,
    country:   parts[2]?.trim() || 'US',
    is_remote: isRemote,
  }]
}

// ============================================================
// JSON-LD generator
// ============================================================
function generateJobLD(job: GreenhouseJob, company: Company, description: string): object {
  const validThrough = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const isRemote = /remote/i.test(job.location?.name || '')

  return {
    '@context': 'https://schema.org',
    '@type':    'JobPosting',
    title:      job.title,
    description,
    datePosted:   job.updated_at,
    validThrough,
    employmentType: 'FULL_TIME',
    url:            job.absolute_url,
    hiringOrganization: {
      '@type':  'Organization',
      name:     company.canonical_name,
      sameAs:   company.domain ? `https://${company.domain}` : undefined,
      logo:     company.logo_url ?? undefined,
    },
    jobLocation: isRemote
      ? { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'US' } }
      : {
          '@type':   'Place',
          address: {
            '@type':          'PostalAddress',
            addressLocality:  job.location?.name?.split(',')[0]?.trim(),
            addressCountry:   'US',
          },
        },
    applicantLocationRequirements: isRemote
      ? { '@type': 'Country', name: 'United States' }
      : undefined,
    jobLocationType: isRemote ? 'TELECOMMUTE' : undefined,
    identifier: {
      '@type': 'PropertyValue',
      name:    'greenhouse',
      value:   String(job.id),
    },
    baseSalary: undefined, // populated if salary metadata exists
  }
}

// ============================================================
// Fetch with retry + exponential backoff
// ============================================================
async function fetchWithRetry(
  url: string,
  maxRetries = 3,
  baseDelayMs = 2000,
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url)

      // Rate-limited or server error — retry
      if (res.status === 429 || res.status >= 500) {
        const retryAfter = res.headers.get('Retry-After')
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : baseDelayMs * Math.pow(2, attempt)
        console.warn(`HTTP ${res.status} for ${url}, retrying in ${delay}ms (attempt ${attempt + 1})`)
        await sleep(delay)
        continue
      }

      return res
    } catch (err) {
      lastError = err as Error
      const delay = baseDelayMs * Math.pow(2, attempt)
      console.warn(`Fetch error for ${url}: ${err}, retrying in ${delay}ms`)
      await sleep(delay)
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${url} after ${maxRetries} retries`)
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

// ============================================================
// Main sync logic for a single company
// ============================================================
async function syncCompany(
  supabase: SupabaseClient,
  company: Company,
): Promise<{ synced: number; deactivated: number }> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${company.ats_board_token}/jobs?content=true`

  const res = await fetchWithRetry(url)
  if (!res.ok) {
    console.error(`Greenhouse API error for ${company.canonical_name}: HTTP ${res.status}`)
    return { synced: 0, deactivated: 0 }
  }

  const data: GreenhouseResponse = await res.json()
  const jobs = data.jobs ?? []
  const seenJobIds: string[] = []
  let synced = 0

  for (const job of jobs) {
    // Only ingest SWE roles
    if (!isSWERole(job.title, job.departments ?? [])) continue

    const jobId = String(job.id)
    seenJobIds.push(jobId)

    const locations      = normalizeLocations(job.location?.name ?? '')
    const hasRemote      = locations.some(l => l.is_remote)
    const descriptionHtml = job.content ?? ''
    const seniority      = extractSeniority(job.title)
    const isIntern       = seniority === 'intern'

    // Build tags
    const tags: string[] = ['H-1B Sponsor']
    if (hasRemote)  tags.push('Remote')
    if (isIntern)   tags.push('Internship')
    else            tags.push('Full-time')

    const jsonld = generateJobLD(job, company, descriptionHtml)

    const upsertPayload: JobPostingUpsert = {
      company_id:       company.id,
      source_ats:       'greenhouse',
      source_job_id:    jobId,
      title:            job.title,
      normalized_title: job.title.toLowerCase().trim(),
      role_category:    'SWE',
      seniority,
      track:            extractTrack(job.title),
      description_html: descriptionHtml,
      locations,
      employment_type:  isIntern ? 'internship' : 'full-time',
      remote:           hasRemote ? 'remote' : 'onsite',
      source_url:       job.absolute_url,
      tags,
      jsonld,
      is_active:        true,
      inactive_since:   null,
      posted_at:        job.updated_at || new Date().toISOString(),
      updated_at:       new Date().toISOString(),
    }

    const { error: upsertErr } = await supabase
      .from('job_postings')
      .upsert(upsertPayload, { onConflict: 'source_ats,source_job_id' })

    if (upsertErr) {
      console.error(`Failed to upsert job ${jobId} (${job.title}):`, upsertErr.message)
    } else {
      synced++
    }
  }

  // Deactivate jobs not seen in this sync pass
  let deactivated = 0
  if (seenJobIds.length > 0) {
    const { data: deactivatedRows, error: deactErr } = await supabase
      .from('job_postings')
      .update({
        is_active:      false,
        inactive_since: new Date().toISOString(),
      })
      .eq('company_id', company.id)
      .eq('source_ats', 'greenhouse')
      .eq('is_active', true)
      .not('source_job_id', 'in', `(${seenJobIds.join(',')})`)
      .select('id')

    if (deactErr) {
      console.error(`Deactivation error for ${company.canonical_name}:`, deactErr.message)
    } else {
      deactivated = deactivatedRows?.length ?? 0
    }
  } else if (jobs.length === 0) {
    // Board is empty — deactivate all existing active jobs for this company
    const { data: deactivatedRows } = await supabase
      .from('job_postings')
      .update({ is_active: false, inactive_since: new Date().toISOString() })
      .eq('company_id', company.id)
      .eq('source_ats', 'greenhouse')
      .eq('is_active', true)
      .select('id')

    deactivated = deactivatedRows?.length ?? 0
  }

  // Update last_synced_at on the company record
  await supabase
    .from('companies')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', company.id)

  return { synced, deactivated }
}

// ============================================================
// Entry point
// ============================================================
serve(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )

    // Optional: allow single-company sync via query param ?company_id=...
    const url        = new URL(req.url)
    const filterById = url.searchParams.get('company_id')

    let query = supabase
      .from('companies')
      .select('id, canonical_name, ats_board_token, logo_url, domain, sponsor_flag, sponsor_score')
      .eq('ats_provider', 'greenhouse')
      .not('ats_board_token', 'is', null)

    if (filterById) {
      query = query.eq('id', filterById)
    }

    const { data: companies, error: cErr } = await query
    if (cErr) throw cErr

    console.log(`Starting Greenhouse sync for ${companies?.length ?? 0} companies`)

    let totalSynced      = 0
    let totalDeactivated = 0
    const errors: string[] = []

    for (const company of companies ?? []) {
      try {
        console.log(`Syncing ${company.canonical_name} (${company.ats_board_token})...`)
        const { synced, deactivated } = await syncCompany(supabase, company as Company)
        console.log(`  → synced: ${synced}, deactivated: ${deactivated}`)
        totalSynced      += synced
        totalDeactivated += deactivated
      } catch (err) {
        const msg = `Error syncing ${company.canonical_name}: ${err}`
        console.error(msg)
        errors.push(msg)
      }

      // Rate-limit: Greenhouse public boards allow ~1 req/sec per IP
      await sleep(1100)
    }

    const responseBody = {
      success:     errors.length === 0,
      synced:      totalSynced,
      deactivated: totalDeactivated,
      companies:   companies?.length ?? 0,
      errors:      errors.length > 0 ? errors : undefined,
    }

    console.log('Sync complete:', responseBody)

    return new Response(JSON.stringify(responseBody), {
      status:  200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Fatal sync error:', err)
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status:  500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
