'use client';

import { MapLibreMap } from 'maplibre-gl';
import { type RefObject, useEffect, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

import {
  DEFAULT_MAP_BEARING_DEG,
  DEFAULT_MAP_PITCH_DEG,
  MAX_MAP_PITCH_DEG,
} from '@/features/geo-map/constants';
import type { GeoMapLngLat } from '@/features/geo-map/types';
import { applyBrandMapStyle } from '@/features/geo-map/utils/apply-brand-map-style';
import { configureMaplibreWorker } from '@/features/geo-map/utils/configure-maplibre-worker';

export type UseMaplibreMapOptions = {
  containerRef: RefObject<HTMLDivElement | null>;
  styleUrl: string;
  initialCenter: GeoMapLngLat;
  initialZoom: number;
  initialPitch?: number;
  initialBearing?: number;
};

export type UseMaplibreMapResult = {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
};

/**
 * Creates and tears down the MapLibre `Map` instance for the lifetime of the
 * container element. Style/initial camera are applied once, on mount only —
 * `GeoMapCanvas` is uncontrolled with respect to camera state after that.
 *
 * Rotate / tilt (MapLibre defaults, left enabled explicitly for clarity):
 * - Desktop: right-drag or Ctrl+drag to rotate bearing and pitch around the center.
 * - Touch: two-finger rotate/zoom; two-finger drag to pitch (`touchPitch`).
 * - Zoom / rotate / tilt buttons: `GeoMapCameraControls` in `GeoMapCanvas`.
 */
export const useMaplibreMap = ({
  containerRef,
  styleUrl,
  initialCenter,
  initialZoom,
  initialPitch = DEFAULT_MAP_PITCH_DEG,
  initialBearing = DEFAULT_MAP_BEARING_DEG,
}: UseMaplibreMapOptions): UseMaplibreMapResult => {
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    configureMaplibreWorker();

    const mapInstance = new MapLibreMap({
      container,
      style: styleUrl,
      center: [initialCenter.longitude, initialCenter.latitude],
      zoom: initialZoom,
      pitch: initialPitch,
      bearing: initialBearing,
      maxPitch: MAX_MAP_PITCH_DEG,
      dragRotate: true,
      touchPitch: true,
      touchZoomRotate: true,
      attributionControl: { compact: true },
    });
    mapInstance.on('load', () => {
      applyBrandMapStyle(mapInstance);
      mapInstance.resize();
      setIsMapLoaded(true);
    });
    setMap(mapInstance);

    const resizeObserver = new ResizeObserver(() => {
      mapInstance.resize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      mapInstance.remove();
      setMap(null);
      setIsMapLoaded(false);
    };
    // Style/center/zoom/pitch/bearing are only ever applied on the initial mount;
    // intentionally omitted from deps so later prop changes don't recreate the map.
  }, [containerRef]);

  return { map, isMapLoaded };
};
