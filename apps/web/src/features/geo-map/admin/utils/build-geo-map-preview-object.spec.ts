import { describe, expect, it } from 'vitest';

import { GEO_MAP_PREVIEW_MIN_ZOOM, GEO_MAP_PREVIEW_PIN_ID } from '@/features/geo-map/admin/constants';
import { buildGeoMapPreviewObject } from '@/features/geo-map/admin/utils/build-geo-map-preview-object';

describe('buildGeoMapPreviewObject', () => {
  it('builds an unsaved pin that never reaches model zoom', () => {
    const object = buildGeoMapPreviewObject(
      { longitude: 44.51, latitude: 40.18 },
      'Preview',
    );

    expect(object.id).toBe(GEO_MAP_PREVIEW_PIN_ID);
    expect(object.projectId).toBeNull();
    expect(object.longitude).toBe(44.51);
    expect(object.latitude).toBe(40.18);
    expect(object.minZoom).toBe(GEO_MAP_PREVIEW_MIN_ZOOM);
    expect(object.minZoom).toBeGreaterThan(22);
  });
});
