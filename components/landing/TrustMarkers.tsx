import { ShieldCheck } from 'lucide-react'

const SPONSOR_LOGOS = [
  { name: 'Databricks', domain: 'databricks.com' },
  { name: 'Stripe', domain: 'stripe.com' },
  { name: 'Anthropic', domain: 'anthropic.com' },
  { name: 'Airbnb', domain: 'airbnb.com' },
  { name: 'Roblox', domain: 'roblox.com' },
  { name: 'Pinterest', domain: 'pinterest.com' },
  { name: 'Figma', domain: 'figma.com' },
  { name: 'DoorDash', domain: 'doordash.com' },
  { name: 'Affirm', domain: 'affirm.com' },
  { name: 'Discord', domain: 'discord.com' },
]

function CompanyChip({ name, domain }: { name: string; domain: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-navy-200 rounded-xl">
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={`${name} logo`}
        className="w-6 h-6 object-contain"
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />
      <span className="text-navy-700 font-medium text-sm">{name}</span>
    </div>
  )
}

export default function TrustMarkers() {
  return (
    <section className="py-20 bg-navy-50 border-y border-navy-200" aria-label="Trust markers">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: sponsor logos */}
          <div>
            <p className="text-navy-500 text-sm font-semibold uppercase tracking-wider mb-4">
              Sponsoring Companies on Home Base
            </p>
            <div className="flex flex-wrap gap-3">
              {SPONSOR_LOGOS.map((c) => (
                <CompanyChip key={c.name} name={c.name} domain={c.domain} />
              ))}
            </div>
          </div>

          {/* Right: gov verified */}
          <div className="lg:pl-12 lg:border-l border-navy-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <ShieldCheck className="w-7 h-7 text-emerald-600" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold text-navy">US Government-Verified Data</h3>
            </div>
            <p className="text-navy-600 leading-relaxed mb-6">
              Every sponsor score is computed from official government records — not recruiter claims or
              user submissions. We process USCIS H-1B Employer Data and DOL OFLC LCA disclosures
              quarterly so you always have the freshest sponsorship picture.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 bg-white border border-navy-200 rounded-xl">
                <span className="text-2xl" aria-hidden="true">🏛️</span>
                <div>
                  <p className="font-semibold text-navy text-sm">USCIS H-1B Employer Data Hub</p>
                  <p className="text-navy-500 text-xs">Petition approvals & denials by employer, FY2009–present</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-navy-200 rounded-xl">
                <span className="text-2xl" aria-hidden="true">📋</span>
                <div>
                  <p className="font-semibold text-navy text-sm">DOL OFLC LCA Disclosure Data</p>
                  <p className="text-navy-500 text-xs">Labor condition applications with wages by role & location</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
