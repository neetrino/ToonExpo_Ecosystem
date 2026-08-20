'use client';

import type { FavoriteApartmentCard } from '@toonexpo/contracts';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import { FavoriteToggleButton } from '@/features/buyer/components/favorite-toggle-button';
import { CatalogRequestButton } from '@/features/buyer/components/catalog-request-button';
import { formatCatalogPrice } from '@/features/catalog/utils/format-price';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type FavoriteApartmentCardProps = {
  apartment: FavoriteApartmentCard;
};

/**
 * Marketplace-style apartment card for the buyer favorites grid.
 * Matches ProjectCard chrome on `/favorites`.
 */
export const FavoriteApartmentCardView = ({ apartment }: FavoriteApartmentCardProps) => {
  const t = useTranslations('Favorites');
  const tBuy = useTranslations('BuyPage');
  const tCatalog = useTranslations('Catalog');
  const locale = useLocale();
  const district = apartment.district?.trim() || null;
  const city = apartment.city?.trim() || null;
  const locationFallback = apartment.locationText?.trim() || null;
  const priceLabel = formatCatalogPrice({
    amount: apartment.price,
    currency: apartment.priceCurrency,
    locale,
    priceVisibility: apartment.priceVisibility,
    onRequestLabel: tCatalog('price.onRequest'),
    signInLabel: tCatalog('price.signInToSee'),
  });
  const bedCount = apartment.bedrooms ?? apartment.rooms;

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-[20px] bg-surface-elevated p-2',
        'ring-1 ring-header-border transition-all duration-[var(--duration-base)]',
        'hover:shadow-lg hover:shadow-brand/5 hover:ring-brand/40',
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[15px] bg-surface">
        <Link href={`/apartments/${apartment.id}`} className="absolute inset-0 block">
          {apartment.cover ? (
            <Image
              src={apartment.cover.fileUrl}
              alt={apartment.cover.altText ?? apartment.project.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-surface px-4 text-center text-sm text-header-muted">
              {t('apartmentTitle', {
                number: apartment.number,
                project: apartment.project.name,
              })}
            </div>
          )}
        </Link>

        <span
          className={cn(
            'pointer-events-none absolute top-3 left-3 rounded-sm bg-canvas/95 px-2 py-1',
            'text-[10px] font-bold tracking-widest text-brand-deep uppercase',
          )}
        >
          {tCatalog('badges.verified')}
        </span>

        <FavoriteToggleButton
          targetType="apartment"
          targetId={apartment.id}
          className="absolute top-3 right-3 z-10"
        />
      </div>

      <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
        <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-x-3 sm:gap-y-1">
          <h3 className="min-w-0 truncate font-brand text-base font-semibold tracking-[-0.02em] text-ink-navy sm:min-w-[min(100%,10rem)] sm:flex-1 sm:basis-[10rem]">
            <Link
              href={`/apartments/${apartment.id}`}
              className="transition-colors hover:text-brand-deep"
            >
              {t('apartmentTitle', {
                number: apartment.number,
                project: apartment.project.name,
              })}
            </Link>
          </h3>
          {apartment.priceOnRequest ? (
            <CatalogRequestButton
              projectId={apartment.project.id}
              apartmentId={apartment.id}
              labelKey="requestPrice"
              appearance="priceLabel"
              className="font-brand text-lg font-bold leading-7 sm:shrink-0"
            />
          ) : (
            <p className="font-brand text-lg font-bold leading-7 text-brand-deep sm:shrink-0">
              {priceLabel}
            </p>
          )}
        </div>

        <p className="mb-4 text-xs leading-4 text-header-muted">
          {district && city ? (
            <>
              <span>{district}</span>
              <span>{' · '}</span>
              <span>{city}</span>
            </>
          ) : (
            (locationFallback ?? city ?? district ?? apartment.builder.name)
          )}
        </p>

        <div
          className={cn(
            'mt-auto flex flex-wrap items-center gap-4 border-t border-header-border pt-3',
            'text-[11px] font-medium tracking-tight text-header-muted uppercase',
          )}
        >
          <span>{bedCount != null ? tBuy('specBed', { count: bedCount }) : '—'}</span>
          <span>
            {apartment.bathrooms != null ? tBuy('specBath', { count: apartment.bathrooms }) : '—'}
          </span>
          <span>
            {apartment.areaTotal != null ? tBuy('specArea', { area: apartment.areaTotal }) : '—'}
          </span>
        </div>
      </div>
    </article>
  );
};
