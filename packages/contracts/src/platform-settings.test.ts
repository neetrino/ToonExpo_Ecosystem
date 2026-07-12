import { describe, expect, it } from 'vitest';

import { platformSettingUpdateInputSchema } from './platform-settings';

describe('platformSettingUpdateInputSchema', () => {
  it('accepts a valid contact email', () => {
    const result = platformSettingUpdateInputSchema.safeParse({
      key: 'CONTACT_EMAIL',
      value: 'contact@toonexpo.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid contact email', () => {
    const result = platformSettingUpdateInputSchema.safeParse({
      key: 'CONTACT_EMAIL',
      value: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a too-short contact phone', () => {
    const result = platformSettingUpdateInputSchema.safeParse({
      key: 'CONTACT_PHONE',
      value: '1234',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid contact phone', () => {
    const result = platformSettingUpdateInputSchema.safeParse({
      key: 'CONTACT_PHONE',
      value: '+37410123456',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a non-boolean mortgage page flag', () => {
    const result = platformSettingUpdateInputSchema.safeParse({
      key: 'MORTGAGE_PAGE_ENABLED',
      value: 'yes',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a boolean mortgage page flag', () => {
    const result = platformSettingUpdateInputSchema.safeParse({
      key: 'MORTGAGE_PAGE_ENABLED',
      value: 'false',
    });
    expect(result.success).toBe(true);
  });
});
