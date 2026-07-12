import { describe, expect, it } from 'vitest';

import { calculateMortgagePayment } from './calc';

describe('calculateMortgagePayment', () => {
  it('calculates a standard annuity payment with known values', () => {
    const result = calculateMortgagePayment({
      propertyPriceAmd: 100_000,
      downPaymentAmd: 0,
      termMonths: 12,
      annualInterestRatePercent: 12,
    });

    expect(result.loanAmountAmd).toBe(100_000);
    expect(result.monthlyPaymentAmd).toBe(8885);
    expect(result.totalPaymentAmd).toBe(106_620);
    expect(result.overpaymentAmd).toBe(6620);
  });

  it('uses equal principal split when annual rate is zero', () => {
    const result = calculateMortgagePayment({
      propertyPriceAmd: 10_000_000,
      downPaymentAmd: 2_000_000,
      termMonths: 120,
      annualInterestRatePercent: 0,
    });

    expect(result.loanAmountAmd).toBe(8_000_000);
    expect(result.monthlyPaymentAmd).toBe(66_667);
    expect(result.totalPaymentAmd).toBe(8_000_040);
    expect(result.overpaymentAmd).toBe(0);
  });

  it('returns zero loan when down payment covers the full price', () => {
    const result = calculateMortgagePayment({
      propertyPriceAmd: 25_000_000,
      downPaymentAmd: 25_000_000,
      termMonths: 240,
      annualInterestRatePercent: 9.5,
    });

    expect(result).toEqual({
      loanAmountAmd: 0,
      monthlyPaymentAmd: 0,
      totalPaymentAmd: 0,
      overpaymentAmd: 0,
    });
  });

  it('returns zero payment for negative property price inputs', () => {
    const result = calculateMortgagePayment({
      propertyPriceAmd: -1_000_000,
      downPaymentAmd: 0,
      termMonths: 120,
      annualInterestRatePercent: 10,
    });

    expect(result.monthlyPaymentAmd).toBe(0);
    expect(result.loanAmountAmd).toBe(0);
  });

  it('returns zero payment for out-of-bounds term values', () => {
    expect(
      calculateMortgagePayment({
        propertyPriceAmd: 50_000_000,
        downPaymentAmd: 10_000_000,
        termMonths: 0,
        annualInterestRatePercent: 10,
      }).monthlyPaymentAmd,
    ).toBe(0);

    expect(
      calculateMortgagePayment({
        propertyPriceAmd: 50_000_000,
        downPaymentAmd: 10_000_000,
        termMonths: 601,
        annualInterestRatePercent: 10,
      }).monthlyPaymentAmd,
    ).toBe(0);
  });
});
