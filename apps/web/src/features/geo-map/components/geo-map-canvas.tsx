'use client';

import { useRef, useState } from 'react';

import {
  DEFAULT_MAP_CENTER_LATITUDE,
  DEFAULT_MAP_CENTER_LONGITUDE,
  DEFAULT_MAP_ZOOM,
} from '@/features/geo-map/constants';
import { GeoMapWebglFallback } from '@/features/geo-map/components/geo-map-webgl-fallback';
import { useDeckOverlay } from '@/features/geo-map/hooks/use-deck-overlay';
import { useMapFocus } from '@/features/geo-map/hooks/use-map-focus';
import { useMapViewportState } from '@/features/geo-map/hooks/use-map-viewport-state';
import { useMaplibreMap } from '@/features/geo-map/hooks/use-maplibre-map';
import { useMarkerLayer } from '@/features/geo-map/hooks/use-marker-layer';
import { useModelFootprintMasks } from '@/features/geo-map/hooks/use-model-footprint-masks';
import { useVisibleObjects } from '@/features/geo-map/hooks/use-visible-objects';
import { useWebglSupport } from '@/features/geo-map/hooks/use-webgl-support';
import type { GeoMapCanvasProps, GeoMapLngLat } from '@/features/geo-map/types';
import type { ObjectPositionOverride } from '@/features/geo-map/utils/apply-position-override';
import { resolveMapStyleUrl } from '@/features/geo-map/utils/resolve-map-style-url';

const DEFAULT_CENTER: GeoMapLngLat = {
  longitude: DEFAULT_MAP_CENTER_LONGITUDE,
  latitude: DEFAULT_MAP_CENTER_LATITUDE,
};

/**
 * Reusable MapLibre + deck.gl 3D map core (Stage 2a — see `docs/3D-MAP-PLAN.md`).
 *
 * Renders `objects` as markers (project name labels) below each object's `minZoom`,
 * and as GLB models — deck.gl `ScenegraphLayer`, interleaved with MapLibre via
 * `MapboxOverlay` — at/above `minZoom`. Model layers are limited to the current
 * viewport so only a few dozen GLBs load at once, however many objects are passed in.
 *
 * Optional `focusRequest` (Stage 5+) flies the camera to an object without
 * breaking existing read-only / editable consumers.
 *
 * Consumed by the admin editor (Stage 2b, `editable`), the public map (Stage 3),
 * and the home map (Stage 5). Load via `next/dynamic` with `ssr: false` —
 * see `GeoMapCanvasLazy`.
 */
export const GeoMapCanvas = ({
  objects,
  styleUrl,
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_MAP_ZOOM,
  editable = false,
  className,
  focusRequest,
  highlightedObjectId = null,
  onObjectClick,
  onObjectHover,
  onMapClick,
  onObjectDragged,
}: GeoMapCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isWebglSupported = useWebglSupport();
  const [dragOverride, setDragOverride] = useState<ObjectPositionOverride | null>(null);

  const { map, isMapLoaded } = useMaplibreMap({
    containerRef,
    styleUrl: styleUrl ?? resolveMapStyleUrl(),
    initialCenter,
    initialZoom,
  });
  const { zoom, bounds } = useMapViewportState(map, isMapLoaded, initialZoom);
  const { markerObjects, modelObjects } = useVisibleObjects(objects, dragOverride, zoom, bounds);

  useMapFocus({ map, isMapLoaded, objects, focusRequest });
  useModelFootprintMasks({ map, isMapLoaded, modelObjects });
  useMarkerLayer({
    map,
    isMapLoaded,
    markerObjects,
    zoom,
    editable,
    highlightedObjectId,
    onObjectClick,
    onObjectHover,
    onObjectDragged,
  });
  useDeckOverlay({
    map,
    isMapLoaded,
    modelObjects,
    zoom,
    editable,
    onObjectClick,
    onObjectHover,
    onMapClick,
    onModelDragMove: (id, position) => setDragOverride({ id, ...position }),
    onModelDragEnd: (id, position) => {
      setDragOverride(null);
      onObjectDragged?.(id, position);
    },
  });

  if (!isWebglSupported) {
    return <GeoMapWebglFallback className={className} />;
  }

  return <div ref={containerRef} className={`h-full w-full ${className ?? ''}`} />;
};
