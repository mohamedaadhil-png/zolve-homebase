'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from './Navbar'
import GlobalSearch from '@/components/search/GlobalSearch'

interface TopBarUser {
  name: string
  email: string
  avatarUrl?: string
}

interface SearchResult {
  id: string
  type: 'job' | 'company' | 'event' | 'coming-soon'
  title: string
  subtitle: string
  href: string
}

const COMING_SOON_ROUTES: Record<string, string> = {
  Upskill: '/upskill',
  Events: '/events',
  Networking: '/networking',
  Resources: '/resources',
}

/**
 * Client wrapper around the top Navbar that owns the global search state.
 * Opens the GlobalSearch palette via the navbar button or ⌘K / Ctrl+K,
 * and fetches site-wide results (jobs, companies, events, coming-soon) from /api/search.
 */
export default function TopBar({ user }: { user: TopBarUser }) {
  const [open, setOpen] = useState(false)

  // ⌘K / Ctrl+K toggles the palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleSearch = useCallback(async (query: string): Promise<SearchResult[]> => {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) return []
      const data = await res.json()

      const jobs: SearchResult[] = (data.jobs ?? []).map((j: any) => ({
        id: `job-${j.id}`,
        type: 'job',
        title: j.title,
        subtitle: [j.company_name, j.role_category].filter(Boolean).join(' · ') || 'Job',
        href: `/jobs/${j.id}`,
      }))

      const companies: SearchResult[] = (data.companies ?? []).map((c: any) => ({
        id: `company-${c.id}`,
        type: 'company',
        title: c.canonical_name,
        subtitle: c.industry ?? 'Company',
        href: `/companies/${c.id}`,
      }))

      const events: SearchResult[] = (data.events ?? []).map((e: any) => ({
        id: `event-${e.id}`,
        type: 'event',
        title: e.title,
        subtitle: [e.dateText, e.speakerName].filter(Boolean).join(' · ') || 'Event',
        href: `/events#event-${e.id}`,
      }))

      const comingSoon: SearchResult[] = (data.coming_soon ?? []).map((c: any) => ({
        id: `cs-${c.title}`,
        type: 'coming-soon',
        title: c.title,
        subtitle: c.description ?? c.category,
        href: COMING_SOON_ROUTES[c.category] ?? '/upskill',
      }))

      return [...jobs, ...companies, ...events, ...comingSoon]
    } catch {
      return []
    }
  }, [])

  return (
    <>
      <Navbar user={user} onSearchOpen={() => setOpen(true)} />
      <GlobalSearch open={open} onClose={() => setOpen(false)} onSearch={handleSearch} />
    </>
  )
}
