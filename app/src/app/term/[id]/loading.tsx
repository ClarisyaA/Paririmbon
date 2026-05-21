/* Term detail loading — shown instantly while term/[id]/page.tsx loads */
export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-4 w-20 rounded bg-stone-800" />

      {/* Main grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: term detail */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card p-8 rounded-3xl space-y-6">
            <div className="flex justify-between items-start gap-4 pb-6 border-b border-stone-800">
              <div className="space-y-3 flex-1">
                <div className="h-4 w-20 rounded bg-stone-800" />
                <div className="h-12 w-2/3 rounded-xl bg-stone-800" />
              </div>
              <div className="h-14 w-28 rounded-xl bg-stone-800 shrink-0" />
            </div>
            <div className="space-y-2 py-4">
              <div className="h-4 w-24 rounded bg-stone-800" />
              <div className="h-4 w-full rounded bg-stone-800/70" />
              <div className="h-4 w-5/6 rounded bg-stone-800/70" />
              <div className="h-4 w-4/5 rounded bg-stone-800/70" />
            </div>
            <div className="h-20 rounded-2xl bg-stone-800/50" />
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="h-4 w-32 rounded bg-stone-800" />
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-stone-800 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-2/3 rounded bg-stone-800" />
                <div className="h-4 w-1/3 rounded bg-stone-800/70" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: graph */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 rounded-3xl h-[420px] md:h-[500px] flex flex-col gap-4">
            <div className="h-5 w-32 rounded bg-stone-800" />
            <div className="h-3 w-48 rounded bg-stone-800/60" />
            <div className="flex-grow rounded-2xl bg-stone-800/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
