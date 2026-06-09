import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { allEvents } from '@/lib/events/data'

const COMING_SOON = [
  { title: 'Resume Review', category: 'Upskill', description: '30-min session · $49' },
  { title: 'Mock Interviews', category: 'Upskill', description: '60-min session · $99' },
  { title: 'Career Strategy Session', category: 'Upskill', description: '45-min session · $79' },
  { title: 'OPT / H-1B Guidance', category: 'Upskill', description: '45-min session · $69' },
  { title: 'Salary Negotiation', category: 'Upskill', description: '30-min session · $59' },
  { title: 'Networking Strategy', category: 'Upskill', description: '45-min session · $69' },
  { title: 'Networking Events', category: 'Events', description: 'Coming soon' },
  { title: 'Mentor Matching', category: 'Networking', description: 'Coming soon' },
  { title: 'Resource Library', category: 'Resources', description: 'Guides & templates — coming soon' },
]

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q') || ''
    if (!q.trim()) {
      return NextResponse.json({ jobs: [], companies: [], events: [], coming_soon: [] })
    }

    const supabase = await createClient()

    const [jobsRes, companiesRes] = await Promise.all([
      supabase.rpc('search_jobs', {
        query: q,
        p_visa_types: null,
        p_job_types: null,
        p_seniority: null,
        p_remote: null,
        p_limit: 5,
        p_offset: 0,
      }),
      supabase
        .from('companies')
        .select('id, canonical_name, logo_url, sponsor_score, industry')
        .ilike('canonical_name', `%${q}%`)
        .limit(4),
    ])

    const comingSoon = COMING_SOON.filter(
      (item) =>
        item.title.toLowerCase().includes(q.toLowerCase()) ||
        item.category.toLowerCase().includes(q.toLowerCase())
    )

    const ql = q.toLowerCase()
    const events = allEvents
      .filter(
        (e) =>
          e.title.toLowerCase().includes(ql) ||
          e.subtitle?.toLowerCase().includes(ql) ||
          e.speakerName?.toLowerCase().includes(ql) ||
          e.tags.some((t) => t.toLowerCase().includes(ql))
      )
      // Upcoming first, then most recent past
      .sort((a, b) => (a.category === b.category ? 0 : a.category === 'upcoming' ? -1 : 1))
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        dateText: e.dateText,
        speakerName: e.speakerName ?? null,
      }))

    return NextResponse.json({
      jobs: jobsRes.data || [],
      companies: companiesRes.data || [],
      events,
      coming_soon: comingSoon,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
