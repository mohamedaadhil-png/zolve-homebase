import { cn } from '@/lib/utils'

type BadgeVariant = 'sponsor' | 'tag' | 'score' | 'warning' | 'new'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  sponsor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  tag: 'bg-slate-100 text-slate-600 border border-slate-200',
  score: 'bg-[#fff1ec] text-[#ff6633] border border-[#ff6633]/20',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  new: 'bg-blue-50 text-blue-600 border border-blue-200',
}

export default function Badge({
  variant = 'tag',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
