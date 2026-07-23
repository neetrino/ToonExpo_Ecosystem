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
  className?: string | undefined;
};

/**
 * Buy-page apartment card — Figma `103:1437` listing grid.
 */
export const BuyApartmentCard = ({
  listing,
  highlighted = false,
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

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-[20px] bg-surface-elevated p-2',
        'ring-1 ring-header-border transition-all duration-[var(--duration-base)]',
        'hover:shadow-lg hover:shadow-brand/5 hover:ring-brand/40',
        highlighted && 'ring-2 ring-brand-deep',
        className,
      )}
    >
      <Link href={`/apartments/${listing.id}`} className="block">
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
            <span className="rounded-[10px] bg-canvas/95 px-2 py-1 text-[10px] font-bold tracking-widest text-brand-deep uppercase">
              {t('badgeVerified')}
            </span>
            {listing.salesStatus === 'available' ? (
              <span className="rounded-[10px] bg-brand-secondary px-2 py-1 text-[10px] font-bold tracking-widest text-on-dark uppercase">
                {t('badgeNew')}
              </span>
            ) : null}
          </div>
        </div>

        <div className="px-3 pt-4 pb-3">
          <div className="mb-1 flex items-start justify-between gap-3">
            <h3 className="min-w-0 flex-1 truncate font-brand text-sm font-semibold tracking-[-0.02em] text-ink-navy">
              {t('unitTitle', {
                number: listing.title,
                project: listing.projectName,
              })}
            </h3>
            <p className="shrink-0 font-brand text-base font-bold whitespace-nowrap text-brand-deep">
              {priceLabel}
            </p>
          </div>
          {listing.locationLine ? (
            <p className="text-xs leading-4 text-header-muted">{listing.locationLine}</p>
          ) : null}
          <div
            className={cn(
              'mt-3 flex flex-wrap items-center gap-4 border-t border-header-border pt-3',
              'text-[11px] font-medium tracking-tight text-header-muted uppercase',
            )}
          >
            <span>{listing.rooms != null ? t('specBed', { count: listing.rooms }) : '—'}</span>
            <span>
              {listing.areaTotal != null ? t('specArea', { area: listing.areaTotal }) : '—'}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};
