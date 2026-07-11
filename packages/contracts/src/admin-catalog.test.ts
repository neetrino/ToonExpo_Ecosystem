import { describe, expect, it } from 'vitest';

import { companyUpsertInputSchema } from './admin-catalog';

describe('admin-catalog schemas', () => {
  it('rejects empty company name', () => {
    const result = companyUpsertInputSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('accepts a valid company name for create', () => {
    const result = companyUpsertInputSchema.safeParse({ name: 'Acme Development' });
    expect(result.success).toBe(true);
  });

  it('accepts companyId for update', () => {
    const result = companyUpsertInputSchema.safeParse({
      companyId: 'company-1',
      name: 'Acme Development',
    });
    expect(result.success).toBe(true);
  });
});
