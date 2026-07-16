import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./redis', () => ({
  getRateLimitRedis: vi.fn(() => null),
  resetRateLimitRedisForTests: vi.fn(),
}));

import { assertNotRateLimited, resetRateLimitCheckForTests } from './check';
import { RATE_LIMITED_ERROR_KEY } from './constants';

describe('assertNotRateLimited', () => {
  beforeEach(() => {
    resetRateLimitCheckForTests();
  });

  it('fails open (allows) when Upstash Redis is unset', async () => {
    const result = await assertNotRateLimited('login', '127.0.0.1');
    expect(result).toEqual({ limited: false });
  });

  it('exposes a stable rateLimited error key constant', () => {
    expect(RATE_LIMITED_ERROR_KEY).toBe('rateLimited');
  });
});
