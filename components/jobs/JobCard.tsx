'use client'

import { cn, timeAgo, formatSalary } from '@/lib/utils'
import { MapPin, Bookmark, BookmarkCheck, DollarSign } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface Company {
  name: string
  logo?: string
}

interface JobCardProps {
  id: string
  title: string
  company: Company
  location: string
  salary_min?: number | null
  salary_max?: number | null
  tags?: string[]
  posted_at: string | Date
  seniority?: string
  remote?: string
  employment_type?: string
  sponsor_score?: number | null
  years_sponsoring?: number | null
  is_saved?: boolean
  onClick?: () => void
  onSave?: (id: string) => void
  className?: string
}

function CompanyLogo({ company }: { company: Company }) {
  if (company.logo) {
    return (
      <img
        src={company.logo}
        alt={company.name}
        className="w-10 h-10 rounded-lg object-contain border border-navy-100 bg-white"
        onError={(e) => {
          const target = e.currentTarget
          target.style.display = 'none'
          if (target.nextSibling) {
            ;(target.nextSibling as HTMLElement).style.display = 'flex'
          }
        }}
      />
    )
  }

  const initials = company.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center text-xs font-bold text-navy-600 flex-shrink-0 border border-navy-200">
      {initials}
    </div>
  )
}

export default function JobCard({
  id,
  title,
  company,
  location,
  salary_min,
  salary_max,
  tags = [],
  posted_at,
  seniority,
  remote,
  employment_type,
  sponsor_score,
  years_sponsoring,
  is_saved = false,
  onClick,
  onSave,
  className,
}: JobCardProps) {
  const salary = formatSalary(salary_min, salary_max)
  const hasSalary = salary !== 'Salary not listed'

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation()
    onSave?.(id)
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white border border-navy-200 rounded-xl p-5 flex flex-col gap-4 group',
        onClick && 'cursor-pointer hover:border-navy-400 transition-all duration-150',
        className
      )}
    >
      {/* Header: company logo + name + bookmark */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CompanyLogo company={company} />
          <div className="min-w-0">
            <p className="text-xs font-medium text-navy-500 truncate">{company.name}</p>
            {years_sponsoring && years_sponsoring > 0 && (
              <Badge variant="sponsor" className="mt-1">
                Sponsoring {years_sponsoring}+ yrs
              </Badge>
            )}
          </div>
        </div>

        {/* Bookmark */}
        {onSave && (
          <button
            onClick={handleSave}
            className={cn(
              'w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg border cursor-pointer transition-all duration-150',
              is_saved
                ? 'bg-[#fff1ec] border-[#ff6633]/30 text-[#ff6633]'
                : 'border-navy-200 text-navy-300 hover:border-navy-400 hover:text-navy-600'
            )}
            aria-label={is_saved ? 'Unsave job' : 'Save job'}
          >
            {is_saved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Job title */}
      <div>
        <h3 className="text-base font-semibold text-navy-800 leading-snug group-hover:text-navy transition-colors duration-150">
          {title}
        </h3>

        {/* Location + remote */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-navy-500">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            {location}
          </span>
          {remote && remote !== 'Onsite' && (
            <Badge variant="tag">{remote}</Badge>
          )}
          {employment_type && (
            <Badge variant="tag">{employment_type}</Badge>
          )}
        </div>
      </div>

      {/* Salary */}
      {hasSalary && (
        <div className="flex items-center gap-1 text-sm font-semibold text-navy-700">
          <DollarSign className="w-4 h-4 text-navy-400" />
          {salary}
        </div>
      )}

      {/* Tags row */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const isH1B = tag.toLowerCase().includes('h-1b') || tag.toLowerCase().includes('h1b')
            const isOPT = tag.toLowerCase().includes('opt')
            return (
              <Badge
                key={tag}
                variant={isH1B ? 'sponsor' : isOPT ? 'new' : 'tag'}
              >
                {tag}
              </Badge>
            )
          })}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-navy-100 gap-2">
        <span className="text-xs text-navy-400">
          {timeAgo(posted_at)}
        </span>

        {sponsor_score != null && (
          <Badge variant="score">Score {sponsor_score}/100</Badge>
        )}
      </div>
    </div>
  )
}
