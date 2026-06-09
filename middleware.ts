import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Pre-launch gate ─────────────────────────────────────────────────────────
  // When PRELAUNCH=true, the public can only reach the waitlist. Emails listed in
  // PRELAUNCH_ALLOW (comma-separated) see the full product, including "/".
  // /login and /auth/* stay open so allowlisted users can sign in.
  if (process.env.PRELAUNCH === 'true') {
    const isOpenPath =
      pathname === '/waitlist' ||
      pathname.startsWith('/api/waitlist') ||
      pathname === '/login' ||
      pathname === '/terms' ||
      pathname === '/privacy' ||
      pathname.startsWith('/auth/')

    if (!isOpenPath) {
      // Entries may be exact emails ("a@b.com") or domain wildcards
      // ("*@zolve.com" or "@zolve.com") that admit any address on that domain.
      const allowlist = (process.env.PRELAUNCH_ALLOW ?? '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
      const email = user?.email?.toLowerCase()
      const isAllowed =
        !!email &&
        allowlist.some((entry) => {
          if (entry.startsWith('*@')) return email.endsWith(entry.slice(1))
          if (entry.startsWith('@')) return email.endsWith(entry)
          return email === entry
        })

      if (!isAllowed) {
        return NextResponse.redirect(new URL('/waitlist', request.url))
      }
    }
  }

  // Protect dashboard and profile routes
  if (
    (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) &&
    !user
  ) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from login
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Check onboarding for authenticated users accessing protected routes
  if (user && (pathname.startsWith('/dashboard') || pathname.startsWith('/profile'))) {
    const { data: userData } = await supabase
      .from('users')
      .select('onboarding_complete')
      .eq('id', user.id)
      .single()

    if (userData && userData.onboarding_complete === false) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
