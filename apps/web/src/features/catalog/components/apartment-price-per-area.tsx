'use client';

import type { PriceVisibility } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { usePriceOverlay } from '@/features/catalog/components/price-overlay-scope';
import { formatCatalogPrice } from '@/features/catalog/utils/format-price';

type ApartmentPricePerAreaProps = {
  apartmentId: string;
  amount: string | null;
  currency: string;
  priceVisibility: PriceVisibility;
  areaTotal: string | null;
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
}: ApartmentPricePerAreaProps) => {
  const t = useTranslations('Catalog');
  const locale = useLocale();
  const overlay = usePriceOverlay().getApartmentPrice(apartmentId);
  const effectiveAmount = amount ?? overlay?.price ?? null;
  const area = areaTotal != null ? Number(areaTotal) : null;

  if (effectiveAmount == null || area == null || !Number.isFinite(area) || area <= 0) {
    return <p className="font-brand text-2xl font-bold text-ink-navy">—</p>;
  }

  const total = Number(effectiveAmount);
  if (!Number.isFinite(total)) {
    return <p className="font-brand text-2xl font-bold text-ink-navy">—</p>;
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

  return <p className="font-brand text-2xl font-bold text-ink-navy">{label}</p>;
};
