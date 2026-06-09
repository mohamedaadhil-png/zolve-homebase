'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react'

const STORAGE_KEY = 'zolve_waitlist_joined'

const STATUS_OPTIONS = [
  { value: 'student', label: 'Student', hint: 'Enrolled in a US university' },
  { value: 'wp', label: 'Working Professional', hint: 'Currently employed in the US' },
  { value: 'dependent', label: 'Dependent', hint: 'On a dependent visa (H-4, F-2)' },
] as const

type Status = (typeof STATUS_OPTIONS)[number]['value']

export default function WaitlistForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [joined, setJoined] = useState(false)

  // Returning visitors who already joined see the success state straight away.
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) {
      setJoined(true)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !status) {
      setError('Please fill in every field.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, status }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }
      localStorage.setItem(STORAGE_KEY, '1')
      setJoined(true)
    } catch {
      setError('Network error. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <section id="waitlist" className="bg-navy py-24 scroll-mt-20" aria-label="Join the waitlist">
      <div className="max-w-2xl mx-auto px-6">
        {joined ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#ff6633]/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#ff6633]" aria-hidden="true" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">You&apos;re on the list! 🎉</h2>
            <p className="text-navy-200 text-lg leading-relaxed">
              Thank you for joining the Zolve Home Base waitlist. We&apos;ll email you the moment
              early access opens — keep an eye on your inbox.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Be first in line for <span className="text-[#ff6633]">early access</span>
              </h2>
              <p className="text-navy-200 text-lg">
                Join the waitlist and we&apos;ll let you know the moment Home Base goes live.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 space-y-5">
              <div>
                <label htmlFor="wl-name" className="block text-sm font-semibold text-navy mb-1.5">
                  Full name
                </label>
                <input
                  id="wl-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 border border-navy-200 rounded-xl text-navy text-sm outline-none focus:border-[#ff6633] focus:ring-1 focus:ring-[#ff6633] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="wl-email" className="block text-sm font-semibold text-navy mb-1.5">
                  Email
                </label>
                <input
                  id="wl-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-navy-200 rounded-xl text-navy text-sm outline-none focus:border-[#ff6633] focus:ring-1 focus:ring-[#ff6633] transition-colors"
                />
              </div>

              <div>
                <span className="block text-sm font-semibold text-navy mb-1.5">What best describes you?</span>
                <div className="grid sm:grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setStatus(opt.value)}
                      className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                        status === opt.value
                          ? 'border-[#ff6633] bg-[#fff1ec]'
                          : 'border-navy-200 hover:border-navy-400'
                      }`}
                    >
                      <span className="block text-sm font-semibold text-navy">{opt.label}</span>
                      <span className="block text-xs text-navy-400 mt-0.5">{opt.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#ff6633] hover:bg-[#e5572b] text-white font-bold rounded-xl transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Joining…
                  </>
                ) : (
                  <>
                    Join the waitlist <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </>
                )}
              </button>
              <p className="text-center text-navy-400 text-xs">
                Free · No spam · We&apos;ll only email you about early access
              </p>
            </form>
          </>
        )}
      </div>
    </section>
  )
}
