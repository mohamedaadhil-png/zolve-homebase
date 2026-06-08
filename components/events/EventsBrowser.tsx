'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, X, ChevronDown, Bookmark, CalendarCheck, SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import EventCard from '@/components/events/EventCard'
import { upcomingEvents, pastEvents, type EventItem, type EventMedium } from '@/lib/events/data'

type DateFilter = 'all' | 'next30' | 'next90' | 'past'

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'All events' },
  { value: 'next30', label: 'Next 30 days' },
  { value: 'next90', label: 'Next 90 days' },
  { value: 'past', label: 'Past recordings' },
]

function relativeDate(dateISO?: string): string | null {
  if (!dateISO) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateISO + 'T00:00:00')
  const days = Math.round((d.getTime() - today.getTime()) / 86_400_000)
  if (days < 0) return 'Past'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days <= 30) return `Event in ${days} days`
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function daysUntil(dateISO?: string): number {
  if (!dateISO) return Infinity
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((new Date(dateISO + 'T00:00:00').getTime() - today.getTime()) / 86_400_000)
}

/** Lightweight dropdown popover */
function FilterPopover({
  label, active, isOpen, onToggle, onClose, children,
}: {
  label: string; active: boolean; isOpen: boolean
  onToggle: () => void; onClose: () => void; children: React.ReactNode
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-sm font-medium cursor-pointer transition-colors',
          active ? 'border-[#ff6633] text-[#ff6633]' : 'border-slate-200 text-slate-600 hover:border-slate-300'
        )}
      >
        {label}
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} />
          <div className="absolute left-0 top-full mt-2 z-40 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-navy-900/10 p-1.5 animate-fade-in">
            {children}
          </div>
        </>
      )}
    </div>
  )
}

