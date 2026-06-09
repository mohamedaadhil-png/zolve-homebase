'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { ROLE_CATEGORY_LABELS, type RoleCategory } from '@/lib/pipeline/classifier'
import { US_STATE_LABELS } from '@/lib/pipeline/location'
import { ChevronDown, Check, X, Search } from 'lucide-react'

export interface JobFilters {
  role: string[]
  state: string[]
  visaType: string[]
  jobType: string[]
  experience: string[]
  remote: string
}

interface StateOption {
  state: string
  count: number
}

interface FilterBarProps {
  filters: JobFilters
  onChange: (filters: JobFilters) => void
  stateOptions: StateOption[]
  className?: string
}

const ROLE_ENTRIES = Object.entries(ROLE_CATEGORY_LABELS) as [RoleCategory, string][]
const VISA_TYPES = ['H-1B Sponsor', 'OPT-friendly', 'CPT', 'Green Card']
const JOB_TYPES = ['Full-time', 'Internship', 'Part-time', 'Contract']
const EXPERIENCE_LEVELS = ['Intern', 'New Grad', 'Junior', 'Mid', 'Senior', 'Staff']
const REMOTE_OPTIONS = ['Any', 'Remote', 'Hybrid', 'Onsite']

interface Option {
  value: string
  label: string
  hint?: string
}

/** A single dropdown trigger + popover. */
function Dropdown({
  label,
  activeCount,
  children,
  width = 'w-60',
}: {
  label: string
  activeCount: number
  children: (close: () => void) => React.ReactNode
  width?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors duration-150 cursor-pointer',
          activeCount > 0
            ? 'border-[#ff6633] bg-[#fff1ec] text-[#ff6633]'
            : 'border-navy-200 bg-white text-navy-700 hover:border-navy-300'
        )}
      >
        {label}
        {activeCount > 0 && (
          <span className="text-[10px] font-bold text-white bg-[#ff6633] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center leading-none">
            {activeCount}
          </span>
        )}
        <ChevronDown className={cn('w-4 h-4 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          className={cn(
            'absolute left-0 top-full mt-2 z-30 bg-white border border-navy-200 rounded-xl shadow-xl p-1.5',
            width
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

/** Checkbox-style option row. */
function OptionRow({
  label,
  hint,
  checked,
  onClick,
}: {
  label: string
  hint?: string
  checked: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-navy-50 cursor-pointer transition-colors duration-100"
    >
      <span
        className={cn(
          'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
          checked ? 'bg-[#ff6633] border-[#ff6633]' : 'border-navy-300'
        )}
      >
        {checked && <Check className="w-3 h-3 text-white" />}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm text-navy-800 truncate">{label}</span>
      </span>
      {hint && <span className="text-xs text-navy-400">{hint}</span>}
    </button>
  )
}

function MultiDropdown({
  label,
  options,
  selected,
  onChange,
  searchable,
}: {
  label: string
  options: Option[]
  selected: string[]
  onChange: (v: string[]) => void
  searchable?: boolean
}) {
  const [q, setQ] = useState('')
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])
  return (
    <Dropdown label={label} activeCount={selected.length}>
      {() => {
        const shown = searchable && q
          ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()))
          : options
        return (
          <>
            {searchable && (
              <div className="flex items-center gap-2 px-2 py-1.5 mb-1 border-b border-navy-100">
                <Search className="w-3.5 h-3.5 text-navy-400" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search…"
                  className="flex-1 text-sm outline-none text-navy-800 placeholder:text-navy-400"
                />
              </div>
            )}
            <div className="max-h-72 overflow-y-auto">
              {shown.map((o) => (
                <OptionRow
                  key={o.value}
                  label={o.label}
                  hint={o.hint}
                  checked={selected.includes(o.value)}
                  onClick={() => toggle(o.value)}
                />
              ))}
              {shown.length === 0 && (
                <p className="px-2.5 py-3 text-sm text-navy-400 text-center">No matches</p>
              )}
            </div>
            {selected.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="w-full mt-1 px-2.5 py-1.5 text-xs text-navy-500 hover:text-[#ff6633] cursor-pointer border-t border-navy-100"
              >
                Clear {label.toLowerCase()}
              </button>
            )}
          </>
        )
      }}
    </Dropdown>
  )
}

function SingleDropdown({
  label,
  options,
  selected,
  onChange,
  isActive,
}: {
  label: string
  options: string[]
  selected: string
  onChange: (v: string) => void
  isActive: boolean
}) {
  return (
    <Dropdown label={label} activeCount={isActive ? 1 : 0} width="w-44">
      {(close) => (
        <div>
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onChange(o)
                close()
              }}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-sm cursor-pointer transition-colors duration-100',
                selected === o ? 'text-[#ff6633] font-medium bg-[#fff1ec]' : 'text-navy-800 hover:bg-navy-50'
              )}
            >
              {o}
              {selected === o && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  )
}

export default function FilterBar({ filters, onChange, stateOptions, className }: FilterBarProps) {
  const activeCount =
    filters.role.length +
    filters.state.length +
    filters.visaType.length +
    filters.jobType.length +
    filters.experience.length +
    (filters.remote !== 'Any' ? 1 : 0)

  const roleOpts: Option[] = ROLE_ENTRIES.map(([value, label]) => ({ value, label }))
  const stateOpts: Option[] = stateOptions.map((s) => ({
    value: s.state,
    label: US_STATE_LABELS[s.state] ?? s.state,
    hint: String(s.count),
  }))
  const toOpts = (arr: string[]): Option[] => arr.map((v) => ({ value: v, label: v }))

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <MultiDropdown label="Role" options={roleOpts} selected={filters.role}
        onChange={(v) => onChange({ ...filters, role: v })} />
      <MultiDropdown label="Location" options={stateOpts} selected={filters.state}
        onChange={(v) => onChange({ ...filters, state: v })} searchable />
      <MultiDropdown label="Experience" options={toOpts(EXPERIENCE_LEVELS)} selected={filters.experience}
        onChange={(v) => onChange({ ...filters, experience: v })} />
      <MultiDropdown label="Job Type" options={toOpts(JOB_TYPES)} selected={filters.jobType}
        onChange={(v) => onChange({ ...filters, jobType: v })} />
      <SingleDropdown label="Remote" options={REMOTE_OPTIONS} selected={filters.remote}
        isActive={filters.remote !== 'Any'} onChange={(v) => onChange({ ...filters, remote: v })} />
      <MultiDropdown label="Visa" options={toOpts(VISA_TYPES)} selected={filters.visaType}
        onChange={(v) => onChange({ ...filters, visaType: v })} />
      {activeCount > 0 && (
        <button
          onClick={() => onChange({ role: [], state: [], visaType: [], jobType: [], experience: [], remote: 'Any' })}
          className="flex items-center gap-1 px-2.5 py-2 text-sm text-navy-500 font-medium hover:text-[#ff6633] cursor-pointer transition-colors duration-150"
        >
          <X className="w-3.5 h-3.5" /> Clear all
        </button>
      )}
    </div>
  )
}
