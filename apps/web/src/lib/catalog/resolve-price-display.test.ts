import { describe, expect, it } from 'vitest';

import { PRICE_VISIBILITIES, type PriceVisibility } from '@toonexpo/domain';

import { resolvePriceDisplay } from './resolve-price-display';

const SAMPLE_PRICE = 85_000_000;

describe('resolvePriceDisplay', () => {
  it.each(
    PRICE_VISIBILITIES.flatMap((visibility) =>
      ([false, true] as const).map((isAuthenticated) => ({ visibility, isAuthenticated })),
    ),
  )(
    '$visibility × auth=$isAuthenticated',
    ({
      visibility,
      isAuthenticated,
    }: {
      visibility: PriceVisibility;
      isAuthenticated: boolean;
    }) => {
      const result = resolvePriceDisplay(visibility, SAMPLE_PRICE, isAuthenticated);

      if (visibility === 'PUBLIC') {
        expect(result).toEqual({ priceDisplay: 'AMOUNT', priceAmd: SAMPLE_PRICE });
        return;
      }
      if (visibility === 'BY_REQUEST') {
        expect(result).toEqual({ priceDisplay: 'BY_REQUEST', priceAmd: null });
        return;
      }
      if (visibility === 'HIDDEN') {
        expect(result).toEqual({ priceDisplay: 'HIDDEN', priceAmd: null });
        return;
      }
      if (isAuthenticated) {
        expect(result).toEqual({ priceDisplay: 'AMOUNT', priceAmd: SAMPLE_PRICE });
        return;
      }
      expect(result).toEqual({ priceDisplay: 'LOGIN_REQUIRED', priceAmd: null });
    },
  );

  it('keeps null amount for PUBLIC when price is missing', () => {
    expect(resolvePriceDisplay('PUBLIC', null, false)).toEqual({
      priceDisplay: 'AMOUNT',
      priceAmd: null,
    });
  });
});
