'use client'

/**
 * Preview-only page — shows the logged-in UI shell with mock data.
 * Remove before production.
 */

import { useState } from 'react'
import { Home, Briefcase, GraduationCap, Users, Calendar, BookOpen, LogOut, Search, Bell, ChevronRight, MapPin, Clock, Bookmark, Star, Shield, TrendingUp, ArrowUpRight, CheckCircle, Circle } from 'lucide-react'

const MOCK_JOBS = [
  { id: '1', title: 'Senior Software Engineer', company: 'Databricks', logo: 'https://logo.clearbit.com/databricks.com', location: 'San Francisco, CA', salary: '$180K – $240K', tags: ['H-1B Sponsor', 'Full-time', 'Hybrid'], score: 92, posted: '2 days ago', seniority: 'Senior', years: 8 },
  { id: '2', title: 'Backend Engineer', company: 'Stripe', logo: 'https://logo.clearbit.com/stripe.com', location: 'Remote', salary: '$160K – $220K', tags: ['H-1B Sponsor', 'Full-time', 'Remote'], score: 88, posted: '3 days ago', seniority: 'Mid', years: 10 },
  { id: '3', title: 'ML Engineer', company: 'Anthropic', logo: 'https://logo.clearbit.com/anthropic.com', location: 'San Francisco, CA', salary: '$200K – $280K', tags: ['H-1B Sponsor', 'Full-time', 'Onsite'], score: 95, posted: '1 day ago', seniority: 'Senior', years: 3 },
  { id: '4', title: 'Frontend Engineer', company: 'Figma', logo: 'https://logo.clearbit.com/figma.com', location: 'New York, NY', salary: '$150K – $200K', tags: ['H-1B Sponsor', 'Full-time', 'Hybrid'], score: 84, posted: '5 days ago', seniority: 'Mid', years: 6 },
  { id: '5', title: 'Infrastructure Engineer', company: 'Airbnb', logo: 'https://logo.clearbit.com/airbnb.com', location: 'San Francisco, CA', salary: '$170K – $230K', tags: ['H-1B Sponsor', 'Full-time', 'Hybrid'], score: 87, posted: '4 days ago', seniority: 'Senior', years: 9 },
  { id: '6', title: 'Software Engineer, New Grad', company: 'Roblox', logo: 'https://logo.clearbit.com/roblox.com', location: 'San Mateo, CA', salary: '$130K – $160K', tags: ['H-1B Sponsor', 'Full-time', 'Onsite'], score: 81, posted: '1 week ago', seniority: 'New Grad', years: 7 },
]

const NAV_ITEMS = [
  { icon: Home, label: 'Home', href: '#home' },
  { icon: Briefcase, label: 'Sponsored Jobs', href: '#jobs' },
  { icon: GraduationCap, label: 'Upskill', href: '#', soon: true },
  { icon: Users, label: 'Networking', href: '#', soon: true },
  { icon: Calendar, label: 'Events', href: '#', soon: true },
  { icon: BookOpen, label: 'Resource Library', href: '#', soon: true },
]

function CompanyLogo({ name, url }: { name: string; url: string }) {
  const [err, setErr] = useState(false)
  if (!err) return <img src={url} alt={name} className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-100 p-1" onError={() => setErr(true)} />
  return <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">{name.slice(0,2)}</div>
}

function ScoreChip({ score }: { score: number }) {
  const color = score >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : score >= 70 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${color}`}><Shield className="w-3 h-3" />{score}</span>
}

function JobCard({ job, onClick, selected }: { job: typeof MOCK_JOBS[0]; onClick: () => void; selected: boolean }) {
  return (
    <button onClick={onClick} className={`w-full text-left p-5 rounded-2xl border transition-all duration-150 cursor-pointer group ${selected ? 'border-[#ff6633] bg-[#fff8f5]' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}`}>
      <div className="flex items-start gap-3">
        <CompanyLogo name={job.company} url={job.logo} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-[#0F172A] text-sm leading-snug">{job.title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{job.company}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <ScoreChip score={job.score} />
              <button className="p-1 text-slate-300 hover:text-[#ff6633] transition-colors cursor-pointer"><Bookmark className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-slate-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
            <span className="text-slate-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{job.posted}</span>
          </div>
          <div className="flex gap-1.5 mt-2.5 flex-wrap">
            {job.tags.map(t => (
              <span key={t} className={`px-2 py-0.5 rounded-full text-xs font-medium ${t === 'H-1B Sponsor' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>{t === 'H-1B Sponsor' ? '✓ ' + t : t}</span>
            ))}
          </div>
          <p className="text-[#0F172A] font-semibold text-sm mt-2">{job.salary}</p>
        </div>
      </div>
    </button>
  )
}

