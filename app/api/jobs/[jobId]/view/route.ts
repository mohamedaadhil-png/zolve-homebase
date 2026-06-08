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

  await supabase.from('job_views').insert({
    job_id: params.jobId,
    user_id: user?.id ?? null,
    viewed_at: new Date().toISOString(),
  })

  return NextResponse.json({ ok: true })
}
