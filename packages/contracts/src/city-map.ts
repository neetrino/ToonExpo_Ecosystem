import type { PublicationStatus } from './catalog.js';

export const CITY_MAP_MAX_PLACEMENTS = 200;

export const CITY_MAP_DEFAULT_ROTATION_X = 90;
export const CITY_MAP_DEFAULT_MIN_ZOOM = 13;

export type CityMapPlacementItem = {
  id: string;
  buildingId: string;
  projectId: string;
  glbMediaAssetId: string;
  glbUrl: string;
  longitude: number;
  latitude: number;
  altitude: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  minZoom: number;
  publicationStatus: PublicationStatus;
  labelOverride: string | null;
  buildingName: string;
  buildingDisplayOrder: number;
  projectName: string;
  projectAddress: string | null;
  projectCity: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CityMapPlacementListResponse = {
  data: CityMapPlacementItem[];
};

export type CityMapBuildingOption = {
  buildingId: string;
  buildingName: string;
  projectId: string;
  projectName: string;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  hasPlacement: boolean;
};

export type CityMapBuildingOptionsResponse = {
  data: CityMapBuildingOption[];
};

export type CreateCityMapPlacementRequest = {
  buildingId: string;
  glbMediaAssetId: string;
  longitude: number;
  latitude: number;
  altitude?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  scale?: number;
  minZoom?: number;
  labelOverride?: string | null;
  publicationStatus?: PublicationStatus;
};

export type UpdateCityMapPlacementRequest = {
  glbMediaAssetId?: string;
  longitude?: number;
  latitude?: number;
  altitude?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  scale?: number;
  minZoom?: number;
  labelOverride?: string | null;
  publicationStatus?: PublicationStatus;
};

export type PublicCityMapPlacement = {
  id: string;
  buildingId: string;
  projectId: string;
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
  buildingName: string;
  projectName: string;
  address: string | null;
  city: string | null;
};

export type PublicCityMapPlacementsResponse = {
  data: PublicCityMapPlacement[];
};

export type PublicCityMapConfig = {
  styleUrl: string;
  centerLng: number;
  centerLat: number;
  initialZoom: number;
  initialPitch: number;
  initialBearing: number;
};
