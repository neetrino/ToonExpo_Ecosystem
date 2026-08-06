import { describe, expect, it } from 'vitest';

import { FOCUS_ZOOM_ABOVE_MIN, MAX_MAP_ZOOM, MIN_MAP_ZOOM } from '@/features/geo-map/constants';
import type { GeoMapObject } from '@/features/geo-map/types';
import { findFocusObject, resolveFocusCamera } from '@/features/geo-map/utils/resolve-focus-camera';

const baseObject = {
  longitude: 44.5152,
  latitude: 40.1872,
  minZoom: 14,
} as const;

describe('resolveFocusCamera', () => {
  it('centers on the object and zooms above minZoom by default', () => {
    expect(resolveFocusCamera(baseObject)).toEqual({
      center: { longitude: 44.5152, latitude: 40.1872 },
      zoom: 14 + FOCUS_ZOOM_ABOVE_MIN,
    });
  });

  it('uses an explicit zoom override when provided', () => {
    expect(resolveFocusCamera(baseObject, 16)).toEqual({
      center: { longitude: 44.5152, latitude: 40.1872 },
      zoom: 16,
    });
  });

  it('clamps zoom to the MapLibre range', () => {
    expect(resolveFocusCamera(baseObject, MIN_MAP_ZOOM - 5).zoom).toBe(MIN_MAP_ZOOM);
    expect(resolveFocusCamera(baseObject, MAX_MAP_ZOOM + 5).zoom).toBe(MAX_MAP_ZOOM);
  });
});

describe('findFocusObject', () => {
  const objects: GeoMapObject[] = [
    {
      id: 'proj-a',
      projectId: 'proj-a',
      label: 'Ajapnyak Terrace',
      logoUrl: null,
      addressLine: null,
      modelUrl: '/models/a.glb',
      sourceOsmId: null,
      longitude: 44.5,
      latitude: 40.18,
      altitudeM: 0,
      headingDeg: 0,
      pitchDeg: 0,
      rollDeg: 0,
      scale: 1,
      minZoom: 14,
    },
  ];

  it('returns the matching object by id', () => {
    expect(findFocusObject(objects, 'proj-a')?.label).toBe('Ajapnyak Terrace');
  });

  it('returns null when the id is unknown', () => {
    expect(findFocusObject(objects, 'missing')).toBeNull();
  });
});
