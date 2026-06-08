import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST { entries: [{ level, university, field_of_study, start_date, end_date }] }
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const entries = Array.isArray(body.entries) ? body.entries : [body]

    const rows = entries.map((e: Record<string, unknown>) => ({
      user_id: user.id,
      level: e.level ?? null,
      university: e.university ?? null,
      field_of_study: e.field_of_study ?? null,
      start_date: e.start_date ?? null,
      end_date: e.end_date ?? null,
    }))

    const { data, error } = await supabase.from('user_education').insert(rows).select()
    if (error) throw error

    return NextResponse.json({ success: true, education: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { error } = await supabase.from('user_education').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
