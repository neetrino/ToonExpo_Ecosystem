/**
 * Geo-map / 3D project map model contracts (admin + public).
 */

export type AdminGeoMapModelItem = {
  id: string;
  projectId: string;
  projectName: string;
  projectSlug: string;
  mediaAssetId: string;
  modelUrl: string;
  longitude: string;
  latitude: string;
  altitudeM: string;
  headingDeg: string;
  pitchDeg: string;
  rollDeg: string;
  scale: string;
  minZoom: string;
  isPublished: boolean;
  createdByUserId: string;
  updatedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminGeoMapModelListResponse = {
  data: AdminGeoMapModelItem[];
};

export type CreateGeoMapModelRequest = {
  projectId: string;
  mediaAssetId: string;
  longitude: number;
  latitude: number;
  altitudeM?: number;
  headingDeg?: number;
  pitchDeg?: number;
  rollDeg?: number;
  scale?: number;
  minZoom?: number;
  isPublished?: boolean;
};

export type UpdateGeoMapModelRequest = {
  mediaAssetId?: string;
  longitude?: number;
  latitude?: number;
  altitudeM?: number;
  headingDeg?: number;
  pitchDeg?: number;
  rollDeg?: number;
  scale?: number;
  minZoom?: number;
  isPublished?: boolean;
};

export type PublicGeoMapModelItem = {
  projectId: string;
  projectSlug: string;
  projectName: string;
  longitude: string;
  latitude: string;
  modelUrl: string;
  altitudeM: string;
  headingDeg: string;
  pitchDeg: string;
  rollDeg: string;
  scale: string;
  minZoom: string;
};

export type PublicGeoMapModelListResponse = {
  data: PublicGeoMapModelItem[];
};
