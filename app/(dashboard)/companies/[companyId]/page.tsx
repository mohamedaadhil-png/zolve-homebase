import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ExternalLink, TrendingUp, Shield, Calendar, Briefcase } from 'lucide-react'
import Link from 'next/link'
import JobCard from '@/components/jobs/JobCard'

export const revalidate = 3600

interface PageProps {
  params: { companyId: string }
}

export default async function CompanyPage({ params }: PageProps) {
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', params.companyId)
    .single()

  if (!company) notFound()

  // USCIS records
  const { data: uscisRecords } = await supabase
    .from('uscis_records')
    .select('*')
    .eq('company_id', params.companyId)
    .order('fiscal_year', { ascending: false })

  // DOL LCA records
  const { data: lcaRecords } = await supabase
    .from('lca_records')
    .select('*')
    .eq('company_id', params.companyId)
    .order('fiscal_year', { ascending: false })
    .limit(5)

  // Active jobs
  const { data: activeJobs } = await supabase
    .from('job_postings')
    .select('*, companies(*)')
    .eq('company_id', params.companyId)
    .eq('is_active', true)
    .limit(10)

  // Comparable companies
  const { data: comparableCompanies } = await supabase
    .from('companies')
    .select('id, name, sponsor_score, logo_url')
    .neq('id', params.companyId)
    .gte('sponsor_score', (company.sponsor_score ?? 50) - 15)
    .lte('sponsor_score', (company.sponsor_score ?? 50) + 15)
    .limit(5)

  // Group USCIS by fiscal year
  const byFY = (uscisRecords ?? []).reduce(
    (acc: Record<string, { approvals: number; denials: number }>, r) => {
      const fy = r.fiscal_year ?? 'Unknown'
      if (!acc[fy]) acc[fy] = { approvals: 0, denials: 0 }
      acc[fy].approvals += r.initial_approval ?? 0
      acc[fy].denials += r.initial_denial ?? 0
      return acc
    },
    {}
  )

  const score = company.sponsor_score ?? 0
  const circumference = 2 * Math.PI * 40
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-start gap-5">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="w-16 h-16 rounded-xl object-contain border border-slate-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400">
              {company.name?.[0] ?? 'C'}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#0F172A]">{company.name}</h1>
            {company.domain && (
              <a
                href={`https://${company.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[#ff6633] hover:underline mt-1"
              >
                {company.domain} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {company.description && (
              <p className="text-sm text-slate-500 mt-2 max-w-xl">{company.description}</p>
            )}
          </div>

          {/* Sponsor Score ring */}
          <div className="flex flex-col items-center">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="#ff6633"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 48 48)"
              />
              <text x="48" y="48" textAnchor="middle" dy="0.35em" className="text-2xl font-bold fill-[#0F172A]" fontSize="20" fontWeight="700">
                {score}
              </text>
            </svg>
            <span className="text-xs text-slate-400 mt-1">Sponsor Score</span>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { icon: Shield, label: 'Approval Rate', value: company.approval_rate ? `${company.approval_rate}%` : 'N/A' },
            { icon: Calendar, label: 'Years Sponsoring', value: company.years_sponsoring ?? 'N/A' },
            { icon: TrendingUp, label: 'Recent Cases (FY)', value: company.recent_sponsorship_count ?? 'N/A' },
          ].map(m => (
            <div key={m.label} className="bg-slate-50 rounded-xl p-4 text-center">
              <m.icon className="w-5 h-5 text-[#ff6633] mx-auto mb-1.5" />
              <p className="text-xl font-bold text-[#0F172A]">{String(m.value)}</p>
              <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sponsorship Trend */}
      {Object.keys(byFY).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-[#0F172A] mb-4">H-1B Sponsorship Trend</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="pb-2 font-medium">Fiscal Year</th>
                  <th className="pb-2 font-medium text-green-600">Approvals</th>
                  <th className="pb-2 font-medium text-red-500">Denials</th>
                  <th className="pb-2 font-medium">Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byFY).map(([fy, data]) => {
                  const total = data.approvals + data.denials
                  const rate = total > 0 ? Math.round((data.approvals / total) * 100) : 0
                  return (
                    <tr key={fy} className="border-b border-slate-50">
                      <td className="py-2.5 font-medium text-[#0F172A]">FY {fy}</td>
                      <td className="py-2.5 text-green-600 font-semibold">{data.approvals.toLocaleString()}</td>
                      <td className="py-2.5 text-red-500">{data.denials.toLocaleString()}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rate >= 80 ? 'bg-green-50 text-green-700' : rate >= 60 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'}`}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOL LCA records */}
      {lcaRecords && lcaRecords.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-[#0F172A] mb-4">DOL LCA Records</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="pb-2 font-medium">Job Title</th>
                  <th className="pb-2 font-medium">SOC Code</th>
                  <th className="pb-2 font-medium">Wage</th>
                  <th className="pb-2 font-medium">FY</th>
                </tr>
              </thead>
              <tbody>
                {lcaRecords.map((r, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-2.5 font-medium text-[#0F172A]">{r.job_title ?? 'N/A'}</td>
                    <td className="py-2.5 text-slate-500">{r.soc_code ?? 'N/A'}</td>
                    <td className="py-2.5">{r.wage_rate_of_pay_from ? `$${Number(r.wage_rate_of_pay_from).toLocaleString()}` : 'N/A'}</td>
                    <td className="py-2.5 text-slate-500">{r.fiscal_year ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Open Roles */}
      {activeJobs && activeJobs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0F172A]">Open Roles at {company.name}</h2>
            <span className="text-sm text-slate-400">{activeJobs.length} positions</span>
          </div>
          <div className="space-y-3">
            {activeJobs.map((job: Record<string, unknown>) => {
              const jobCompany = job.companies as Record<string, unknown> | undefined
              return (
                <Link key={job.id as string} href={`/jobs/${job.id}`}>
                  <JobCard
                    id={job.id as string}
                    title={job.title as string}
                    company={{
                      name: (jobCompany?.canonical_name ?? jobCompany?.name ?? company.name) as string,
                      logo: jobCompany?.logo_url as string | undefined,
                    }}
                    location={(job.location ?? 'Remote') as string}
                    salary_min={job.salary_min as number | null}
                    salary_max={job.salary_max as number | null}
                    tags={job.tags as string[] | undefined}
                    posted_at={(job.posted_at ?? new Date().toISOString()) as string}
                    sponsor_score={job.sponsor_score as number | null}
                  />
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Comparable companies */}
      {comparableCompanies && comparableCompanies.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-[#0F172A] mb-4">Comparable Sponsors</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {comparableCompanies.map(c => (
              <Link
                key={c.id}
                href={`/companies/${c.id}`}
                className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:border-[#ff6633]/30 hover:bg-orange-50/30 transition-all"
              >
                {c.logo_url ? (
                  <img src={c.logo_url} alt={c.name} className="w-8 h-8 rounded-lg object-contain" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-400">
                    {c.name?.[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[#0F172A] truncate">{c.name}</p>
                  <p className="text-xs text-slate-400">Score: {c.sponsor_score}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
