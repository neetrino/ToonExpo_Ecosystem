import { describe, expect, it } from 'vitest';

import { sanitizeReturnUrl } from './sanitize-return-url';

describe('sanitizeReturnUrl', () => {
  it('accepts relative app paths', () => {
    expect(sanitizeReturnUrl('/settings/qr')).toBe('/settings/qr');
    expect(sanitizeReturnUrl('/projects/abc')).toBe('/projects/abc');
  });

  it('rejects open redirects', () => {
    expect(sanitizeReturnUrl('//evil.com')).toBe('/settings');
    expect(sanitizeReturnUrl('https://evil.com')).toBe('/settings');
    expect(sanitizeReturnUrl('/\\evil')).toBe('/settings');
  });

  it('uses fallback for empty values', () => {
    expect(sanitizeReturnUrl(null, '/projects')).toBe('/projects');
    expect(sanitizeReturnUrl(undefined)).toBe('/settings');
  });
});
