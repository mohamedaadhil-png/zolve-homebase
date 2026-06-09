import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  MapPin, Clock, DollarSign, Briefcase, Wifi, Shield,
  CheckCircle, ArrowUpRight, Star, ChevronRight,
} from 'lucide-react'
import { formatSalary, timeAgo, decodeHtmlEntities } from '@/lib/utils'

export const revalidate = 3600

interface PageProps {
  params: { jobId: string }
}

// jobId may be a bare UUID or `{uuid}-{slug}`. UUIDs contain hyphens, so
// extract the full UUID by pattern rather than splitting on '-'.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
function extractJobId(param: string): string {
  const m = param.match(UUID_RE)
  return m ? m[0] : param
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  const jobId = extractJobId(params.jobId)

  const { data: job } = await supabase
    .from('job_postings')
    .select('title, companies(canonical_name)')
    .eq('id', jobId)
    .single()

  if (!job) return {}

  const company = job.companies as { canonical_name: string } | null
  const companyName = company?.canonical_name ?? 'a top employer'
  return {
    title: `${job.title} at ${companyName} — H-1B Sponsored`,
    description: `Apply for ${job.title} at ${companyName}. This role offers H-1B visa sponsorship with verified sponsorship history on Zolve Home Base.`,
    openGraph: {
      title: `${job.title} at ${companyName}`,
      description: `H-1B sponsored position with verified sponsorship history. Apply on Zolve Home Base.`,
      siteName: 'Zolve Home Base',
      type: 'website',
    },
  }
}

