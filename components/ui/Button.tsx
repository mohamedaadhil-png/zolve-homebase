'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    const base =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-lg cursor-pointer transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand select-none'

    const variants = {
      primary:
        'bg-[#ff6633] text-white hover:bg-[#e5572b] active:bg-[#cc4d26] focus-visible:ring-brand disabled:bg-[#ff6633]/50 disabled:cursor-not-allowed',
      secondary:
        'bg-white border border-navy-200 text-navy-800 hover:bg-navy-50 active:bg-navy-100 focus-visible:ring-navy-400 disabled:opacity-50 disabled:cursor-not-allowed',
      ghost:
        'bg-transparent text-navy-700 hover:bg-navy-100 active:bg-navy-200 focus-visible:ring-navy-400 disabled:opacity-50 disabled:cursor-not-allowed',
      outline:
        'bg-transparent border border-[#ff6633] text-[#ff6633] hover:bg-[#fff1ec] active:bg-[#ffe4d9] focus-visible:ring-brand disabled:opacity-50 disabled:cursor-not-allowed',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
