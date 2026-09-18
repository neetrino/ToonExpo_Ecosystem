import { describe, expect, it } from 'vitest';

import {
  collectProjectCities,
  compareLocationOptions,
  expandCityFilterValues,
  matchSelectedLocationOptions,
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

  it('keeps Jermuk when it is not yet in the catalog', () => {
    expect(mergeLocationOptions([], ['Yerevan', 'Jermuk'])).toEqual(['Yerevan', 'Jermuk']);
  });
});

describe('expandCityFilterValues', () => {
  it('expands Yerevan to all locale spellings', () => {
    expect(expandCityFilterValues(['Yerevan'])).toEqual(['Yerevan', 'Երևան', 'Ереван']);
  });

  it('passes through unknown cities', () => {
    expect(expandCityFilterValues(['Ashtarak'])).toEqual(['Ashtarak']);
  });

  it('expands Jermuk to all locale spellings', () => {
    expect(expandCityFilterValues(['Jermuk'])).toEqual(['Jermuk', 'Ջերմուկ', 'Джермук']);
  });
});

describe('matchSelectedLocationOptions', () => {
  it('maps expanded URL spellings back to the visible option label', () => {
    expect(
      matchSelectedLocationOptions(['Երևան', 'Գյումրի'], 'Yerevan,Երևան,Ереван'),
    ).toEqual(['Երևան']);
  });

  it('returns empty when the query is missing', () => {
    expect(matchSelectedLocationOptions(['Երևան'], undefined)).toEqual([]);
  });
});
