'use client'

import { cn } from '@/lib/utils'

export interface JobFilters {
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

const VISA_TYPES = ['H-1B Sponsor', 'OPT-friendly', 'CPT', 'Green Card']
const JOB_TYPES = ['Full-time', 'Internship', 'Part-time', 'Contract']
const EXPERIENCE_LEVELS = ['Intern', 'New Grad', 'Junior', 'Mid', 'Senior', 'Staff']
const REMOTE_OPTIONS = ['Any', 'Remote', 'Hybrid', 'Onsite']

function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-2.5">
        {label}
      </p>
      <div className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
              className="w-4 h-4 rounded border-navy-300 text-[#ff6633] cursor-pointer accent-[#ff6633]"
            />
            <span className="text-sm text-navy-700 group-hover:text-navy transition-colors duration-150">
              {opt}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

function RadioGroup({
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
      <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-2.5">
        {label}
      </p>
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="remote"
              value={opt}
              checked={selected === opt}
              onChange={() => onChange(opt)}
              className="w-4 h-4 border-navy-300 text-[#ff6633] cursor-pointer accent-[#ff6633]"
            />
            <span className="text-sm text-navy-700 group-hover:text-navy transition-colors duration-150">
              {opt}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default function FilterPanel({ filters, onChange, className }: FilterPanelProps) {
  const hasActiveFilters =
    filters.visaType.length > 0 ||
    filters.jobType.length > 0 ||
    filters.experience.length > 0 ||
    filters.remote !== 'Any'

  function clearAll() {
    onChange({
      visaType: [],
      jobType: [],
      experience: [],
      remote: 'Any',
    })
  }

  return (
    <div
      className={cn(
        'bg-white border border-navy-200 rounded-xl p-5 space-y-6',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy-800">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-[#ff6633] font-medium hover:text-[#e5572b] cursor-pointer transition-colors duration-150"
          >
            Clear All
          </button>
        )}
      </div>

      <CheckboxGroup
        label="Visa Type"
        options={VISA_TYPES}
        selected={filters.visaType}
        onChange={(v) => onChange({ ...filters, visaType: v })}
      />

      <div className="border-t border-navy-100" />

      <CheckboxGroup
        label="Job Type"
        options={JOB_TYPES}
        selected={filters.jobType}
        onChange={(v) => onChange({ ...filters, jobType: v })}
      />

      <div className="border-t border-navy-100" />

      <CheckboxGroup
        label="Experience"
        options={EXPERIENCE_LEVELS}
        selected={filters.experience}
        onChange={(v) => onChange({ ...filters, experience: v })}
      />

      <div className="border-t border-navy-100" />

      <RadioGroup
        label="Remote"
        options={REMOTE_OPTIONS}
        selected={filters.remote}
        onChange={(v) => onChange({ ...filters, remote: v })}
      />
    </div>
  )
}
