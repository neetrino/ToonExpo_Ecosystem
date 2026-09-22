import { describe, expect, it, vi } from 'vitest';

import {
  hideMapPoiSymbolLayers,
  listPoiSymbolLayerIds,
} from '@/features/geo-map/utils/hide-map-poi-symbol-layers';

describe('listPoiSymbolLayerIds', () => {
  it('selects symbol layers that have an icon, not text-only road names', () => {
    expect(
      listPoiSymbolLayerIds([
        { id: 'poi_z16', type: 'symbol', layout: { 'icon-image': ['get', 'class'] } },
        { id: 'highway-name-major', type: 'symbol', layout: {} },
        { id: 'park', type: 'fill' },
      ]),
    ).toEqual(['poi_z16']);
  });
});

describe('hideMapPoiSymbolLayers', () => {
  it('sets visibility none on icon symbol layers only', () => {
    const setLayoutProperty = vi.fn();
    hideMapPoiSymbolLayers({
      getStyle: () => ({
        layers: [
          { id: 'poi_z14', type: 'symbol', layout: { 'icon-image': 'bus' } },
          { id: 'highway-name-minor', type: 'symbol', layout: {} },
        ],
      }),
      getLayer: (id: string) => (id === 'poi_z14' ? {} : undefined),
      setLayoutProperty,
    } as never);
    expect(setLayoutProperty).toHaveBeenCalledWith('poi_z14', 'visibility', 'none');
    expect(setLayoutProperty).not.toHaveBeenCalledWith(
      'highway-name-minor',
      expect.anything(),
      expect.anything(),
    );
  });
});
