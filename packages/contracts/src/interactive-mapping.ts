/**
 * Interactive mapping (4-phase Admin wizard) contracts.
 * Coordinate contract: pointer → normalized 0…1 relative to object-fit:contain
 * content box; markers persist as xPercent/yPercent (0–100); polygons as svgPath
 * in media viewBox pixel space (Defense MappingCanvas parity).
 */

import type { PublicationStatus } from './catalog.js';
import type {
  VisualHotspotInteractionType,
  VisualHotspotShapeType,
  VisualMapContextType,
} from './visual-map.js';

export type InteractiveMappingPhaseId = 1 | 2 | 3 | 4;

export type InteractiveMappingPhaseStatus = 'locked' | 'active' | 'done';

export type InteractiveMappingPhaseProgress = {
  phase: InteractiveMappingPhaseId;
  status: InteractiveMappingPhaseStatus;
  titleKey: string;
};

export type InteractiveMappingDistrictSummary = {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  publicationStatus: PublicationStatus;
  displayOrder: number;
};

export type InteractiveMappingProjectSummary = {
  id: string;
  name: string;
  slug: string;
  builderCompanyId: string;
  publicationStatus: PublicationStatus;
  activePhase: InteractiveMappingPhaseId | null;
  phases: InteractiveMappingPhaseProgress[];
  districtCount: number;
  buildingCount: number;
  floorCount: number;
  apartmentCount: number;
};

export type InteractiveMappingProjectListResponse = {
  data: InteractiveMappingProjectSummary[];
};

export type InteractiveMappingCanvasSummary = {
  id: string;
  contextType: VisualMapContextType;
  contextId: string;
  mediaAssetId: string;
  mediaUrl: string;
  mediaWidth: number | null;
  mediaHeight: number | null;
  publicationStatus: PublicationStatus;
  isPrimary: boolean;
  hotspotCount: number;
};

export type InteractiveMappingBuildingSummary = {
  id: string;
  name: string;
  districtId: string | null;
  floorsCount: number | null;
  publicationStatus: PublicationStatus;
};

export type InteractiveMappingFloorSummary = {
  id: string;
  buildingId: string;
  number: number;
  name: string | null;
  floorplanMediaId: string | null;
  publicationStatus: PublicationStatus;
};

export type InteractiveMappingApartmentSummary = {
  id: string;
  buildingId: string;
  floorId: string;
  number: string;
  publicationStatus: PublicationStatus;
};

export type InteractiveMappingProjectDetail = {
  project: InteractiveMappingProjectSummary;
  districts: InteractiveMappingDistrictSummary[];
  buildings: InteractiveMappingBuildingSummary[];
  floors: InteractiveMappingFloorSummary[];
  apartments: InteractiveMappingApartmentSummary[];
  canvases: InteractiveMappingCanvasSummary[];
};

export type CreateDistrictRequest = {
  name: string;
  slug?: string;
  displayOrder?: number;
  publicationStatus?: PublicationStatus;
};

export type UpdateDistrictRequest = {
  name?: string;
  slug?: string;
  displayOrder?: number;
  publicationStatus?: PublicationStatus;
};

export type SetupBuildingFloorsRequest = {
  floorCount: number;
  renderMediaAssetId?: string;
};

export type SetupBuildingFloorsResponse = {
  buildingId: string;
  floorsCount: number;
  floors: InteractiveMappingFloorSummary[];
  renderCanvasId: string | null;
};

export type MappingHotspotGeometry = {
  shapeType: VisualHotspotShapeType;
  interactionType: VisualHotspotInteractionType;
  xPercent: number;
  yPercent: number;
  svgPath?: string | null;
  points?: unknown;
};
