import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const waitlistSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  status: z.enum(['student', 'wp', 'dependent']),
})

// POST — add an email to the pre-launch waitlist.
// Dedupe relies on the UNIQUE(email) constraint: a repeat email is reported
// as alreadyJoined rather than an error, so the UI shows the success state.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = waitlistSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await (supabase as any).from('waitlist').insert({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      status: parsed.data.status,
    })

    if (error) {
      // 23505 = unique_violation → already on the list, treat as success.
      if (error.code === '23505') {
        return NextResponse.json({ ok: true, alreadyJoined: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
