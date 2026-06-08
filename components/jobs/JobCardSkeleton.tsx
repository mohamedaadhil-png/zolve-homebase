import SkeletonCard from '@/components/ui/SkeletonCard'
import { cn } from '@/lib/utils'

export default function JobCardSkeleton({ className }: { className?: string }) {
  return <SkeletonCard className={className} />
}
