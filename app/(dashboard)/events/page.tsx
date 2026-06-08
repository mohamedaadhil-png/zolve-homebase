import { Calendar, ArrowRight } from 'lucide-react'

export default function EventsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Calendar className="w-8 h-8 text-green-600" />
      </div>
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full text-xs font-semibold text-green-600 mb-4">
        Coming Soon
      </div>
      <h1 className="text-3xl font-bold text-[#0F172A] mb-3">Events</h1>
      <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-md mx-auto">
        Visa workshops, employer career fairs, and webinars tailored for international students and visa holders.
      </p>
      <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto text-left mb-8">
        {[
          'H-1B lottery prep workshops',
          'Virtual career fairs with sponsor employers',
          'OPT deadline reminders and webinars',
          'Immigration attorney Q&A sessions',
        ].map(item => (
          <div key={item} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm text-slate-600">{item}</span>
          </div>
        ))}
      </div>
      <a
        href="mailto:hello@zolve.com"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff6633] text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
      >
        Get Early Access <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  )
}
