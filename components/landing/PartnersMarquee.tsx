'use client'

// All logos are local files in /public/logos/
const ALL_LOGOS = [
  { name: 'Google',     src: '/logos/google.png' },
  { name: 'Amazon',     src: '/logos/amazon.png' },
  { name: 'Microsoft',  src: '/logos/microsoft.png' },
  { name: 'Meta',       src: '/logos/meta.png' },
  { name: 'Stripe',     src: '/logos/stripe.png' },
  { name: 'Walmart',    src: '/logos/walmart.png' },
  { name: 'Airbnb',     src: '/logos/airbnb.png' },
  { name: 'Anthropic',  src: '/logos/anthropic.png' },
  { name: 'Databricks', src: '/logos/databricks.png' },
  { name: 'Datadog',    src: '/logos/datadog.webp' },
  { name: 'Roblox',     src: '/logos/roblox.webp' },
]

// Split into two rows, interleaved so each row looks different
const ROW_ONE = ALL_LOGOS.filter((_, i) => i % 2 === 0)   // Google, Microsoft, Stripe, Airbnb, Databricks, Roblox
const ROW_TWO = ALL_LOGOS.filter((_, i) => i % 2 !== 0)   // Amazon, Meta, Walmart, Anthropic, Datadog

function LogoPill({ name, src }: { name: string; src: string }) {
  return (
    <div className="flex-none flex items-center justify-center px-7 py-3 bg-white rounded-2xl mx-2 h-[60px] min-w-[160px]">
      <img
        src={src}
        alt={`${name} logo`}
        className="max-h-[30px] w-auto max-w-[150px] object-contain"
        loading="lazy"
      />
    </div>
  )
}

function MarqueeRow({ items, reverse }: { items: typeof ROW_ONE; reverse?: boolean }) {
  // Triple the items so the loop is seamless even on wide screens
  const repeated = [...items, ...items, ...items]
  return (
    <div className="flex overflow-hidden marquee-pause" aria-hidden="true">
      <div
        className={`flex ${reverse ? 'animate-marquee-slow' : 'animate-marquee'}`}
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        {repeated.map((c, i) => (
          <LogoPill key={`${c.name}-${i}`} name={c.name} src={c.src} />
        ))}
      </div>
    </div>
  )
}

interface PartnersMarqueeProps {
  jobCount: number
  companyCount: number
}

export default function PartnersMarquee({ jobCount, companyCount }: PartnersMarqueeProps) {
  return (
    <section className="relative bg-[#131310] text-white py-20 sm:py-28 overflow-hidden" aria-label="Hiring partners">
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-16 items-start mb-16">
          {/* Left */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6633]" aria-hidden="true" />
              <span className="text-[#ff6633] text-xs font-bold tracking-[0.2em] uppercase">
                Hiring Partners
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.08] tracking-tight">
              The companies that{' '}
              <span className="font-serif-accent text-[#ff6633]">actually</span> sponsor.
            </h2>
          </div>

          {/* Right */}
          <div className="lg:pt-2">
            <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-xl">
              Every employer on Home Base has a verified H-1B sponsorship track record drawn from
              official USCIS and DOL filings — no guesswork, no dead-end applications.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: `${jobCount.toLocaleString()}+`, label: 'Sponsored roles live now' },
                { value: `${companyCount}`,               label: 'Verified sponsor companies' },
                { value: 'Gov.',                          label: 'USCIS + DOL verified data' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl sm:text-4xl font-bold text-[#ff6633] tracking-tight">{stat.value}</p>
                  <p className="text-white/50 text-sm mt-1.5 leading-snug">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Marquee rows — full bleed */}
      <div className="relative space-y-3">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-[#131310] to-transparent z-10" aria-hidden="true" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-[#131310] to-transparent z-10" aria-hidden="true" />
        <MarqueeRow items={ROW_ONE} />
        <MarqueeRow items={ROW_TWO} reverse />
      </div>
    </section>
  )
}
