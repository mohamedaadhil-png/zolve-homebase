import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // IMPORTANT: auth/onboarding protection for the app is enforced in the
  // (dashboard) layout, which runs on the Node runtime. We deliberately do NOT
  // read the Supabase session here in the general case: on Vercel's Edge runtime
  // the SSR client's session read wipes the auth cookie, causing a login loop.
  //
  // The only reason we need the session in middleware is the pre-launch gate,
  // so we only touch Supabase when the gate is explicitly enabled.
  if (process.env.PRELAUNCH !== 'true') {
    return NextResponse.next()
  }

  // ── Pre-launch gate ─────────────────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const email = session?.user?.email?.toLowerCase()

  // Public can only reach the waitlist; PRELAUNCH_ALLOW entries see the full site.
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
    const isAllowed =
      !!email &&
      allowlist.some((entry) => {
        if (entry.startsWith('*@')) return email.endsWith(entry.slice(1))
        if (entry.startsWith('@')) return email.endsWith(entry)
        return email === entry
      })

    if (!isAllowed) {
      const res = NextResponse.redirect(new URL('/waitlist', request.url))
      supabaseResponse.cookies.getAll().forEach((cookie) => res.cookies.set(cookie))
      return res
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|mov|woff|woff2|ttf)$).*)',
  ],
}
