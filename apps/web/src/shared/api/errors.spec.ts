import { describe, expect, it } from 'vitest';

import {
  API_UNREACHABLE_MESSAGE,
  ApiNetworkError,
  isNetworkFetchError,
  toApiNetworkError,
} from '@/shared/api/errors';

describe('ApiNetworkError', () => {
  it('is detected as a network fetch error', () => {
    expect(isNetworkFetchError(new ApiNetworkError())).toBe(true);
    expect(isNetworkFetchError(new TypeError('fetch failed'))).toBe(true);
    expect(isNetworkFetchError(new Error('permission denied'))).toBe(false);
  });

  it('detects Next.js-serialized copies (class identity is lost)', () => {
    const serialized = new Error(API_UNREACHABLE_MESSAGE);
    expect(isNetworkFetchError(serialized)).toBe(true);

    const named = new Error('something else');
    named.name = 'ApiNetworkError';
    expect(isNetworkFetchError(named)).toBe(true);
  });

  it('wraps a raw fetch TypeError once', () => {
    const raw = new TypeError('fetch failed');
    const wrapped = toApiNetworkError(raw);
    expect(wrapped).toBeInstanceOf(ApiNetworkError);
    expect(wrapped.cause).toBe(raw);
    expect(toApiNetworkError(wrapped)).toBe(wrapped);
  });
});
