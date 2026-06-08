import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { origin } = new URL(request.url)

  const supabase = await createClient()
  await supabase.auth.signOut()

  // Send the user back to the public landing page (pre-sign-in)
  return NextResponse.redirect(`${origin}/`, {
    status: 302,
  })
}
