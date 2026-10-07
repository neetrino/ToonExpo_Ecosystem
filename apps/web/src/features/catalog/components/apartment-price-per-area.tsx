'use client';

import type { PriceVisibility } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { usePriceOverlay } from '@/features/catalog/components/price-overlay-scope';
import { formatCatalogPrice } from '@/features/catalog/utils/format-price';
import { cn } from '@/shared/ui/cn';

type ApartmentPricePerAreaProps = {
  apartmentId: string;
  amount: string | null;
  currency: string;
  priceVisibility: PriceVisibility;
  areaTotal: string | null;
  label: string;
  className?: string | undefined;
};

/**
 * Locale-converted price per m² for the apartment stats bar.
 */
export const ApartmentPricePerArea = ({
  apartmentId,
  amount,
  currency,
  priceVisibility,
  areaTotal,
  label,
  className,
}: ApartmentPricePerAreaProps) => {
  const t = useTranslations('Catalog');
  const locale = useLocale();
  const overlay = usePriceOverlay().getApartmentPrice(apartmentId);
  const effectiveAmount = amount ?? overlay?.price ?? null;
  const area = areaTotal != null ? Number(areaTotal) : null;
  const total = effectiveAmount != null ? Number(effectiveAmount) : null;

  if (
    total == null ||
    !Number.isFinite(total) ||
    total <= 0 ||
    area == null ||
    !Number.isFinite(area) ||
    area <= 0
  ) {
    return null;
  }

  const perArea = Math.round(total / area);
  const priceLabel = formatCatalogPrice({
    amount: perArea,
    currency: overlay?.priceCurrency ?? currency,
    locale,
    priceVisibility,
    onRequestLabel: t('price.onRequest'),
    signInLabel: t('price.signInToSee'),
  });

  return (
    <div
      className={cn(
        'col-span-3 flex min-w-0 flex-col items-center text-center md:order-5 md:shrink-0',
        className,
      )}
    >
      <p className="text-[10px] font-bold tracking-widest text-header-muted uppercase">{label}</p>
      <p className="mt-1 font-brand text-[clamp(1.125rem,4vw,1.5rem)] font-bold text-ink-navy md:text-2xl">
        {priceLabel}
      </p>
    </div>
  );
};
