import { describe, expect, it } from 'vitest';

import {
  parseMoneyAmount,
  parsePaymentAmountInput,
  remainingPaymentAmount,
  sumPaymentAmounts,
} from '@/features/builder/utils/crm-payment-totals';

describe('crm-payment-totals', () => {
  it('sums payment history', () => {
    expect(sumPaymentAmounts([{ amount: '100' }, { amount: '50.5' }])).toBe(150.5);
  });

  it('computes remaining against the apartment price', () => {
    expect(remainingPaymentAmount('1000', 250)).toBe(750);
    expect(remainingPaymentAmount('1000', 2000)).toBe(0);
    expect(remainingPaymentAmount(null, 10)).toBeNull();
  });

  it('rejects invalid money strings', () => {
    expect(parseMoneyAmount('')).toBeNull();
    expect(parseMoneyAmount('abc')).toBeNull();
  });

  it('parses payment form input', () => {
    expect(parsePaymentAmountInput('1500,5')).toBe(1500.5);
    expect(parsePaymentAmountInput('0')).toBeNull();
    expect(parsePaymentAmountInput('abc')).toBeNull();
  });
});