export default async function PublicJobDetailPage({ params }: PageProps) {
  const supabase = await createClient()
  const jobId = extractJobId(params.jobId)

  const [{ data: job }, { data: { user } }] = await Promise.all([
    supabase.from('job_postings').select('*, companies(*)').eq('id', jobId).single(),
    supabase.auth.getUser(),
  ])

  if (!job) notFound()

  const company = (job.companies ?? {}) as Record<string, unknown>
  const isLoggedIn = !!user

  const similar = await supabase
    .rpc('get_similar_jobs', { p_job_id: jobId, p_limit: 3 })
    .then((r) => r.data ?? [])
    .catch(() => [])

  const locations = (job.locations as Array<Record<string, unknown>>) ?? []
  const loc = locations[0]
  const locationStr = loc
    ? loc.is_remote
      ? 'Remote'
      : [loc.city, loc.state].filter(Boolean).join(', ') || 'United States'
    : 'United States'

  const score = company.sponsor_score as number | null
  const years = company.years_sponsoring as number | null

  const highlights = [
    company.sponsor_flag && 'OPT Friendly',
    job.is_active && 'Active Hiring Employer',
    job.posted_at && new Date(job.posted_at as string) > new Date(Date.now() - 7 * 86400000) && 'Recently Posted',
    typeof score === 'number' && score >= 70 && 'Strong Sponsorship History',
    (job.role_category === 'software_engineering' || job.role_category === 'data_ai') && 'High Demand Role',
  ].filter(Boolean) as string[]

  return (
    <>
      {/* JSON-LD for SEO */}
      {job.jsonld && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(job.jsonld) }}
        />
      )}

      {/* Public nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 bg-[#ff6633] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">Z</span>
            </div>
            <span className="font-bold text-[#0F172A] tracking-tight">
              ZOLVE <span className="text-[#ff6633]">Home Base</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-[#0F172A] cursor-pointer">Sign in</Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-[#ff6633] text-white text-sm font-semibold rounded-xl hover:bg-[#e5572b] transition-colors cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-4">
          <div className="flex items-start gap-4 mb-4">
            {company.logo_url ? (
              <img
                src={company.logo_url as string}
                alt={company.canonical_name as string}
                className="w-14 h-14 rounded-xl object-contain border border-slate-100 bg-white p-1"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400">
                {(company.canonical_name as string)?.[0] ?? 'C'}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-slate-500">{company.canonical_name as string}</p>
              <h1 className="text-2xl font-bold text-[#0F172A]">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {locationStr}
                </span>
                {job.posted_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {timeAgo(job.posted_at as string)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Verified banner */}
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 mb-4">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              H-1B Sponsorship History Verified
              {years ? ` — sponsored consistently for ${years} years` : ''}
            </span>
            {typeof score === 'number' && (
              <span className="ml-auto px-2.5 py-1 bg-[#ff6633] text-white text-xs font-bold rounded-lg">
                Score {score}/100
              </span>
            )}
          </div>

          {/* Why this stands out */}
          {highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {highlights.map((h) => (
                <span
                  key={h}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <Star className="w-3 h-3 fill-emerald-500" /> {h}
                </span>
              ))}
            </div>
          )}

          {/* Quick facts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: DollarSign, label: 'Salary', value: formatSalary(job.salary_min as number, job.salary_max as number) },
              { icon: Briefcase, label: 'Type', value: (job.employment_type as string) ?? 'Full-time' },
              { icon: Star, label: 'Seniority', value: (job.seniority as string) ?? 'Mid-level' },
              { icon: Wifi, label: 'Remote', value: (job.remote as string) ?? 'Onsite' },
            ].map((fact) => (
              <div key={fact.label} className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <fact.icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-400">{fact.label}</span>
                </div>
                <p className="text-sm font-semibold text-[#0F172A] capitalize">{fact.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Job description */}
        {job.description_html ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-4">
            <h2 className="text-lg font-bold text-[#0F172A] mb-4">Job Description</h2>
            <div
              className="prose prose-slate prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_h2]:font-bold [&_h2]:text-base [&_h2]:mt-4 [&_h2]:mb-2 [&_p]:mb-3"
              dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(job.description_html as string) }}
            />
          </div>
        ) : null}

        {/* About employer */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-4">
          <h2 className="text-lg font-bold text-[#0F172A] mb-4">About This Employer</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ['Industry', company.industry],
              ['Company Size', company.company_size],
              ['Headquarters', company.headquarters],
              ['Approval Rate', company.approval_rate ? `${company.approval_rate}%` : null],
              ['Years Sponsoring', years ? `${years} years` : null],
              ['Sponsor Score', typeof score === 'number' ? `${score}/100` : null],
            ].map(([label, value]) =>
              value ? (
                <div key={label as string}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-[#0F172A]">{value as string}</p>
                </div>
              ) : null
            )}
          </div>
          {company.id ? (
            <Link href={`/companies/${company.id}`} className="inline-flex items-center gap-1 mt-4 text-[#ff6633] hover:underline text-sm font-semibold cursor-pointer">
              View Full Sponsor Report <ChevronRight className="w-4 h-4" />
            </Link>
          ) : null}
        </div>

        {/* Similar opportunities */}
        {similar.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-4">
            <h2 className="text-lg font-bold text-[#0F172A] mb-4">Similar Opportunities</h2>
            <div className="space-y-3">
              {similar.map((sj: Record<string, unknown>) => (
                <Link
                  key={sj.id as string}
                  href={`/jobs/${sj.id}`}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-[#0F172A] text-sm">{sj.title as string}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {sj.company_name as string} · {formatSalary(sj.salary_min as number, sj.salary_max as number)}
                    </p>
                  </div>
                  {typeof sj.sponsor_score === 'number' && (
                    <span className="px-2 py-1 bg-[#fff1ec] text-[#ff6633] text-xs font-bold rounded-lg">
                      {sj.sponsor_score as number}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Ready to Apply?</h2>
          <p className="text-sm text-slate-500 mb-5">
            {isLoggedIn
              ? "Apply directly through the employer's website."
              : 'Create a free account to apply and track your application.'}
          </p>
          {isLoggedIn ? (
            <a
              href={job.source_url as string}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff6633] text-white font-semibold rounded-xl hover:bg-[#e5572b] transition-colors cursor-pointer"
            >
              Apply Now <ArrowUpRight className="w-4 h-4" />
            </a>
          ) : (
            <div className="space-y-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#ff6633] text-white font-semibold rounded-xl hover:bg-[#e5572b] transition-colors cursor-pointer"
              >
                Sign Up to Apply <ArrowUpRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-slate-400">Free account — no credit card required</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
