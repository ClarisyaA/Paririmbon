/* Root loading — shown while / (home) chunks are loading */
export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 space-y-24 animate-pulse">
      {/* Hero skeleton */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="h-4 w-40 rounded-full bg-stone-800 mx-auto" />
        <div className="h-14 w-3/4 rounded-2xl bg-stone-800 mx-auto" />
        <div className="h-5 w-2/3 rounded bg-stone-800 mx-auto" />
        <div className="h-12 w-72 rounded-2xl bg-stone-800 mx-auto mt-4" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card h-32 rounded-2xl bg-stone-800/50" />
        ))}
      </div>

      {/* Manuscripts skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-card h-40 rounded-2xl bg-stone-800/50" />
        ))}
      </div>
    </div>
  );
}
