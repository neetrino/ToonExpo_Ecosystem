import type { PriceDisplayMode, PriceVisibility } from '@toonexpo/domain';

export type ResolvedPriceDisplay = {
  priceDisplay: PriceDisplayMode;
  priceAmd: number | null;
};

/**
 * Resolves public price disclosure for a viewer.
 * SECURITY: call at query boundaries so hidden amounts never reach HTML/payload.
 * Docs: 05-Public-Buyer-Experience §Price Visibility Messages.
 * Auth: any logged-in session counts (doc says "Sign in", not buyer-only).
 */
export function resolvePriceDisplay(
  visibility: PriceVisibility,
  priceAmd: number | null,
  isAuthenticated: boolean,
): ResolvedPriceDisplay {
  if (visibility === 'HIDDEN') {
    return { priceDisplay: 'HIDDEN', priceAmd: null };
  }
  if (visibility === 'BY_REQUEST') {
    return { priceDisplay: 'BY_REQUEST', priceAmd: null };
  }
  if (visibility === 'VISIBLE_AFTER_LOGIN') {
    if (!isAuthenticated) {
      return { priceDisplay: 'LOGIN_REQUIRED', priceAmd: null };
    }
    return { priceDisplay: 'AMOUNT', priceAmd };
  }
  return { priceDisplay: 'AMOUNT', priceAmd };
}
