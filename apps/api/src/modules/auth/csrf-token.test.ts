import { describe, expect, it } from 'vitest';

import {
  createCsrfToken,
  isValidCsrfToken,
  issueOrReuseCsrfToken,
} from './csrf-token';

describe('csrf-token', () => {
  it('rejects missing, empty, and too-short values', () => {
    expect(isValidCsrfToken(undefined)).toBe(false);
    expect(isValidCsrfToken('')).toBe(false);
    expect(isValidCsrfToken('short')).toBe(false);
    expect(isValidCsrfToken(123)).toBe(false);
  });

  it('accepts a freshly generated token', () => {
    const token = createCsrfToken();
    expect(isValidCsrfToken(token)).toBe(true);
    expect(token.length).toBeGreaterThanOrEqual(16);
  });

  it('generates a new token when no cookie exists', () => {
    const first = issueOrReuseCsrfToken(undefined);
    expect(first.setCookie).toBe(true);
    expect(isValidCsrfToken(first.csrfToken)).toBe(true);
  });

  it('reuses an existing valid CSRF cookie token', () => {
    const existing = createCsrfToken();
    const result = issueOrReuseCsrfToken(existing);
    expect(result).toEqual({ csrfToken: existing, setCookie: false });
  });

  it('keeps the same token across two tab-like csrf lookups', () => {
    const tabA = issueOrReuseCsrfToken(undefined);
    expect(tabA.setCookie).toBe(true);

    const tabB = issueOrReuseCsrfToken(tabA.csrfToken);
    expect(tabB.setCookie).toBe(false);
    expect(tabB.csrfToken).toBe(tabA.csrfToken);

    const tabAAgain = issueOrReuseCsrfToken(tabA.csrfToken);
    expect(tabAAgain.csrfToken).toBe(tabA.csrfToken);
  });

  it('issues a new token when the existing cookie is invalid', () => {
    const result = issueOrReuseCsrfToken('bad');
    expect(result.setCookie).toBe(true);
    expect(result.csrfToken).not.toBe('bad');
  });
});
