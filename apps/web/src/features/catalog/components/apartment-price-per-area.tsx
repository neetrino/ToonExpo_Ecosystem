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
  className,
}: ApartmentPricePerAreaProps) => {
  const t = useTranslations('Catalog');
  const locale = useLocale();
  const overlay = usePriceOverlay().getApartmentPrice(apartmentId);
  const effectiveAmount = amount ?? overlay?.price ?? null;
  const area = areaTotal != null ? Number(areaTotal) : null;

  if (effectiveAmount == null || area == null || !Number.isFinite(area) || area <= 0) {
    return (
      <p className={cn('font-brand text-2xl font-bold text-ink-navy', className)}>—</p>
    );
  }

  const total = Number(effectiveAmount);
  if (!Number.isFinite(total)) {
    return (
      <p className={cn('font-brand text-2xl font-bold text-ink-navy', className)}>—</p>
    );
  }

  const perArea = Math.round(total / area);
  const label = formatCatalogPrice({
    amount: perArea,
    currency: overlay?.priceCurrency ?? currency,
    locale,
    priceVisibility,
    onRequestLabel: t('price.onRequest'),
    signInLabel: t('price.signInToSee'),
  });

  return (
    <p className={cn('font-brand text-2xl font-bold text-ink-navy', className)}>{label}</p>
  );
};
