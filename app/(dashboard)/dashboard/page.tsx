import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, BookOpen, Users, Calendar, ArrowRight, AlertCircle } from 'lucide-react'
import JobCard from '@/components/jobs/JobCard'

function calculateCompletion(user: Record<string, unknown>): number {
  const fields = ['name', 'email', 'mobile', 'visa_status', 'preferred_role', 'resume_url', 'avatar_url']
  const filled = fields.filter(f => !!user[f]).length
  return Math.round((filled / fields.length) * 100)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const completion = userData ? calculateCompletion(userData as Record<string, unknown>) : 0

  // Recommended jobs — all MVP jobs are SWE; surface the freshest, sponsor-ranked first.
  // Try to match the user's preferred track, but fall back to all SWE roles.
  const trackMap: Record<string, string> = {
    'Backend Engineer': 'backend',
    'Frontend Engineer': 'frontend',
    'Full-Stack Engineer': 'fullstack',
    'ML Engineer': 'ml',
  }
  const preferredTrack = trackMap[userData?.preferred_role ?? '']

  let recQuery = supabase
    .from('job_postings')
    .select('*, companies(*)')
    .eq('is_active', true)
    .eq('role_category', 'SWE')
  if (preferredTrack) recQuery = recQuery.eq('track', preferredTrack)

  let { data: recommendedJobs } = await recQuery
    .order('posted_at', { ascending: false })
    .limit(6)

  // Fallback: if no track matches, show any recent SWE roles
  if (!recommendedJobs || recommendedJobs.length === 0) {
    const { data: fallback } = await supabase
      .from('job_postings')
      .select('*, companies(*)')
      .eq('is_active', true)
      .eq('role_category', 'SWE')
      .order('posted_at', { ascending: false })
      .limit(6)
    recommendedJobs = fallback
  }

  const firstName = userData?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Here's what's happening with your job search today.
        </p>
      </div>

      {/* Profile completion card */}
      {completion < 80 && (
        <div className="bg-white border border-orange-100 rounded-2xl p-5 mb-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-[#ff6633]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#0F172A] mb-1">Complete your profile</h3>
            <p className="text-sm text-slate-500 mb-3">
              Your profile is {completion}% complete. A complete profile helps you get noticed by employers.
            </p>
            <div className="w-full h-2 bg-slate-100 rounded-full mb-3">
              <div
                className="h-full bg-[#ff6633] rounded-full transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff6633] hover:underline"
            >
              Complete profile <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Coming soon cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: BookOpen,
            title: 'Upskill',
            desc: 'Mock interviews, resume reviews, and career coaching',
            href: '/upskill',
            color: 'bg-blue-50 text-blue-600',
          },
          {
            icon: Users,
            title: 'Networking',
            desc: 'Connect with H-1B professionals in your field',
            href: '/networking',
            color: 'bg-purple-50 text-purple-600',
          },
          {
            icon: Calendar,
            title: 'Events',
            desc: 'Visa workshops, career fairs, and webinars',
            href: '/events',
            color: 'bg-green-50 text-green-600',
          },
        ].map(item => (
          <Link
            key={item.title}
            href={item.href}
            className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-sm transition-shadow group"
          >
            <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3`}>
              <item.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[#0F172A] mb-1">
              {item.title}{' '}
              <span className="text-xs font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
            </h3>
            <p className="text-sm text-slate-500">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recommended Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#0F172A]">Recommended for You</h2>
          <Link
            href="/jobs"
            className="text-sm font-medium text-[#ff6633] hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendedJobs && recommendedJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {recommendedJobs.map((job: Record<string, unknown>) => {
              const company = job.companies as Record<string, unknown> | undefined
              const locs = (job.locations as Array<Record<string, unknown>> | undefined) ?? []
              const loc = locs[0]
              const locationStr = loc
                ? loc.is_remote
                  ? 'Remote'
                  : [loc.city, loc.state].filter(Boolean).join(', ') || 'United States'
                : 'United States'
              return (
                <Link key={job.id as string} href={`/jobs/${job.id}`}>
                  <JobCard
                    id={job.id as string}
                    title={job.title as string}
                    company={{
                      name: (company?.canonical_name ?? company?.name ?? 'Unknown') as string,
                      logo: company?.logo_url as string | undefined,
                    }}
                    location={locationStr}
                    salary_min={job.salary_min as number | null}
                    salary_max={job.salary_max as number | null}
                    tags={job.tags as string[] | undefined}
                    posted_at={(job.posted_at ?? new Date().toISOString()) as string}
                    seniority={job.seniority as string | undefined}
                    sponsor_score={company?.sponsor_score as number | null}
                  />
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No recommendations yet. Complete your profile to get personalized job matches.</p>
          </div>
        )}
      </div>
    </div>
  )
}
