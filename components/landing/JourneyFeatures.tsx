'use client'

import { Search, BadgeCheck, Compass } from 'lucide-react'

const FEATURES = [
  {
    icon: Search,
    title: 'Search with confidence',
    desc: 'Filter thousands of live SWE roles by visa friendliness, seniority, and remote status — every listing tied to a real sponsor.',
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=70',
    alt: 'Team collaborating at a laptop',
  },
  {
    icon: BadgeCheck,
    title: 'Verify before you apply',
    desc: "Check any employer's approval rate, years sponsoring, and role-level grades — sourced straight from federal disclosure data.",
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=70',
    alt: 'Person reviewing data on a screen',
  },
  {
    icon: Compass,
    title: 'Navigate your journey',
    desc: 'From OPT to H-1B to green card, Home Base keeps your profile, applications, and timelines organized in one place.',
    image:
      'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=800&q=70',
    alt: 'Professional planning a career path',
  },
]

export default function JourneyFeatures() {
  return (
    <section className="bg-[#F4F7F4] py-20 sm:py-28" aria-label="How it works">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy leading-[1.08] tracking-tight mb-5">
            Built around your{' '}
            <span className="font-serif-accent text-[#ff6633]">visa journey</span>
          </h2>
          <p className="text-navy-600 text-lg leading-relaxed">
            From your first OPT application to your H-1B approval, every step is designed to put
            verified, sponsor-friendly opportunities within reach.
          </p>
        </div>

        {/* Columns */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div className="w-11 h-11 rounded-xl bg-[#ff6633] flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">{f.title}</h3>
              <p className="text-navy-600 text-sm leading-relaxed mb-6">{f.desc}</p>
              <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-navy-100">
                <img
                  src={f.image}
                  alt={f.alt}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
