import { describe, expect, it } from 'vitest';

import { bosProvisioningRequestSchema } from './bos-provisioning';

const BASE = {
  requestId: 'req-1',
  bosCompanyId: 'bos-co-1',
  companyName: 'Acme Builders',
  companyType: 'builder' as const,
  primaryContactName: 'Jane Builder',
  primaryContactEmail: 'jane@example.com',
  requestedModules: ['builder_portal' as const],
};

describe('bosProvisioningRequestSchema', () => {
  it('accepts a valid builder payload', () => {
    expect(bosProvisioningRequestSchema.safeParse(BASE).success).toBe(true);
  });

  it('requires partnerType for partner companyType', () => {
    const result = bosProvisioningRequestSchema.safeParse({
      ...BASE,
      companyType: 'partner',
    });
    expect(result.success).toBe(false);
  });

  it('accepts partner with partnerType', () => {
    const result = bosProvisioningRequestSchema.safeParse({
      ...BASE,
      companyType: 'partner',
      partnerType: 'SUPPLIER',
    });
    expect(result.success).toBe(true);
  });

  it('accepts bank without partnerType', () => {
    const result = bosProvisioningRequestSchema.safeParse({
      ...BASE,
      companyType: 'bank',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(
      bosProvisioningRequestSchema.safeParse({ ...BASE, primaryContactEmail: 'bad' }).success,
    ).toBe(false);
  });

  it('rejects unknown module keys', () => {
    expect(
      bosProvisioningRequestSchema.safeParse({
        ...BASE,
        requestedModules: ['unknown_module'],
      }).success,
    ).toBe(false);
  });
});