function JobDetail({ job }: { job: typeof MOCK_JOBS[0] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <CompanyLogo name={job.company} url={job.logo} />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#0F172A]">{job.title}</h2>
            <p className="text-slate-500 font-medium">{job.company}</p>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.posted}</span>
            </div>
          </div>
          <ScoreChip score={job.score} />
        </div>

        {/* Verified banner */}
        <div className="mt-4 flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-emerald-800 font-semibold text-sm">H-1B Sponsorship History Verified</p>
            <p className="text-emerald-600 text-xs">Sponsored consistently in the last {job.years} years</p>
          </div>
          <span className="ml-auto px-3 py-1.5 bg-[#ff6633] text-white text-xs font-bold rounded-lg">Score {job.score}/100</span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Highlights */}
        <div>
          <p className="text-sm font-semibold text-[#0F172A] mb-2">Why this stands out</p>
          <div className="flex flex-wrap gap-2">
            {['OPT Friendly', 'Active Hiring', 'Recently Posted', 'Strong Sponsorship', 'High Demand Role'].map(h => (
              <span key={h} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                <Star className="w-3 h-3 fill-emerald-500" />{h}
              </span>
            ))}
          </div>
        </div>

        {/* Quick facts */}
        <div className="grid grid-cols-2 gap-3">
          {[['Salary', job.salary], ['Job Type', 'Full-time'], ['Level', job.seniority], ['Remote', job.location === 'Remote' ? 'Remote' : 'Hybrid']].map(([k, v]) => (
            <div key={k} className="p-3 bg-slate-50 rounded-xl">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">{k}</p>
              <p className="text-[#0F172A] font-semibold text-sm mt-0.5">{v}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#ff6633] hover:bg-[#e5572b] text-white font-bold rounded-xl transition-colors cursor-pointer text-sm">
            Apply Now <ArrowUpRight className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-sm">
            Sponsor Data
          </button>
        </div>

        {/* Right rail */}
        <div className="p-4 bg-slate-50 rounded-xl">
          <p className="text-sm font-semibold text-[#0F172A] mb-3">Visa Sponsorship Snapshot</p>
          <div className="space-y-2">
            {[['Sponsor Score', `${job.score}/100`], ['Approval Rate', '94%'], ['Years Sponsoring', `${job.years} years`], ['Recent Activity', 'Active']].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-500">{k}</span>
                <span className="font-semibold text-[#0F172A]">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

type View = 'home' | 'jobs'

export default function PreviewPage() {
  const [activeNav, setActiveNav] = useState<View>('home')
  const [selectedJob, setSelectedJob] = useState(MOCK_JOBS[0])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredJobs = MOCK_JOBS.filter(j =>
    !searchQuery || j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-slate-200 flex flex-col z-40">
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex flex-col leading-none">
            <span className="text-[#0F172A] font-extrabold text-base tracking-tight">ZOLVE</span>
            <span className="text-[#ff6633] text-[11px] font-semibold tracking-wide -mt-0.5">Home Base</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ icon: Icon, label, href, soon }) => {
            const isActive = (label === 'Home' && activeNav === 'home') || (label === 'Sponsored Jobs' && activeNav === 'jobs')
            return (
              <button key={label} onClick={() => { if (!soon) setActiveNav(label === 'Home' ? 'home' : 'jobs') }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer text-left ${isActive ? 'bg-[#fff1ec] text-[#ff6633] border-l-[3px] border-[#ff6633] pl-[9px]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${soon ? 'opacity-60 cursor-default' : ''}`}>
                <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                {label}
                {soon && <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full">Soon</span>}
              </button>
            )
          })}
        </nav>
        <div className="px-3 pb-5">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 cursor-pointer">
            <LogOut className="w-[18px] h-[18px]" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        {/* Navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 h-14 flex items-center gap-4">
          <div className="flex-1 max-w-xl">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl text-slate-400 text-sm">
              <Search className="w-4 h-4" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search jobs, companies, sponsors…" className="bg-transparent outline-none flex-1 text-slate-700" />
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff6633] rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#ff6633] flex items-center justify-center text-white font-bold text-sm cursor-pointer">A</div>
        </header>

        {/* Home view */}
        {activeNav === 'home' && (
          <main className="flex-1 p-6 max-w-5xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#0F172A]">Welcome back, Aadhil 👋</h1>
              <p className="text-slate-500 mt-1">You have {MOCK_JOBS.length} new sponsored roles matching your profile.</p>
            </div>

            {/* Profile completion */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-[#0F172A]">Complete your profile</p>
                  <p className="text-slate-400 text-sm">Get better job matches and recruiter visibility</p>
                </div>
                <span className="text-2xl font-bold text-[#ff6633]">30%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full mb-4">
                <div className="h-2 bg-[#ff6633] rounded-full" style={{ width: '30%' }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: '4 survey questions', done: true },
                  { label: 'Upload resume', done: false },
                  { label: 'Add education', done: false },
                  { label: 'Add employment', done: false },
                  { label: 'Mobile number', done: false },
                  { label: 'Visibility decision', done: false },
                ].map(({ label, done }) => (
                  <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'}`}>
                    {done ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <Circle className="w-3.5 h-3.5 flex-shrink-0" />}
                    {label}
                  </div>
                ))}
              </div>
              <button className="mt-4 px-5 py-2.5 bg-[#ff6633] text-white text-sm font-bold rounded-xl hover:bg-[#e5572b] transition-colors cursor-pointer">
                Complete Profile
              </button>
            </div>

            {/* Recommended jobs */}
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-bold text-[#0F172A]">Recommended Jobs</h2>
              <button onClick={() => setActiveNav('jobs')} className="text-[#ff6633] text-sm font-semibold hover:underline cursor-pointer flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {MOCK_JOBS.slice(0, 4).map(job => (
                <button key={job.id} onClick={() => { setSelectedJob(job); setActiveNav('jobs') }}
                  className="text-left p-4 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-sm transition-all duration-150 cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <CompanyLogo name={job.company} url={job.logo} />
                    <div>
                      <p className="font-semibold text-[#0F172A] text-sm">{job.title}</p>
                      <p className="text-slate-400 text-xs">{job.company}</p>
                    </div>
                    <ScoreChip score={job.score} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" />{job.location}
                    <span className="ml-auto font-semibold text-[#0F172A]">{job.salary}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Coming soon */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Upskill', desc: 'Resume Review, Mock Interviews & more', icon: GraduationCap },
                { label: 'Networking', desc: 'Connect with mentors and recruiters', icon: Users },
                { label: 'Events', desc: 'Career fairs and visa workshops', icon: Calendar },
              ].map(({ label, desc, icon: Icon }) => (
                <div key={label} className="p-5 bg-white border border-slate-200 rounded-2xl opacity-70">
                  <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-slate-500" />
                  </div>
                  <p className="font-semibold text-[#0F172A] text-sm">{label}</p>
                  <p className="text-slate-400 text-xs mt-1">{desc}</p>
                  <span className="mt-3 inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full">Coming Soon</span>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* Jobs view */}
        {activeNav === 'jobs' && (
          <main className="flex-1 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#0F172A]">Sponsored Jobs</h1>
                <p className="text-slate-400 text-sm mt-0.5">Showing {filteredJobs.length} jobs · ranked by Sponsor Score</p>
              </div>
            </div>
            <div className="grid lg:grid-cols-[380px_1fr] gap-5">
              {/* Job list */}
              <div className="space-y-3">
                {filteredJobs.map(job => (
                  <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} selected={selectedJob.id === job.id} />
                ))}
              </div>
              {/* Job detail */}
              <div className="lg:sticky lg:top-20 lg:self-start">
                <JobDetail job={selectedJob} />
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  )
}
