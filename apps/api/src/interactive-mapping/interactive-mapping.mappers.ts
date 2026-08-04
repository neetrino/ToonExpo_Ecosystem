import type {
  InteractiveMappingApartmentSummary,
  InteractiveMappingBuildingSummary,
  InteractiveMappingCanvasSummary,
  InteractiveMappingDistrictSummary,
  InteractiveMappingFloorSummary,
} from '@toonexpo/contracts';
import type { PublicationStatus } from '@toonexpo/db';

export const mapDistrict = (row: {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  publicationStatus: PublicationStatus;
  displayOrder: number;
}): InteractiveMappingDistrictSummary => ({
  id: row.id,
  projectId: row.projectId,
  name: row.name,
  slug: row.slug,
  publicationStatus: row.publicationStatus,
  displayOrder: row.displayOrder,
});

export const mapBuilding = (row: {
  id: string;
  name: string;
  districtId: string | null;
  floorsCount: number | null;
  publicationStatus: PublicationStatus;
}): InteractiveMappingBuildingSummary => ({
  id: row.id,
  name: row.name,
  districtId: row.districtId,
  floorsCount: row.floorsCount,
  publicationStatus: row.publicationStatus,
});

export const mapFloor = (
  row: {
    id: string;
    buildingId: string;
    number: number;
    name: string | null;
    floorplanMediaId: string | null;
    publicationStatus: PublicationStatus;
  },
  flags: { hasBuildingPolygon?: boolean; hasFloorPlan?: boolean } = {},
): InteractiveMappingFloorSummary => ({
  id: row.id,
  buildingId: row.buildingId,
  number: row.number,
  name: row.name,
  floorplanMediaId: row.floorplanMediaId,
  publicationStatus: row.publicationStatus,
  hasBuildingPolygon: flags.hasBuildingPolygon === true,
  hasFloorPlan: flags.hasFloorPlan === true || row.floorplanMediaId != null,
});

export const mapApartment = (row: {
  id: string;
  buildingId: string;
  floorId: string;
  number: string;
  publicationStatus: PublicationStatus;
}): InteractiveMappingApartmentSummary => ({
  id: row.id,
  buildingId: row.buildingId,
  floorId: row.floorId,
  number: row.number,
  publicationStatus: row.publicationStatus,
});

export const mapCanvas = (row: {
  id: string;
  contextType: InteractiveMappingCanvasSummary['contextType'];
  contextId: string;
  mediaAssetId: string;
  publicationStatus: PublicationStatus;
  isPrimary: boolean;
  mediaAsset: { fileUrl: string; width: number | null; height: number | null };
  _count: { hotspots: number };
}): InteractiveMappingCanvasSummary => ({
  id: row.id,
  contextType: row.contextType,
  contextId: row.contextId,
  mediaAssetId: row.mediaAssetId,
  mediaUrl: row.mediaAsset.fileUrl,
  mediaWidth: row.mediaAsset.width,
  mediaHeight: row.mediaAsset.height,
  publicationStatus: row.publicationStatus,
  isPrimary: row.isPrimary,
  hotspotCount: row._count.hotspots,
});
