import { describe, expect, it } from 'vitest';

import { PROJECT_CITY_FILTER_MAX_LENGTH, parseProjectFilters } from './project-filters';

describe('parseProjectFilters', () => {
  it('accepts valid city and builder slug', () => {
    const result = parseProjectFilters({ city: ' Yerevan ', builder: 'demo-development' });

    expect(result).toEqual({
      city: 'Yerevan',
      builderSlug: 'demo-development',
      hasActiveFilters: true,
    });
  });

  it('strips overlong city', () => {
    const overlong = 'a'.repeat(PROJECT_CITY_FILTER_MAX_LENGTH + 1);
    const result = parseProjectFilters({ city: overlong });

    expect(result.city).toBeUndefined();
    expect(result.hasActiveFilters).toBe(false);
  });

  it('strips invalid builder slug', () => {
    const result = parseProjectFilters({ builder: '../bad-slug' });

    expect(result.builderSlug).toBeUndefined();
    expect(result.hasActiveFilters).toBe(false);
  });

  it('strips empty city after trim', () => {
    const result = parseProjectFilters({ city: '   ' });

    expect(result.city).toBeUndefined();
    expect(result.hasActiveFilters).toBe(false);
  });
});
