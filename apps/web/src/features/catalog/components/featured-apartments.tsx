import { getTranslations } from 'next-intl/server';

import { BuyApartmentCard } from '@/features/catalog/components/buy-apartment-card';
import { CATALOG_CARD_CELL_FILL_CLASS } from '@/features/catalog/constants/catalog-list';
import type { BuyApartmentListing } from '@/features/catalog/utils/load-buy-apartments';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { EmptyState } from '@/shared/ui/empty-state';
import { Reveal } from '@/shared/ui/motion/reveal';
import { SectionHeader } from '@/shared/ui/section-header';
import { StaggerGroup } from '@/shared/ui/motion/stagger-group';

type FeaturedApartmentsProps = {
  listings: BuyApartmentListing[];
};

/**
 * Home featured listings grid — apartment cards (bed / bath / area).
 */
export const FeaturedApartments = async ({ listings }: FeaturedApartmentsProps) => {
  const t = await getTranslations('HomePage');

  return (
    <section className="bg-canvas pt-10 pb-[clamp(2.75rem,5.5vw,4.5rem)] md:pt-12">
      <div className="page-container">
        <Reveal>
          <SectionHeader
            eyebrow={t('featured.eyebrow')}
            title={t('featured.title')}
            action={
              <Link
                href="/apartments"
                className="shrink-0 pb-1 text-sm font-semibold text-brand-deep transition-colors hover:text-brand-deep/80"
              >
                {t('featured.viewAll')}
              </Link>
            }
          />
        </Reveal>

        {listings.length > 0 ? (
          <StaggerGroup
            className={cn(
              'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3',
              CATALOG_CARD_CELL_FILL_CLASS,
            )}
            baseDelayMs={80}
          >
            {listings.map((listing) => (
              <BuyApartmentCard key={listing.id} listing={listing} />
            ))}
          </StaggerGroup>
        ) : (
          <EmptyState title={t('featured.empty')} />
        )}
      </div>
    </section>
  );
};
