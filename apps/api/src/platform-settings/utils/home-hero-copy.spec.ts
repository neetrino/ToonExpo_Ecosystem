import { describe, expect, it } from 'vitest';

import {
  isHomeHeroCopyEmpty,
  normalizeHomeHeroCopy,
  parseHomeHeroCopy,
} from './home-hero-copy.js';

describe('home-hero-copy', () => {
  it('returns empty maps for missing or invalid JSON', () => {
    expect(parseHomeHeroCopy(undefined)).toEqual({ title: {}, subtitle: {} });
    expect(parseHomeHeroCopy('')).toEqual({ title: {}, subtitle: {} });
    expect(parseHomeHeroCopy('not-json')).toEqual({ title: {}, subtitle: {} });
    expect(parseHomeHeroCopy('[]')).toEqual({ title: {}, subtitle: {} });
  });

  it('keeps trimmed supported locales and drops empty or unknown keys', () => {
    const parsed = parseHomeHeroCopy(
      JSON.stringify({
        title: { hy: '  Գտեք հասցեն  ', ru: '  ', en: 'Find the address', xx: 'nope' },
        subtitle: { en: 'Search homes' },
      }),
    );

    expect(parsed).toEqual({
      title: { hy: 'Գտեք հասցեն', en: 'Find the address' },
      subtitle: { en: 'Search homes' },
    });
  });

  it('normalizes PATCH payloads and detects empty copy', () => {
    const next = normalizeHomeHeroCopy({
      title: { hy: '  Headline  ', ru: '', en: undefined },
      subtitle: { hy: '   ' },
    });

    expect(next).toEqual({ title: { hy: 'Headline' }, subtitle: {} });
    expect(isHomeHeroCopyEmpty(next)).toBe(false);
    expect(isHomeHeroCopyEmpty({ title: {}, subtitle: {} })).toBe(true);
  });
});
