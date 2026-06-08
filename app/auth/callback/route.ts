import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if user exists in users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, onboarding_complete')
          .eq('id', user.id)
          .single()

        if (!existingUser) {
          // New user — create record
          await supabase.from('users').insert({
            id: user.id,
            google_sub: user.user_metadata?.sub ?? user.id,
            name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? '',
            email: user.email ?? '',
            onboarding_complete: false,
            created_at: new Date().toISOString(),
          })

          return NextResponse.redirect(`${origin}/onboarding`)
        }

        if (!existingUser.onboarding_complete) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }

        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Something went wrong — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
