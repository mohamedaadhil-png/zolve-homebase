'use client'

import { cn } from '@/lib/utils'

interface SponsorScoreRingProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function getScoreColor(score: number) {
  if (score >= 80) return { stroke: '#10b981', text: 'text-emerald-600' }
  if (score >= 60) return { stroke: '#f59e0b', text: 'text-amber-500' }
  return { stroke: '#ef4444', text: 'text-red-500' }
}

const sizeMap = {
  sm: { wh: 60, r: 22, strokeW: 4, fontSize: 'text-sm', subFontSize: 'text-[8px]' },
  md: { wh: 88, r: 34, strokeW: 5, fontSize: 'text-lg', subFontSize: 'text-[10px]' },
  lg: { wh: 120, r: 48, strokeW: 6, fontSize: 'text-2xl', subFontSize: 'text-xs' },
}

export default function SponsorScoreRing({
  score,
  size = 'md',
  className,
}: SponsorScoreRingProps) {
  const { wh, r, strokeW, fontSize, subFontSize } = sizeMap[size]
  const { stroke, text } = getScoreColor(score)
  const circumference = 2 * Math.PI * r
  const progress = Math.min(Math.max(score, 0), 100)
  const offset = circumference - (progress / 100) * circumference
  const center = wh / 2

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: wh, height: wh }}
    >
      <svg
        width={wh}
        height={wh}
        viewBox={`0 0 ${wh} ${wh}`}
        className="-rotate-90"
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeW}
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold leading-none', fontSize, text)}>
          {score}
        </span>
        <span className={cn('text-slate-400 font-medium leading-none mt-0.5', subFontSize)}>
          / 100
        </span>
      </div>
    </div>
  )
}
