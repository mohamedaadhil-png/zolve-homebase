'use client'

import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export default function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 border-b border-navy-200',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 text-sm font-medium cursor-pointer transition-all duration-150 ease-in-out whitespace-nowrap',
              isActive
                ? 'text-[#ff6633]'
                : 'text-navy-600 hover:text-navy-800 hover:bg-navy-50'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold',
                  isActive
                    ? 'bg-[#fff1ec] text-[#ff6633]'
                    : 'bg-navy-100 text-navy-500'
                )}
              >
                {tab.count}
              </span>
            )}
            {/* Active underline */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff6633] rounded-t-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
