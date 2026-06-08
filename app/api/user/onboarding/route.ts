import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const onboardingSchema = z.object({
  status_type: z.enum(['student', 'wp', 'dependent']),
  visa_status: z.enum(['F-1', 'OPT', 'H-1B', 'other']),
  opt_status: z.string().optional(),
  grad_year: z.number().int().min(2000).max(2035),
  preferred_role: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = onboardingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { error } = await supabase
      .from('users')
      .update({
        ...parsed.data,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
