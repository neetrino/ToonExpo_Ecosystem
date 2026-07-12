import { describe, expect, it } from 'vitest';

import { defaultAuthRedirect, loginHrefWithCallback, safeAuthCallbackPath } from './callback-url';

describe('safeAuthCallbackPath', () => {
  it('accepts same-locale relative catalog paths', () => {
    expect(safeAuthCallbackPath('/en/projects/demo/sunrise', 'en')).toBe(
      '/en/projects/demo/sunrise',
    );
  });

  it('rejects open redirects and cross-locale paths', () => {
    expect(safeAuthCallbackPath('https://evil.example/', 'en')).toBeNull();
    expect(safeAuthCallbackPath('//evil.example', 'en')).toBeNull();
    expect(safeAuthCallbackPath('/ru/projects/x', 'en')).toBeNull();
    expect(safeAuthCallbackPath('/en/../admin', 'en')).toBeNull();
  });
});

describe('loginHrefWithCallback', () => {
  it('encodes a safe callback query param', () => {
    expect(loginHrefWithCallback('en', '/en/projects/a/b')).toBe(
      '/login?callbackUrl=%2Fen%2Fprojects%2Fa%2Fb',
    );
  });
});

describe('defaultAuthRedirect', () => {
  it('returns locale account path', () => {
    expect(defaultAuthRedirect('hy')).toBe('/hy/account');
  });
});
