import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/rate-limit', () => ({
  assertIpNotRateLimited: vi.fn(),
}));

import { assertIpNotRateLimited } from '@/lib/rate-limit';

import { authRateLimitGate } from './rate-limit-gate';

describe('authRateLimitGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns rateLimited state when limiter denies', async () => {
    vi.mocked(assertIpNotRateLimited).mockResolvedValue({
      limited: true,
      errorKey: 'rateLimited',
    });

    await expect(authRateLimitGate('login')).resolves.toEqual({ errorKey: 'rateLimited' });
    expect(assertIpNotRateLimited).toHaveBeenCalledWith('login');
  });

  it('returns undefined when limiter allows', async () => {
    vi.mocked(assertIpNotRateLimited).mockResolvedValue({ limited: false });

    await expect(authRateLimitGate('register')).resolves.toBeUndefined();
    expect(assertIpNotRateLimited).toHaveBeenCalledWith('register');
  });
});
