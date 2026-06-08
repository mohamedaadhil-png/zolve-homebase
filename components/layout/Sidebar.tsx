'use client'

import { cn } from '@/lib/utils'
import {
  Home,
  Briefcase,
  GraduationCap,
  Users,
  Calendar,
  BookOpen,
  Building2,
  LogOut,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  soon?: boolean
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/jobs', label: 'Live Jobs', icon: Briefcase },
  { href: '/sponsor-directory', label: 'Sponsor Directory', icon: Building2 },
  { href: '/upskill', label: 'Upskill', icon: GraduationCap, soon: true },
  { href: '/networking', label: 'Networking', icon: Users, soon: true },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/resources', label: 'Resource Library', icon: BookOpen, soon: true },
]

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside
      className={cn(
        'w-60 bg-white border-r border-navy-200 flex flex-col h-full',
        className
      )}
    >
      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 ease-in-out group',
                active
                  ? 'bg-[#fff1ec] text-[#ff6633]'
                  : 'text-navy-600 hover:bg-navy-50 hover:text-navy-800'
              )}
            >
              {/* Active left border indicator */}
              {active && (
                <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#ff6633] rounded-r-full" />
              )}

              <Icon
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-colors duration-150',
                  active ? 'text-[#ff6633]' : 'text-navy-400 group-hover:text-navy-600'
                )}
              />
              <span className="flex-1">{item.label}</span>

              {item.soon && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-navy-100 text-navy-400 leading-none">
                  Soon
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Sign Out */}
      <div className="p-3 border-t border-navy-200">
        <Link
          href="/auth/signout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-navy-500 hover:bg-red-50 hover:text-red-500 cursor-pointer transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Link>
      </div>
    </aside>
  )
}
