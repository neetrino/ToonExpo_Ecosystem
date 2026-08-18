'use client';

import type { MapLibreMap } from 'maplibre-gl';
import { useEffect, useRef } from 'react';

import {
  DEFAULT_MODEL_MIN_ZOOM,
  FOCUS_FLY_TO_DURATION_MS,
  FOCUS_PITCH_DEG,
  FOCUS_ZOOM_ABOVE_MIN,
} from '@/features/geo-map/constants';
import type { GeoMapViewRequest } from '@/features/geo-map/types';

export type UseMapViewRequestOptions = {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
  viewRequest: GeoMapViewRequest | undefined;
};

const DEFAULT_VIEW_ZOOM = DEFAULT_MODEL_MIN_ZOOM + FOCUS_ZOOM_ABOVE_MIN;

/**
 * Flies the camera to an arbitrary lng/lat when `viewRequest.token` changes.
 */
export const useMapViewRequest = ({
  map,
  isMapLoaded,
  viewRequest,
}: UseMapViewRequestOptions): void => {
  const lastTokenRef = useRef<number | null>(null);

  useEffect(() => {
    if (!map || !isMapLoaded || !viewRequest) {
      return;
    }
    if (lastTokenRef.current === viewRequest.token) {
      return;
    }

    lastTokenRef.current = viewRequest.token;
    map.flyTo({
      center: [viewRequest.center.longitude, viewRequest.center.latitude],
      zoom: viewRequest.zoom ?? DEFAULT_VIEW_ZOOM,
      pitch: FOCUS_PITCH_DEG,
      duration: FOCUS_FLY_TO_DURATION_MS,
      essential: true,
    });
  }, [map, isMapLoaded, viewRequest]);
};
