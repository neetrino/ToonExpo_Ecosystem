import { describe, expect, it } from 'vitest';

import { favoriteListItemSchema, favoriteToggleInputSchema } from './favorites';

const SAMPLE_ID = 'clxxxxxxxxxxxxxxxxxxxx';

describe('favoriteToggleInputSchema', () => {
  it('accepts project and apartment targets', () => {
    expect(
      favoriteToggleInputSchema.safeParse({
        targetType: 'PROJECT',
        targetId: SAMPLE_ID,
      }).success,
    ).toBe(true);
    expect(
      favoriteToggleInputSchema.safeParse({
        targetType: 'APARTMENT',
        targetId: SAMPLE_ID,
      }).success,
    ).toBe(true);
  });

  it('rejects invalid target type or id shape', () => {
    expect(
      favoriteToggleInputSchema.safeParse({
        targetType: 'COMPANY',
        targetId: SAMPLE_ID,
      }).success,
    ).toBe(false);
    expect(
      favoriteToggleInputSchema.safeParse({
        targetType: 'PROJECT',
        targetId: '../evil',
      }).success,
    ).toBe(false);
  });
});

describe('favoriteListItemSchema', () => {
  it('accepts a project favorite list row', () => {
    const parsed = favoriteListItemSchema.safeParse({
      id: SAMPLE_ID,
      targetType: 'PROJECT',
      targetId: SAMPLE_ID,
      createdAt: new Date('2026-07-12T10:00:00.000Z'),
      title: 'Sunrise Residence',
      companyName: 'Demo Development',
      companySlug: 'demo-development',
      projectName: 'Sunrise Residence',
      projectSlug: 'sunrise-residence',
      apartmentStatus: null,
      priceDisplay: null,
      priceAmd: null,
    });
    expect(parsed.success).toBe(true);
  });
});
