import { Marker, type MapLibreMap } from 'maplibre-gl';

import type { GeoMapLngLat, GeoMapObject } from '@/features/geo-map/types';
import {
  applyGeoMapPinState,
  createGeoMapPinElement,
  disposeGeoMapPinElement,
  type GeoMapPinElement,
} from '@/features/geo-map/utils/create-geo-map-pin-element';
import { isValidGeoMapLngLat } from '@/features/geo-map/utils/validate-geo-map-position';
import { computeMarkerFadeOpacity } from '@/features/geo-map/utils/zoom-fade-opacity';

export type MarkerCallbacks = {
  onObjectClick?: ((id: string) => void) | undefined;
  onObjectHover?: ((id: string | null) => void) | undefined;
  onObjectDragMove?: ((id: string, position: GeoMapLngLat) => void) | undefined;
  onObjectDragged?: ((id: string, position: GeoMapLngLat) => void) | undefined;
};

export type ManagedPinMarker = {
  marker: Marker;
  pin: GeoMapPinElement;
};

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

export const removeManagedPin = (
  managed: ManagedPinMarker,
  markers: Map<string, ManagedPinMarker>,
  id: string,
): void => {
  managed.marker.remove();
  disposeGeoMapPinElement(managed.pin);
  markers.delete(id);
};

export const prunePinMarkers = (
  markers: Map<string, ManagedPinMarker>,
  nextIds: ReadonlySet<string>,
): void => {
  for (const [id, managed] of markers) {
    if (!nextIds.has(id)) {
      removeManagedPin(managed, markers, id);
    }
  }
};

const attachPinHandlers = (
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

/** Creates or updates one project pin. Invalid coordinates must already be filtered out. */
export const upsertObjectPin = (
  map: MapLibreMap,
  markers: Map<string, ManagedPinMarker>,
  object: GeoMapObject,
  zoom: number,
  editable: boolean,
  highlightedObjectId: string | null | undefined,
  draggingId: string | null,
  draggingIdRef: { current: string | null },
  callbacksRef: { current: MarkerCallbacks },
): void => {
  const opacity = String(computeMarkerFadeOpacity(zoom, object.minZoom));
  const selected = object.id === highlightedObjectId;
  const existing = markers.get(object.id);
  if (existing) {
    if (draggingId !== object.id) {
      syncMarkerPosition(existing.marker, object);
    }
    existing.marker.setDraggable(editable);
    existing.marker.setOpacity(opacity);
    applyGeoMapPinState(existing.pin.element, object.label, editable, selected);
    return;
  }

  const pin = createGeoMapPinElement(object.label, editable, selected);
  const marker = new Marker({ element: pin.element, draggable: editable, anchor: 'bottom' })
    .setLngLat([object.longitude, object.latitude])
    .setOpacity(opacity)
    .addTo(map);
  attachPinHandlers(marker, pin.element, object.id, draggingIdRef, callbacksRef);
  markers.set(object.id, { marker, pin });
};

export const clearPinMarkers = (markers: Map<string, ManagedPinMarker>): void => {
  for (const [id, managed] of [...markers]) {
    removeManagedPin(managed, markers, id);
  }
};

/** Renders every valid object as its own pin. Drops ids that are no longer present. */
export const syncPinMarkers = (
  map: MapLibreMap,
  markers: Map<string, ManagedPinMarker>,
  markerObjects: readonly GeoMapObject[],
  zoom: number,
  editable: boolean,
  highlightedObjectId: string | null | undefined,
  draggingId: string | null,
  draggingIdRef: { current: string | null },
  callbacksRef: { current: MarkerCallbacks },
): void => {
  const placeable = markerObjects.filter(isValidGeoMapLngLat);
  prunePinMarkers(markers, new Set(placeable.map((object) => object.id)));
  for (const object of placeable) {
    upsertObjectPin(
      map,
      markers,
      object,
      zoom,
      editable,
      highlightedObjectId,
      draggingId,
      draggingIdRef,
      callbacksRef,
    );
  }
};
