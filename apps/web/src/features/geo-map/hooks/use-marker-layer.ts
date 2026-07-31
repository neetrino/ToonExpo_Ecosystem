'use client';

import { Marker, type MapLibreMap } from 'maplibre-gl';
import { useEffect, useRef } from 'react';

import {
  MARKER_ELEMENT_CLASS_NAME,
  MARKER_ELEMENT_EDITABLE_CLASS_NAME,
  MARKER_ELEMENT_HIGHLIGHTED_CLASS_NAME,
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
  element.textContent = label;
  return element;
};

type MarkerCallbacks = Pick<
  UseMarkerLayerOptions,
  'onObjectClick' | 'onObjectHover' | 'onObjectDragged'
>;

const attachMarkerHandlers = (
  marker: Marker,
  element: HTMLDivElement,
  id: string,
  { onObjectClick, onObjectHover, onObjectDragged }: MarkerCallbacks,
): void => {
  element.addEventListener('click', (event) => {
    event.stopPropagation();
    onObjectClick?.(id);
  });
  element.addEventListener('mouseenter', () => onObjectHover?.(id));
  element.addEventListener('mouseleave', () => onObjectHover?.(null));
  marker.on('dragend', () => {
    const lngLat = marker.getLngLat();
    onObjectDragged?.(id, { longitude: lngLat.lng, latitude: lngLat.lat });
  });
};

const syncMarkers = (
  map: MapLibreMap,
  markers: Map<string, Marker>,
  markerObjects: GeoMapObject[],
  zoom: number,
  editable: boolean,
  highlightedObjectId: string | null | undefined,
  callbacks: MarkerCallbacks,
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
      existing.setLngLat([object.longitude, object.latitude]);
      existing.setDraggable(editable);
      const element = existing.getElement();
      element.className = resolveMarkerClassName(editable, highlighted);
      element.style.setProperty('opacity', String(opacity));
      continue;
    }

    const element = createMarkerElement(object.label, editable, highlighted);
    element.style.setProperty('opacity', String(opacity));
    const marker = new Marker({ element, draggable: editable })
      .setLngLat([object.longitude, object.latitude])
      .addTo(map);
    attachMarkerHandlers(marker, element, object.id, callbacks);
    markers.set(object.id, marker);
  }
};

/**
 * Renders `markerObjects` as MapLibre HTML markers (project name labels),
 * draggable when `editable`, reporting drag results via `onObjectDragged`.
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
  onObjectDragged,
}: UseMarkerLayerOptions): void => {
  const markersRef = useRef(new Map<string, Marker>());

  useEffect(() => {
    if (!map || !isMapLoaded) {
      return;
    }
    syncMarkers(map, markersRef.current, markerObjects, zoom, editable, highlightedObjectId, {
      onObjectClick,
      onObjectHover,
      onObjectDragged,
    });
  }, [
    map,
    isMapLoaded,
    markerObjects,
    zoom,
    editable,
    highlightedObjectId,
    onObjectClick,
    onObjectHover,
    onObjectDragged,
  ]);

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
