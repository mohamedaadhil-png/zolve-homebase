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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session and persist rotated tokens. Middleware is the only place
  // that can reliably write the refreshed auth cookies, so this must run on every
  // request (do not put logic between createServerClient and getUser).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Redirect while preserving refreshed auth cookies (a bare redirect drops them).
  const redirectTo = (path: string) => {
    const res = NextResponse.redirect(new URL(path, request.url))
    supabaseResponse.cookies.getAll().forEach((cookie) => res.cookies.set(cookie))
    return res
  }

  // ── Pre-launch gate ─────────────────────────────────────────────────────────
  if (process.env.PRELAUNCH === 'true') {
    const isOpenPath =
      pathname === '/waitlist' ||
      pathname.startsWith('/api/waitlist') ||
      pathname === '/login' ||
      pathname === '/terms' ||
      pathname === '/privacy' ||
      pathname.startsWith('/auth/')

    if (!isOpenPath) {
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

      if (!isAllowed) return redirectTo('/waitlist')
    }
  }

  // Protect dashboard and profile routes
  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) && !user) {
    return redirectTo('/login')
  }

  // Redirect logged-in users away from login
  if (pathname === '/login' && user) {
    return redirectTo('/dashboard')
  }

  // Onboarding gate for authenticated users on protected routes
  if (user && (pathname.startsWith('/dashboard') || pathname.startsWith('/profile'))) {
    const { data: userData } = await supabase
      .from('users')
      .select('onboarding_complete')
      .eq('id', user.id)
      .single()
    if (userData && userData.onboarding_complete === false) {
      return redirectTo('/onboarding')
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|mov|woff|woff2|ttf)$).*)',
  ],
}
