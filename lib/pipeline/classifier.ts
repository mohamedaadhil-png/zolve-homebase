/**
 * SWE role classifier.
 * Returns true if a job title+department belongs to Software Engineering.
 */

const SWE_KEYWORDS = [
  'software engineer',
  'software developer',
  'swe',
  'backend engineer',
  'back end engineer',
  'back-end engineer',
  'frontend engineer',
  'front end engineer',
  'front-end engineer',
  'full stack',
  'fullstack',
  'full-stack',
  'infrastructure engineer',
  'platform engineer',
  'ml engineer',
  'machine learning engineer',
  'machine learning',
  'mobile engineer',
  'ios engineer',
  'android engineer',
  'site reliability',
  ' sre',
  'devops engineer',
  'data engineer',
  'security engineer',
  'systems engineer',
  'embedded engineer',
  'firmware engineer',
  'applied scientist',
  'research engineer',
] as const

const NON_SWE_KEYWORDS = [
  'sales engineer',
  'solutions engineer',
  'support engineer',
  'customer success',
  'customer support',
  'technical recruiter',
  'recruiter',
  'designer',
  'product manager',
  'project manager',
  'marketing',
  'finance manager',
  'legal',
  'operations manager',
  'office manager',
  'hr ',
  'human resources',
  'business analyst',
  'business development',
  'account executive',
  'account manager',
] as const

export function isSWERole(title: string, departments: string[] = []): boolean {
  const combined = `${title} ${departments.join(' ')}`.toLowerCase()
  const hasInclude = SWE_KEYWORDS.some((kw) => combined.includes(kw))
  const hasExclude = NON_SWE_KEYWORDS.some((kw) => combined.includes(kw))
  return hasInclude && !hasExclude
}

// ── Full role-category classification (every role, normalized) ────────────────
// A proper job-family taxonomy so nothing falls into a meaningless "other"
// bucket. Order in ROLE_RULES is precedence: the first family whose keywords
// match wins, which resolves title overlaps (e.g. "Security Engineer" → security
// before engineering; "Solutions Engineer" → sales before engineering).
export type RoleCategory =
  | 'software_engineering'
  | 'data_ai'
  | 'product'
  | 'design'
  | 'devops_infra'
  | 'security'
  | 'sales'
  | 'marketing'
  | 'customer'
  | 'operations'
  | 'finance'
  | 'people'
  | 'legal'
  | 'other'

/** Human-facing labels for each category (used in filters/badges). */
export const ROLE_CATEGORY_LABELS: Record<RoleCategory, string> = {
  software_engineering: 'Software Engineering',
  data_ai: 'Data & AI',
  product: 'Product',
  design: 'Design',
  devops_infra: 'DevOps & Infra',
  security: 'Security',
  sales: 'Sales',
  marketing: 'Marketing',
  customer: 'Customer Success',
  operations: 'Operations',
  finance: 'Finance',
  people: 'People & Recruiting',
  legal: 'Legal',
  other: 'Other',
}

