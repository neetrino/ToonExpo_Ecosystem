'use client';

import type { MapLibreMap } from 'maplibre-gl';
import { useEffect, useRef } from 'react';

import {
  ensureThreeBuildingLayer,
  removeThreeBuildingLayer,
} from '@/features/geo-map/three/custom-building-layer';
import type { GeoMapObject } from '@/features/geo-map/types';
import { buildThreeBuildingLayerSignature } from '@/features/geo-map/utils/geo-map-update-signatures';

export type UseThreeBuildingLayerOptions = {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
  /** Viewport-visible models (already includes transform / drag overrides). */
  modelObjects: GeoMapObject[];
};

/**
 * Mounts the MapLibre Three.js custom layer for GLB buildings and syncs
 * `modelObjects` whenever pose / url / set membership changes.
 */
export const useThreeBuildingLayer = ({
  map,
  isMapLoaded,
  modelObjects,
}: UseThreeBuildingLayerOptions): void => {
  const signatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map || !isMapLoaded) {
      return;
    }
    ensureThreeBuildingLayer(map);
    signatureRef.current = null;

    return () => {
      removeThreeBuildingLayer(map);
      signatureRef.current = null;
    };
  }, [map, isMapLoaded]);

  useEffect(() => {
    if (!map || !isMapLoaded) {
      return;
    }
    const signature = buildThreeBuildingLayerSignature(modelObjects);
    if (signatureRef.current === signature) {
      return;
    }
    signatureRef.current = signature;
    const layer = ensureThreeBuildingLayer(map);
    layer.setModels(modelObjects);
  }, [map, isMapLoaded, modelObjects]);
};
