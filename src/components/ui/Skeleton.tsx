/**
 * লোড হওয়ার সময়ের ধূসর placeholder
 *   <Skeleton className="h-4 w-1/2" />
 *   <PageHeroSkeleton />   ← loading.tsx-এ hero-র জায়গায়
 */
export function Skeleton({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-full ${dark ? 'bg-white/10' : 'bg-slate-200'} ${className}`} />;
}

export function PageHeroSkeleton() {
  return (
    <section className="relative overflow-hidden bg-secondary pb-20 lg:pb-24">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-primary/25 blur-[160px]" />
      <div className="container-x relative z-10 flex flex-col items-center pt-44 lg:pt-48">
        <Skeleton dark className="h-8 w-40" />
        <Skeleton dark className="mt-7 h-12 w-full max-w-md rounded-2xl" />
        <Skeleton dark className="mt-5 h-4 w-full max-w-xl" />
        <Skeleton dark className="mt-3 h-4 w-2/3 max-w-md" />
      </div>
    </section>
  );
}

/** পুরো পেজের সাধারণ loading — hero + কয়েকটা কার্ড */
export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <main aria-busy="true" aria-label="লোড হচ্ছে">
      <PageHeroSkeleton />
      <section className="section dot-pattern">
        <div className="container-x grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cards }, (_, i) => (
            <div key={i} className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6">
              <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
