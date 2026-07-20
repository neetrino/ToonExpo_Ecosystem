import { ConfigService } from '@nestjs/config';
import { describe, expect, it, vi } from 'vitest';

import type { AppEnv } from '../config/env.validation.js';
import { ThrottlerConfigService } from './throttler-config.service.js';
import { UpstashThrottlerStorage } from './upstash-throttler.storage.js';

const createService = (env: Partial<AppEnv>): ThrottlerConfigService => {
  const pinoLogger = { info: vi.fn(), error: vi.fn() };
  const configService = {
    get: (key: keyof AppEnv) => env[key],
  } as unknown as ConfigService<AppEnv, true>;

  return new ThrottlerConfigService(configService, pinoLogger as never);
};

describe('ThrottlerConfigService', () => {
  it('uses in-memory storage when Upstash env vars are unset', () => {
    const service = createService({});
    const options = service.createThrottlerOptions();

    expect(options.storage).toBeUndefined();
  });

  it('uses Upstash Redis storage when both env vars are set', () => {
    vi.stubEnv('VITEST', '');
    const service = createService({
      UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'token-value',
    });
    const options = service.createThrottlerOptions();

    expect(options.storage).toBeInstanceOf(UpstashThrottlerStorage);
    vi.unstubAllEnvs();
  });
});
