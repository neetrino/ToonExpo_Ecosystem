import { describe, expect, it } from 'vitest';
import type { PublicVenueMapArea } from '@toonexpo/contracts';

import { resolveVenueMapAreaTitle } from './resolve-venue-map-area-title';

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
  company: null,
  ...overrides,
});

describe('resolveVenueMapAreaTitle', () => {
  it('uses the public label, then name, then code', () => {
    expect(resolveVenueMapAreaTitle(area())).toBe('Builder Co');
    expect(resolveVenueMapAreaTitle(area({ publicLabel: '  ' }))).toBe('North hall');
    expect(resolveVenueMapAreaTitle(area({ publicLabel: null, name: null }))).toBe('A1');
  });

  it('never exposes occupant copy for hidden areas', () => {
    expect(
      resolveVenueMapAreaTitle(
        area({
          displayMode: 'hidden',
          publicLabel: 'Secret',
          name: 'Secret hall',
        }),
      ),
    ).toBe('A1');
  });
});
