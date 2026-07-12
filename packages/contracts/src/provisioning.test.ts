import { describe, expect, it } from 'vitest';

import { provisionAccountSchema, slugifyCompanyName } from './provisioning';

const BASE_INPUT = {
  email: 'builder@example.com',
  name: 'Jane Builder',
  role: 'BUILDER' as const,
  companyName: 'Acme Development',
};

describe('provisionAccountSchema', () => {
  it('accepts a valid builder payload with company', () => {
    expect(provisionAccountSchema.safeParse(BASE_INPUT).success).toBe(true);
  });

  it('accepts admin without company name', () => {
    const result = provisionAccountSchema.safeParse({
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'BIGPROJECTS_ADMIN',
    });
    expect(result.success).toBe(true);
  });

  it('accepts entrance staff without company name', () => {
    const result = provisionAccountSchema.safeParse({
      email: 'staff@example.com',
      name: 'Entrance Staff',
      role: 'ENTRANCE_STAFF',
    });
    expect(result.success).toBe(true);
  });

  it('rejects BUYER role', () => {
    const result = provisionAccountSchema.safeParse({
      ...BASE_INPUT,
      role: 'BUYER',
    });
    expect(result.success).toBe(false);
  });

  it('requires companyName for BUILDER', () => {
    const { companyName: _removed, ...withoutCompany } = BASE_INPUT;
    expect(provisionAccountSchema.safeParse(withoutCompany).success).toBe(false);
  });

  it('requires companyName for PARTNER', () => {
    const result = provisionAccountSchema.safeParse({
      email: 'partner@example.com',
      name: 'Partner User',
      role: 'PARTNER',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(provisionAccountSchema.safeParse({ ...BASE_INPUT, email: 'not-email' }).success).toBe(
      false,
    );
  });
});

describe('slugifyCompanyName', () => {
  it('lowercases and replaces non-alphanumerics with hyphens', () => {
    expect(slugifyCompanyName('Acme Development LLC')).toBe('acme-development-llc');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugifyCompanyName('  ---Hello World---  ')).toBe('hello-world');
  });

  it('collapses consecutive separators into one hyphen', () => {
    expect(slugifyCompanyName('Foo   Bar!!!Baz')).toBe('foo-bar-baz');
  });

  it('falls back to company when slug would be empty', () => {
    expect(slugifyCompanyName('!!!')).toBe('company');
  });
});
