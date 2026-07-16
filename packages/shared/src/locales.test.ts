import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, isAppLocale, SUPPORTED_LOCALES } from './locales';

describe('locales', () => {
  it('includes default locale', () => {
    expect(SUPPORTED_LOCALES).toContain(DEFAULT_LOCALE);
  });

  it('narrows supported locales', () => {
    expect(isAppLocale('hy')).toBe(true);
    expect(isAppLocale('de')).toBe(false);
  });
});
