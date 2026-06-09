import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Distinct US states (with accurate counts) among active postings, for the
// Location filter dropdown. Uses an aggregate RPC to avoid the 1000-row cap.
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('job_state_facets')
    if (error) throw error
    const states = ((data as { state: string; count: number }[]) ?? []).map((r) => ({
      state: r.state,
      count: Number(r.count),
    }))
    return NextResponse.json({ states })
  } catch (err) {
    return NextResponse.json({ states: [], error: String(err) }, { status: 500 })
  }
}
