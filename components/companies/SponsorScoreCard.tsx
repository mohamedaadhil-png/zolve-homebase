import { cn } from '@/lib/utils'
import { TrendingUp, Calendar, Activity } from 'lucide-react'
import SponsorScoreRing from '@/components/ui/SponsorScoreRing'

interface SponsorScoreCardProps {
  sponsorScore: number
  approvalRate: number
  yearsSponsoring: number
  recentActivity: 'Active' | 'Moderate' | 'Limited'
  className?: string
}

const activityColors = {
  Active: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  Moderate: 'text-amber-600 bg-amber-50 border-amber-200',
  Limited: 'text-red-500 bg-red-50 border-red-200',
}

export default function SponsorScoreCard({
  sponsorScore,
  approvalRate,
  yearsSponsoring,
  recentActivity,
  className,
}: SponsorScoreCardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-navy-200 rounded-xl p-5',
        className
      )}
    >
      <h3 className="text-sm font-semibold text-navy-800 mb-4">Sponsorship Overview</h3>

      <div className="flex items-center gap-6">
        {/* Score ring */}
        <div className="flex-shrink-0">
          <SponsorScoreRing score={sponsorScore} size="md" />
          <p className="text-xs text-navy-400 text-center mt-1.5">Sponsor Score</p>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-navy-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-navy-400">Approval Rate</p>
              <p className="text-sm font-semibold text-navy-800">
                {approvalRate.toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-navy-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-navy-400">Years Sponsoring</p>
              <p className="text-sm font-semibold text-navy-800">
                {yearsSponsoring}+ years
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-navy-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-navy-400">Recent Activity</p>
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
                  activityColors[recentActivity]
                )}
              >
                {recentActivity}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
