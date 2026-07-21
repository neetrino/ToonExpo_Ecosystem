import { describe, expect, it } from 'vitest';

import { loginSchema } from './login.schema';
import { registerSchema } from './register.schema';
import { setPasswordSchema } from './set-password.schema';

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'Ani@Example.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('ani@example.com');
    }
  });

  it('rejects short passwords', () => {
    const result = loginSchema.safeParse({
      email: 'ani@example.com',
      password: 'short',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });

    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('accepts a valid registration payload', () => {
    const result = registerSchema.safeParse({
      firstName: 'Ani',
      surname: 'Hakobyan',
      email: 'ani@example.com',
      phone: '+37491111222',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects phone without enough characters', () => {
    const result = registerSchema.safeParse({
      firstName: 'Ani',
      surname: 'Hakobyan',
      email: 'ani@example.com',
      phone: '123',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects phone with letters', () => {
    const result = registerSchema.safeParse({
      firstName: 'Ani',
      surname: 'Hakobyan',
      email: 'ani@example.com',
      phone: '+374abc',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects empty first name', () => {
    const result = registerSchema.safeParse({
      firstName: '   ',
      surname: 'Hakobyan',
      email: 'ani@example.com',
      phone: '+37491111222',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects mismatched confirmation', () => {
    const result = registerSchema.safeParse({
      firstName: 'Ani',
      surname: 'Hakobyan',
      email: 'ani@example.com',
      phone: '+37491111222',
      password: 'password123',
      confirmPassword: 'password456',
    });

    expect(result.success).toBe(false);
  });
});

describe('setPasswordSchema', () => {
  it('accepts matching passwords of sufficient length', () => {
    const result = setPasswordSchema.safeParse({
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects short passwords', () => {
    const result = setPasswordSchema.safeParse({
      password: 'short',
      confirmPassword: 'short',
    });

    expect(result.success).toBe(false);
  });

  it('rejects mismatched confirmation', () => {
    const result = setPasswordSchema.safeParse({
      password: 'password123',
      confirmPassword: 'password456',
    });

    expect(result.success).toBe(false);
  });
});
