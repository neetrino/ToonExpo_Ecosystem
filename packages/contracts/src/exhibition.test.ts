import { describe, expect, it } from 'vitest';

import { checkInInputSchema, exhibitionEventUpsertInputSchema } from './exhibition';

describe('exhibitionEventUpsertInputSchema', () => {
  it('accepts a valid create payload', () => {
    const parsed = exhibitionEventUpsertInputSchema.safeParse({
      name: 'ToonExpo 2026 Spring',
      code: 'toonexpo-2026-spring',
      status: 'ACTIVE',
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid code', () => {
    const parsed = exhibitionEventUpsertInputSchema.safeParse({
      name: 'Bad',
      code: 'Bad Code!',
      status: 'PLANNING',
    });

    expect(parsed.success).toBe(false);
  });
});

describe('checkInInputSchema', () => {
  it('requires a qr token', () => {
    expect(checkInInputSchema.safeParse({ qrToken: '' }).success).toBe(false);
    expect(checkInInputSchema.safeParse({ qrToken: 'abc' }).success).toBe(true);
  });
});
