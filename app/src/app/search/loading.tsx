/* Search page loading — shown instantly while search/page.tsx loads */
export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8 animate-pulse">
      {/* Sidebar skeleton */}
      <aside className="lg:col-span-1 space-y-4">
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="h-4 w-24 rounded bg-stone-800" />
          <div className="space-y-2">
            <div className="h-9 rounded-xl bg-stone-800" />
            <div className="h-9 rounded-xl bg-stone-800/60" />
            <div className="h-9 rounded-xl bg-stone-800/60" />
          </div>
        </div>
      </aside>

      {/* Results skeleton */}
      <section className="lg:col-span-3 space-y-6">
        <div className="glass-card h-14 rounded-2xl bg-stone-800/50" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 rounded-2xl space-y-3">
              <div className="h-5 w-1/3 rounded bg-stone-800" />
              <div className="h-7 w-1/2 rounded bg-stone-800" />
              <div className="h-4 w-full rounded bg-stone-800/70" />
              <div className="h-4 w-4/5 rounded bg-stone-800/70" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
