import { PageHeroSkeleton, Skeleton } from '@/components/ui/Skeleton';

/** টিউটোরিয়াল পেজ লোড হওয়ার সময় */
export default function TutorialLoading() {
  return (
    <main aria-busy="true" aria-label="লোড হচ্ছে">
      <PageHeroSkeleton />
      <section className="section dot-pattern">
        <div className="container-x grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="mt-7 h-6 w-2/3" />
            <Skeleton className="mt-4 h-3 w-full" />
            <Skeleton className="mt-3 h-3 w-5/6" />
          </div>
          <div className="hidden space-y-3 rounded-3xl border border-slate-200 bg-white p-5 lg:block">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="aspect-video w-32 rounded-xl" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
