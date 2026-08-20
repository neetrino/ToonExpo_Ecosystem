import { describe, expect, it } from 'vitest';

import {
  hasPublishedPriceOnRequest,
  isPriceOnRequestEnabled,
  shouldRevealCatalogPrice,
  shouldRevealPrice,
} from './catalog.mapper.js';

describe('shouldRevealCatalogPrice', () => {
  it('never reveals when the building has price-on-request enabled', () => {
    expect(shouldRevealCatalogPrice('public', true, true)).toBe(false);
    expect(shouldRevealCatalogPrice('visible_after_login', true, true)).toBe(false);
  });

  it('defers to apartment visibility when the building flag is off', () => {
    expect(shouldRevealCatalogPrice('public', false, false)).toBe(true);
    expect(shouldRevealCatalogPrice('by_request', true, false)).toBe(false);
    expect(shouldRevealCatalogPrice('visible_after_login', true, false)).toBe(
      shouldRevealPrice('visible_after_login', true),
    );
  });
});

describe('isPriceOnRequestEnabled', () => {
  it('reads the flag from the row or nested building', () => {
    expect(isPriceOnRequestEnabled({ priceOnRequestEnabled: true })).toBe(true);
    expect(isPriceOnRequestEnabled({ building: { priceOnRequestEnabled: true } })).toBe(true);
    expect(isPriceOnRequestEnabled({ building: { priceOnRequestEnabled: false } })).toBe(false);
  });
});

describe('hasPublishedPriceOnRequest', () => {
  it('is true when any building opted in', () => {
    expect(
      hasPublishedPriceOnRequest([
        { priceOnRequestEnabled: false },
        { priceOnRequestEnabled: true },
      ]),
    ).toBe(true);
    expect(hasPublishedPriceOnRequest([{ priceOnRequestEnabled: false }])).toBe(false);
    expect(hasPublishedPriceOnRequest([])).toBe(false);
  });
});
