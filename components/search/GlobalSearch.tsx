'use client'

import { cn } from '@/lib/utils'
import { Search, X, Briefcase, Building2, Clock } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'

interface SearchResult {
  id: string
  type: 'job' | 'company' | 'coming-soon'
  title: string
  subtitle: string
}

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
  onSearch?: (query: string) => Promise<SearchResult[]>
  results?: SearchResult[]
  loading?: boolean
}

const typeIcons = {
  job: Briefcase,
  company: Building2,
  'coming-soon': Clock,
}

const typeLabels = {
  job: 'Jobs',
  company: 'Companies',
  'coming-soon': 'Coming Soon',
}

export default function GlobalSearch({
  open,
  onClose,
  onSearch,
  results = [],
  loading = false,
}: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [localResults, setLocalResults] = useState<SearchResult[]>(results)
  const inputRef = useRef<HTMLInputElement>(null)

  // Group results by type
  const grouped = localResults.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {} as Record<string, SearchResult[]>)

  const flatResults = localResults

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setLocalResults(results)
  }, [results])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') return onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && flatResults[activeIndex]) {
        // Navigate to result
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose, flatResults, activeIndex])

  const handleChange = useCallback(
    async (val: string) => {
      setQuery(val)
      setActiveIndex(0)
      if (onSearch && val.trim()) {
        const res = await onSearch(val)
        setLocalResults(res)
      } else {
        setLocalResults([])
      }
    },
    [onSearch]
  )

  if (!open) return null

  const typeOrder: SearchResult['type'][] = ['job', 'company', 'coming-soon']

  let globalIdx = 0

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl mx-auto mt-[10vh] animate-slide-up">
        {/* Search input */}
        <div className="flex items-center gap-3 bg-white border border-navy-200 rounded-2xl px-5 py-4">
          <Search className="w-5 h-5 text-navy-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search jobs, companies…"
            className="flex-1 text-base text-navy-800 placeholder:text-navy-400 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              onClick={() => handleChange('')}
              className="w-6 h-6 flex items-center justify-center rounded text-navy-400 hover:text-navy-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-navy-400 hover:text-navy-700 cursor-pointer font-mono border border-navy-200 px-2 py-1 rounded-lg transition-colors duration-150"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        {query && (
          <div className="mt-2 bg-white border border-navy-200 rounded-2xl overflow-hidden max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="px-5 py-4 text-sm text-navy-400">Searching…</div>
            )}

            {!loading && localResults.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-navy-500">No results for "{query}"</p>
                <p className="text-xs text-navy-400 mt-1">Try a different search term</p>
              </div>
            )}

            {!loading &&
              typeOrder.map((type) => {
                const group = grouped[type]
                if (!group || group.length === 0) return null
                const Icon = typeIcons[type]

                return (
                  <div key={type}>
                    <div className="px-5 py-2 bg-navy-50 border-b border-navy-100">
                      <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider">
                        {typeLabels[type]}
                      </p>
                    </div>
                    {group.map((result) => {
                      const idx = globalIdx++
                      const isActive = idx === activeIndex
                      return (
                        <button
                          key={result.id}
                          className={cn(
                            'w-full flex items-center gap-3 px-5 py-3.5 text-left cursor-pointer transition-colors duration-100 border-b border-navy-100 last:border-b-0',
                            isActive ? 'bg-[#fff1ec]' : 'hover:bg-navy-50'
                          )}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={onClose}
                        >
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                              isActive ? 'bg-[#ff6633]/10' : 'bg-navy-100'
                            )}
                          >
                            <Icon
                              className={cn(
                                'w-4 h-4',
                                isActive ? 'text-[#ff6633]' : 'text-navy-400'
                              )}
                            />
                          </div>
                          <div className="min-w-0">
                            <p
                              className={cn(
                                'text-sm font-medium truncate',
                                isActive ? 'text-[#ff6633]' : 'text-navy-800'
                              )}
                            >
                              {result.title}
                            </p>
                            <p className="text-xs text-navy-400 truncate">{result.subtitle}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
          </div>
        )}

        {/* Empty state hint */}
        {!query && (
          <div className="mt-2 bg-white border border-navy-200 rounded-2xl px-5 py-6 text-center">
            <p className="text-sm text-navy-400">
              Search for jobs, companies, or roles
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-xs text-navy-300 flex items-center gap-1">
                <kbd className="font-mono bg-navy-100 px-1.5 py-0.5 rounded text-[10px]">↑</kbd>
                <kbd className="font-mono bg-navy-100 px-1.5 py-0.5 rounded text-[10px]">↓</kbd>
                Navigate
              </span>
              <span className="text-xs text-navy-300 flex items-center gap-1">
                <kbd className="font-mono bg-navy-100 px-1.5 py-0.5 rounded text-[10px]">↵</kbd>
                Select
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
