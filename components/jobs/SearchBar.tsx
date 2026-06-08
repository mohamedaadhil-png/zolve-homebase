'use client'

import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'

interface SearchBarProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export default function SearchBar({
  value: controlledValue,
  onChange,
  placeholder = 'Search jobs, companies, titles…',
  className,
  autoFocus = false,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(controlledValue ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChange = useCallback(
    debounce((val: unknown) => onChange(val as string), 300),
    [onChange]
  )

  // Sync controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInputValue(controlledValue)
    }
  }, [controlledValue])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInputValue(val)
    debouncedOnChange(val)
  }

  function handleClear() {
    setInputValue('')
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-4 w-4 h-4 text-navy-400 pointer-events-none flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'w-full pl-10 pr-10 py-3 text-sm text-navy-800 bg-white border border-navy-200 rounded-xl',
          'placeholder:text-navy-400',
          'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand',
          'hover:border-navy-400',
          'transition-all duration-150'
        )}
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 w-6 h-6 flex items-center justify-center rounded-md text-navy-400 hover:text-navy-700 hover:bg-navy-100 cursor-pointer transition-all duration-150"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
