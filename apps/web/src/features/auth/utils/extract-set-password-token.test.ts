import { describe, expect, it, vi } from 'vitest';

import {
  extractSetPasswordTokenFromHash,
  stripSetPasswordTokenFromUrl,
} from './extract-set-password-token';

describe('extractSetPasswordTokenFromHash', () => {
  it('parses token from a hash fragment', () => {
    expect(extractSetPasswordTokenFromHash('#token=abc123')).toBe('abc123');
    expect(extractSetPasswordTokenFromHash('token=abc123')).toBe('abc123');
  });

  it('decodes encoded token values', () => {
    expect(extractSetPasswordTokenFromHash('#token=abc%2Bdef%3D')).toBe('abc+def=');
  });

  it('returns null for missing or empty tokens', () => {
    expect(extractSetPasswordTokenFromHash('')).toBeNull();
    expect(extractSetPasswordTokenFromHash('#')).toBeNull();
    expect(extractSetPasswordTokenFromHash('#token=')).toBeNull();
    expect(extractSetPasswordTokenFromHash('#other=value')).toBeNull();
  });
});

describe('stripSetPasswordTokenFromUrl', () => {
  it('clears the hash while preserving pathname and search', () => {
    const replaceState = vi.fn();
    vi.stubGlobal('window', {
      location: {
        pathname: '/hy/auth/set-password',
        search: '',
      },
      history: { replaceState },
    });

    stripSetPasswordTokenFromUrl();

    expect(replaceState).toHaveBeenCalledWith(null, '', '/hy/auth/set-password');

    vi.unstubAllGlobals();
  });
});
