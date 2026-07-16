import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../env', () => ({
  loadApiEnv: vi.fn(() => ({
    UPSTASH_REDIS_REST_URL: undefined,
    UPSTASH_REDIS_REST_TOKEN: undefined,
  })),
}));

import { allowBosProvisioningRequest, bosRateLimitKey, resetBosRateLimitForTests } from './bos';
import { resetApiRateLimitRedisForTests } from './redis';

describe('bos rate limit helpers', () => {
  beforeEach(() => {
    resetBosRateLimitForTests();
    resetApiRateLimitRedisForTests();
  });

  it('fingerprints API keys without storing the raw secret', () => {
    const key = bosRateLimitKey('super-secret-key', '1.2.3.4');
    expect(key.startsWith('key:')).toBe(true);
    expect(key).not.toContain('super-secret');
  });

  it('falls back to IP when header is missing', () => {
    expect(bosRateLimitKey(undefined, '9.9.9.9')).toBe('ip:9.9.9.9');
  });

  it('fails open when Upstash is unset', async () => {
    await expect(allowBosProvisioningRequest('key:abc')).resolves.toBe(true);
  });
});
