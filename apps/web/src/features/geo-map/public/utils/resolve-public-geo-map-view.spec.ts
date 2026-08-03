import { describe, expect, it } from 'vitest';

import {
  DEFAULT_MAP_CENTER_LATITUDE,
  DEFAULT_MAP_CENTER_LONGITUDE,
  DEFAULT_MAP_ZOOM,
} from '@/features/geo-map/constants';
import { resolvePublicGeoMapView } from '@/features/geo-map/public/utils/resolve-public-geo-map-view';

describe('resolvePublicGeoMapView', () => {
  it('uses Yerevan defaults when there are no objects', () => {
    expect(resolvePublicGeoMapView([])).toEqual({
      center: {
        longitude: DEFAULT_MAP_CENTER_LONGITUDE,
        latitude: DEFAULT_MAP_CENTER_LATITUDE,
      },
      zoom: DEFAULT_MAP_ZOOM,
    });
  });

  it('centers on a single object at detail zoom', () => {
    expect(resolvePublicGeoMapView([{ longitude: 44.5, latitude: 40.18 }])).toEqual({
      center: { longitude: 44.5, latitude: 40.18 },
      zoom: 14,
    });
  });

  it('fits multiple objects with a wider zoom', () => {
    const view = resolvePublicGeoMapView([
      { longitude: 44.5, latitude: 40.18 },
      { longitude: 44.52, latitude: 40.2 },
    ]);
    expect(view.center.longitude).toBeCloseTo(44.51, 5);
    expect(view.center.latitude).toBeCloseTo(40.19, 5);
    expect(view.zoom).toBeGreaterThanOrEqual(10);
    expect(view.zoom).toBeLessThanOrEqual(15);
  });
});
