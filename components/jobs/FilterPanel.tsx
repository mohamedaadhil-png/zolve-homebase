'use client'

import { cn } from '@/lib/utils'
import { ROLE_CATEGORY_LABELS, type RoleCategory } from '@/lib/pipeline/classifier'
import { SlidersHorizontal, X } from 'lucide-react'

export interface JobFilters {
  role: string[]
  visaType: string[]
  jobType: string[]
  experience: string[]
  remote: string
}

interface FilterPanelProps {
  filters: JobFilters
  onChange: (filters: JobFilters) => void
  className?: string
}

const ROLE_ENTRIES = Object.entries(ROLE_CATEGORY_LABELS) as [RoleCategory, string][]
const VISA_TYPES = ['H-1B Sponsor', 'OPT-friendly', 'CPT', 'Green Card']
const JOB_TYPES = ['Full-time', 'Internship', 'Part-time', 'Contract']
const EXPERIENCE_LEVELS = ['Intern', 'New Grad', 'Junior', 'Mid', 'Senior', 'Staff']
const REMOTE_OPTIONS = ['Any', 'Remote', 'Hybrid', 'Onsite']

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer',
        active
          ? 'bg-[#ff6633] border-[#ff6633] text-white shadow-sm'
          : 'bg-white border-navy-200 text-navy-600 hover:border-[#ff6633]/50 hover:text-navy-900 hover:bg-[#fff1ec]'
      )}
    >
      {label}
    </button>
  )
}

/** Section header with an optional selected-count badge. */
function GroupLabel({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <p className="text-[11px] font-semibold text-navy-500 uppercase tracking-wider">{label}</p>
      {!!count && (
        <span className="text-[10px] font-bold text-[#ff6633] bg-[#fff1ec] rounded-full px-1.5 py-0.5 leading-none">
          {count}
        </span>
      )}
    </div>
  )
}

/** Multi-select chip group. Options can be {value,label} or a plain string. */
function ChipGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: Array<{ value: string; label: string }>
  selected: string[]
  onChange: (values: string[]) => void
}) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])
  return (
    <div>
      <GroupLabel label={label} count={selected.length} />
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            active={selected.includes(opt.value)}
            onClick={() => toggle(opt.value)}
          />
        ))}
      </div>
    </div>
  )
}

/** Single-select chip group (e.g. Remote). */
function SingleChipGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <GroupLabel label={label} />
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Chip key={opt} label={opt} active={selected === opt} onClick={() => onChange(opt)} />
        ))}
      </div>
    </div>
  )
}

const asOptions = (arr: string[]) => arr.map((v) => ({ value: v, label: v }))

export default function FilterPanel({ filters, onChange, className }: FilterPanelProps) {
  const activeCount =
    filters.role.length +
    filters.visaType.length +
    filters.jobType.length +
    filters.experience.length +
    (filters.remote !== 'Any' ? 1 : 0)

  function clearAll() {
    onChange({ role: [], visaType: [], jobType: [], experience: [], remote: 'Any' })
  }

  return (
    <div
      className={cn(
        'bg-white border border-navy-200 rounded-2xl overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-navy-100 bg-navy-50/50">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-navy-500" />
          <h3 className="text-sm font-semibold text-navy-800">Filters</h3>
          {activeCount > 0 && (
            <span className="text-[10px] font-bold text-white bg-[#ff6633] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center leading-none">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-navy-500 font-medium hover:text-[#ff6633] cursor-pointer transition-colors duration-150"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Groups */}
      <div className="px-5 py-5 space-y-5 max-h-[calc(100vh-12rem)] overflow-y-auto">
        <ChipGroup
          label="Role"
          options={ROLE_ENTRIES.map(([value, label]) => ({ value, label }))}
          selected={filters.role}
          onChange={(v) => onChange({ ...filters, role: v })}
        />
        <div className="border-t border-navy-100" />
        <ChipGroup
          label="Visa Type"
          options={asOptions(VISA_TYPES)}
          selected={filters.visaType}
          onChange={(v) => onChange({ ...filters, visaType: v })}
        />
        <div className="border-t border-navy-100" />
        <ChipGroup
          label="Job Type"
          options={asOptions(JOB_TYPES)}
          selected={filters.jobType}
          onChange={(v) => onChange({ ...filters, jobType: v })}
        />
        <div className="border-t border-navy-100" />
        <ChipGroup
          label="Experience"
          options={asOptions(EXPERIENCE_LEVELS)}
          selected={filters.experience}
          onChange={(v) => onChange({ ...filters, experience: v })}
        />
        <div className="border-t border-navy-100" />
        <SingleChipGroup
          label="Remote"
          options={REMOTE_OPTIONS}
          selected={filters.remote}
          onChange={(v) => onChange({ ...filters, remote: v })}
        />
      </div>
    </div>
  )
}
