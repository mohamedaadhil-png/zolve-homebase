'use client'

// Real recruiter logos via Clearbit. Two rows scrolling in opposite directions.
const ROW_ONE = [
  { name: 'Databricks', domain: 'databricks.com' },
  { name: 'Stripe', domain: 'stripe.com' },
  { name: 'Anthropic', domain: 'anthropic.com' },
  { name: 'Airbnb', domain: 'airbnb.com' },
  { name: 'Roblox', domain: 'roblox.com' },
  { name: 'Pinterest', domain: 'pinterest.com' },
  { name: 'Figma', domain: 'figma.com' },
  { name: 'Cloudflare', domain: 'cloudflare.com' },
  { name: 'Reddit', domain: 'reddit.com' },
]
const ROW_TWO = [
  { name: 'DoorDash', domain: 'doordash.com' },
  { name: 'Discord', domain: 'discord.com' },
  { name: 'Dropbox', domain: 'dropbox.com' },
  { name: 'Datadog', domain: 'datadoghq.com' },
  { name: 'Affirm', domain: 'affirm.com' },
  { name: 'Robinhood', domain: 'robinhood.com' },
  { name: 'Twilio', domain: 'twilio.com' },
  { name: 'GitLab', domain: 'gitlab.com' },
  { name: 'Instacart', domain: 'instacart.com' },
]

function LogoPill({ name, domain }: { name: string; domain: string }) {
  return (
    <div className="flex-none flex items-center gap-2.5 px-6 py-3.5 bg-white rounded-2xl mx-2 min-w-[180px] justify-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={`${name} logo`}
        className="w-6 h-6 object-contain"
        loading="lazy"
        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
      />
      <span className="font-semibold text-navy text-[15px] whitespace-nowrap">{name}</span>
    </div>
  )
}

function MarqueeRow({ items, reverse }: { items: typeof ROW_ONE; reverse?: boolean }) {
  const doubled = [...items, ...items]
  return (
    <div className="flex overflow-hidden marquee-pause" aria-hidden="true">
      <div
        className={`flex ${reverse ? 'animate-marquee-slow' : 'animate-marquee'}`}
        style={reverse ? { flexDirection: 'row-reverse' } : undefined}
      >
        {doubled.map((c, i) => (
          <LogoPill key={`${c.name}-${i}`} name={c.name} domain={c.domain} />
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
      {/* subtle grid texture */}
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
          {/* Left: eyebrow */}
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

          {/* Right: subtext + stats */}
          <div className="lg:pt-2">
            <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-xl">
              Every employer on Home Base has a verified H-1B sponsorship track record drawn from
              official USCIS and DOL filings — no guesswork, no dead-end applications.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: `${jobCount.toLocaleString()}+`, label: 'Sponsored roles live now' },
                { value: `${companyCount}`, label: 'Verified sponsor companies' },
                { value: 'Gov.', label: 'USCIS + DOL verified data' },
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

      {/* Logo marquees — full bleed */}
      <div className="relative space-y-3">
        {/* edge fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-[#131310] to-transparent z-10" aria-hidden="true" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-[#131310] to-transparent z-10" aria-hidden="true" />
        <MarqueeRow items={ROW_ONE} />
        <MarqueeRow items={ROW_TWO} reverse />
      </div>
    </section>
  )
}
