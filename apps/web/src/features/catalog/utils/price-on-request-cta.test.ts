import { describe, expect, it } from 'vitest';

import { hasVisibleCatalogPrice, shouldShowPriceOnRequestCta } from './price-on-request-cta';

describe('shouldShowPriceOnRequestCta', () => {
  it('shows the button when the builder enabled price-on-request', () => {
    expect(
      shouldShowPriceOnRequestCta({
        priceOnRequest: true,
        minPrice: '1000',
        maxPrice: '2000',
      }),
    ).toBe(true);
  });

  it('shows the button when no numeric price is available', () => {
    expect(
      shouldShowPriceOnRequestCta({
        priceOnRequest: false,
        minPrice: null,
        maxPrice: null,
      }),
    ).toBe(true);
  });

  it('keeps a numeric price as text when the mode is off', () => {
    expect(hasVisibleCatalogPrice('1000', null)).toBe(true);
    expect(
      shouldShowPriceOnRequestCta({
        priceOnRequest: false,
        minPrice: '1000',
        maxPrice: '2000',
      }),
    ).toBe(false);
  });
});
