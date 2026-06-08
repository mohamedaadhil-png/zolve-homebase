'use client'

import { Clock, DollarSign, Star, Lock } from 'lucide-react'

const SERVICES = [
  { title: 'Resume Review', duration: '30 min', price: 49, popular: false, desc: 'ATS-optimized resume tailored for US tech roles' },
  { title: 'Mock Interviews', duration: '60 min', price: 99, popular: false, desc: 'Technical + behavioral prep with industry experts' },
  { title: 'Career Strategy Session', duration: '45 min', price: 79, popular: true, desc: 'Personalized roadmap for your US tech career' },
  { title: 'OPT / H-1B Guidance', duration: '45 min', price: 69, popular: false, desc: 'Navigate visa timelines and employer strategies' },
  { title: 'Salary Negotiation', duration: '30 min', price: 59, popular: false, desc: 'Maximize your offer with data-backed strategies' },
  { title: 'Networking Strategy', duration: '45 min', price: 69, popular: true, desc: 'Build the right connections to land referrals' },
]

export default function UpskillCarousel() {
  return (
    <section className="py-20 bg-white overflow-hidden" aria-label="Upskill services">
      <div className="max-w-6xl mx-auto px-6 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy-100 rounded-full text-navy-700 text-xs font-semibold mb-4">
          Coming Soon
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-3">
          Accelerate your career with expert support
        </h2>
        <p className="text-navy-600 text-lg">
          One-on-one sessions with professionals who&apos;ve navigated the same path.
        </p>
      </div>

      {/* Auto-scroll carousel wrapper */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 px-6 max-w-6xl mx-auto scrollbar-none snap-x snap-mandatory">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="flex-none w-64 snap-start bg-navy-50 border border-navy-200 rounded-2xl p-5"
            >
              {service.popular && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#fff1ec] text-[#ff6633] text-xs font-semibold rounded-full border border-[#ff6633]/20 mb-3">
                  <Star className="w-3 h-3 fill-[#ff6633]" aria-hidden="true" />
                  Popular
                </div>
              )}
              <h3 className="font-bold text-navy text-base mb-1.5">{service.title}</h3>
              <p className="text-navy-600 text-sm leading-snug mb-4">{service.desc}</p>
              <div className="flex items-center gap-3 text-navy-500 text-sm mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {service.duration}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" aria-hidden="true" />
                  ${service.price}
                </span>
              </div>
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-navy-200 text-navy-500 font-semibold text-sm rounded-xl cursor-not-allowed"
                aria-label="Join to book — coming soon"
              >
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                Join to Book
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8">
        <button
          disabled
          className="inline-flex items-center gap-2 px-6 py-3 bg-navy-100 text-navy-500 font-semibold rounded-xl cursor-not-allowed"
        >
          <Lock className="w-4 h-4" aria-hidden="true" />
          Enroll to unlock sessions
        </button>
      </div>
    </section>
  )
}
