'use client';

import type { PriceVisibility } from '@toonexpo/contracts';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import { CatalogRequestButton } from '@/features/buyer/components/catalog-request-button';
import { usePriceOverlay } from '@/features/catalog/components/price-overlay-scope';
import { formatCatalogPrice } from '@/features/catalog/utils/format-price';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

export type ComparableHomeCardModel = {
  id: string;
  title: string;
  locationLine: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaTotal: string | null;
  price: string | null;
  priceCurrency: string;
  priceVisibility: PriceVisibility;
  priceOnRequest: boolean;
  projectId: string;
  image: { src: string; alt: string } | null;
};

type ComparableHomeCardProps = {
  home: ComparableHomeCardModel;
  className?: string | undefined;
};

/**
 * Comparable listing card — Figma `89:740` (Comparable homes grid).
 */
export const ComparableHomeCard = ({ home, className }: ComparableHomeCardProps) => {
  const t = useTranslations('Catalog.apartment');
  const tPrice = useTranslations('Catalog.price');
  const locale = useLocale();
  const overlay = usePriceOverlay().getApartmentPrice(home.id);
  const priceLabel = formatCatalogPrice({
    amount: home.price ?? overlay?.price ?? null,
    currency: overlay?.priceCurrency ?? home.priceCurrency,
    locale,
    priceVisibility: home.priceVisibility,
    onRequestLabel: tPrice('onRequest'),
    signInLabel: tPrice('signInToSee'),
  });

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-[20px] bg-surface-elevated p-2',
        'ring-1 ring-header-border transition-all duration-[var(--duration-base)]',
        'hover:shadow-lg hover:shadow-brand/5 hover:ring-brand/40',
        className,
      )}
    >
      <Link
        href={`/apartments/${home.id}`}
        className="relative block aspect-[4/3] overflow-hidden rounded-[15px] bg-surface"
      >
        {home.image ? (
          <Image
            src={home.image.src}
            alt={home.image.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-header-muted">
            {t('unit', { number: home.title })}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate font-brand text-base font-semibold tracking-[-0.02em] text-ink-navy">
            <Link
              href={`/apartments/${home.id}`}
              className="transition-colors hover:text-brand-deep"
            >
              {t('unit', { number: home.title })}
            </Link>
          </h3>
          {home.priceOnRequest ? (
            <CatalogRequestButton
              projectId={home.projectId}
              apartmentId={home.id}
              labelKey="requestPrice"
              appearance="priceLabel"
              className="shrink-0 font-brand text-lg font-bold leading-[23px]"
            />
          ) : (
            <p className="shrink-0 font-brand text-lg font-bold leading-[23px] text-brand-deep">
              {priceLabel}
            </p>
          )}
        </div>

        <p className="mb-4 min-h-4 truncate text-xs leading-4 text-header-muted">
          {home.locationLine}
        </p>

        <div
          className={cn(
            'mt-auto flex flex-wrap items-center gap-4 border-t border-header-border pt-3',
            'text-[11px] font-medium tracking-tight text-header-muted uppercase',
          )}
        >
          <span>{home.bedrooms != null ? t('comparableBed', { count: home.bedrooms }) : '—'}</span>
          <span>
            {home.bathrooms != null ? t('comparableBath', { count: home.bathrooms }) : '—'}
          </span>
          <span>
            {home.areaTotal != null ? t('comparableArea', { area: home.areaTotal }) : '—'}
          </span>
        </div>
      </div>
    </article>
  );
};
