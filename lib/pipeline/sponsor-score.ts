/**
 * Sponsor Score computation.
 * Placeholder weights (v0): 50% approval_rate, 30% volume, 20% recency
 * Scores are 0–100. Refreshed quarterly after gov-data-ingest.
 */

export interface USCISRecord {
  fiscal_year: number
  initial_approvals: number
  initial_denials: number
  continuing_approvals: number
  continuing_denials: number
}

export interface SponsorScoreResult {
  sponsor_score: number
  approval_rate: number
  years_sponsoring: number
  recent_activity: 'active' | 'inactive' | 'unknown'
  role_grades: Record<string, number>
}

export interface LCARecord {
  soc_code: string
  decision_date: string | null
  case_status: string
}

/** Compute sponsor score from USCIS + LCA records for a single company */
export function computeSponsorScore(
  uscisRecords: USCISRecord[],
  lcaRecords: LCARecord[],
  currentFY: number = new Date().getFullYear()
): SponsorScoreResult {
  if (!uscisRecords.length) {
    return {
      sponsor_score: 0,
      approval_rate: 0,
      years_sponsoring: 0,
      recent_activity: 'unknown',
      role_grades: {},
    }
  }

  // Limit to last 3 fiscal years for recency
  const recentFYs = uscisRecords.filter((r) => r.fiscal_year >= currentFY - 3)
  const allFYs = uscisRecords

  // 1. Approval rate (50% weight)
  const totalApprovals = recentFYs.reduce(
    (s, r) => s + r.initial_approvals + r.continuing_approvals,
    0
  )
  const totalDenials = recentFYs.reduce(
    (s, r) => s + r.initial_denials + r.continuing_denials,
    0
  )
  const total = totalApprovals + totalDenials
  const approvalRate = total > 0 ? totalApprovals / total : 0
  const approvalScore = approvalRate * 100

  // 2. Volume score (30% weight) — log-normalized, max ~100 at 10000+ approvals
  const allTimeApprovals = allFYs.reduce(
    (s, r) => s + r.initial_approvals + r.continuing_approvals,
    0
  )
  const volumeScore = Math.min(100, (Math.log10(Math.max(1, allTimeApprovals)) / 4) * 100)

  // 3. Recency score (20% weight) — 100 if filed in last FY, decays 20%/yr
  const mostRecentFY = Math.max(...allFYs.map((r) => r.fiscal_year))
  const fyGap = Math.max(0, currentFY - mostRecentFY)
  const recencyScore = Math.max(0, 100 - fyGap * 20)

  // Weighted composite
  const sponsor_score = Math.min(
    100,
    Math.round(approvalScore * 0.5 + volumeScore * 0.3 + recencyScore * 0.2)
  )

  // Years sponsoring
  const years_sponsoring = new Set(allFYs.map((r) => r.fiscal_year)).size

  // Recent activity
  const recent_activity: 'active' | 'inactive' | 'unknown' =
    fyGap === 0 ? 'active' : fyGap <= 2 ? 'active' : 'inactive'

  // Role grades: SWE = SOC 15-xxxx
  const role_grades = computeRoleGrades(lcaRecords)

  return {
    sponsor_score,
    approval_rate: Math.round(approvalRate * 1000) / 10, // as percentage
    years_sponsoring,
    recent_activity,
    role_grades,
  }
}

/** Compute role-level sponsorship grades from LCA records */
function computeRoleGrades(lcaRecords: LCARecord[]): Record<string, number> {
  const categories: Record<string, { certified: number; total: number }> = {}

  for (const rec of lcaRecords) {
    const soc = rec.soc_code || ''
    let cat = 'other'
    if (soc.startsWith('15-12')) cat = 'swe'
    else if (soc.startsWith('15-11')) cat = 'management'
    else if (soc.startsWith('15-13')) cat = 'data'
    else if (soc.startsWith('15-14')) cat = 'security'
    else if (soc.startsWith('15-2')) cat = 'math'
    else if (soc.startsWith('15')) cat = 'it'

    if (!categories[cat]) categories[cat] = { certified: 0, total: 0 }
    categories[cat].total++
    if (rec.case_status?.toLowerCase().includes('certified')) {
      categories[cat].certified++
    }
  }

  const grades: Record<string, number> = {}
  for (const [cat, { certified, total }] of Object.entries(categories)) {
    grades[cat] = total > 0 ? Math.round((certified / total) * 100) : 0
  }
  return grades
}
