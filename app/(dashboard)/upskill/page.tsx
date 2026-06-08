import { Clock, DollarSign, Star } from 'lucide-react'

const SERVICES = [
  { title: 'Resume Review', price: 49, duration: '30 min', popular: false, desc: 'Get expert feedback on your resume from a career coach who knows what H-1B sponsors look for.' },
  { title: 'Mock Interviews', price: 99, duration: '60 min', popular: false, desc: 'Practice technical and behavioral interviews with industry professionals.' },
  { title: 'Career Strategy', price: 79, duration: '45 min', popular: true, desc: 'Build a personalized roadmap for your career goals and visa timeline.' },
  { title: 'OPT/H-1B Guidance', price: 69, duration: '45 min', popular: false, desc: 'Navigate OPT, STEM OPT, and H-1B processes with an immigration-aware advisor.' },
  { title: 'Salary Negotiation', price: 59, duration: '30 min', popular: false, desc: 'Learn to negotiate your offer confidently, including H-1B prevailing wage considerations.' },
  { title: 'Networking Strategy', price: 69, duration: '45 min', popular: true, desc: 'Build your professional network strategically in the US tech ecosystem.' },
]

export default function UpskillPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Coming soon banner */}
      <div className="bg-gradient-to-r from-[#ff6633]/10 to-orange-50 border border-[#ff6633]/20 rounded-2xl p-6 mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff6633]/10 rounded-full text-xs font-semibold text-[#ff6633] mb-3">
          <Star className="w-3.5 h-3.5" />
          Coming Soon
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Upskill with Expert Coaches</h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto">
          We're building something amazing for you — expert coaching tailored for international students navigating the US job market.
        </p>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map(service => (
          <div
            key={service.title}
            className="relative bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-shadow"
          >
            {service.popular && (
              <div className="absolute -top-2 right-4 px-2.5 py-0.5 bg-[#ff6633] text-white text-xs font-semibold rounded-full">
                Popular
              </div>
            )}

            <h3 className="font-bold text-[#0F172A] mb-1">{service.title}</h3>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">{service.desc}</p>

            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" /> {service.duration}
              </span>
              <span className="flex items-center gap-1 text-sm font-bold text-[#0F172A]">
                <DollarSign className="w-3.5 h-3.5" />{service.price}
              </span>
            </div>

            <button
              disabled
              className="w-full py-2.5 bg-slate-100 text-slate-400 text-sm font-semibold rounded-xl cursor-not-allowed"
            >
              Join to Book
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-slate-400 mt-8">
        Want early access?{' '}
        <a href="mailto:hello@zolve.com" className="text-[#ff6633] hover:underline">
          Join the waitlist
        </a>
      </p>
    </div>
  )
}
