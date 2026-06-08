import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-navy-800"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 text-sm text-navy-800 bg-white border rounded-lg placeholder:text-navy-400',
            'transition-all duration-150 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand',
            error
              ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
              : 'border-navy-200 hover:border-navy-400',
            'disabled:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-60',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-navy-400">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
