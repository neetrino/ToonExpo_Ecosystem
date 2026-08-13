import { describe, expect, it } from 'vitest';
import type { PublicVenueMapArea } from '@toonexpo/contracts';

import { matchesVenueMapSearch } from './matches-venue-map-search';

const area = (overrides: Partial<PublicVenueMapArea> = {}): PublicVenueMapArea => ({
  id: 'area_1',
  code: 'A1',
  name: 'North hall',
  displayMode: 'organization',
  publicLabel: 'Builder Co',
  areaSqm: 12,
  sortOrder: 0,
  rects: [{ x: 0, y: 0, width: 10, height: 10 }],
  labelX: 5,
  labelY: 5,
  company: {
    id: 'co_1',
    name: 'Builder Co',
    type: 'builder',
    href: '/builders/co_1',
  },
  ...overrides,
});

describe('matchesVenueMapSearch', () => {
  it('matches code, label and company name', () => {
    expect(matchesVenueMapSearch(area(), 'a1')).toBe(true);
    expect(matchesVenueMapSearch(area(), 'builder')).toBe(true);
    expect(matchesVenueMapSearch(area(), 'north')).toBe(true);
    expect(matchesVenueMapSearch(area(), 'missing')).toBe(false);
  });
});
