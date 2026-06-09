/**
 * Ingest jobs from all seed companies' Greenhouse boards into job_postings.
 *
 * - Pulls every role (not just SWE) and classifies role_category.
 * - Idempotent: upserts on (source_ats, source_job_id).
 * - Deactivates postings that have dropped off a board since the last run.
 *
 * Run:   tsx scripts/ingest-jobs.ts            (writes)
 *        tsx scripts/ingest-jobs.ts --dry-run  (no writes, prints summary)
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { fetchBoardJobs, type GreenhouseJob } from '../lib/greenhouse/connector'
import { classifyRole, extractSeniority, extractTrack } from '../lib/pipeline/classifier'
import { parseJobLocation } from '../lib/pipeline/location'

// ── env ──────────────────────────────────────────────────────────────────────
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
for (const line of readFileSync(path.join(root, '.env.local'), 'utf8').split('\n')) {
  if (!line || line.startsWith('#') || !line.includes('=')) continue
  const i = line.indexOf('=')
  const k = line.slice(0, i).trim()
  if (!process.env[k]) process.env[k] = line.slice(i + 1).trim()
}

const DRY_RUN = process.argv.includes('--dry-run')
// All roles are kept and normalized into proper families; pass --exclude-other
// to drop the small residual "other" bucket.
const EXCLUDE_OTHER = process.argv.includes('--exclude-other')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── helpers ──────────────────────────────────────────────────────────────────
function buildRow(job: GreenhouseJob, companyId: string) {
  const departments = (job.departments || []).map((d) => d.name)
  const role = classifyRole(job.title, departments)
  const loc = parseJobLocation(job.location?.name ?? '')
  return {
    company_id: companyId,
    source_ats: 'greenhouse',
    source_job_id: String(job.id),
    title: job.title,
    normalized_title: job.title.toLowerCase(),
    role_category: role,
    seniority: extractSeniority(job.title),
    track: role === 'software_engineering' ? extractTrack(job.title) : null,
    description_html: job.content ?? null,
    locations: [{ raw: loc.raw, city: loc.city, state: loc.state, country: loc.country, is_remote: loc.is_remote }],
    country: loc.country,
    state: loc.state,
    employment_type: 'full-time',
    remote: loc.is_remote ? 'remote' : 'onsite',
    posted_at: job.updated_at ?? null,
    source_url: job.absolute_url,
    tags: ['H-1B Sponsor', 'Full-time'],
    is_active: true,
    _isUS: loc.isUS, // transient flag for the US-only filter (stripped before insert)
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 Job ingestion ${DRY_RUN ? '(DRY RUN — no writes)' : ''}\n`)

  const { data: companies, error: cErr } = await supabase
    .from('companies')
    .select('id, canonical_name, ats_board_token')
    .not('ats_board_token', 'is', null)
  if (cErr) throw cErr
  console.log(`Found ${companies!.length} companies with board tokens\n`)

  const catTotals: Record<string, number> = {}
  let totalUpserted = 0
  let totalDeactivated = 0

  for (const company of companies!) {
    const token = company.ats_board_token as string
    let jobs: GreenhouseJob[] = []
    try {
      jobs = await fetchBoardJobs(token)
    } catch (err) {
      console.log(`  ✗ ${company.canonical_name.padEnd(14)} fetch failed: ${err}`)
      continue
    }

    // Build rows; keep US-only (current scope), optionally drop "other".
    let rows = jobs.map((j) => buildRow(j, company.id as string)).filter((r) => r._isUS)
    if (EXCLUDE_OTHER) rows = rows.filter((r) => r.role_category !== 'other')

    // Dedup identical postings: same (title + primary location) listed twice.
    const seenKey = new Set<string>()
    const deduped = rows
      .filter((r) => {
        const key = `${r.normalized_title}|${(r.locations[0]?.raw ?? '').toLowerCase()}`
        if (seenKey.has(key)) return false
        seenKey.add(key)
        return true
      })
      .map(({ _isUS, ...rest }) => rest) // strip transient flag before insert
    const dupDropped = rows.length - deduped.length
    for (const r of deduped) catTotals[r.role_category] = (catTotals[r.role_category] || 0) + 1
    const seenIds = new Set(deduped.map((r) => r.source_job_id))

    if (DRY_RUN) {
      console.log(
        `  • ${company.canonical_name.padEnd(14)} ${String(deduped.length).padStart(4)} jobs (deduped ${dupDropped})`
      )
    } else {
      // Upsert the fresh, deduped set.
      for (const batch of chunk(deduped, 500)) {
        const { error } = await supabase
          .from('job_postings')
          .upsert(batch, { onConflict: 'source_ats,source_job_id' })
        if (error) throw new Error(`${company.canonical_name} upsert: ${error.message}`)
      }
      // Remove postings that are no longer live on the board (incl. old dupes).
      const { data: existing } = await supabase
        .from('job_postings')
        .select('source_job_id')
        .eq('company_id', company.id)
      const stale = (existing ?? [])
        .map((r) => r.source_job_id as string)
        .filter((id) => !seenIds.has(id))
      for (const batch of chunk(stale, 200)) {
        const { error } = await supabase
          .from('job_postings')
          .delete()
          .eq('company_id', company.id)
          .in('source_job_id', batch)
        if (error) throw new Error(`${company.canonical_name} delete-stale: ${error.message}`)
      }
      totalUpserted += deduped.length
      totalDeactivated += stale.length
      console.log(
        `  ✓ ${company.canonical_name.padEnd(14)} upserted ${String(deduped.length).padStart(4)}  removed ${stale.length}  (deduped ${dupDropped})`
      )
    }
    await new Promise((r) => setTimeout(r, 250))
  }

  console.log(`\nCategory distribution:`)
  for (const [cat, n] of Object.entries(catTotals).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat.padEnd(22)} ${n}`)
  }
  if (!DRY_RUN) {
    console.log(`\n✅ Done. Upserted ${totalUpserted}, deactivated ${totalDeactivated}.`)
  } else {
    console.log(`\n(DRY RUN complete — nothing written.)`)
  }
}

main().catch((e) => {
  console.error('❌ Ingestion failed:', e)
  process.exit(1)
})
