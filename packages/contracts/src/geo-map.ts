/**
 * Geo-map / 3D project map model contracts (admin + public).
 */

export type AdminGeoMapModelItem = {
  id: string;
  /** Null when the model was placed freely and is not yet attached to a project. */
  projectId: string | null;
  projectName: string | null;
  projectSlug: string | null;
  mediaAssetId: string;
  /** Original upload title when available (useful for unassigned list labels). */
  mediaTitle: string | null;
  modelUrl: string;
  /** OSM id used to hide the replaced extrusion; null when unknown / radius-only hide. */
  sourceOsmId: string | null;
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
  /** Omit / undefined to place without attaching a project yet. */
  projectId?: string;
  mediaAssetId: string;
  longitude: number;
  latitude: number;
  sourceOsmId?: string;
  altitudeM?: number;
  headingDeg?: number;
  pitchDeg?: number;
  rollDeg?: number;
  scale?: number;
  minZoom?: number;
  isPublished?: boolean;
};

export type UpdateGeoMapModelRequest = {
  /** Attach to a free project (v1: attach only, no detach). */
  projectId?: string;
  mediaAssetId?: string;
  sourceOsmId?: string | null;
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
  /** Builder company logo URL; null when the company has no logo media. */
  logoUrl: string | null;
  longitude: string;
  latitude: string;
  modelUrl: string;
  sourceOsmId: string | null;
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
