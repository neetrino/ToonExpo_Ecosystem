import { describe, expect, it } from 'vitest';

import { buyerRegisterSchema, loginSchema } from './auth';

const VALID_REGISTER = {
  name: 'Ada Lovelace',
  phone: '+37411223344',
  email: 'ada@example.com',
  password: 'sup3rsecret',
};

describe('buyerRegisterSchema', () => {
  it('accepts a valid buyer payload', () => {
    expect(buyerRegisterSchema.safeParse(VALID_REGISTER).success).toBe(true);
  });

  it('trims whitespace around string fields', () => {
    const parsed = buyerRegisterSchema.parse({ ...VALID_REGISTER, name: '  Ada  ' });
    expect(parsed.name).toBe('Ada');
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(buyerRegisterSchema.safeParse({ ...VALID_REGISTER, password: 'short1' }).success).toBe(
      false,
    );
  });

  it('rejects an invalid email', () => {
    expect(
      buyerRegisterSchema.safeParse({ ...VALID_REGISTER, email: 'not-an-email' }).success,
    ).toBe(false);
  });

  it('rejects an empty name', () => {
    expect(buyerRegisterSchema.safeParse({ ...VALID_REGISTER, name: '   ' }).success).toBe(false);
  });

  it('rejects a too-short phone', () => {
    expect(buyerRegisterSchema.safeParse({ ...VALID_REGISTER, phone: '12' }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'ada@example.com', password: 'sup3rsecret' });
    expect(result.success).toBe(true);
  });

  it('rejects a short password', () => {
    expect(loginSchema.safeParse({ email: 'ada@example.com', password: 'x' }).success).toBe(false);
  });

  it('rejects a missing email', () => {
    expect(loginSchema.safeParse({ password: 'sup3rsecret' }).success).toBe(false);
  });
});
