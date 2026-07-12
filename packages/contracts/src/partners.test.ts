import { describe, expect, it } from 'vitest';

import {
  BANK_OFFER_INTEREST_RATE_MAX,
  BANK_OFFER_INTEREST_RATE_MIN,
  BANK_OFFER_MIN_DOWN_PAYMENT_PERCENT_MAX,
  BANK_OFFER_MIN_DOWN_PAYMENT_PERCENT_MIN,
  bankOfferUpsertInputSchema,
  partnerUpsertInputSchema,
} from './partners';

describe('partner schemas', () => {
  it('rejects empty partner name', () => {
    const result = partnerUpsertInputSchema.safeParse({
      name: '',
      type: 'BANK',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid partner create payload', () => {
    const result = partnerUpsertInputSchema.safeParse({
      name: 'Converse Bank Demo',
      type: 'BANK',
      phone: '+37410000000',
      website: 'https://bank.example',
      logoUrl: 'https://picsum.photos/seed/logo/200/200',
    });
    expect(result.success).toBe(true);
  });

  it('rejects javascript and data URL schemes on partner fields', () => {
    const website = partnerUpsertInputSchema.safeParse({
      name: 'Evil Partner',
      type: 'SERVICE',
      website: 'javascript:alert(1)',
    });
    const logo = partnerUpsertInputSchema.safeParse({
      name: 'Evil Partner',
      type: 'SERVICE',
      logoUrl: 'data:text/html,evil',
    });
    expect(website.success).toBe(false);
    expect(logo.success).toBe(false);
  });

  it('rejects interest rates outside bounds', () => {
    const tooLow = bankOfferUpsertInputSchema.safeParse({
      partnerId: 'partner-1',
      title: 'Standard',
      interestRate: BANK_OFFER_INTEREST_RATE_MIN - 0.01,
      minDownPaymentPercent: 10,
      maxTermMonths: 240,
    });
    const tooHigh = bankOfferUpsertInputSchema.safeParse({
      partnerId: 'partner-1',
      title: 'Standard',
      interestRate: BANK_OFFER_INTEREST_RATE_MAX + 1,
      minDownPaymentPercent: 10,
      maxTermMonths: 240,
    });
    expect(tooLow.success).toBe(false);
    expect(tooHigh.success).toBe(false);
  });

  it('rejects min down payment percent outside bounds', () => {
    const tooLow = bankOfferUpsertInputSchema.safeParse({
      partnerId: 'partner-1',
      title: 'Standard',
      interestRate: 10,
      minDownPaymentPercent: BANK_OFFER_MIN_DOWN_PAYMENT_PERCENT_MIN - 1,
      maxTermMonths: 240,
    });
    const tooHigh = bankOfferUpsertInputSchema.safeParse({
      partnerId: 'partner-1',
      title: 'Standard',
      interestRate: 10,
      minDownPaymentPercent: BANK_OFFER_MIN_DOWN_PAYMENT_PERCENT_MAX + 1,
      maxTermMonths: 240,
    });
    expect(tooLow.success).toBe(false);
    expect(tooHigh.success).toBe(false);
  });

  it('accepts a valid bank offer payload', () => {
    const result = bankOfferUpsertInputSchema.safeParse({
      partnerId: 'partner-1',
      title: 'Preferential mortgage',
      interestRate: '9.5',
      minDownPaymentPercent: '10',
      maxTermMonths: '240',
      maxAmountAmd: '80000000',
      featured: 'true',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.interestRate).toBe(9.5);
      expect(result.data.minDownPaymentPercent).toBe(10);
      expect(result.data.maxTermMonths).toBe(240);
      expect(result.data.featured).toBe(true);
    }
  });
});
