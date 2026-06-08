import { Quote } from 'lucide-react'

export default function TestimonialSection() {
  return (
    <section className="py-20 bg-white" aria-label="Testimonial">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <Quote className="w-10 h-10 text-[#ff6633] mx-auto mb-6 opacity-60" aria-hidden="true" />
        <blockquote>
          <p className="text-2xl sm:text-3xl font-semibold text-navy leading-relaxed mb-8">
            &ldquo;Home Base showed me exactly which companies had a real track record of sponsoring
            H-1Bs in my SOC category. I stopped wasting interviews on companies that never sponsor.
            Landed an offer at Databricks in 6 weeks.&rdquo;
          </p>
          <footer className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold text-base">
              PK
            </div>
            <div className="text-left">
              <p className="font-semibold text-navy">Priya K.</p>
              <p className="text-navy-500 text-sm">Software Engineer · OPT → H-1B · Databricks</p>
            </div>
          </footer>
        </blockquote>
      </div>
    </section>
  )
}
