/* About page loading — shown instantly while about/page.tsx loads */
export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-20 space-y-16 animate-pulse">
      {/* Title skeleton */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="h-12 w-3/5 rounded-2xl bg-stone-800 mx-auto" />
        <div className="h-4 w-2/3 rounded bg-stone-800/70 mx-auto" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card h-48 rounded-3xl bg-stone-800/40" />
        <div className="glass-card h-48 rounded-3xl bg-stone-800/40" />
      </div>

      {/* Ontology section */}
      <div className="glass-card h-56 rounded-3xl bg-stone-800/40" />

      {/* Team skeleton */}
      <div className="space-y-8">
        <div className="h-8 w-48 rounded-xl bg-stone-800 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 rounded-3xl flex flex-col items-center gap-4">
              <div className="w-44 h-44 rounded-2xl bg-stone-800" />
              <div className="h-5 w-32 rounded bg-stone-800" />
              <div className="h-3 w-20 rounded bg-stone-800/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
