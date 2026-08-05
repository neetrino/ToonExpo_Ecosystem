'use client';

import { Marker, type MapLibreMap } from 'maplibre-gl';
import { useEffect, useRef } from 'react';

import {
  MARKER_ELEMENT_CLASS_NAME,
  MARKER_ELEMENT_EDITABLE_CLASS_NAME,
  MARKER_ELEMENT_SELECTED_CLASS_NAME,
  MARKER_PIN_SVG_INNER_HTML,
} from '@/features/geo-map/constants';
import type { GeoMapLngLat, GeoMapObject } from '@/features/geo-map/types';
import { isValidGeoMapLngLat } from '@/features/geo-map/utils/validate-geo-map-position';
import { computeMarkerFadeOpacity } from '@/features/geo-map/utils/zoom-fade-opacity';

export type UseMarkerLayerOptions = {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
  markerObjects: GeoMapObject[];
  zoom: number;
  editable: boolean;
  highlightedObjectId?: string | null | undefined;
  onObjectClick?: ((id: string) => void) | undefined;
  onObjectHover?: ((id: string | null) => void) | undefined;
  /** Fired continuously while an editable pin drag is in progress. */
  onObjectDragMove?: ((id: string, position: GeoMapLngLat) => void) | undefined;
  onObjectDragged?: ((id: string, position: GeoMapLngLat) => void) | undefined;
};

/**
 * Applies state as class toggles / attributes only. Never assigns `className`:
 * MapLibre keeps `maplibregl-marker` (absolute positioning) on the same element,
 * and dropping it makes every pin fall back into document flow.
 */
const applyMarkerState = (
  element: HTMLElement,
  label: string,
  editable: boolean,
  selected: boolean,
): void => {
  element.classList.toggle(MARKER_ELEMENT_EDITABLE_CLASS_NAME, editable);
  element.classList.toggle(MARKER_ELEMENT_SELECTED_CLASS_NAME, selected);
  element.setAttribute('aria-label', label);
  element.title = label;
};

const createMarkerElement = (
  label: string,
  editable: boolean,
  selected: boolean,
): HTMLDivElement => {
  const element = document.createElement('div');
  element.classList.add(MARKER_ELEMENT_CLASS_NAME);
  element.setAttribute('role', 'button');
  element.innerHTML = MARKER_PIN_SVG_INNER_HTML;
  applyMarkerState(element, label, editable, selected);
  return element;
};

type MarkerCallbacks = Pick<
  UseMarkerLayerOptions,
  'onObjectClick' | 'onObjectHover' | 'onObjectDragMove' | 'onObjectDragged'
>;

const toLngLat = (marker: Marker): GeoMapLngLat => {
  const lngLat = marker.getLngLat();
  return { longitude: lngLat.lng, latitude: lngLat.lat };
};

/** Skips redundant `setLngLat` so re-renders never re-project an unchanged pin. */
const syncMarkerPosition = (marker: Marker, object: GeoMapObject): void => {
  const current = marker.getLngLat();
  if (current.lng === object.longitude && current.lat === object.latitude) {
    return;
  }
  marker.setLngLat([object.longitude, object.latitude]);
};

const attachMarkerHandlers = (
  marker: Marker,
  element: HTMLDivElement,
  id: string,
  draggingIdRef: { current: string | null },
  callbacksRef: { current: MarkerCallbacks },
): void => {
  element.addEventListener('click', (event) => {
    event.stopPropagation();
    callbacksRef.current.onObjectClick?.(id);
  });
  element.addEventListener('mouseenter', () => callbacksRef.current.onObjectHover?.(id));
  element.addEventListener('mouseleave', () => callbacksRef.current.onObjectHover?.(null));
  marker.on('drag', () => {
    draggingIdRef.current = id;
    callbacksRef.current.onObjectDragMove?.(id, toLngLat(marker));
  });
  marker.on('dragend', () => {
    draggingIdRef.current = null;
    callbacksRef.current.onObjectDragged?.(id, toLngLat(marker));
  });
};

const syncMarkers = (
  map: MapLibreMap,
  markers: Map<string, Marker>,
  markerObjects: GeoMapObject[],
  zoom: number,
  editable: boolean,
  highlightedObjectId: string | null | undefined,
  draggingId: string | null,
  draggingIdRef: { current: string | null },
  callbacksRef: { current: MarkerCallbacks },
): void => {
  const placeableObjects = markerObjects.filter(isValidGeoMapLngLat);
  const nextIds = new Set(placeableObjects.map((object) => object.id));
  for (const [id, marker] of markers) {
    if (!nextIds.has(id)) {
      marker.remove();
      markers.delete(id);
    }
  }

  for (const object of placeableObjects) {
    const opacity = String(computeMarkerFadeOpacity(zoom, object.minZoom));
    const selected = object.id === highlightedObjectId;
    const existing = markers.get(object.id);
    if (existing) {
      if (draggingId !== object.id) {
        syncMarkerPosition(existing, object);
      }
      existing.setDraggable(editable);
      existing.setOpacity(opacity);
      applyMarkerState(existing.getElement(), object.label, editable, selected);
      continue;
    }

    const element = createMarkerElement(object.label, editable, selected);
    const marker = new Marker({ element, draggable: editable, anchor: 'bottom' })
      .setLngLat([object.longitude, object.latitude])
      .setOpacity(opacity)
      .addTo(map);
    attachMarkerHandlers(marker, element, object.id, draggingIdRef, callbacksRef);
    markers.set(object.id, marker);
  }
};

/**
 * Renders `markerObjects` as MapLibre HTML map-pin markers (always visible),
 * draggable when `editable`, reporting drag via `onObjectDragMove` / `onObjectDragged`.
 *
 * MapLibre positions each pin through the root element's inline `transform`, so
 * hover / selected styling is CSS-only on the inner SVG (`.geo-map-pin__shape`).
 * Objects with invalid coordinates are skipped instead of anchored to `0,0`.
 */
export const useMarkerLayer = ({
  map,
  isMapLoaded,
  markerObjects,
  zoom,
  editable,
  highlightedObjectId = null,
  onObjectClick,
  onObjectHover,
  onObjectDragMove,
  onObjectDragged,
}: UseMarkerLayerOptions): void => {
  const markersRef = useRef(new Map<string, Marker>());
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
    syncMarkers(
      map,
      markersRef.current,
      markerObjects,
      zoom,
      editable,
      highlightedObjectId,
      draggingIdRef.current,
      draggingIdRef,
      callbacksRef,
    );
  }, [map, isMapLoaded, markerObjects, zoom, editable, highlightedObjectId]);

  useEffect(() => {
    const markers = markersRef.current;
    return () => {
      for (const marker of markers.values()) {
        marker.remove();
      }
      markers.clear();
    };
  }, []);
};
