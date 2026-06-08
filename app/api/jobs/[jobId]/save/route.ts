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

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if already saved
  const { data: existing } = await supabase
    .from('saved_jobs')
    .select('id')
    .eq('user_id', user.id)
    .eq('job_id', params.jobId)
    .single()

  if (existing) {
    // Unsave
    await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', user.id)
      .eq('job_id', params.jobId)

    return NextResponse.json({ saved: false })
  } else {
    // Save
    await supabase.from('saved_jobs').insert({
      user_id: user.id,
      job_id: params.jobId,
      saved_at: new Date().toISOString(),
    })

    return NextResponse.json({ saved: true })
  }
}