const ROLE_RULES: Array<{ cat: RoleCategory; kws: string[] }> = [
  { cat: 'design', kws: [
    'designer', 'ux ', 'ui/ux', 'ux/ui', 'user experience', 'user research', 'ux research',
    'design lead', 'design manager', 'creative director', 'content design', 'graphic design',
    'product design', 'visual design', 'design system',
  ] },
  { cat: 'product', kws: [
    'product manager', 'product management', 'product owner', 'technical program manager',
    ' tpm', 'product lead', 'group product', 'head of product', 'director of product',
    'chief product', 'principal product manager',
  ] },
  { cat: 'data_ai', kws: [
    'data scientist', 'data analyst', 'data analytics', 'analytics engineer', 'data engineer',
    'machine learning', 'ml engineer', ' ai ', 'applied scientist', 'research scientist',
    'business intelligence', 'bi analyst', 'quantitative', 'statistician', 'biostatistician',
    'analytics ', 'data science',
  ] },
  { cat: 'security', kws: [
    'security engineer', 'application security', 'infosec', 'information security',
    'security analyst', 'soc analyst', 'threat', 'security operations', 'grc ',
    'trust and safety', 'trust & safety', 'security architect', 'detection engineer',
  ] },
  { cat: 'devops_infra', kws: [
    'devops', 'site reliability', ' sre', 'sre ', 'platform engineer', 'infrastructure engineer',
    'cloud engineer', 'release engineer', 'build engineer', 'systems engineer', 'network engineer',
    'reliability engineer', 'it support', 'it engineer', 'systems administrator',
  ] },
  { cat: 'software_engineering', kws: [
    'software engineer', 'software developer', 'swe', 'backend', 'back end', 'back-end',
    'frontend', 'front end', 'front-end', 'full stack', 'fullstack', 'full-stack',
    'mobile engineer', 'ios engineer', 'android engineer', 'embedded', 'firmware',
    'qa engineer', 'test engineer', 'quality engineer', 'web engineer', 'api engineer',
    'research engineer', 'engineering manager', 'engineer,', 'engineer -', 'developer',
  ] },
  { cat: 'sales', kws: [
    'account executive', 'account manager', 'sales engineer', 'solutions engineer',
    'solutions architect', 'solutions consultant', ' sales', 'sales ', 'sdr', 'bdr',
    'business development', 'partnerships', 'partner manager', 'revenue', 'enterprise account',
    'engagement manager', 'go-to-market', 'gtm',
  ] },
  { cat: 'marketing', kws: [
    'marketing', 'growth ', 'demand generation', 'demand gen', 'content marketing', 'seo',
    'social media', 'communications', 'public relations', ' pr ', 'brand ', 'product marketing',
    'lifecycle marketing', 'events', 'copywriter',
  ] },
  { cat: 'customer', kws: [
    'customer success', 'customer support', 'support engineer', 'technical support',
    'customer experience', 'implementation', 'onboarding specialist', 'customer enablement',
    'technical account manager', 'support specialist', 'customer care', 'success manager',
  ] },
  { cat: 'finance', kws: [
    'finance', 'accounting', 'accountant', 'controller', 'fp&a', 'treasury', 'audit',
    ' tax ', 'payroll', 'financial analyst', 'revenue operations', 'revops',
  ] },
  { cat: 'people', kws: [
    'recruiter', 'recruiting', 'talent ', 'people operations', 'people ops', 'human resources',
    ' hr ', 'benefits', 'compensation', 'people partner', 'sourcer',
  ] },
  { cat: 'legal', kws: [
    'legal', 'counsel', 'paralegal', 'compliance', 'privacy', 'regulatory', 'policy',
  ] },
  { cat: 'operations', kws: [
    'operations', 'business operations', 'strategy', 'program manager', 'project manager',
    'supply chain', 'logistics', 'workplace', 'facilities', 'site manager', 'shift lead',
    'kitchen', 'dasher', 'driver', 'warehouse', 'fleet', 'chief of staff', 'administrative',
    'office manager', 'executive assistant',
  ] },
]

/**
 * Normalize any job title into a role family. Returns 'other' only when nothing
 * matches (rare). Precedence is the ROLE_RULES order.
 */
export function classifyRole(title: string, departments: string[] = []): RoleCategory {
  const c = ` ${title} ${departments.join(' ')} `.toLowerCase()
  for (const { cat, kws } of ROLE_RULES) {
    if (kws.some((kw) => c.includes(kw))) return cat
  }
  return 'other'
}

export type Seniority = 'intern' | 'new-grad' | 'junior' | 'mid' | 'senior' | 'staff'
export type Track =
  | 'backend'
  | 'frontend'
  | 'fullstack'
  | 'ml'
  | 'mobile'
  | 'infra'
  | 'data'
  | 'systems'
  | 'general'

export function extractSeniority(title: string): Seniority {
  const t = title.toLowerCase()
  if (/intern|co-op|coop|internship/.test(t)) return 'intern'
  if (/new grad|entry.?level|university grad|recent grad/.test(t)) return 'new-grad'
  if (/\bjr\b|junior/.test(t)) return 'junior'
  if (/\bstaff\b|principal|distinguished/.test(t)) return 'staff'
  if (/senior|\bsr\b|lead|manager/.test(t)) return 'senior'
  return 'mid'
}

export function extractTrack(title: string): Track {
  const t = title.toLowerCase()
  if (/machine learning|ml |ai |applied scientist|research engineer/.test(t)) return 'ml'
  if (/frontend|front.end|react|ui engineer|web engineer/.test(t)) return 'frontend'
  if (/backend|back.end|api engineer|server/.test(t)) return 'backend'
  if (/fullstack|full.stack/.test(t)) return 'fullstack'
  if (/ios|android|mobile/.test(t)) return 'mobile'
  if (/infra|platform|sre|reliability|devops|cloud/.test(t)) return 'infra'
  if (/data engineer/.test(t)) return 'data'
  if (/security|embedded|firmware|systems/.test(t)) return 'systems'
  return 'general'
}
