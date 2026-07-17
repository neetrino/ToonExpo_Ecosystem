import type { PriceDisplayMode, PriceVisibility } from '@toonexpo/domain';

export type FavoritePrice = {
  priceDisplay: PriceDisplayMode;
  priceAmd: number | null;
};

/** Favorites are buyer-authenticated, so after-login prices may be disclosed. */
export function resolveFavoritePrice(
  visibility: PriceVisibility,
  priceAmd: number | null,
): FavoritePrice {
  if (visibility === 'HIDDEN') {
    return { priceDisplay: 'HIDDEN', priceAmd: null };
  }
  if (visibility === 'BY_REQUEST') {
    return { priceDisplay: 'BY_REQUEST', priceAmd: null };
  }
  return { priceDisplay: 'AMOUNT', priceAmd };
}
