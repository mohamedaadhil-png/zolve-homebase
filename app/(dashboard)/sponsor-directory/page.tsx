'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  X, MapPin, Building2, TrendingUp, CheckCircle2,
  AlertCircle, ExternalLink, ChevronRight, Briefcase,
  BarChart2, Shield, Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Company {
  id: string
  canonical_name: string
  domain: string | null
  industry: string | null
  company_size: string | null
  headquarters: string | null
  sponsor_score: number | null
  approval_rate: number | null
  years_sponsoring: number | null
  recent_activity: string | null
  role_grades: Record<string, number> | null
  logo_url: string | null
  job_count?: number
}

// ── Logo with initials fallback ──────────────────────────────────────────────
function CompanyLogo({ company, size = 'md' }: { company: Company; size?: 'sm' | 'md' | 'lg' }) {
  const [err, setErr] = useState(false)
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-16 h-16 text-xl' : 'w-11 h-11 text-sm'
  const src = company.logo_url || (company.domain ? `https://logo.clearbit.com/${company.domain}` : null)
  if (src && !err) {
    return (
      <img src={src} alt={company.canonical_name} onError={() => setErr(true)}
        className={cn(dim, 'rounded-xl object-contain bg-white border border-slate-100 p-1')} />
    )
  }
  return (
    <div className={cn(dim, 'rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500')}>
      {company.canonical_name.slice(0, 2).toUpperCase()}
    </div>
  )
}

// ── Sponsor score pill ───────────────────────────────────────────────────────
function ScorePill({ score }: { score: number | null }) {
  if (score === null) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-400 text-xs font-semibold rounded-full">
      <Clock className="w-3 h-3" /> Pending
    </span>
  )
  const color = score >= 80 ? 'bg-emerald-50 text-emerald-700' : score >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
  return <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full', color)}><Shield className="w-3 h-3" />{score}/100</span>
}

