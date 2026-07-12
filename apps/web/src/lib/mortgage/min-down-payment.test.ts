import { describe, expect, it } from 'vitest';

import { getMinimumDownPaymentAmd, resolveDownPaymentForOffer } from './min-down-payment';

describe('getMinimumDownPaymentAmd', () => {
  it('computes percent of property price', () => {
    expect(getMinimumDownPaymentAmd(50_000_000, 10)).toBe(5_000_000);
    expect(getMinimumDownPaymentAmd(25_000_000, 20)).toBe(5_000_000);
  });

  it('returns zero for zero price or percent', () => {
    expect(getMinimumDownPaymentAmd(0, 10)).toBe(0);
    expect(getMinimumDownPaymentAmd(10_000_000, 0)).toBe(0);
  });
});

describe('resolveDownPaymentForOffer', () => {
  it('keeps entered down payment when it meets the minimum', () => {
    const result = resolveDownPaymentForOffer({
      propertyPriceAmd: 40_000_000,
      downPaymentAmd: 8_000_000,
      minDownPaymentPercent: 10,
    });

    expect(result).toEqual({
      effectiveDownPaymentAmd: 8_000_000,
      isBelowMinimum: false,
      minimumDownPaymentAmd: 4_000_000,
    });
  });

  it('clamps to minimum and flags when below required percent', () => {
    const result = resolveDownPaymentForOffer({
      propertyPriceAmd: 40_000_000,
      downPaymentAmd: 1_000_000,
      minDownPaymentPercent: 20,
    });

    expect(result).toEqual({
      effectiveDownPaymentAmd: 8_000_000,
      isBelowMinimum: true,
      minimumDownPaymentAmd: 8_000_000,
    });
  });

  it('caps entered down payment at property price before comparing', () => {
    const result = resolveDownPaymentForOffer({
      propertyPriceAmd: 30_000_000,
      downPaymentAmd: 50_000_000,
      minDownPaymentPercent: 10,
    });

    expect(result.effectiveDownPaymentAmd).toBe(30_000_000);
    expect(result.isBelowMinimum).toBe(false);
  });

  it('treats missing minimum as zero', () => {
    const result = resolveDownPaymentForOffer({
      propertyPriceAmd: 20_000_000,
      downPaymentAmd: 0,
      minDownPaymentPercent: null,
    });

    expect(result).toEqual({
      effectiveDownPaymentAmd: 0,
      isBelowMinimum: false,
      minimumDownPaymentAmd: 0,
    });
  });
});
