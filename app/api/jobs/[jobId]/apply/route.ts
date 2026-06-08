import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: { jobId: string } }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get job's source URL
  const { data: job } = await supabase
    .from('job_postings')
    .select('source_url')
    .eq('id', params.jobId)
    .single()

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // Record apply click
  await supabase.from('job_apply_clicks').insert({
    job_id: params.jobId,
    user_id: user?.id ?? null,
    clicked_at: new Date().toISOString(),
  })

  return NextResponse.json({ source_url: job.source_url })
}
