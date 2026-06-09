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

  // Use getSession() here (reads/decodes the cookie locally, no network call) for
  // routing decisions. getUser() makes a network call to Supabase that can fail on
  // Vercel's Edge runtime and wipe the session cookie. Authoritative validation
  // still happens at the page/layout level (server components, Node runtime).
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user ?? null

  const { pathname } = request.nextUrl

  // Redirect while preserving any refreshed Supabase auth cookies. Returning a
  // bare NextResponse.redirect drops them, which logs the user out on the next
  // request (the "keeps asking me to sign in" loop).
  const redirectTo = (path: string) => {
    const res = NextResponse.redirect(new URL(path, request.url))
    supabaseResponse.cookies.getAll().forEach((cookie) => res.cookies.set(cookie))
    return res
  }

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
        return redirectTo('/waitlist')
      }
    }
  }

  // Protect dashboard and profile routes
  if (
    (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) &&
    !user
  ) {
    return redirectTo('/login')
  }

  // Redirect logged-in users away from login
  if (pathname === '/login' && user) {
    return redirectTo('/dashboard')
  }

  // Check onboarding for authenticated users accessing protected routes
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
