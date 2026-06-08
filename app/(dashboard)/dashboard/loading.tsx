export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-8 w-56 bg-slate-100 rounded mb-2" />
      <div className="h-5 w-72 bg-slate-100 rounded mb-8" />
      <div className="h-24 bg-slate-100 rounded-2xl mb-6" />
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
      </div>
      <div className="h-6 w-40 bg-slate-100 rounded mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
      </div>
    </div>
  )
}
