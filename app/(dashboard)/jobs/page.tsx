'use client'

import { useEffect, useRef, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import JobCard from '@/components/jobs/JobCard'
import FilterBar, { type JobFilters } from '@/components/jobs/FilterBar'

interface Job {
  id: string
  title: string
  slug?: string
  location?: string
  salary_min?: number | null
  salary_max?: number | null
  tags?: string[]
  posted_at?: string
  seniority?: string
  remote?: string
  employment_type?: string
  sponsor_score?: number | null
  years_sponsoring?: number | null
  companies?: { canonical_name?: string; name?: string; logo_url?: string; sponsor_score?: number }
}

function JobsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [stateOptions, setStateOptions] = useState<{ state: string; count: number }[]>([])
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const LIMIT = 20

  const q = searchParams.get('q') ?? ''
  const visa_types = searchParams.get('visa_types') ?? ''
  const job_types = searchParams.get('job_types') ?? ''
  const seniority = searchParams.get('seniority') ?? ''
  const remote = searchParams.get('remote') ?? ''
  const roles = searchParams.get('roles') ?? ''
  const statesParam = searchParams.get('states') ?? ''

  // Load Location dropdown options once.
  useEffect(() => {
    fetch('/api/jobs/facets')
      .then((r) => r.json())
      .then((d) => setStateOptions(d.states ?? []))
      .catch(() => {})
  }, [])

  const buildQuery = useCallback(
    (off: number) => {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (visa_types) params.set('visa_types', visa_types)
      if (job_types) params.set('job_types', job_types)
      if (seniority) params.set('seniority', seniority)
      if (remote) params.set('remote', remote)
      if (roles) params.set('roles', roles)
      if (statesParam) params.set('states', statesParam)
      params.set('limit', String(LIMIT))
      params.set('offset', String(off))
      return `/api/jobs?${params.toString()}`
    },
    [q, visa_types, job_types, seniority, remote, roles, statesParam]
  )

  // Initial load / filter change
  useEffect(() => {
    setJobs([])
    setOffset(0)
    setHasMore(true)
    setLoading(true)

    fetch(buildQuery(0))
      .then(r => r.json())
      .then(data => {
        setJobs(data.jobs ?? [])
        setTotal(data.total ?? 0)
        setHasMore((data.jobs ?? []).length === LIMIT)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [buildQuery])

  // Infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!hasMore || loading) return

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loadingMore) {
          const nextOffset = offset + LIMIT
          setLoadingMore(true)
          fetch(buildQuery(nextOffset))
            .then(r => r.json())
            .then(data => {
              const newJobs = data.jobs ?? []
              setJobs(prev => [...prev, ...newJobs])
              setOffset(nextOffset)
              setHasMore(newJobs.length === LIMIT)
              setLoadingMore(false)
            })
            .catch(() => setLoadingMore(false))
        }
      },
      { threshold: 0.1 }
    )

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current)
    }

    return () => observerRef.current?.disconnect()
  }, [buildQuery, hasMore, loading, loadingMore, offset])

  const filters: JobFilters = {
    role: roles ? roles.split(',') : [],
    state: statesParam ? statesParam.split(',') : [],
    visaType: visa_types ? visa_types.split(',') : [],
    jobType: job_types ? job_types.split(',') : [],
    experience: seniority ? seniority.split(',') : [],
    remote: remote || 'Any',
  }

  const handleFilterChange = (newFilters: JobFilters) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newFilters.role.length) params.set('roles', newFilters.role.join(','))
    else params.delete('roles')
    if (newFilters.state.length) params.set('states', newFilters.state.join(','))
    else params.delete('states')
    if (newFilters.visaType.length) params.set('visa_types', newFilters.visaType.join(','))
    else params.delete('visa_types')
    if (newFilters.jobType.length) params.set('job_types', newFilters.jobType.join(','))
    else params.delete('job_types')
    if (newFilters.experience.length) params.set('seniority', newFilters.experience.join(','))
    else params.delete('seniority')
    if (newFilters.remote && newFilters.remote !== 'Any') params.set('remote', newFilters.remote)
    else params.delete('remote')
    router.push(`/jobs?${params.toString()}`)
  }

  const updateQ = (val: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (val) params.set('q', val)
    else params.delete('q')
    router.push(`/jobs?${params.toString()}`)
  }

  const handleJobClick = (job: Job) => {
    router.push(`/jobs/${job.id}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Live Jobs</h1>
        <p className="text-slate-500 mt-1">H-1B sponsored positions from verified employers</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          defaultValue={q}
          placeholder="Search jobs, companies, skills..."
          onKeyDown={e => {
            if (e.key === 'Enter') {
              updateQ((e.target as HTMLInputElement).value)
            }
          }}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6633]/20 focus:border-[#ff6633]"
        />
        {q && (
          <button onClick={() => updateQ('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Filter bar (dropdowns) */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        stateOptions={stateOptions}
        className="mb-6"
      />

      <div>
        {/* Jobs list */}
        <div className="min-w-0">
          {/* Result count */}
          <div className="mb-4">
            {loading ? (
              <div className="h-5 w-40 bg-slate-100 rounded animate-pulse" />
            ) : (
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-[#0F172A]">{total.toLocaleString()}</span> sponsored jobs found
              </p>
            )}
          </div>

          {/* Job cards */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500">No jobs found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={{
                    name: job.companies?.canonical_name ?? job.companies?.name ?? 'Unknown',
                    logo: job.companies?.logo_url,
                  }}
                  location={job.location ?? 'Remote'}
                  salary_min={job.salary_min}
                  salary_max={job.salary_max}
                  tags={job.tags}
                  posted_at={job.posted_at ?? new Date().toISOString()}
                  seniority={job.seniority}
                  remote={job.remote}
                  employment_type={job.employment_type}
                  sponsor_score={job.companies?.sponsor_score ?? job.sponsor_score}
                  years_sponsoring={job.years_sponsoring}
                  onClick={() => handleJobClick(job)}
                />
              ))}
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />

          {loadingMore && (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 text-[#ff6633] animate-spin" />
            </div>
          )}

          {!hasMore && jobs.length > 0 && (
            <p className="text-center text-sm text-slate-400 py-6">
              You've seen all {total.toLocaleString()} jobs
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-[#ff6633] animate-spin" /></div>}>
      <JobsContent />
    </Suspense>
  )
}
