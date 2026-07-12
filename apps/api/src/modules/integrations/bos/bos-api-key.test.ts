import { createHash } from 'node:crypto';

import { HttpException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadApiEnv, allowBosProvisioningRequest } = vi.hoisted(() => ({
  loadApiEnv: vi.fn(),
  allowBosProvisioningRequest: vi.fn(),
}));

vi.mock('../../../common/env', () => ({
  loadApiEnv,
}));

vi.mock('../../../common/rate-limit', () => ({
  allowBosProvisioningRequest,
  bosRateLimitKey: (apiKeyHeader: string | undefined, ip: string) => {
    if (apiKeyHeader) {
      const fingerprint = createHash('sha256')
        .update(apiKeyHeader, 'utf8')
        .digest('hex')
        .slice(0, 16);
      return `key:${fingerprint}`;
    }
    return `ip:${ip || 'unknown'}`;
  },
  RATE_LIMITED_HTTP_CODE: 'RATE_LIMITED',
}));

import { checkBosApiKey } from './bos-api-key';
import { BosApiKeyGuard } from './bos-api-key.guard';

describe('checkBosApiKey', () => {
  it('returns disabled when configured key is unset', () => {
    expect(checkBosApiKey(undefined, 'any')).toBe('disabled');
    expect(checkBosApiKey('', 'any')).toBe('disabled');
  });

  it('returns unauthorized when header is missing or wrong', () => {
    expect(checkBosApiKey('secret', undefined)).toBe('unauthorized');
    expect(checkBosApiKey('secret', 'wrong')).toBe('unauthorized');
  });

  it('returns ok for an exact match', () => {
    expect(checkBosApiKey('secret', 'secret')).toBe('ok');
  });

  it('rejects unequal keys of different lengths without length oracle branch', () => {
    expect(checkBosApiKey('short', 'much-longer-secret')).toBe('unauthorized');
    expect(checkBosApiKey('much-longer-secret', 'short')).toBe('unauthorized');
  });

  it('rejects equal-length unequal secrets', () => {
    expect(checkBosApiKey('abcdef', 'abcdeg')).toBe('unauthorized');
  });
});

describe('BosApiKeyGuard', () => {
  const guard = new BosApiKeyGuard();

  beforeEach(() => {
    vi.clearAllMocks();
    allowBosProvisioningRequest.mockResolvedValue(true);
  });

  function contextWithHeader(header: string | undefined) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          header: (name: string) => (name.toLowerCase() === 'x-bos-api-key' ? header : undefined),
          headers: {},
          ip: '127.0.0.1',
        }),
      }),
    };
  }

  it('throws 503 INTEGRATION_DISABLED when BOS_API_KEY is unset', async () => {
    loadApiEnv.mockReturnValue({ BOS_API_KEY: undefined });
    await expect(guard.canActivate(contextWithHeader('any') as never)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('throws 401 when key is invalid', async () => {
    loadApiEnv.mockReturnValue({ BOS_API_KEY: 'correct' });
    await expect(guard.canActivate(contextWithHeader('wrong') as never)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('returns true when key matches and rate limit allows', async () => {
    loadApiEnv.mockReturnValue({ BOS_API_KEY: 'correct' });
    await expect(guard.canActivate(contextWithHeader('correct') as never)).resolves.toBe(true);
    expect(allowBosProvisioningRequest).toHaveBeenCalled();
  });

  it('throws 429 RATE_LIMITED when provisioning is rate limited', async () => {
    loadApiEnv.mockReturnValue({ BOS_API_KEY: 'correct' });
    allowBosProvisioningRequest.mockResolvedValue(false);

    try {
      await guard.canActivate(contextWithHeader('correct') as never);
      expect.unreachable('expected rate limit exception');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(429);
      expect((error as HttpException).getResponse()).toMatchObject({
        code: 'RATE_LIMITED',
      });
    }
  });
});