export default function EventsBrowser() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [mediums, setMediums] = useState<Set<EventMedium>>(new Set())
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [openFilter, setOpenFilter] = useState<'medium' | 'date' | null>(null)

  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [registered, setRegistered] = useState<Set<string>>(new Set())
  const [registeringId, setRegisteringId] = useState<string | null>(null)

  // Prefill the user's existing registrations (best-effort; ignore if API/table absent)
  useEffect(() => {
    fetch('/api/events/register')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.eventIds?.length) setRegistered(new Set<string>(d.eventIds))
      })
      .catch(() => {})
  }, [])

  function toggleMedium(m: EventMedium) {
    setMediums((prev) => {
      const next = new Set(prev)
      next.has(m) ? next.delete(m) : next.add(m)
      return next
    })
  }

  function toggleSaved(id: string) {
    setSaved((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleRegister(event: EventItem) {
    if (registered.has(event.id) || registeringId) return
    setRegisteringId(event.id)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    // Not signed in → route through the sign-up / sign-in flow, return here after
    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent('/events')}`)
      return
    }
    try {
      await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, title: event.title, dateText: event.dateText }),
      })
    } catch { /* keep optimistic UI even if persistence fails */ }
    setRegistered((prev) => new Set(prev).add(event.id))
    setRegisteringId(null)
  }

  const matches = (e: EventItem) => {
    if (query) {
      const q = query.toLowerCase()
      const hay = [e.title, e.subtitle, e.speakerName, ...e.tags].join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (mediums.size && !mediums.has(e.medium)) return false
    return true
  }

  const { upcoming, past } = useMemo(() => {
    const showUpcoming = dateFilter === 'all' || dateFilter === 'next30' || dateFilter === 'next90'
    const showPast = dateFilter === 'all' || dateFilter === 'past'

    let up = showUpcoming ? upcomingEvents.filter(matches) : []
    if (dateFilter === 'next30') up = up.filter((e) => daysUntil(e.dateISO) <= 30)
    if (dateFilter === 'next90') up = up.filter((e) => daysUntil(e.dateISO) <= 90)
    up = [...up].sort((a, b) => daysUntil(a.dateISO) - daysUntil(b.dateISO))

    const pst = showPast ? pastEvents.filter(matches) : []
    return { upcoming: up, past: pst }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, mediums, dateFilter])

  const total = upcoming.length + past.length
  const filtersActive = query !== '' || mediums.size > 0 || dateFilter !== 'all'

  function resetAll() {
    setQuery(''); setMediums(new Set()); setDateFilter('all'); setOpenFilter(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Events</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Visa webinars, mock interviews &amp; live sessions for international students
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <StatChip icon={<Bookmark className="w-3.5 h-3.5" />} label="Saved" value={saved.size} />
          <StatChip icon={<CalendarCheck className="w-3.5 h-3.5" />} label="Registered" value={registered.size} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, speakers, topics..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6633]/20 focus:border-[#ff6633] transition-shadow"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        <FilterPopover
          label={mediums.size ? `Medium · ${mediums.size}` : 'Medium'}
          active={mediums.size > 0}
          isOpen={openFilter === 'medium'}
          onToggle={() => setOpenFilter(openFilter === 'medium' ? null : 'medium')}
          onClose={() => setOpenFilter(null)}
        >
          {(['virtual', 'in_person'] as EventMedium[]).map((m) => (
            <button
              key={m}
              onClick={() => toggleMedium(m)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-sm text-navy-700 capitalize"
            >
              {m === 'in_person' ? 'In-person' : 'Virtual'}
              <span className={cn(
                'w-4 h-4 rounded border flex items-center justify-center',
                mediums.has(m) ? 'bg-[#ff6633] border-[#ff6633]' : 'border-slate-300'
              )}>
                {mediums.has(m) && <X className="hidden" />}
                {mediums.has(m) && <span className="w-1.5 h-1.5 bg-white rounded-sm" />}
              </span>
            </button>
          ))}
        </FilterPopover>

        <FilterPopover
          label={dateFilter !== 'all' ? DATE_OPTIONS.find((o) => o.value === dateFilter)!.label : 'Date'}
          active={dateFilter !== 'all'}
          isOpen={openFilter === 'date'}
          onToggle={() => setOpenFilter(openFilter === 'date' ? null : 'date')}
          onClose={() => setOpenFilter(null)}
        >
          {DATE_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => { setDateFilter(o.value); setOpenFilter(null) }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-sm text-navy-700"
            >
              {o.label}
              <span className={cn(
                'w-4 h-4 rounded-full border flex items-center justify-center',
                dateFilter === o.value ? 'border-[#ff6633]' : 'border-slate-300'
              )}>
                {dateFilter === o.value && <span className="w-2 h-2 bg-[#ff6633] rounded-full" />}
              </span>
            </button>
          ))}
        </FilterPopover>

        {filtersActive && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-[#ff6633] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" /> Reset
          </button>
        )}
      </div>

      {/* Results */}
      {total === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <SlidersHorizontal className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-navy-700 font-semibold">No events match your filters</p>
          <button onClick={resetAll} className="text-sm text-[#ff6633] font-medium mt-2 cursor-pointer hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {upcoming.length > 0 && (
            <Section title="Upcoming" count={upcoming.length}>
              {upcoming.map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  relative={relativeDate(e.dateISO)}
                  isSaved={saved.has(e.id)}
                  isRegistered={registered.has(e.id)}
                  registering={registeringId === e.id}
                  onSave={toggleSaved}
                  onRegister={handleRegister}
                />
              ))}
            </Section>
          )}
          {past.length > 0 && (
            <Section title="Past recordings" count={past.length}>
              {past.map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  isSaved={saved.has(e.id)}
                  isRegistered={registered.has(e.id)}
                  registering={false}
                  onSave={toggleSaved}
                  onRegister={handleRegister}
                />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  )
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm">
      <span className="text-[#ff6633]">{icon}</span>
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-navy-800">{value}</span>
    </div>
  )
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-navy-800">{title}</h2>
        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
          {count}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </section>
  )
}
