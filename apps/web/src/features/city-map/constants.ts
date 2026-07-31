import type {
  CityMapPlacementItem,
  PublicCityMapConfig,
  PublicCityMapPlacement,
} from '@toonexpo/contracts';

export const CITY_MAP_PIN_SOURCE_ID = 'city-map-pins-source';
export const CITY_MAP_PIN_LAYER_ID = 'city-map-pins-layer';
export const CITY_MAP_PIN_SELECTED_LAYER_ID = 'city-map-pins-selected-layer';
export const CITY_MAP_CUSTOM_LAYER_ID = 'city-map-three-buildings';
/** Same-origin CSP worker (synced to `public/maplibre` on web build). */
export const CITY_MAP_MAPLIBRE_WORKER_URL = '/maplibre/maplibre-gl-csp-worker.js';

export const CITY_MAP_DEFAULT_CONFIG: PublicCityMapConfig = {
  styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
  centerLng: 44.5152,
  centerLat: 40.1872,
  initialZoom: 14,
  initialPitch: 55,
  initialBearing: -20,
};

export type CityMapModelPose = {
  id: string;
  projectId: string;
  buildingId: string;
  glbUrl: string;
  longitude: number;
  latitude: number;
  altitude: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  minZoom: number;
  label: string;
  /** Admin map only — public poses are always published. */
  publicationStatus?: 'draft' | 'published' | 'archived';
};

export const toPublicModelPose = (placement: PublicCityMapPlacement): CityMapModelPose => ({
  id: placement.id,
  projectId: placement.projectId,
  buildingId: placement.buildingId,
  glbUrl: placement.glbUrl,
  longitude: placement.longitude,
  latitude: placement.latitude,
  altitude: placement.altitude,
  rotationX: placement.rotationX,
  rotationY: placement.rotationY,
  rotationZ: placement.rotationZ,
  scale: placement.scale,
  minZoom: placement.minZoom,
  label: placement.label,
  publicationStatus: 'published',
});

export const toAdminModelPose = (placement: CityMapPlacementItem): CityMapModelPose => ({
  id: placement.id,
  projectId: placement.projectId,
  buildingId: placement.buildingId,
  glbUrl: placement.glbUrl,
  longitude: placement.longitude,
  latitude: placement.latitude,
  altitude: placement.altitude,
  rotationX: placement.rotationX,
  rotationY: placement.rotationY,
  rotationZ: placement.rotationZ,
  scale: placement.scale,
  minZoom: placement.minZoom,
  label: placement.labelOverride?.trim() || placement.buildingName,
  publicationStatus: placement.publicationStatus,
});

export const degToRad = (degrees: number): number => (degrees * Math.PI) / 180;

/** Client-side search over placement labels/addresses (admin + public). */
export const filterCityMapPlacementsByQuery = <
  T extends {
    label?: string | null;
    buildingName?: string | null;
    projectName?: string | null;
    projectAddress?: string | null;
    projectCity?: string | null;
    address?: string | null;
    city?: string | null;
    labelOverride?: string | null;
  },
>(
  items: T[],
  query: string,
): T[] => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return items;
  }
  return items.filter((item) => {
    const haystack = [
      item.label,
      item.labelOverride,
      item.buildingName,
      item.projectName,
      item.projectAddress,
      item.projectCity,
      item.address,
      item.city,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
};
