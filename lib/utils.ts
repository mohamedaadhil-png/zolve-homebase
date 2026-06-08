import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Decode HTML entities in ATS content (Greenhouse returns entity-encoded HTML).
 * Server-safe — no DOM. Handles named + numeric entities.
 */
export function decodeHtmlEntities(input: string): string {
  if (!input) return ''
  const named: Record<string, string> = {
    '&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"',
    '&#39;': "'", '&#x27;': "'", '&apos;': "'", '&nbsp;': ' ',
    '&mdash;': '—', '&ndash;': '–', '&hellip;': '…',
    '&rsquo;': '’', '&lsquo;': '‘', '&ldquo;': '“', '&rdquo;': '”',
    '&bull;': '•', '&trade;': '™', '&reg;': '®', '&copy;': '©',
  }
  let out = input.replace(/&[a-zA-Z]+;|&#\d+;|&#x[0-9a-fA-F]+;/g, (m) => {
    if (named[m]) return named[m]
    if (m.startsWith('&#x')) return String.fromCodePoint(parseInt(m.slice(3, -1), 16))
    if (m.startsWith('&#')) return String.fromCodePoint(parseInt(m.slice(2, -1), 10))
    return m
  })
  // Greenhouse double-encodes &amp;lt; → decode a second pass for those cases
  if (/&(lt|gt|amp|quot|#39);/.test(out)) {
    out = out.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
  }
  return out
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatSalary(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Salary not listed'
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `${fmt(min)}+`
  return `Up to ${fmt(max!)}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getSponsorScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-500'
}

export function getSponsorScoreLabel(score: number): string {
  if (score >= 80) return 'Strong Sponsor'
  if (score >= 60) return 'Active Sponsor'
  return 'Limited Sponsorship'
}
