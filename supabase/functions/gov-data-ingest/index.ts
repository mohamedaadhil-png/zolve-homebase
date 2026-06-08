// ============================================================
// Zolve HomeBase — Edge Function: gov-data-ingest
// Ingests USCIS H-1B employer data and DOL LCA records from
// CSV/TSV files stored in the `gov-data-raw` Storage bucket,
// matches them to companies, then recomputes sponsor scores.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================
// Types
// ============================================================
interface StorageFile {
  name: string
  id:   string
}

interface USCISRow {
  employer_name_raw:    string
  normalized_name:      string
  fiscal_year:          number
  initial_approvals:    number
  initial_denials:      number
  continuing_approvals: number
  continuing_denials:   number
  city:                 string
  state:                string
  zip:                  string
}

interface DOLRow {
  employer_name_raw: string
  normalized_name:   string
  soc_code:          string
  job_title:         string
  worksite_city:     string
  worksite_state:    string
  prevailing_wage:   number | null
  offered_wage:      number | null
  case_status:       string
  decision_date:     string | null
}

interface MatchResult {
  company_id:       string | null
  match_confidence: number
  match_method:     string
}

interface IngestSummary {
  file:   string
  type:   'uscis' | 'dol' | 'unknown'
  rows:   number
  upserted: number
  errors: number
}

// ============================================================
// Name normalisation — mirrors the Postgres function
// ============================================================
function normalizeCompanyName(raw: string): string {
  let n = raw.toLowerCase().trim()

  // Strip legal suffixes
  n = n.replace(
    /\s+(incorporated|inc\.?|limited liability company|llc\.?|corporation|corp\.?|limited|ltd\.?|company|co\.?|limited partnership|lp\.?|llp\.?|pllc\.?|pc\.?|plc\.?|gmbh|ag|sa|bv|nv)\s*$/gi,
    '',
  )

  // Strip punctuation (keep letters, digits, spaces)
  n = n.replace(/[^\w\s]/g, ' ')

  // Collapse whitespace
  n = n.replace(/\s+/g, ' ').trim()

  return n
}

// ============================================================
// CSV / TSV parser (handles quoted fields)
// ============================================================
function parseCsvLine(line: string, delimiter: string): string[] {
  const fields: string[] = []
  let current  = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === delimiter && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

function parseCsv(text: string, delimiter = ','): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '')
  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0], delimiter).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i], delimiter)
    if (values.length === 0) continue
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = values[idx] ?? '' })
    rows.push(row)
  }

  return rows
}

// ============================================================
// USCIS file detector & parser
// USCIS publishes CSVs with columns like:
//   Employer, Initial Approvals, Initial Denials,
//   Continuing Approvals, Continuing Denials, NAICS, Tax ID, State, City, ZIP
// ============================================================
function isUSCISFile(filename: string): boolean {
  const lower = filename.toLowerCase()
  return lower.includes('uscis') || lower.includes('h1b_employer') || lower.includes('h-1b_employer') || lower.includes('i129')
}

function isDOLFile(filename: string): boolean {
  const lower = filename.toLowerCase()
  return lower.includes('lca') || lower.includes('dol') || lower.includes('perm') || lower.includes('h1b_lca')
}

function detectDelimiter(firstLine: string): string {
  const tabCount   = (firstLine.match(/\t/g) || []).length
  const commaCount = (firstLine.match(/,/g)  || []).length
  return tabCount > commaCount ? '\t' : ','
}

// Map flexible USCIS column names to our schema
function mapUSCISRow(raw: Record<string, string>, fiscalYear: number): USCISRow | null {
  const employerName =
    raw['employer'] ??
    raw['employer_name'] ??
    raw['petitioner_name'] ??
    raw['petitioner'] ??
    ''

  if (!employerName) return null

  const safeInt = (v: string | undefined) => parseInt(v?.replace(/,/g, '') || '0', 10) || 0

  return {
    employer_name_raw:    employerName,
    normalized_name:      normalizeCompanyName(employerName),
    fiscal_year:          fiscalYear,
    initial_approvals:    safeInt(raw['initial_approvals']    ?? raw['initial_approval']),
    initial_denials:      safeInt(raw['initial_denials']      ?? raw['initial_denial']),
    continuing_approvals: safeInt(raw['continuing_approvals'] ?? raw['continuing_approval']),
    continuing_denials:   safeInt(raw['continuing_denials']   ?? raw['continuing_denial']),
    city:                 raw['city']  ?? raw['worksite_city']  ?? '',
    state:                raw['state'] ?? raw['worksite_state'] ?? '',
    zip:                  raw['zip']   ?? raw['postal_code']    ?? '',
  }
}

