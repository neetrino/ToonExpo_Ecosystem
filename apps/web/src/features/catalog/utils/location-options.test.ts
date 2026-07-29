import { describe, expect, it } from 'vitest';

import {
  collectProjectCities,
  compareLocationOptions,
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
});

describe('mergeLocationOptions', () => {
  it('merges without case-sensitive duplicates and pins Yerevan', () => {
    expect(mergeLocationOptions(['Yerevan'], ['yerevan', 'Gyumri', 'Vanadzor'])).toEqual([
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
});
