import { describe, expect, it, vi } from 'vitest';

import { OSM_BUILDING_CORNER_RADIUS_M } from '@/features/geo-map/constants';
import { applyOsmBuildingCornerRadius } from '@/features/geo-map/utils/apply-osm-building-corner-radius';

describe('applyOsmBuildingCornerRadius', () => {
  it('sets the native rounded-corner layout on an existing extrusion layer', () => {
    const setLayoutProperty = vi.fn();
    const map = {
      getLayer: (id: string) => (id === 'building-3d' ? {} : undefined),
      setLayoutProperty,
    };
    applyOsmBuildingCornerRadius(map as never, 'building-3d');
    expect(setLayoutProperty).toHaveBeenCalledWith(
      'building-3d',
      'fill-extrusion-rounded-corner-distance',
      OSM_BUILDING_CORNER_RADIUS_M,
    );
  });

  it('does not add or remove buildings when the layer is missing', () => {
    const setLayoutProperty = vi.fn();
    applyOsmBuildingCornerRadius(
      { getLayer: () => undefined, setLayoutProperty } as never,
      'building-3d',
    );
    expect(setLayoutProperty).not.toHaveBeenCalled();
  });

  it('accepts an explicit numeric corner distance for the smooth overlay', () => {
    const setLayoutProperty = vi.fn();
    applyOsmBuildingCornerRadius(
      { getLayer: () => ({}), setLayoutProperty } as never,
      'geo-map-rounded-buildings-3d',
      48,
    );
    expect(setLayoutProperty).toHaveBeenCalledWith(
      'geo-map-rounded-buildings-3d',
      'fill-extrusion-rounded-corner-distance',
      48,
    );
  });
});
