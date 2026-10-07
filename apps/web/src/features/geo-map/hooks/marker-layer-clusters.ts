import { Marker, type MapLibreMap } from 'maplibre-gl';

import {
  MAP_CAMERA_EASE_DURATION_MS,
  MARKER_CLUSTER_RADIUS_PX,
} from '@/features/geo-map/constants';
import {
  prunePinMarkers,
  upsertObjectPin,
  type ManagedPinMarker,
  type MarkerCallbacks,
} from '@/features/geo-map/hooks/marker-layer-pins';
import type { GeoMapObject } from '@/features/geo-map/types';
import { isValidGeoMapLngLat } from '@/features/geo-map/utils/validate-geo-map-position';
import {
  clusterScreenPoints,
  resolveClusterExpandZoom,
  shouldRenderClusterBubble,
  type ClusterScreenPoint,
  type MapMarkerCluster,
} from '@/features/geo-map/utils/cluster-screen-points';
import {
  applyGeoMapClusterState,
  createGeoMapClusterElement,
} from '@/features/geo-map/utils/create-geo-map-cluster-element';

export type ManagedClusterMarker = {
  marker: Marker;
  element: HTMLDivElement;
};

type ProjectedMarker = ClusterScreenPoint & { object: GeoMapObject };

type ClusterSyncInput = {
  map: MapLibreMap;
  pins: Map<string, ManagedPinMarker>;
  clusters: Map<string, ManagedClusterMarker>;
  markerObjects: readonly GeoMapObject[];
  zoom: number;
  highlightedObjectId: string | null | undefined;
  draggingId: string | null;
  draggingIdRef: { current: string | null };
  callbacksRef: { current: MarkerCallbacks };
};

const CLUSTER_MARKER_PREFIX = 'cluster:';

const motionDurationMs = (): number => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 0;
  }
  return MAP_CAMERA_EASE_DURATION_MS;
};

const expandCluster = (map: MapLibreMap, marker: Marker): void => {
  const center = marker.getLngLat();
  map.easeTo({
    center,
    zoom: resolveClusterExpandZoom(map.getZoom()),
    duration: motionDurationMs(),
  });
};

const bindClusterExpand = (element: HTMLDivElement, map: MapLibreMap, marker: Marker): void => {
  const activate = (event: Event): void => {
    event.stopPropagation();
    expandCluster(map, marker);
  };
  element.addEventListener('click', activate);
  element.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    activate(event);
  });
};

const projectMarker = (map: MapLibreMap, object: GeoMapObject): ProjectedMarker => {
  const screen = map.project([object.longitude, object.latitude]);
  return {
    id: object.id,
    longitude: object.longitude,
    latitude: object.latitude,
    apartmentCount: object.apartmentCount,
    x: screen.x,
    y: screen.y,
    object,
  };
};

const syncClusterPosition = (marker: Marker, longitude: number, latitude: number): void => {
  const current = marker.getLngLat();
  if (current.lng === longitude && current.lat === latitude) {
    return;
  }
  marker.setLngLat([longitude, latitude]);
};

const pruneClusterMarkers = (
  markers: Map<string, ManagedClusterMarker>,
  nextIds: ReadonlySet<string>,
): void => {
  for (const [id, managed] of markers) {
    if (nextIds.has(id)) {
      continue;
    }
    managed.marker.remove();
    markers.delete(id);
  }
};

const upsertClusterMarker = (
  map: MapLibreMap,
  clusters: Map<string, ManagedClusterMarker>,
  id: string,
  longitude: number,
  latitude: number,
  apartmentCount: number,
): void => {
  const existing = clusters.get(id);
  if (existing) {
    syncClusterPosition(existing.marker, longitude, latitude);
    applyGeoMapClusterState(existing.element, apartmentCount);
    return;
  }

  const element = createGeoMapClusterElement(apartmentCount);
  const marker = new Marker({ element, anchor: 'center' })
    .setLngLat([longitude, latitude])
    .addTo(map);
  bindClusterExpand(element, map, marker);
  clusters.set(id, { marker, element });
};

export const clearClusterMarkers = (markers: Map<string, ManagedClusterMarker>): void => {
  for (const managed of markers.values()) {
    managed.marker.remove();
  }
  markers.clear();
};

const clusterMarkerId = (groupId: string): string => `${CLUSTER_MARKER_PREFIX}${groupId}`;

const placeGroupPins = (
  map: MapLibreMap,
  pins: Map<string, ManagedPinMarker>,
  members: readonly ProjectedMarker[],
  input: ClusterSyncInput,
): void => {
  for (const member of members) {
    upsertObjectPin(
      map,
      pins,
      member.object,
      input.zoom,
      false,
      input.highlightedObjectId,
      input.draggingId,
      input.draggingIdRef,
      input.callbacksRef,
    );
  }
};

const applyClusterGroup = (
  map: MapLibreMap,
  pins: Map<string, ManagedPinMarker>,
  clusters: Map<string, ManagedClusterMarker>,
  group: MapMarkerCluster<ProjectedMarker>,
  input: ClusterSyncInput,
): void => {
  if (!shouldRenderClusterBubble(group.members.length, group.apartmentCount)) {
    placeGroupPins(map, pins, group.members, input);
    return;
  }
  upsertClusterMarker(
    map,
    clusters,
    clusterMarkerId(group.id),
    group.longitude,
    group.latitude,
    group.apartmentCount,
  );
};

/**
 * Replaces public pins with one apartment-count bubble per district.
 * A placement with no published apartments stays an ordinary pin.
 */
export const syncClusteredMarkers = (input: ClusterSyncInput): void => {
  const grouped = clusterScreenPoints(
    input.markerObjects
      .filter(isValidGeoMapLngLat)
      .map((object) => projectMarker(input.map, object)),
    MARKER_CLUSTER_RADIUS_PX,
  );
  const nextPinIds = new Set<string>();
  const nextClusterIds = new Set<string>();
  for (const group of grouped) {
    if (!shouldRenderClusterBubble(group.members.length, group.apartmentCount)) {
      for (const member of group.members) {
        nextPinIds.add(member.object.id);
      }
      continue;
    }
    nextClusterIds.add(clusterMarkerId(group.id));
  }
  prunePinMarkers(input.pins, nextPinIds);
  pruneClusterMarkers(input.clusters, nextClusterIds);
  for (const group of grouped) {
    applyClusterGroup(input.map, input.pins, input.clusters, group, input);
  }
};
