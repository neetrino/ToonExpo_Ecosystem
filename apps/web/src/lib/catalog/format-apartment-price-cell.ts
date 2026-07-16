import type { PublicApartment } from '@toonexpo/contracts';

import { formatPriceAmd } from '@/lib/catalog/format-price';

type PriceCellLabels = {
  noValue: string;
  priceByRequest: string;
  priceHidden: string;
  priceLoginRequired: string;
};

/** Renders apartment table price cell from server-resolved priceDisplay. */
export function formatApartmentPriceCell(
  apartment: PublicApartment,
  locale: string,
  labels: PriceCellLabels,
): string {
  if (apartment.priceDisplay === 'AMOUNT') {
    return apartment.priceAmd !== null
      ? formatPriceAmd(apartment.priceAmd, locale)
      : labels.noValue;
  }
  if (apartment.priceDisplay === 'BY_REQUEST') {
    return labels.priceByRequest;
  }
  if (apartment.priceDisplay === 'LOGIN_REQUIRED') {
    return labels.priceLoginRequired;
  }
  return labels.priceHidden;
}
