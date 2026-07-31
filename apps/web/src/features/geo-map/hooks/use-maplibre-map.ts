'use client';

import { MapLibreMap, NavigationControl } from 'maplibre-gl';
import { type RefObject, useEffect, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

import { NAVIGATION_CONTROL_POSITION } from '@/features/geo-map/constants';
import type { GeoMapLngLat } from '@/features/geo-map/types';
import { configureMaplibreWorker } from '@/features/geo-map/utils/configure-maplibre-worker';

export type UseMaplibreMapOptions = {
  containerRef: RefObject<HTMLDivElement | null>;
  styleUrl: string;
  initialCenter: GeoMapLngLat;
  initialZoom: number;
};

export type UseMaplibreMapResult = {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
};

/**
 * Creates and tears down the MapLibre `Map` instance for the lifetime of the
 * container element. Style/initial camera are applied once, on mount only —
 * `GeoMapCanvas` is uncontrolled with respect to camera state after that.
 */
export const useMaplibreMap = ({
  containerRef,
  styleUrl,
  initialCenter,
  initialZoom,
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
    });
    mapInstance.addControl(new NavigationControl(), NAVIGATION_CONTROL_POSITION);
    mapInstance.on('load', () => {
      mapInstance.resize();
      setIsMapLoaded(true);
    });
    setMap(mapInstance);

    return () => {
      mapInstance.remove();
      setMap(null);
      setIsMapLoaded(false);
    };
    // Style/center/zoom are only ever applied on the initial mount; intentionally
    // omitted from deps so later prop changes don't recreate the map instance.
  }, [containerRef]);

  return { map, isMapLoaded };
};