// Map flexible DOL LCA column names
function mapDOLRow(raw: Record<string, string>): DOLRow | null {
  const employerName =
    raw['employer_name'] ??
    raw['employer']      ??
    raw['lca_case_employer_name'] ??
    ''

  if (!employerName) return null

  const safeNum = (v: string | undefined): number | null => {
    if (!v) return null
    const n = parseFloat(v.replace(/[$,]/g, ''))
    return isNaN(n) ? null : n
  }

  return {
    employer_name_raw: employerName,
    normalized_name:   normalizeCompanyName(employerName),
    soc_code:          raw['soc_code']        ?? raw['lca_case_soc_code'] ?? '',
    job_title:         raw['job_title']        ?? raw['lca_case_job_title'] ?? raw['position_title'] ?? '',
    worksite_city:     raw['worksite_city']    ?? raw['lca_case_workloc1_city'] ?? '',
    worksite_state:    raw['worksite_state']   ?? raw['lca_case_workloc1_state'] ?? '',
    prevailing_wage:   safeNum(raw['prevailing_wage'] ?? raw['pw_amount'] ?? raw['lca_case_pw_amount_9089']),
    offered_wage:      safeNum(raw['wage_rate_of_pay_from'] ?? raw['offered_wage'] ?? raw['wage_offered_from_9089']),
    case_status:       raw['case_status']      ?? raw['lca_case_status'] ?? '',
    decision_date:     raw['decision_date']    ?? raw['lca_case_submit'] ?? null,
  }
}

// ============================================================
// Company matcher: exact → trgm similarity via RPC
// ============================================================
async function matchCompany(
  supabase: SupabaseClient,
  normalizedName: string,
): Promise<MatchResult> {
  // 1. Exact match on normalized_name
  const { data: exact } = await supabase
    .from('companies')
    .select('id')
    .eq('normalized_name', normalizedName)
    .limit(1)
    .single()

  if (exact) {
    return { company_id: exact.id, match_confidence: 1.0, match_method: 'exact' }
  }

  // 2. Alias match
  const { data: alias } = await supabase
    .from('company_aliases')
    .select('company_id')
    .eq('alias_raw', normalizedName)
    .limit(1)
    .single()

  if (alias) {
    return { company_id: alias.company_id, match_confidence: 0.95, match_method: 'alias' }
  }

  // 3. Trigram similarity via Postgres (>0.65 threshold)
  const { data: trgm } = await supabase.rpc('find_company_by_trgm', {
    p_name: normalizedName,
    p_threshold: 0.65,
  })

  if (trgm && trgm.length > 0) {
    return {
      company_id:       trgm[0].company_id,
      match_confidence: trgm[0].similarity,
      match_method:     'trgm',
    }
  }

  return { company_id: null, match_confidence: 0, match_method: 'none' }
}

// ============================================================
// Extract fiscal year from filename (e.g. "uscis_fy2023.csv")
// ============================================================
function extractFiscalYear(filename: string): number {
  const match = filename.match(/(?:fy|fiscal.?year.?)(\d{4})/i) ??
                filename.match(/(\d{4})/)
  return match ? parseInt(match[1], 10) : new Date().getFullYear()
}

// ============================================================
// Batch upsert helper with chunk splitting
// ============================================================
async function batchUpsert<T extends object>(
  supabase: SupabaseClient,
  table: string,
  rows: T[],
  chunkSize = 500,
): Promise<{ upserted: number; errors: number }> {
  let upserted = 0
  let errors   = 0

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await supabase.from(table).upsert(chunk)
    if (error) {
      console.error(`Upsert error on ${table}:`, error.message)
      errors += chunk.length
    } else {
      upserted += chunk.length
    }
  }

  return { upserted, errors }
}

// ============================================================
// Process a single USCIS file
// ============================================================
async function processUSCISFile(
  supabase: SupabaseClient,
  filename: string,
  text: string,
): Promise<IngestSummary> {
  const delimiter  = detectDelimiter(text.split('\n')[0])
  const rawRows    = parseCsv(text, delimiter)
  const fiscalYear = extractFiscalYear(filename)

  const mapped: USCISRow[] = rawRows
    .map(r => mapUSCISRow(r, fiscalYear))
    .filter((r): r is USCISRow => r !== null)

  // Batch-match companies, then build upsert payloads
  const upsertRows: object[] = []

  for (const row of mapped) {
    const match = await matchCompany(supabase, row.normalized_name)
    upsertRows.push({
      ...row,
      company_id:       match.company_id,
      match_confidence: match.match_confidence,
      match_method:     match.match_method,
    })
  }

  const { upserted, errors } = await batchUpsert(supabase, 'uscis_sponsor_records', upsertRows)
  return { file: filename, type: 'uscis', rows: mapped.length, upserted, errors }
}

