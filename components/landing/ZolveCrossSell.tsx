'use client'

import { CreditCard, Landmark, Send, ArrowUpRight } from 'lucide-react'

const PRODUCTS = [
  {
    icon: CreditCard,
    name: 'Zolve Credit Card',
    desc: 'Build U.S. credit from day one — no SSN or credit history required.',
    href: 'https://www.zolve.com/credit-card',
    accent: 'from-[#ff6633] to-[#ff8c5a]',
    cta: 'Apply free',
  },
  {
    icon: Landmark,
    name: 'Zolve Checking Account',
    desc: 'A high-yield U.S. checking account you can open before you even land.',
    href: 'https://www.zolve.com/checking-account',
    accent: 'from-navy to-navy-700',
    cta: 'Open account',
  },
  {
    icon: Send,
    name: 'Zolve Remittance',
    desc: 'Send money home at great rates with fast, transparent transfers.',
    href: 'https://www.zolve.com/remittance',
    accent: 'from-emerald-500 to-emerald-600',
    cta: 'Send money',
  },
]

export default function ZolveCrossSell() {
  return (
    <section className="bg-navy text-white py-20 sm:py-28 relative overflow-hidden" aria-label="Zolve products">
      {/* glow */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#ff6633]/10 blur-[120px] rounded-full"
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6633]" aria-hidden="true" />
            <span className="text-[#ff6633] text-xs font-bold tracking-[0.2em] uppercase">
              The Zolve Ecosystem
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.08] tracking-tight mb-5">
            More than a job board.{' '}
            <span className="font-serif-accent text-[#ff6633]">Your U.S. launchpad.</span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Home Base is part of Zolve — the financial platform that helps global citizens set up
            their U.S. life from the very first day.
          </p>
        </div>

        {/* Product cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {PRODUCTS.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-white/[0.04] border border-white/10 rounded-3xl p-7 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200 cursor-pointer flex flex-col"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.accent} flex items-center justify-center mb-6`}
              >
                <p.icon className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-2">{p.name}</h3>
              <p className="text-white/55 text-sm leading-relaxed mb-8 flex-1">{p.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-[#ff6633] font-semibold text-sm group-hover:gap-2.5 transition-all duration-200">
                {p.cta}
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>

        {/* Footnote */}
        <p className="text-center text-white/40 text-sm mt-10">
          Trusted by 750,000+ global citizens building their financial life in the U.S.
        </p>
      </div>
    </section>
  )
}
