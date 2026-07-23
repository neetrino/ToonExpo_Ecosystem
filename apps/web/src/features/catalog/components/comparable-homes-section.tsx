import { getTranslations } from 'next-intl/server';

import {
  ComparableHomeCard,
  type ComparableHomeCardModel,
} from '@/features/catalog/components/comparable-home-card';

type ComparableHomesSectionProps = {
  homes: ComparableHomeCardModel[];
};

/**
 * Full-bleed “Comparable homes” band — Figma `89:736`, above the site footer.
 */
export const ComparableHomesSection = async ({ homes }: ComparableHomesSectionProps) => {
  if (homes.length === 0) {
    return null;
  }

  const t = await getTranslations('Catalog.apartment');

  return (
    <section className="border-t border-header-border bg-band-mist/20">
      <div className="page-container py-16">
        <h2 className="font-brand text-2xl font-bold tracking-[-0.02em] text-ink-navy">
          {t('comparableTitle')}
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homes.map((home) => (
            <ComparableHomeCard key={home.id} home={home} />
          ))}
        </div>
      </div>
    </section>
  );
};
