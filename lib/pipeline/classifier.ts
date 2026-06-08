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
