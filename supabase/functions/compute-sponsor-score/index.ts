// ============================================================
// Zolve HomeBase — Edge Function: compute-sponsor-score
// Recomputes sponsor scores for one or all companies.
//
// Query params:
//   company_id (optional) — recompute a single company
//   batch_size (optional, default 50) — companies per iteration
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ScoreResult {
  company_id:    string
  canonical_name: string
  sponsor_score:  number | null
  status:        'ok' | 'error'
  error?:        string
}

serve(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )

    const url        = new URL(req.url)
    const companyId  = url.searchParams.get('company_id')
    const batchSize  = parseInt(url.searchParams.get('batch_size') ?? '50', 10)

    let companyIds: Array<{ id: string; canonical_name: string }> = []

    if (companyId) {
      // Single company mode
      const { data, error } = await supabase
        .from('companies')
        .select('id, canonical_name')
        .eq('id', companyId)
        .single()

      if (error) throw new Error(`Company not found: ${companyId}`)
      companyIds = [data]
    } else {
      // All companies that have USCIS data
      const { data, error } = await supabase
        .from('companies')
        .select('id, canonical_name')
        .order('canonical_name')

      if (error) throw error
      companyIds = data ?? []
    }

    console.log(`Computing sponsor scores for ${companyIds.length} companies`)

    const results: ScoreResult[] = []

    // Process in batches to avoid overwhelming Postgres
    for (let i = 0; i < companyIds.length; i += batchSize) {
      const batch = companyIds.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async company => {
          try {
            const { data, error } = await supabase.rpc('compute_sponsor_score', {
              p_company_id: company.id,
            })

            if (error) {
              console.error(`Score error for ${company.canonical_name}:`, error.message)
              results.push({
                company_id:     company.id,
                canonical_name: company.canonical_name,
                sponsor_score:  null,
                status:         'error',
                error:          error.message,
              })
            } else {
              results.push({
                company_id:     company.id,
                canonical_name: company.canonical_name,
                sponsor_score:  data as number,
                status:         'ok',
              })
            }
          } catch (err) {
            results.push({
              company_id:     company.id,
              canonical_name: company.canonical_name,
              sponsor_score:  null,
              status:         'error',
              error:          String(err),
            })
          }
        }),
      )

      // Small pause between batches to avoid connection saturation
      if (i + batchSize < companyIds.length) {
        await new Promise<void>(r => setTimeout(r, 200))
      }
    }

    const succeeded = results.filter(r => r.status === 'ok').length
    const failed    = results.filter(r => r.status === 'error').length

    // Build top-10 sponsors list for quick validation
    const top10 = results
      .filter(r => r.sponsor_score !== null)
      .sort((a, b) => (b.sponsor_score ?? 0) - (a.sponsor_score ?? 0))
      .slice(0, 10)
      .map(r => ({ name: r.canonical_name, score: r.sponsor_score }))

    const responseBody = {
      success:   failed === 0,
      computed:  succeeded,
      failed,
      top10,
      results:   companyId ? results : undefined, // only include full list in single-company mode
    }

    console.log('Sponsor score computation complete:', { succeeded, failed })

    return new Response(JSON.stringify(responseBody), {
      status:  200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Fatal error in compute-sponsor-score:', err)
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status:  500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
