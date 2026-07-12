import { beforeEach, describe, expect, it, vi } from 'vitest';

const { assertIpNotRateLimited, consumeAccountInvite, hashPassword } = vi.hoisted(() => ({
  assertIpNotRateLimited: vi.fn(),
  consumeAccountInvite: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({ assertIpNotRateLimited }));
vi.mock('@/lib/auth/invite', () => ({ consumeAccountInvite }));
vi.mock('@/lib/auth/password', () => ({ hashPassword }));

import { runSetPassword } from './set-password';

function buildFormData(password: string, confirmPassword = password): FormData {
  const formData = new FormData();
  formData.set('password', password);
  formData.set('confirmPassword', confirmPassword);
  return formData;
}

describe('runSetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assertIpNotRateLimited.mockResolvedValue({ limited: false });
    hashPassword.mockResolvedValue('hashed-password');
  });

  it('returns rateLimited when the IP limiter denies the request', async () => {
    assertIpNotRateLimited.mockResolvedValue({ limited: true, errorKey: 'rateLimited' });

    const result = await runSetPassword('raw-token', buildFormData('sup3rsecret'));

    expect(result).toEqual({ ok: false, errorKey: 'rateLimited' });
    expect(consumeAccountInvite).not.toHaveBeenCalled();
  });

  it('returns invalidInput when passwords do not match', async () => {
    const result = await runSetPassword('raw-token', buildFormData('sup3rsecret', 'other-secret'));

    expect(result).toEqual({ ok: false, errorKey: 'invalidInput' });
    expect(consumeAccountInvite).not.toHaveBeenCalled();
  });

  it('returns invalidInput for a too-short password', async () => {
    const result = await runSetPassword('raw-token', buildFormData('short1'));
    expect(result).toEqual({ ok: false, errorKey: 'invalidInput' });
  });

  it('returns invalidOrExpired when the invite cannot be consumed', async () => {
    consumeAccountInvite.mockResolvedValue({ ok: false, error: 'invalidOrExpired' });

    const result = await runSetPassword('raw-token', buildFormData('sup3rsecret'));

    expect(result).toEqual({ ok: false, errorKey: 'invalidOrExpired' });
  });

  it('hashes the password and consumes the invite on success', async () => {
    consumeAccountInvite.mockResolvedValue({ ok: true });

    const result = await runSetPassword('raw-token', buildFormData('sup3rsecret'));

    expect(hashPassword).toHaveBeenCalledWith('sup3rsecret');
    expect(consumeAccountInvite).toHaveBeenCalledWith('raw-token', 'hashed-password');
    expect(result).toEqual({ ok: true });
  });
});
