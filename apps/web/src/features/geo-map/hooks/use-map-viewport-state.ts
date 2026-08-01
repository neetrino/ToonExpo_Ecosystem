'use client';

import type { MapLibreMap } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';

import { VIEWPORT_ZOOM_QUANTIZE_DECIMALS } from '@/features/geo-map/constants';
import type { LngLatBounds } from '@/features/geo-map/utils/geo-bounds';
import {
  buildViewportSignature,
  quantizeDecimal,
} from '@/features/geo-map/utils/geo-map-update-signatures';

export type MapViewportState = {
  zoom: number;
  bounds: LngLatBounds | null;
};

const readViewportState = (map: MapLibreMap): MapViewportState => {
  const bounds = map.getBounds();
  return {
    zoom: quantizeDecimal(map.getZoom(), VIEWPORT_ZOOM_QUANTIZE_DECIMALS),
    bounds: {
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
    },
  };
};

/**
 * Tracks map zoom + viewport bounds for marker/model visibility.
 *
 * `move` is rAF-coalesced and React state only updates when the quantized
 * zoom/bounds signature changes — avoids ScenegraphLayer / OSM filter thrash
 * on every camera frame.
 */
export const useMapViewportState = (
  map: MapLibreMap | null,
  isMapLoaded: boolean,
  initialZoom: number,
): MapViewportState => {
  const [viewport, setViewport] = useState<MapViewportState>({
    zoom: quantizeDecimal(initialZoom, VIEWPORT_ZOOM_QUANTIZE_DECIMALS),
    bounds: null,
  });
  const signatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map || !isMapLoaded) {
      return;
    }

    let rafId: number | null = null;

    const publishIfChanged = (): void => {
      const next = readViewportState(map);
      const signature = buildViewportSignature(next);
      if (signatureRef.current === signature) {
        return;
      }
      signatureRef.current = signature;
      setViewport(next);
    };

    const handleMove = (): void => {
      if (rafId !== null) {
        return;
      }
      rafId = requestAnimationFrame(() => {
        rafId = null;
        publishIfChanged();
      });
    };

    publishIfChanged();
    map.on('move', handleMove);

    return () => {
      map.off('move', handleMove);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [map, isMapLoaded]);

  return viewport;
};
