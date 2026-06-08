import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET — list the current user's registered event ids (used to prefill the UI)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ eventIds: [] })

    const { data, error } = await (supabase as any)
      .from('event_registrations')
      .select('event_id')
      .eq('user_id', user.id)

    // Table may not exist yet (migration not applied) — fail soft.
    if (error) return NextResponse.json({ eventIds: [] })
    return NextResponse.json({ eventIds: (data ?? []).map((r: any) => r.event_id) })
  } catch {
    return NextResponse.json({ eventIds: [] })
  }
}

// POST — register the current user for an event
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { eventId, title } = await request.json()
    if (!eventId) {
      return NextResponse.json({ error: 'eventId required' }, { status: 400 })
    }

    const { error } = await (supabase as any)
      .from('event_registrations')
      .upsert(
        { user_id: user.id, event_id: eventId, event_title: title ?? null, status: 'registered' },
        { onConflict: 'user_id,event_id' }
      )

    if (error) {
      // Soft-fail if the table isn't provisioned yet so the UI still works.
      return NextResponse.json({ ok: true, persisted: false })
    }
    return NextResponse.json({ ok: true, persisted: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
