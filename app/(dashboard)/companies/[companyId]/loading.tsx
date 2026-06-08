export default function CompanyLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-pulse">
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-xl bg-slate-100" />
          <div className="flex-1">
            <div className="h-7 w-56 bg-slate-100 rounded mb-2" />
            <div className="h-4 w-36 bg-slate-100 rounded" />
          </div>
          <div className="w-24 h-24 rounded-full bg-slate-100" />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl" />)}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="h-6 w-48 bg-slate-100 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-slate-100 rounded" />)}
        </div>
      </div>
    </div>
  )
}
