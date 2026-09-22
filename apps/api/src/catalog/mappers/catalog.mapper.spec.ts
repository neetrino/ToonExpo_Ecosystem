import { describe, expect, it } from 'vitest';

import {
  hasPublishedPriceOnRequest,
  isPriceOnRequestEnabled,
  shouldRevealCatalogPrice,
  shouldRevealPrice,
  toMediaSummary,
} from './catalog.mapper.js';

describe('toMediaSummary', () => {
  const originalR2 = process.env['R2_PUBLIC_URL'];

  it('prefixes root-relative file URLs with R2_PUBLIC_URL', () => {
    process.env['R2_PUBLIC_URL'] = 'https://cdn.example.com';
    expect(
      toMediaSummary({
        id: 'm1',
        fileUrl: '/demo/unit.webp',
        thumbnailUrl: '/demo/unit-thumb.webp',
        altText: 'Unit',
      }),
    ).toEqual({
      id: 'm1',
      fileUrl: 'https://cdn.example.com/demo/unit.webp',
      thumbnailUrl: 'https://cdn.example.com/demo/unit-thumb.webp',
      altText: 'Unit',
    });
    if (originalR2 === undefined) {
      delete process.env['R2_PUBLIC_URL'];
    } else {
      process.env['R2_PUBLIC_URL'] = originalR2;
    }
  });

  it('returns null for pending or empty uploads', () => {
    expect(
      toMediaSummary({
        id: 'm2',
        fileUrl: 'pending',
        thumbnailUrl: null,
        altText: null,
      }),
    ).toBeNull();
    expect(
      toMediaSummary({
        id: 'm3',
        fileUrl: '  ',
        thumbnailUrl: null,
        altText: null,
      }),
    ).toBeNull();
  });
});

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
  it('reads the flag from the row, nested building, or project', () => {
    expect(isPriceOnRequestEnabled({ priceOnRequestEnabled: true })).toBe(true);
    expect(isPriceOnRequestEnabled({ building: { priceOnRequestEnabled: true } })).toBe(true);
    expect(isPriceOnRequestEnabled({ building: { priceOnRequestEnabled: false } })).toBe(false);
    expect(isPriceOnRequestEnabled({ project: { priceOnRequestEnabled: true } })).toBe(true);
    expect(
      isPriceOnRequestEnabled({
        building: { priceOnRequestEnabled: false, project: { priceOnRequestEnabled: true } },
      }),
    ).toBe(true);
  });
});

describe('hasPublishedPriceOnRequest', () => {
  it('is true when the project or any building opted in', () => {
    expect(
      hasPublishedPriceOnRequest([
        { priceOnRequestEnabled: false },
        { priceOnRequestEnabled: true },
      ]),
    ).toBe(true);
    expect(hasPublishedPriceOnRequest([{ priceOnRequestEnabled: false }])).toBe(false);
    expect(hasPublishedPriceOnRequest([])).toBe(false);
    expect(hasPublishedPriceOnRequest([{ priceOnRequestEnabled: false }], true)).toBe(true);
  });
});
