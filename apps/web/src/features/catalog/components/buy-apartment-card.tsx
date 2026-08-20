'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import type { BuyApartmentListing } from '@/features/catalog/utils/load-buy-apartments';
import { formatCatalogPrice } from '@/features/catalog/utils/format-price';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type BuyApartmentCardProps = {
  listing: BuyApartmentListing;
  highlighted?: boolean | undefined;
  /** List → map: hover focuses the apartment's project 3D model. */
  onHoverEnter?: (() => void) | undefined;
  onHoverLeave?: (() => void) | undefined;
  className?: string | undefined;
};

/**
 * Buy-page apartment card — Figma `103:1437` listing grid.
 * Card body navigates to the apartment; hover syncs the map to the project model.
 */
export const BuyApartmentCard = ({
  listing,
  highlighted = false,
  onHoverEnter,
  onHoverLeave,
  className,
}: BuyApartmentCardProps) => {
  const t = useTranslations('BuyPage');
  const catalogT = useTranslations('Catalog');
  const locale = useLocale();
  const priceLabel = formatCatalogPrice({
    amount: listing.price,
    currency: listing.priceCurrency,
    locale,
    priceVisibility: listing.priceVisibility,
    onRequestLabel: catalogT('price.onRequest'),
    signInLabel: catalogT('price.signInToSee'),
  });
  const bedCount = listing.bedrooms ?? listing.rooms;

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-[20px] bg-surface-elevated p-2',
        'ring-1 ring-header-border transition-all duration-[var(--duration-base)]',
        'hover:shadow-lg hover:shadow-brand/5 hover:ring-brand/40',
        highlighted && 'ring-2 ring-brand-deep',
        className,
      )}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
    >
      <Link href={`/apartments/${listing.id}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
          {listing.image ? (
            <Image
              src={listing.image.src}
              alt={listing.image.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-header-muted">
              {listing.title}
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {listing.verified ? (
              <span className="rounded-[10px] bg-canvas/95 px-2 py-1 text-[10px] font-bold tracking-widest text-brand-deep uppercase">
                {t('badgeVerified')}
              </span>
            ) : null}
            {listing.salesStatus === 'available' ? (
              <span className="rounded-[10px] bg-brand-secondary px-2 py-1 text-[10px] font-bold tracking-widest text-on-dark uppercase">
                {t('badgeNew')}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
          <div className="mb-1 flex flex-col gap-1">
            <h3 className="min-w-0 truncate font-brand text-sm font-semibold tracking-[-0.02em] text-ink-navy">
              {t('unitTitle', {
                number: listing.title,
                project: listing.projectName,
              })}
            </h3>
            <p className="font-brand text-base font-bold text-brand-deep">{priceLabel}</p>
          </div>
          <p className="min-h-4 truncate text-xs leading-4 text-header-muted">
            {listing.locationLine}
          </p>
          <div
            className={cn(
              'mt-auto flex flex-wrap items-center gap-4 border-t border-header-border pt-3',
              'text-[11px] font-medium tracking-tight text-header-muted uppercase',
            )}
          >
            <span>{bedCount != null ? t('specBed', { count: bedCount }) : '—'}</span>
            <span>
              {listing.bathrooms != null ? t('specBath', { count: listing.bathrooms }) : '—'}
            </span>
            <span>
              {listing.areaTotal != null ? t('specArea', { area: listing.areaTotal }) : '—'}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};
