'use client';

import type { AdminApartmentListItem } from '@toonexpo/contracts';
import { Banknote } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { AdminInventoryCardStat } from '@/features/admin/components/admin-inventory-card';
import { formatCatalogPrice } from '@/features/catalog/utils/format-price';

const formatApartmentListPrice = (
  apartment: Pick<AdminApartmentListItem, 'price' | 'priceCurrency'>,
  locale: string,
  emptyLabel: string,
): string =>
  formatCatalogPrice({
    amount: apartment.price,
    currency: apartment.priceCurrency,
    locale,
    onRequestLabel: emptyLabel,
  });

/**
 * Inventory list price column — entered amount, or an em dash when unset.
 */
export const AdminApartmentPriceText = ({
  apartment,
}: {
  apartment: Pick<AdminApartmentListItem, 'price' | 'priceCurrency'>;
}) => {
  const t = useTranslations('Admin.apartments');
  const locale = useLocale();
  return <>{formatApartmentListPrice(apartment, locale, t('priceEmpty'))}</>;
};

/**
 * Inventory card price block (same chrome as buildings/apartments stats).
 */
export const AdminApartmentPriceStat = ({
  apartment,
}: {
  apartment: Pick<AdminApartmentListItem, 'price' | 'priceCurrency'>;
}) => {
  const t = useTranslations('Admin.apartments');
  const locale = useLocale();
  return (
    <AdminInventoryCardStat
      icon={<Banknote className="size-4" strokeWidth={2} />}
      label={t('price')}
      value={formatApartmentListPrice(apartment, locale, t('priceEmpty'))}
    />
  );
};
