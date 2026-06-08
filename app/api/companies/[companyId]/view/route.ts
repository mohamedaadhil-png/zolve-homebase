import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: { companyId: string } }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  await supabase.from('company_views').insert({
    company_id: params.companyId,
    user_id: user?.id ?? null,
    viewed_at: new Date().toISOString(),
  })

  return NextResponse.json({ ok: true })
}
