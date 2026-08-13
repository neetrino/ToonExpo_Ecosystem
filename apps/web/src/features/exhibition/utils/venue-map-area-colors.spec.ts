import { describe, expect, it } from 'vitest';

import {
  VENUE_MAP_AREA_COLORS,
  resolveVenueMapAreaColor,
} from './venue-map-area-colors';

describe('resolveVenueMapAreaColor', () => {
  it('uses the BOS palette color for the same index', () => {
    const first = resolveVenueMapAreaColor(0, false);
    const second = resolveVenueMapAreaColor(0, false);
    expect(first).toEqual(second);
    expect(first.fill).toBe(VENUE_MAP_AREA_COLORS[0]?.fill);
    expect(first.stroke).toBe(VENUE_MAP_AREA_COLORS[0]?.stroke);
    expect(first.fillOpacity).toBe(VENUE_MAP_AREA_COLORS[0]?.fillOpacity);
  });

  it('raises fill opacity when the area is highlighted', () => {
    const rest = resolveVenueMapAreaColor(1, false);
    const highlighted = resolveVenueMapAreaColor(1, true);
    expect(highlighted.stroke).toBe(rest.stroke);
    expect(highlighted.fillOpacity).toBe(0.42);
  });

  it('falls back to the first swatch for a non-finite index', () => {
    const color = resolveVenueMapAreaColor(Number.NaN, false);
    expect(color.fill).toBe(VENUE_MAP_AREA_COLORS[0]?.fill);
  });

  it('generates a distinct hue past the fixed palette', () => {
    const color = resolveVenueMapAreaColor(VENUE_MAP_AREA_COLORS.length, false);
    expect(color.fill.startsWith('hsl(')).toBe(true);
    expect(color.stroke.startsWith('hsl(')).toBe(true);
  });
});
