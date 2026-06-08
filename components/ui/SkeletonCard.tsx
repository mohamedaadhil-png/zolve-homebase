import { cn } from '@/lib/utils'

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-slate-200 rounded animate-skeleton',
        className
      )}
    />
  )
}

export default function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-white border border-navy-200 rounded-xl p-5 space-y-4',
        className
      )}
    >
      {/* Header row: logo + company + bookmark */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-md flex-shrink-0" />
      </div>

      {/* Job title */}
      <div className="space-y-1.5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Tags row */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-1 border-t border-navy-100">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}
