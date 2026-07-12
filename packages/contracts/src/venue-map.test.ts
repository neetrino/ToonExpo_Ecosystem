import { describe, expect, it } from 'vitest';

import {
  boothMoveInputSchema,
  boothUpsertInputSchema,
  venueMapUpsertInputSchema,
} from './venue-map';

describe('venueMapUpsertInputSchema', () => {
  it('accepts a valid http image URL', () => {
    const parsed = venueMapUpsertInputSchema.safeParse({
      eventId: 'evt-1',
      imageUrl: 'https://picsum.photos/seed/venue/1200/800',
      imageAlt: 'Pavilion plan',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects non-http schemes', () => {
    expect(
      venueMapUpsertInputSchema.safeParse({
        eventId: 'evt-1',
        imageUrl: 'javascript:alert(1)',
      }).success,
    ).toBe(false);
  });
});

describe('boothUpsertInputSchema', () => {
  it('accepts percent coords and optional assignments', () => {
    const parsed = boothUpsertInputSchema.safeParse({
      venueMapId: 'vm-1',
      code: 'A12',
      label: 'Demo Development',
      xPercent: 25.5,
      yPercent: 60,
      companyId: 'co-1',
      partnerId: '',
      note: 'Near entrance',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.partnerId).toBeUndefined();
      expect(parsed.data.companyId).toBe('co-1');
    }
  });

  it('rejects coords outside 0–100', () => {
    expect(
      boothUpsertInputSchema.safeParse({
        venueMapId: 'vm-1',
        code: 'A1',
        label: 'Stand',
        xPercent: 101,
        yPercent: 50,
      }).success,
    ).toBe(false);
  });

  it('rejects invalid booth codes', () => {
    expect(
      boothUpsertInputSchema.safeParse({
        venueMapId: 'vm-1',
        code: 'A 12',
        label: 'Stand',
        xPercent: 10,
        yPercent: 10,
      }).success,
    ).toBe(false);
  });
});

describe('boothMoveInputSchema', () => {
  it('accepts boundary coords', () => {
    expect(
      boothMoveInputSchema.safeParse({ boothId: 'b1', xPercent: 0, yPercent: 100 }).success,
    ).toBe(true);
  });
});
