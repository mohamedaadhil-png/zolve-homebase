import { ShieldCheck } from 'lucide-react'
import Link from 'next/link'

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

const LINKS: Record<string, FooterLink[]> = {
  Product: [
    { label: 'Browse Jobs', href: '/jobs' },
    { label: 'Sponsor Directory', href: '/sponsor-directory' },
    { label: 'Upskill (Soon)', href: '/upskill' },
    { label: 'Networking (Soon)', href: '/networking' },
  ],
  Company: [
    { label: 'About', href: 'https://www.zolve.com/about-us', external: true },
    { label: 'Blog', href: 'https://zolve.com/blog/', external: true },
    { label: 'Careers', href: 'https://zolve.freshteam.com/jobs', external: true },
    { label: 'Contact', href: 'https://www.zolve.com/help', external: true },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/privacy#cookies' },
  ],
}

export default function FooterSection() {
  return (
    <footer className="bg-[#131310] border-t border-white/10" aria-label="Footer">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-white font-bold text-xl tracking-tight">ZOLVE</span>
              <span className="text-[#ff6633] font-semibold text-sm">Home Base</span>
            </div>
            <p className="text-navy-400 text-sm leading-relaxed mb-4">
              Government-verified H-1B sponsorship data for international tech professionals in the US.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>Powered by USCIS + DOL data</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <p className="text-white font-semibold text-sm mb-4">{section}</p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-navy-400 hover:text-white text-sm transition-colors duration-150 cursor-pointer"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-navy-400 hover:text-white text-sm transition-colors duration-150 cursor-pointer"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-navy-500 text-sm">
            © {new Date().getFullYear()} Zolve. All rights reserved.
          </p>
          <p className="text-navy-500 text-xs">
            Data sourced from USCIS H-1B Employer Data Hub & DOL OFLC. Updated quarterly.
          </p>
        </div>
      </div>
    </footer>
  )
}
