import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST { entries: [{ company, designation, start_date, end_date, is_current }] }
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const entries = Array.isArray(body.entries) ? body.entries : [body]

    const rows = entries.map((e: Record<string, unknown>) => ({
      user_id: user.id,
      company: e.company ?? null,
      designation: e.designation ?? null,
      start_date: e.start_date ?? null,
      end_date: e.end_date ?? null,
      is_current: e.is_current ?? false,
    }))

    const { data, error } = await supabase.from('user_employment').insert(rows).select()
    if (error) throw error

    return NextResponse.json({ success: true, employment: data })
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

    const { error } = await supabase.from('user_employment').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
