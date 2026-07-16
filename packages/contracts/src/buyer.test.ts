import { describe, expect, it } from 'vitest';

import { buyerProfileUpdateInputSchema } from './buyer';

describe('buyerProfileUpdateInputSchema', () => {
  it('accepts name and optional phone', () => {
    const parsed = buyerProfileUpdateInputSchema.safeParse({
      name: 'Anna Buyer',
      phone: '+37491111111',
    });
    expect(parsed.success).toBe(true);
  });

  it('strips email and role fields not in schema', () => {
    const parsed = buyerProfileUpdateInputSchema.safeParse({
      name: 'Anna Buyer',
      email: 'attacker@example.com',
      role: 'BIGPROJECTS_ADMIN',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual({ name: 'Anna Buyer' });
      expect('email' in parsed.data).toBe(false);
      expect('role' in parsed.data).toBe(false);
    }
  });
});
