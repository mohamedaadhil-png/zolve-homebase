import { ShieldCheck } from 'lucide-react'

const LINKS = {
  Product: ['Browse Jobs', 'Sponsor Directory', 'Upskill (Soon)', 'Networking (Soon)'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
}

export default function FooterSection() {
  return (
    <footer className="bg-navy border-t border-navy-800" aria-label="Footer">
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
                  <li key={item}>
                    <a
                      href="#"
                      className="text-navy-400 hover:text-white text-sm transition-colors duration-150 cursor-pointer"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-navy-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
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
