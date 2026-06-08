import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('job_postings')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('role_category', 'SWE')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ count: count ?? 0 })
}
