'use client';

import type { MapLibreMap } from 'maplibre-gl';
import { useEffect, useRef } from 'react';

import { FOCUS_FLY_TO_DURATION_MS, FOCUS_PITCH_DEG } from '@/features/geo-map/constants';
import type { GeoMapFocusRequest, GeoMapObject } from '@/features/geo-map/types';
import { findFocusObject, resolveFocusCamera } from '@/features/geo-map/utils/resolve-focus-camera';

export type UseMapFocusOptions = {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
  objects: readonly GeoMapObject[];
  focusRequest: GeoMapFocusRequest | undefined;
};

/**
 * Watches `focusRequest.token` and flies the MapLibre camera to the target object.
 * Re-triggers only when the token changes (same objectId can be focused again).
 */
export const useMapFocus = ({
  map,
  isMapLoaded,
  objects,
  focusRequest,
}: UseMapFocusOptions): void => {
  const lastTokenRef = useRef<number | null>(null);

  useEffect(() => {
    if (!map || !isMapLoaded || !focusRequest) {
      return;
    }
    if (lastTokenRef.current === focusRequest.token) {
      return;
    }

    const object = findFocusObject(objects, focusRequest.objectId);
    if (!object) {
      return;
    }

    lastTokenRef.current = focusRequest.token;
    const camera = resolveFocusCamera(object, focusRequest.zoom);
    map.flyTo({
      center: [camera.center.longitude, camera.center.latitude],
      zoom: camera.zoom,
      pitch: FOCUS_PITCH_DEG,
      duration: FOCUS_FLY_TO_DURATION_MS,
      essential: true,
    });
  }, [map, isMapLoaded, objects, focusRequest]);
};
