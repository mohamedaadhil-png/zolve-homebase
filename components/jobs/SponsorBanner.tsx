import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface SponsorBannerProps {
  yearsSponsoring: number
  sponsorScore?: number | null
  className?: string
}

export default function SponsorBanner({
  yearsSponsoring,
  sponsorScore,
  className,
}: SponsorBannerProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-xl',
        className
      )}
    >
      <div className="flex-shrink-0">
        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-emerald-800">
          H-1B Sponsorship History Verified
        </p>
        <p className="text-xs text-emerald-600 mt-0.5">
          Sponsored consistently in the last {yearsSponsoring}{' '}
          {yearsSponsoring === 1 ? 'year' : 'years'}
        </p>
      </div>

      {sponsorScore != null && (
        <Badge variant="score" className="flex-shrink-0">
          Score {sponsorScore}/100
        </Badge>
      )}
    </div>
  )
}
