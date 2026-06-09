'use client'

import { cn } from '@/lib/utils'
import { Check, Circle } from 'lucide-react'
import Button from '@/components/ui/Button'

interface ProfileItem {
  label: string
  done: boolean
}

interface ProfileCompletionCardProps {
  items?: ProfileItem[]
  completionPercent?: number
  className?: string
}

const defaultItems: ProfileItem[] = [
  { label: 'Survey', done: true },
  { label: 'Resume', done: false },
  { label: 'Education', done: false },
  { label: 'Employment', done: false },
  { label: 'Mobile', done: false },
  { label: 'Visibility Decision', done: false },
]

export default function ProfileCompletionCard({
  items = defaultItems,
  completionPercent,
  className,
}: ProfileCompletionCardProps) {
  const doneCount = items.filter((i) => i.done).length
  const percent =
    completionPercent ?? Math.round((doneCount / items.length) * 100)

  return (
    <div
      className={cn(
        'bg-white border border-navy-200 rounded-xl p-5 space-y-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy-800">Complete your profile</h3>
        <span className="text-sm font-bold text-[#ff6633]">{percent}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#ff6633] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Checklist */}
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2.5">
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-150',
                item.done
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'bg-white border-navy-300'
              )}
            >
              {item.done ? (
                <Check className="w-3 h-3 text-white stroke-[3]" />
              ) : (
                <Circle className="w-2.5 h-2.5 text-navy-300" />
              )}
            </div>
            <span
              className={cn(
                'text-sm',
                item.done ? 'text-navy-500 line-through' : 'text-navy-700'
              )}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA — scrolls to the resume/details form below on the profile page */}
      <a href="#profile-details" className="block">
        <Button variant="primary" size="sm" className="w-full">
          Complete Profile
        </Button>
      </a>
    </div>
  )
}
