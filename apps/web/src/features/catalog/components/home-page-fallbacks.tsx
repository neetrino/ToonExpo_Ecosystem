import { Skeleton } from '@/shared/ui/skeleton';

/** Full-bleed stand-in while the hero banner request is in flight. */
export const HomeHeroFallback = () => (
  <div className="min-h-fluid-screen bg-ink-navy" aria-hidden />
);

/** Card grid stand-in while featured projects and apartments stream in. */
export const HomeCatalogBandsFallback = () => (
  <section className="border-y border-header-border bg-band-mist/30" aria-hidden>
    <div className="page-container section-pad">
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="hidden h-64 w-full rounded-2xl lg:block" />
      </div>
    </div>
  </section>
);
