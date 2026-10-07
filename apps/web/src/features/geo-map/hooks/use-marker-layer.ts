'use client';

import type { MapLibreMap } from 'maplibre-gl';
import { useEffect, useRef } from 'react';

import { MARKER_CLUSTER_MAX_ZOOM } from '@/features/geo-map/constants';
import {
  clearClusterMarkers,
  syncClusteredMarkers,
  type ManagedClusterMarker,
} from '@/features/geo-map/hooks/marker-layer-clusters';
import {
  clearPinMarkers,
  syncPinMarkers,
  type ManagedPinMarker,
  type MarkerCallbacks,
} from '@/features/geo-map/hooks/marker-layer-pins';
import type { GeoMapLngLat, GeoMapObject } from '@/features/geo-map/types';

export type UseMarkerLayerOptions = {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
  markerObjects: GeoMapObject[];
  zoom: number;
  editable: boolean;
  /**
   * When true and zoom is below {@link MARKER_CLUSTER_MAX_ZOOM}, nearby pins
   * collapse into apartment-count bubbles. Admin editing passes false.
   */
  clusterMarkers?: boolean;
  highlightedObjectId?: string | null | undefined;
  onObjectClick?: ((id: string) => void) | undefined;
  onObjectHover?: ((id: string | null) => void) | undefined;
  /** Fired continuously while an editable pin drag is in progress. */
  onObjectDragMove?: ((id: string, position: GeoMapLngLat) => void) | undefined;
  onObjectDragged?: ((id: string, position: GeoMapLngLat) => void) | undefined;
};

/**
 * Renders `markerObjects` as MapLibre HTML pins. Read-only maps cluster
 * overlapping pins into apartment-count bubbles until {@link MARKER_CLUSTER_MAX_ZOOM}.
 *
 * MapLibre positions each pin through the root element's inline `transform`, so
 * hover / selected styling is CSS-only on the Lucide SVG (`.geo-map-pin__shape`).
 * Objects with invalid coordinates are skipped instead of anchored to `0,0`.
 */
export const useMarkerLayer = ({
  map,
  isMapLoaded,
  markerObjects,
  zoom,
  editable,
  clusterMarkers = false,
  highlightedObjectId = null,
  onObjectClick,
  onObjectHover,
  onObjectDragMove,
  onObjectDragged,
}: UseMarkerLayerOptions): void => {
  const pinsRef = useRef(new Map<string, ManagedPinMarker>());
  const clustersRef = useRef(new Map<string, ManagedClusterMarker>());
  const draggingIdRef = useRef<string | null>(null);
  const callbacksRef = useRef<MarkerCallbacks>({
    onObjectClick,
    onObjectHover,
    onObjectDragMove,
    onObjectDragged,
  });
  callbacksRef.current = {
    onObjectClick,
    onObjectHover,
    onObjectDragMove,
    onObjectDragged,
  };

  useEffect(() => {
    if (!map || !isMapLoaded) {
      return;
    }
    const clustering = clusterMarkers && zoom < MARKER_CLUSTER_MAX_ZOOM;
    if (!clustering) {
      clearClusterMarkers(clustersRef.current);
      syncPinMarkers(
        map,
        pinsRef.current,
        markerObjects,
        zoom,
        editable,
        highlightedObjectId,
        draggingIdRef.current,
        draggingIdRef,
        callbacksRef,
      );
      return;
    }
    syncClusteredMarkers({
      map,
      pins: pinsRef.current,
      clusters: clustersRef.current,
      markerObjects,
      zoom,
      highlightedObjectId,
      draggingId: draggingIdRef.current,
      draggingIdRef,
      callbacksRef,
    });
  }, [map, isMapLoaded, markerObjects, zoom, editable, clusterMarkers, highlightedObjectId]);

  useEffect(() => {
    const pins = pinsRef.current;
    const clusters = clustersRef.current;
    return () => {
      clearPinMarkers(pins);
      clearClusterMarkers(clusters);
    };
  }, []);
};
