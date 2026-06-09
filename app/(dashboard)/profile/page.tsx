'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Plus, Check, Loader2, X, Trash2 } from 'lucide-react'
import ProfileCompletionCard from '@/components/profile/ProfileCompletionCard'

interface Education {
  id?: string
  level?: string
  university?: string
  field_of_study?: string
  start_date?: string | null
  end_date?: string | null
}

interface Employment {
  id?: string
  company?: string
  designation?: string
  start_date?: string | null
  end_date?: string | null
  is_current?: boolean
}

interface UserProfile {
  id: string
  name: string
  email: string
  mobile?: string
  visa_status?: string
  preferred_role?: string
  resume_url?: string
  visible_to_employers?: boolean
  consent_at?: string
}

// Values match the DB CHECK constraint on users.visa_status.
const VISA_OPTIONS = [
  { value: 'F-1', label: 'F-1' },
  { value: 'OPT', label: 'OPT (F-1)' },
  { value: 'H-1B', label: 'H-1B' },
  { value: 'other', label: 'Other' },
]
const ROLE_OPTIONS = [
  'Software Engineer',
  'Backend Engineer',
  'Frontend Engineer',
  'Full-Stack Engineer',
  'ML Engineer',
  'Other',
]

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [education, setEducation] = useState<Education[]>([])
  const [employment, setEmployment] = useState<Employment[]>([])
  const [serverCompletion, setServerCompletion] = useState<number | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [parsedResume, setParsedResume] = useState<{ education: Education[]; employment: Employment[] } | null>(null)
  const [showEduModal, setShowEduModal] = useState(false)
  const [showEmpModal, setShowEmpModal] = useState(false)
  const [newEdu, setNewEdu] = useState<Record<string, string>>({})
  const [newEmp, setNewEmp] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        setProfile(data.user)
        setEducation(data.education ?? [])
        setEmployment(data.employment ?? [])
        setServerCompletion(data.completion?.percent ?? null)
      })
      .catch(console.error)
      .finally(() => setLoaded(true))
  }, [])

  // Merge saved fields locally — never replace the whole profile with an
  // undefined response (that was collapsing the page into a spinner).
  const handleSave = async (fields: Partial<UserProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...fields } : prev))
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.user) setProfile(data.user)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleResumeUpload = async (file: File) => {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('resume', file)
      const res = await fetch('/api/profile/resume', { method: 'POST', body: form })
      if (res.ok) {
        const data = await res.json()
        setParsedResume(data.parsed)
        setProfile((prev) => (prev ? { ...prev, resume_url: data.resume_url } : prev))
      }
    } finally {
      setUploading(false)
    }
  }

  const handleConfirmParsed = async () => {
    if (!parsedResume) return
    const [eduRes, empRes] = await Promise.all([
      parsedResume.education?.length
        ? fetch('/api/user/education', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entries: parsedResume.education }),
          }).then((r) => r.json())
        : Promise.resolve({ education: [] }),
      parsedResume.employment?.length
        ? fetch('/api/user/employment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entries: parsedResume.employment }),
          }).then((r) => r.json())
        : Promise.resolve({ employment: [] }),
    ])
    if (eduRes.education?.length) setEducation((prev) => [...eduRes.education, ...prev])
    if (empRes.employment?.length) setEmployment((prev) => [...empRes.employment, ...prev])
    setParsedResume(null)
  }

  const addEducation = async () => {
    const entry: Education = {
      university: newEdu.university,
      level: newEdu.level,
      field_of_study: newEdu.field_of_study,
      start_date: newEdu.start_year ? `${newEdu.start_year}-01-01` : null,
      end_date: newEdu.end_year ? `${newEdu.end_year}-01-01` : null,
    }
    const res = await fetch('/api/user/education', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.education?.length) setEducation((prev) => [...data.education, ...prev])
    }
    setShowEduModal(false)
    setNewEdu({})
  }

  const addEmployment = async () => {
    const entry: Employment = {
      company: newEmp.company,
      designation: newEmp.designation,
      start_date: newEmp.start_date ? `${newEmp.start_date}-01` : null,
      end_date: newEmp.end_date ? `${newEmp.end_date}-01` : null,
    }
    const res = await fetch('/api/user/employment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.employment?.length) setEmployment((prev) => [...data.employment, ...prev])
    }
    setShowEmpModal(false)
    setNewEmp({})
  }

  const deleteEducation = async (id?: string) => {
    if (!id) return
    setEducation((prev) => prev.filter((e) => e.id !== id))
    await fetch(`/api/user/education?id=${id}`, { method: 'DELETE' })
  }

  const deleteEmployment = async (id?: string) => {
    if (!id) return
    setEmployment((prev) => prev.filter((e) => e.id !== id))
    await fetch(`/api/user/employment?id=${id}`, { method: 'DELETE' })
  }

  const toggleVisibility = () => {
    handleSave({ visible_to_employers: !profile?.visible_to_employers })
  }

  const localCompletion = (() => {
    if (!profile) return 0
    let pct = 0
    if (profile.visa_status && profile.preferred_role) pct += 30
    if (profile.resume_url) pct += 25
    if (education.length > 0) pct += 15
    if (employment.length > 0) pct += 15
    if (profile.mobile) pct += 10
    if (profile.consent_at) pct += 5
    return pct
  })()
  const completion = serverCompletion ?? localCompletion

  if (!loaded || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#ff6633] animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0F172A]">Your Profile</h1>
        {saving && (
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
          </span>
        )}
      </div>

      <ProfileCompletionCard completionPercent={completion} />

      {/* Avatar */}
      <div id="profile-details" className="bg-white rounded-2xl border border-slate-100 p-6 scroll-mt-6">
        <h2 className="font-semibold text-[#0F172A] mb-4">Photo</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-xl font-bold text-[#ff6633]">
            {profile.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-[#0F172A]">{profile.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">Profile photo coming soon</p>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-[#0F172A] mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Name</label>
            <input
              type="text"
              defaultValue={profile.name}
              onBlur={(e) => e.target.value !== profile.name && handleSave({ name: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6633]/20 focus:border-[#ff6633]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={profile.email}
              readOnly
              className="mt-1 w-full px-3 py-2 border border-slate-100 rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Mobile</label>
            <input
              type="tel"
              defaultValue={profile.mobile ?? ''}
              onBlur={(e) => e.target.value !== (profile.mobile ?? '') && handleSave({ mobile: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6633]/20 focus:border-[#ff6633]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Visa Status</label>
              <select
                value={profile.visa_status ?? ''}
                onChange={(e) => handleSave({ visa_status: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6633]/20 focus:border-[#ff6633]"
              >
                <option value="">Select…</option>
                {VISA_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Target Role</label>
              <select
                value={profile.preferred_role ?? ''}
                onChange={(e) => handleSave({ preferred_role: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6633]/20 focus:border-[#ff6633]"
              >
                <option value="">Select…</option>
                {ROLE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Resume */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-[#0F172A] mb-4">Resume</h2>

        {profile.resume_url && (
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#ff6633]/10 rounded-lg flex items-center justify-center">
                <Upload className="w-4 h-4 text-[#ff6633]" />
              </div>
              <span className="text-sm font-medium text-[#0F172A]">Resume uploaded</span>
            </div>
            <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#ff6633] hover:underline">
              View
            </a>
          </div>
        )}

        <div
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) handleResumeUpload(file)
          }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#ff6633]/40 hover:bg-orange-50/20 transition-all"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-[#ff6633] animate-spin mx-auto mb-2" />
          ) : (
            <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          )}
          <p className="text-sm text-slate-500">
            {uploading ? 'Uploading & parsing…' : 'Drop your resume here or click to upload'}
          </p>
          <p className="text-xs text-slate-400 mt-1">PDF, DOCX up to 5MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleResumeUpload(file)
          }}
        />

        {parsedResume && (
          <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl">
            <p className="text-sm font-semibold text-green-700 mb-2">Resume parsed successfully</p>
            <p className="text-xs text-green-600 mb-3">
              Found {parsedResume.education?.length ?? 0} education and {parsedResume.employment?.length ?? 0} employment entries.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmParsed}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Confirm & Save
              </button>
              <button
                onClick={() => setParsedResume(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Education */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#0F172A]">Education</h2>
          <button
            onClick={() => setShowEduModal(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#ff6633] hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        {education.length === 0 ? (
          <p className="text-sm text-slate-400">No education entries yet</p>
        ) : (
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{edu.university}</p>
                  <p className="text-xs text-slate-500">
                    {[edu.level, edu.field_of_study].filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-xs text-slate-400">
                    {edu.start_date?.slice(0, 4)} – {edu.end_date?.slice(0, 4) ?? 'Present'}
                  </p>
                </div>
                <button onClick={() => deleteEducation(edu.id)} className="text-slate-300 hover:text-red-500 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Employment */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#0F172A]">Work Experience</h2>
          <button
            onClick={() => setShowEmpModal(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#ff6633] hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        {employment.length === 0 ? (
          <p className="text-sm text-slate-400">No employment entries yet</p>
        ) : (
          <div className="space-y-3">
            {employment.map((emp) => (
              <div key={emp.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{emp.designation}</p>
                  <p className="text-xs text-slate-500">{emp.company}</p>
                  <p className="text-xs text-slate-400">
                    {emp.start_date?.slice(0, 7)} – {emp.is_current ? 'Present' : emp.end_date?.slice(0, 7) ?? '—'}
                  </p>
                </div>
                <button onClick={() => deleteEmployment(emp.id)} className="text-slate-300 hover:text-red-500 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visibility toggle */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#0F172A]">Visible to Employers</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {profile.visible_to_employers && profile.consent_at
                ? `Enabled on ${new Date(profile.consent_at).toLocaleDateString()}`
                : 'Allow employers to find your profile'}
            </p>
          </div>
          <button
            onClick={toggleVisibility}
            aria-label="Toggle employer visibility"
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
              profile.visible_to_employers ? 'bg-[#ff6633]' : 'bg-slate-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                profile.visible_to_employers ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Education Modal */}
      {showEduModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-[#0F172A] mb-4">Add Education</h3>
            <div className="space-y-3">
              {[
                { label: 'University', key: 'university', type: 'text' },
                { label: 'Degree / Level', key: 'level', type: 'text' },
                { label: 'Field of Study', key: 'field_of_study', type: 'text' },
                { label: 'Start Year', key: 'start_year', type: 'number' },
                { label: 'End Year', key: 'end_year', type: 'number' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-slate-500">{f.label}</label>
                  <input
                    type={f.type}
                    onChange={(e) => setNewEdu((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#ff6633]"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowEduModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={addEducation}
                className="flex-1 px-4 py-2 bg-[#ff6633] text-white font-semibold rounded-lg text-sm cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employment Modal */}
      {showEmpModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-[#0F172A] mb-4">Add Employment</h3>
            <div className="space-y-3">
              {[
                { label: 'Company', key: 'company', type: 'text' },
                { label: 'Title', key: 'designation', type: 'text' },
                { label: 'Start Date', key: 'start_date', type: 'month' },
                { label: 'End Date', key: 'end_date', type: 'month' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-slate-500">{f.label}</label>
                  <input
                    type={f.type}
                    onChange={(e) => setNewEmp((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#ff6633]"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowEmpModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={addEmployment}
                className="flex-1 px-4 py-2 bg-[#ff6633] text-white font-semibold rounded-lg text-sm cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
