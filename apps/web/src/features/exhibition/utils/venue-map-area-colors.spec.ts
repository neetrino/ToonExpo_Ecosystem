import { describe, expect, it } from 'vitest';

import {
  VENUE_MAP_AREA_COLORS,
  resolveVenueMapAreaColor,
} from './venue-map-area-colors';

describe('resolveVenueMapAreaColor', () => {
  it('returns a stable palette color for the same area id', () => {
    const first = resolveVenueMapAreaColor('area-a', false);
    const second = resolveVenueMapAreaColor('area-a', false);
    expect(first).toBe(second);
    expect(VENUE_MAP_AREA_COLORS).toContainEqual(first);
  });

  it('returns the hidden palette for hidden areas', () => {
    const color = resolveVenueMapAreaColor('area-a', true);
    expect(color.fill).toContain('15, 23, 42');
  });
});
