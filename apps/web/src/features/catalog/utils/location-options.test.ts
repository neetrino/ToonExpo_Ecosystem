import { describe, expect, it } from 'vitest';

import { collectProjectCities, mergeLocationOptions } from './location-options';

describe('collectProjectCities', () => {
  it('returns unique sorted cities', () => {
    expect(
      collectProjectCities([
        { city: 'Yerevan' },
        { city: ' Gyumri ' },
        { city: 'Yerevan' },
        { city: null },
        { city: '  ' },
      ] as never),
    ).toEqual(['Gyumri', 'Yerevan']);
  });
});

describe('mergeLocationOptions', () => {
  it('merges without case-sensitive duplicates', () => {
    expect(mergeLocationOptions(['Yerevan'], ['yerevan', 'Gyumri', 'Vanadzor'])).toEqual([
      'Gyumri',
      'Vanadzor',
      'Yerevan',
    ]);
  });
});
