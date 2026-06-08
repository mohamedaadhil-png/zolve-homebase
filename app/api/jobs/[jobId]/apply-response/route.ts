import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { response } = await request.json() as { response: 'applied' | 'saved_for_later' | 'not_yet' }

  await supabase.from('job_apply_responses').upsert({
    job_id: params.jobId,
    user_id: user.id,
    response,
    responded_at: new Date().toISOString(),
  })

  return NextResponse.json({ ok: true })
}
