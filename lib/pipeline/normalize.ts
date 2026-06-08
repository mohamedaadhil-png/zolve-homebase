/**
 * Company name normalization pipeline.
 * Strips legal suffixes, punctuation, and common noise words
 * to produce a canonical string for ATS↔gov matching.
 */

const LEGAL_SUFFIXES = [
  'incorporated', 'inc', 'llc', 'l\\.l\\.c', 'limited', 'ltd', 'corporation',
  'corp', 'co', 'plc', 'lp', 'llp', 'gmbh', 'pvt', 'private limited',
  'holding', 'holdings', 'group', 'international', 'solutions', 'technologies',
  'technology', 'services', 'labs', 'studio', 'studios',
]

const LEGAL_SUFFIX_RE = new RegExp(
  `[,.]?\\s*(${LEGAL_SUFFIXES.join('|')})\\.?\\s*$`,
  'gi'
)

const NOISE_TRAILING_RE = /\s+(usa|us|america)\.?\s*$/gi

export function normalizeName(raw: string): string {
  let s = raw.trim().toLowerCase()
  // Collapse whitespace
  s = s.replace(/\s+/g, ' ')
  // Remove legal suffixes (may need multiple passes)
  let prev = ''
  while (prev !== s) {
    prev = s
    s = s.replace(LEGAL_SUFFIX_RE, '').trim()
  }
  // Remove trailing country noise
  s = s.replace(NOISE_TRAILING_RE, '').trim()
  // Normalize & → and
  s = s.replace(/&/g, 'and')
  // Strip punctuation
  s = s.replace(/[.,'"!@#$%^*()_+\-=[\]{};:\\|<>?/]/g, ' ')
  // Collapse whitespace again
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

/** Canonical brand overrides — grows over time */
export const CANONICAL_OVERRIDES: Record<string, string> = {
  'alphabet': 'google',
  'google llc': 'google',
  'google corp': 'google',
  'google inc': 'google',
  'meta platforms': 'meta',
  'facebook': 'meta',
  'facebook inc': 'meta',
  'amazon com': 'amazon',
  'amazon web services': 'amazon',
  'aws': 'amazon',
  'tata consultancy services': 'tcs',
  'microsoft corporation': 'microsoft',
  'microsoft corp': 'microsoft',
  'doordash usa': 'doordash',
  'doordash inc': 'doordash',
}

export function applyCanonicalOverride(normalized: string): string {
  return CANONICAL_OVERRIDES[normalized] ?? normalized
}

/** Normalize a job title to lowercase trimmed */
export function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Parse a raw location string into structured fields */
export function parseLocation(raw: string): {
  city: string | null
  state: string | null
  country: string
  is_remote: boolean
} {
  if (!raw) return { city: null, state: null, country: 'US', is_remote: false }
  const isRemote = /remote/i.test(raw)
  const cleaned = raw
    .replace(/remote[-\s]*/i, '')
    .replace(/\bUS\b/, '')
    .trim()
  const parts = cleaned.split(',').map((p) => p.trim()).filter(Boolean)
  return {
    city: parts[0] || null,
    state: parts[1] || null,
    country: 'US',
    is_remote: isRemote,
  }
}

/** Parse salary range from text like "$120,000 - $180,000" */
export function parseSalaryRange(text: string): { min: number | null; max: number | null } {
  const numbers = text.match(/\$[\d,]+/g)?.map((n) => parseInt(n.replace(/[$,]/g, ''), 10)) ?? []
  if (numbers.length >= 2) return { min: numbers[0], max: numbers[1] }
  if (numbers.length === 1) return { min: numbers[0], max: null }
  return { min: null, max: null }
}
