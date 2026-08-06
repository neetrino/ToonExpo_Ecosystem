'use client';

import { MapLibreMap } from 'maplibre-gl';
import { type RefObject, useEffect, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

import {
  COLD_START_MAP_PITCH_DEG,
  COLD_START_PITCH_EASE_DURATION_MS,
  DEFAULT_MAP_BEARING_DEG,
  DEFAULT_MAP_PITCH_DEG,
  MAP_ANTIALIAS_ENABLED,
  MAP_FADE_DURATION_MS,
  MAP_MAX_PIXEL_RATIO,
  MAX_MAP_PITCH_DEG,
} from '@/features/geo-map/constants';
import type { GeoMapLngLat } from '@/features/geo-map/types';
import { applyBrandMapStyle } from '@/features/geo-map/utils/apply-brand-map-style';
import { applyMapAtmosphere } from '@/features/geo-map/utils/apply-map-atmosphere';
import { configureMaplibreWorker } from '@/features/geo-map/utils/configure-maplibre-worker';
import { registerMissingStyleImageResolver } from '@/features/geo-map/utils/register-missing-style-image-resolver';

export type UseMaplibreMapOptions = {
  containerRef: RefObject<HTMLDivElement | null>;
  styleUrl: string;
  initialCenter: GeoMapLngLat;
  initialZoom: number;
  /**
   * When set, camera starts at this pitch (lab/tests). When omitted, mounts at
   * pitch 0 and eases once to {@link DEFAULT_MAP_PITCH_DEG} after style idle.
   */
  initialPitch?: number;
  initialBearing?: number;
};

export type UseMaplibreMapResult = {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
};

type CreateMapInstanceOptions = {
  container: HTMLElement;
  styleUrl: string;
  initialCenter: GeoMapLngLat;
  initialZoom: number;
  startPitch: number;
  initialBearing: number;
  easePitchOnIdle: boolean;
  onLoaded: () => void;
};

const resolveMapPixelRatio = (): number =>
  Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, MAP_MAX_PIXEL_RATIO);

const scheduleColdStartPitchEase = (mapInstance: MapLibreMap): void => {
  mapInstance.once('idle', () => {
    mapInstance.easeTo({
      pitch: DEFAULT_MAP_PITCH_DEG,
      duration: COLD_START_PITCH_EASE_DURATION_MS,
    });
  });
};

const createMapInstance = ({
  container,
  styleUrl,
  initialCenter,
  initialZoom,
  startPitch,
  initialBearing,
  easePitchOnIdle,
  onLoaded,
}: CreateMapInstanceOptions): MapLibreMap => {
  const mapInstance = new MapLibreMap({
    container,
    style: styleUrl,
    center: [initialCenter.longitude, initialCenter.latitude],
    zoom: initialZoom,
    pitch: startPitch,
    bearing: initialBearing,
    maxPitch: MAX_MAP_PITCH_DEG,
    fadeDuration: MAP_FADE_DURATION_MS,
    canvasContextAttributes: { antialias: MAP_ANTIALIAS_ENABLED },
    pixelRatio: resolveMapPixelRatio(),
    dragRotate: true,
    touchPitch: true,
    touchZoomRotate: true,
    attributionControl: { compact: true },
  });
  // OpenFreeMap liberty sprite omits many OSM amenity icons the style references.
  registerMissingStyleImageResolver(mapInstance);
  mapInstance.on('load', () => {
    applyBrandMapStyle(mapInstance);
    applyMapAtmosphere(mapInstance);
    mapInstance.resize();
    onLoaded();
    if (easePitchOnIdle) {
      scheduleColdStartPitchEase(mapInstance);
    }
  });
  return mapInstance;
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
  initialPitch,
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
    const hasExplicitPitch = initialPitch !== undefined;
    const mapInstance = createMapInstance({
      container,
      styleUrl,
      initialCenter,
      initialZoom,
      startPitch: hasExplicitPitch ? initialPitch : COLD_START_MAP_PITCH_DEG,
      initialBearing,
      easePitchOnIdle: !hasExplicitPitch,
      onLoaded: () => setIsMapLoaded(true),
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
