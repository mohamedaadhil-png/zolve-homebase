import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

/** Shared shell for the Terms and Privacy pages. */
export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ff6633] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="text-[#0F172A] font-bold text-lg tracking-tight">
              ZOLVE <span className="text-[#ff6633]">HomeBase</span>
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-1">{title}</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: {updated}</p>
        <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed [&_h2]:text-[#0F172A] [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:mt-8 [&_h2]:mb-2">
          {children}
        </div>
      </main>
    </div>
  )
}