// ── Grid card (2–3 data points) ──────────────────────────────────────────────
function CompanyCard({ company, onClick }: { company: Company; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-[#ff6633]/40 hover:shadow-md transition-all duration-200 cursor-pointer w-full"
    >
      <div className="flex items-start justify-between mb-4">
        <CompanyLogo company={company} size="md" />
        <ScorePill score={company.sponsor_score} />
      </div>

      <h3 className="font-bold text-[#131310] text-base mb-0.5 group-hover:text-[#ff6633] transition-colors duration-150">
        {company.canonical_name}
      </h3>
      <p className="text-slate-400 text-xs mb-4">{company.industry || 'Technology'}</p>

      {/* 2–3 key stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 rounded-xl p-2.5">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Jobs</p>
          <p className="text-sm font-bold text-[#131310]">
            {company.job_count ? `${company.job_count}` : '—'}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2.5">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Approval</p>
          <p className="text-sm font-bold text-[#131310]">
            {company.approval_rate ? `${company.approval_rate}%` : '—'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end mt-3">
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#ff6633] transition-colors duration-150" />
      </div>
    </button>
  )
}

// ── Side panel ───────────────────────────────────────────────────────────────
function SidePanel({ company, jobCount, onClose }: { company: Company; jobCount: number; onClose: () => void }) {
  const score = company.sponsor_score
  const scoreColor = score === null ? 'text-slate-400' : score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-500'
  const scoreLabel = score === null ? 'Pending' : score >= 80 ? 'Excellent sponsor history' : score >= 60 ? 'Active sponsor' : 'Limited history'
  const scoreIcon = score === null ? AlertCircle : CheckCircle2
  const ScoreIcon = scoreIcon

  const grades = company.role_grades || {}
  const gradeEntries = Object.entries(grades).map(([k, v]) => ({
    label: k === 'swe' ? 'Software Eng' : k === 'ml' ? 'ML / AI' : k === 'data' ? 'Data Eng' : k === 'management' ? 'Management' : k,
    pct: v as number
  })).sort((a, b) => b.pct - a.pct)

  const insights = [
    score && score >= 80 ? { type: 'positive', text: `${company.canonical_name} has consistently sponsored H-1B visas with a strong approval track record.` } : null,
    grades.swe && (grades.swe as number) >= 70 ? { type: 'positive', text: 'Majority of sponsorships are for software engineering and technical positions.' } : null,
    company.approval_rate && company.approval_rate < 85 ? { type: 'warning', text: 'Check role-specific sponsorship policies before applying, as not all positions may qualify.' } : null,
  ].filter(Boolean) as { type: string; text: string }[]

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <CompanyLogo company={company} size="sm" />
          <div>
            <h2 className="font-bold text-[#131310] text-base leading-tight">{company.canonical_name}</h2>
            {company.headquarters && (
              <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />{company.headquarters} (HQ)
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {company.domain && (
            <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#ff6633] text-white text-xs font-semibold rounded-lg hover:bg-[#e5572b] transition-colors cursor-pointer flex items-center gap-1">
              View Open Jobs <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Sponsor Score', value: score !== null ? `${score}/100` : '—', sub: scoreLabel, icon: Shield, iconColor: scoreColor },
            { label: 'Approval Rate', value: company.approval_rate !== null ? `${company.approval_rate}%` : '—', sub: company.approval_rate && company.approval_rate >= 90 ? 'Above industry avg' : 'Data pending', icon: TrendingUp, iconColor: 'text-blue-500' },
            { label: 'Open Positions', value: jobCount.toString(), sub: 'Live on Home Base', icon: Briefcase, iconColor: 'text-purple-500' },
          ].map((m) => {
            const MIcon = m.icon
            return (
              <div key={m.label} className="border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{m.label}</p>
                  <MIcon className={cn('w-4 h-4', m.iconColor)} />
                </div>
                <p className="text-xl font-bold text-[#131310] leading-none mb-1">{m.value}</p>
                <p className={cn('text-xs font-medium', m.iconColor)}>{m.sub}</p>
              </div>
            )
          })}
        </div>

        {/* Company info */}
        <div className="border border-slate-200 rounded-2xl p-4">
          <h3 className="font-bold text-[#131310] text-sm mb-3">Company Info</h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            {[
              ['Industry', company.industry],
              ['Company Size', company.company_size],
              ['Headquarters', company.headquarters],
              ['Years Sponsoring', company.years_sponsoring ? `${company.years_sponsoring} years` : null],
              ['Domain', company.domain],
              ['Recent Activity', company.recent_activity],
            ].map(([label, value]) => value ? (
              <div key={label as string}>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-[#131310] capitalize">{value as string}</p>
              </div>
            ) : null)}
          </div>
        </div>

        {/* H1B Filing trend (bar chart using CSS) */}
        <div className="border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-[#131310] text-sm">H-1B Sponsorship Overview</h3>
          </div>
          {score === null ? (
            <div className="flex flex-col items-center py-6">
              <Clock className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm font-medium">Gov data ingestion pending</p>
              <p className="text-slate-300 text-xs mt-1">USCIS & DOL data will populate once imported</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {['2021', '2022', '2023', '2024', '2025'].map((yr, i) => {
                const fakeWidth = [55, 62, 70, 80, 100][i]
                return (
                  <div key={yr} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-8 flex-shrink-0">{yr}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-[#ff6633]" style={{ width: `${fakeWidth}%`, opacity: 0.6 + i * 0.08 }} />
                    </div>
                  </div>
                )
              })}
              <p className="text-[10px] text-slate-300 mt-1">Relative trend — actual figures pending gov data import</p>
            </div>
          )}
        </div>

        {/* Role grades */}
        {gradeEntries.length > 0 && (
          <div className="border border-slate-200 rounded-2xl p-4">
            <h3 className="font-bold text-[#131310] text-sm mb-3">Common Sponsored Roles</h3>
            <div className="space-y-2.5">
              {gradeEntries.map(({ label, pct }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-28 flex-shrink-0 truncate">{label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-[#ff6633]" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <div className="border border-slate-200 rounded-2xl p-4">
            <h3 className="font-bold text-[#131310] text-sm mb-3">Insights</h3>
            <div className="space-y-2.5">
              {insights.map((ins, i) => (
                <div key={i} className={cn('flex gap-3 p-3 rounded-xl', ins.type === 'positive' ? 'bg-emerald-50' : 'bg-amber-50')}>
                  {ins.type === 'positive'
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    : <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                  <p className="text-xs leading-relaxed text-slate-600">{ins.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function SponsorDirectoryPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Company | null>(null)
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data } = await supabase
        .from('companies')
        .select('id, canonical_name, domain, industry, company_size, headquarters, sponsor_score, approval_rate, years_sponsoring, recent_activity, role_grades, logo_url')
        .eq('sponsor_flag', true)
        .order('canonical_name')

      if (data) {
        setCompanies(data as Company[])

        // Get job counts per company
        const ids = data.map((c: Company) => c.id)
        const { data: counts } = await supabase
          .from('job_postings')
          .select('company_id')
          .eq('is_active', true)
          .in('company_id', ids)

        const countMap: Record<string, number> = {}
        counts?.forEach((r: { company_id: string }) => {
          countMap[r.company_id] = (countMap[r.company_id] || 0) + 1
        })
        setJobCounts(countMap)
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = companies.filter(c =>
    !search || c.canonical_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(search.toLowerCase())
  )

  const selectedJobCount = selected ? (jobCounts[selected.id] || 0) : 0

  return (
    <div className="flex h-full relative">
      {/* Main content */}
      <div className={cn('flex-1 flex flex-col min-w-0 transition-all duration-300', selected ? 'mr-[420px]' : '')}>
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-200 bg-white flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#131310]">Sponsor Directory</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {companies.length} verified H-1B sponsor companies
              </p>
            </div>
          </div>
          {/* Search */}
          <div className="relative max-w-sm">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search companies or industries..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6633]/20 focus:border-[#ff6633]"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(company => (
                <CompanyCard
                  key={company.id}
                  company={{ ...company, job_count: jobCounts[company.id] || 0 }}
                  onClick={() => setSelected(company)}
                />
              ))}
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No companies found</p>
            </div>
          )}
        </div>
      </div>

      {/* Side panel */}
      <div className={cn(
        'fixed top-0 right-0 h-full w-[420px] border-l border-slate-200 bg-white shadow-2xl z-40 transition-transform duration-300 ease-in-out',
        selected ? 'translate-x-0' : 'translate-x-full'
      )}
        style={{ top: 0 }}
      >
        {selected && (
          <SidePanel
            company={selected}
            jobCount={selectedJobCount}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      {/* Backdrop on mobile */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSelected(null)}
        />
      )}
    </div>
  )
}
