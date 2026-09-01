import { describe, expect, it } from 'vitest';

import {
  collectProjectCities,
  compareLocationOptions,
  expandCityFilterValues,
  mergeLocationOptions,
} from './location-options';

describe('compareLocationOptions', () => {
  it('pins Yerevan above other cities', () => {
    expect(compareLocationOptions('Yerevan', 'Gyumri')).toBeLessThan(0);
    expect(compareLocationOptions('Gyumri', 'Yerevan')).toBeGreaterThan(0);
  });

  it('sorts non-pinned cities alphabetically', () => {
    expect(compareLocationOptions('Gyumri', 'Vanadzor')).toBeLessThan(0);
  });
});

describe('collectProjectCities', () => {
  it('returns unique cities with Yerevan first', () => {
    expect(
      collectProjectCities([
        { city: 'Yerevan' },
        { city: ' Gyumri ' },
        { city: 'Yerevan' },
        { city: null },
        { city: '  ' },
      ] as never),
    ).toEqual(['Yerevan', 'Gyumri']);
  });

  it('collapses cross-script Yerevan aliases', () => {
    expect(
      collectProjectCities([{ city: 'Yerevan' }, { city: 'Երևան' }, { city: 'Ереван' }] as never),
    ).toEqual(['Yerevan']);
  });
});

describe('mergeLocationOptions', () => {
  it('merges without case-sensitive duplicates and pins Yerevan', () => {
    expect(mergeLocationOptions(['Yerevan'], ['Yerevan', 'Gyumri', 'Vanadzor'])).toEqual([
      'Yerevan',
      'Gyumri',
      'Vanadzor',
    ]);
  });

  it('keeps localized Yerevan spelling first', () => {
    expect(mergeLocationOptions(['Դիլիջան', 'Երևան'], ['Գյումրի'])).toEqual([
      'Երևան',
      'Գյումրի',
      'Դիլիջան',
    ]);
  });

  it('collapses EN and HY Yerevan preferring popular locale spelling', () => {
    expect(mergeLocationOptions(['Երևան', 'Gyumri'], ['Yerevan', 'Gyumri'])).toEqual([
      'Yerevan',
      'Gyumri',
    ]);
  });

  it('collapses EN and HY Yerevan when UI is Armenian', () => {
    expect(mergeLocationOptions(['Yerevan'], ['Երևան', 'Գյումրի'])).toEqual([
      'Երևան',
      'Գյումրի',
    ]);
  });
});

describe('expandCityFilterValues', () => {
  it('expands Yerevan to all locale spellings', () => {
    expect(expandCityFilterValues(['Yerevan'])).toEqual(['Yerevan', 'Երևան', 'Ереван']);
  });

  it('passes through unknown cities', () => {
    expect(expandCityFilterValues(['Ashtarak'])).toEqual(['Ashtarak']);
  });
});
