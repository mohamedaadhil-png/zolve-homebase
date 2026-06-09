'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface LoggedOutNavProps {
  onSignIn?: () => void
  /** Overrides the nav button label (e.g. "Join the waitlist"). */
  ctaLabel?: string
}

export default function LoggedOutNav({ onSignIn, ctaLabel }: LoggedOutNavProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 16)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 transition-all duration-200 ease-in-out',
        scrolled
          ? 'bg-white border-b border-navy-200'
          : 'bg-transparent'
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex flex-col leading-none select-none">
        <span
          className={cn(
            'text-base font-extrabold tracking-tight transition-colors duration-200',
            scrolled ? 'text-navy' : 'text-white'
          )}
        >
          ZOLVE
        </span>
        <span className="text-[11px] font-semibold text-[#ff6633] tracking-wide -mt-0.5">
          Home Base
        </span>
      </Link>

      {/* Sign In / Join the waitlist */}
      <button
        onClick={onSignIn}
        className="px-5 py-2.5 text-sm font-semibold bg-[#ff6633] text-white rounded-lg hover:bg-[#e5572b] cursor-pointer transition-all duration-150"
      >
        {ctaLabel ?? 'Sign In'}
      </button>
    </nav>
  )
}
