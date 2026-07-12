import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadApiEnv } = vi.hoisted(() => ({
  loadApiEnv: vi.fn(),
}));

vi.mock('../../../common/env', () => ({
  loadApiEnv,
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
  });

  function contextWithHeader(header: string | undefined) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          header: (name: string) => (name.toLowerCase() === 'x-bos-api-key' ? header : undefined),
        }),
      }),
    };
  }

  it('throws 503 INTEGRATION_DISABLED when BOS_API_KEY is unset', () => {
    loadApiEnv.mockReturnValue({ BOS_API_KEY: undefined });
    expect(() => guard.canActivate(contextWithHeader('any') as never)).toThrow(
      ServiceUnavailableException,
    );
    try {
      guard.canActivate(contextWithHeader('any') as never);
    } catch (error) {
      expect(error).toBeInstanceOf(ServiceUnavailableException);
      expect((error as ServiceUnavailableException).getResponse()).toMatchObject({
        code: 'INTEGRATION_DISABLED',
      });
    }
  });

  it('throws 401 when key is invalid', () => {
    loadApiEnv.mockReturnValue({ BOS_API_KEY: 'correct' });
    expect(() => guard.canActivate(contextWithHeader('wrong') as never)).toThrow(
      UnauthorizedException,
    );
  });

  it('returns true when key matches', () => {
    loadApiEnv.mockReturnValue({ BOS_API_KEY: 'correct' });
    expect(guard.canActivate(contextWithHeader('correct') as never)).toBe(true);
  });
});
