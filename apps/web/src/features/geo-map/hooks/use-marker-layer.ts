'use client';

import { Marker, type MapLibreMap } from 'maplibre-gl';
import { useEffect, useRef } from 'react';

import {
  MARKER_ELEMENT_CLASS_NAME,
  MARKER_ELEMENT_EDITABLE_CLASS_NAME,
  MARKER_ELEMENT_HIGHLIGHTED_CLASS_NAME,
  MARKER_PIN_SVG_INNER_HTML,
} from '@/features/geo-map/constants';
import type { GeoMapLngLat, GeoMapObject } from '@/features/geo-map/types';
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

const resolveMarkerClassName = (editable: boolean, highlighted: boolean): string => {
  const parts = [MARKER_ELEMENT_CLASS_NAME];
  if (editable) {
    parts.push(MARKER_ELEMENT_EDITABLE_CLASS_NAME);
  }
  if (highlighted) {
    parts.push(MARKER_ELEMENT_HIGHLIGHTED_CLASS_NAME);
  }
  return parts.join(' ');
};

const createMarkerElement = (
  label: string,
  editable: boolean,
  highlighted: boolean,
): HTMLDivElement => {
  const element = document.createElement('div');
  element.className = resolveMarkerClassName(editable, highlighted);
  element.setAttribute('role', 'button');
  element.setAttribute('aria-label', label);
  element.title = label;
  element.innerHTML = MARKER_PIN_SVG_INNER_HTML;
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
  const nextIds = new Set(markerObjects.map((object) => object.id));
  for (const [id, marker] of markers) {
    if (!nextIds.has(id)) {
      marker.remove();
      markers.delete(id);
    }
  }

  for (const object of markerObjects) {
    const opacity = computeMarkerFadeOpacity(zoom, object.minZoom);
    const highlighted = object.id === highlightedObjectId;
    const existing = markers.get(object.id);
    if (existing) {
      if (draggingId !== object.id) {
        existing.setLngLat([object.longitude, object.latitude]);
      }
      existing.setDraggable(editable);
      const element = existing.getElement();
      element.className = resolveMarkerClassName(editable, highlighted);
      element.setAttribute('aria-label', object.label);
      element.title = object.label;
      if (!element.querySelector('svg')) {
        element.innerHTML = MARKER_PIN_SVG_INNER_HTML;
      }
      element.style.setProperty('opacity', String(opacity));
      continue;
    }

    const element = createMarkerElement(object.label, editable, highlighted);
    element.style.setProperty('opacity', String(opacity));
    const marker = new Marker({ element, draggable: editable, anchor: 'bottom' })
      .setLngLat([object.longitude, object.latitude])
      .addTo(map);
    attachMarkerHandlers(marker, element, object.id, draggingIdRef, callbacksRef);
    markers.set(object.id, marker);
  }
};

/**
 * Renders `markerObjects` as MapLibre HTML map-pin markers (always visible),
 * draggable when `editable`, reporting drag via `onObjectDragMove` / `onObjectDragged`.
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
