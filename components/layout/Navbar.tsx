'use client'

import { cn } from '@/lib/utils'
import { Search, ChevronDown, User, LogOut } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface NavbarUser {
  name: string
  email: string
  avatarUrl?: string
}

interface NavbarProps {
  user: NavbarUser
  onSearchOpen?: () => void
  className?: string
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function Navbar({ user, onSearchOpen, className }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header
      className={cn(
        'h-16 bg-white border-b border-navy-200 flex items-center px-6 gap-6 sticky top-0 z-40',
        className
      )}
    >
      {/* Logo */}
      <Link href="/dashboard" className="flex flex-col leading-none select-none flex-shrink-0">
        <span className="text-base font-extrabold text-navy tracking-tight">ZOLVE</span>
        <span className="text-[11px] font-semibold text-[#ff6633] tracking-wide -mt-0.5">
          Home Base
        </span>
      </Link>

      {/* Search bar — center */}
      <div className="flex-1 max-w-xl mx-auto">
        <button
          onClick={onSearchOpen}
          className="w-full flex items-center gap-3 px-4 py-2.5 bg-navy-50 border border-navy-200 rounded-lg text-sm text-navy-400 hover:border-navy-400 hover:bg-white cursor-pointer transition-all duration-150 text-left"
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          <span>Search jobs, companies, events…</span>
          <span className="ml-auto flex items-center gap-1 text-xs text-navy-300 font-mono bg-navy-100 px-1.5 py-0.5 rounded">
            ⌘K
          </span>
        </button>
      </div>

      {/* Right: avatar + dropdown */}
      <div className="relative flex-shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-navy-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#ff6633] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(user.name)}
            </div>
          )}
          <span className="hidden sm:block text-sm font-medium text-navy-700 max-w-[120px] truncate">
            {user.name.split(' ')[0]}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-navy-400 transition-transform duration-150',
              dropdownOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-navy-200 rounded-xl py-1 z-50 animate-fade-in">
            {/* User info */}
            <div className="px-4 py-3 border-b border-navy-100">
              <p className="text-sm font-semibold text-navy-800 truncate">{user.name}</p>
              <p className="text-xs text-navy-400 truncate">{user.email}</p>
            </div>
            <Link
              href="/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50 cursor-pointer transition-colors duration-150"
            >
              <User className="w-4 h-4 text-navy-400" />
              Profile
            </Link>
            <div className="border-t border-navy-100 mt-1 pt-1">
              <Link
                href="/auth/signout"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 cursor-pointer transition-colors duration-150"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
