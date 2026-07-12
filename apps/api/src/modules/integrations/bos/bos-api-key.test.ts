import { describe, expect, it } from 'vitest';

import { checkBosApiKey } from './bos-api-key';

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
});
