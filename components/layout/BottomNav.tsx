'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Briefcase, GraduationCap, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/upskill', label: 'Upskill', icon: GraduationCap },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-t border-slate-100 flex items-center">
      {items.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
              active ? 'text-[#ff6633]' : 'text-slate-400'
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
