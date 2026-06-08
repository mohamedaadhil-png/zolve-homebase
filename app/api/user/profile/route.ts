import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [profileRes, eduRes, empRes, completionRes] = await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase.from('user_education').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
      supabase.from('user_employment').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
      supabase.from('user_profile_completion').select('percent, breakdown').eq('user_id', user.id).maybeSingle(),
    ])

    return NextResponse.json({
      user: profileRes.data,
      education: eduRes.data || [],
      employment: empRes.data || [],
      completion: completionRes.data,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const allowed = ['name', 'mobile', 'visa_status', 'preferred_role', 'visible_to_employers']
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    // Recording the employer-visibility decision (either way) stamps consent.
    if ('visible_to_employers' in body) {
      updates.consent_at = new Date().toISOString()
      updates.consent_version = '1.0'
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (error) throw error

    return NextResponse.json({ success: true, user: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