// ============================================================
// Process a single DOL LCA file
// ============================================================
async function processDOLFile(
  supabase: SupabaseClient,
  filename: string,
  text: string,
): Promise<IngestSummary> {
  const delimiter = detectDelimiter(text.split('\n')[0])
  const rawRows   = parseCsv(text, delimiter)

  const mapped: DOLRow[] = rawRows
    .map(r => mapDOLRow(r))
    .filter((r): r is DOLRow => r !== null)

  const upsertRows: object[] = []

  for (const row of mapped) {
    const match = await matchCompany(supabase, row.normalized_name)
    upsertRows.push({
      ...row,
      company_id:       match.company_id,
      match_confidence: match.match_confidence,
      match_method:     match.match_method,
    })
  }

  const { upserted, errors } = await batchUpsert(supabase, 'dol_lca_records', upsertRows)
  return { file: filename, type: 'dol', rows: mapped.length, upserted, errors }
}

// ============================================================
// Recompute sponsor scores for all matched companies
// ============================================================
async function recomputeAllSponsorScores(supabase: SupabaseClient): Promise<void> {
  // Get distinct company_ids that appear in USCIS data
  const { data: companies } = await supabase
    .from('uscis_sponsor_records')
    .select('company_id')
    .not('company_id', 'is', null)

  if (!companies) return

  const uniqueIds = [...new Set(companies.map(r => r.company_id as string))]
  console.log(`Recomputing sponsor scores for ${uniqueIds.length} companies`)

  for (const id of uniqueIds) {
    const { error } = await supabase.rpc('compute_sponsor_score', { p_company_id: id })
    if (error) console.error(`Score compute failed for ${id}:`, error.message)
  }
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

    const reqUrl    = new URL(req.url)
    const targetFile = reqUrl.searchParams.get('file') // optional: process a single file

    // List files in the gov-data-raw bucket
    const { data: fileList, error: listErr } = await supabase.storage
      .from('gov-data-raw')
      .list('', { limit: 200 })

    if (listErr) throw listErr

    const files = (fileList as StorageFile[]).filter(f => {
      const lower = f.name.toLowerCase()
      if (targetFile) return f.name === targetFile
      return lower.endsWith('.csv') || lower.endsWith('.tsv') || lower.endsWith('.txt')
    })

    console.log(`Found ${files.length} data files to process`)

    const summaries: IngestSummary[] = []

    for (const file of files) {
      console.log(`Processing: ${file.name}`)

      // Download the file
      const { data: blob, error: downloadErr } = await supabase.storage
        .from('gov-data-raw')
        .download(file.name)

      if (downloadErr || !blob) {
        console.error(`Failed to download ${file.name}:`, downloadErr?.message)
        summaries.push({ file: file.name, type: 'unknown', rows: 0, upserted: 0, errors: 1 })
        continue
      }

      const text = await blob.text()

      try {
        if (isUSCISFile(file.name)) {
          const summary = await processUSCISFile(supabase, file.name, text)
          summaries.push(summary)
          console.log(`  USCIS → rows: ${summary.rows}, upserted: ${summary.upserted}`)
        } else if (isDOLFile(file.name)) {
          const summary = await processDOLFile(supabase, file.name, text)
          summaries.push(summary)
          console.log(`  DOL → rows: ${summary.rows}, upserted: ${summary.upserted}`)
        } else {
          console.warn(`  Unknown file type: ${file.name} — skipping`)
          summaries.push({ file: file.name, type: 'unknown', rows: 0, upserted: 0, errors: 0 })
        }
      } catch (fileErr) {
        console.error(`  Error processing ${file.name}:`, fileErr)
        summaries.push({ file: file.name, type: 'unknown', rows: 0, upserted: 0, errors: 1 })
      }
    }

    // After all files are ingested, recompute sponsor scores
    console.log('Recomputing sponsor scores...')
    await recomputeAllSponsorScores(supabase)

    const totalRows     = summaries.reduce((a, s) => a + s.rows,     0)
    const totalUpserted = summaries.reduce((a, s) => a + s.upserted, 0)
    const totalErrors   = summaries.reduce((a, s) => a + s.errors,   0)

    const responseBody = {
      success:   totalErrors === 0,
      files:     summaries.length,
      totalRows,
      totalUpserted,
      totalErrors,
      summaries,
    }

    console.log('Ingest complete:', responseBody)

    return new Response(JSON.stringify(responseBody), {
      status:  200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Fatal ingest error:', err)
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status:  500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
