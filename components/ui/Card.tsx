import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  onClick?: () => void
}

export default function Card({
  children,
  className,
  hoverable = false,
  onClick,
  ...props
}: CardProps) {
  const isClickable = !!onClick || hoverable

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white border border-navy-200 rounded-xl',
        isClickable &&
          'cursor-pointer transition-all duration-150 ease-in-out hover:border-navy-400',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
