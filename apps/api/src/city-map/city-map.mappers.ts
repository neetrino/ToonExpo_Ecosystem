import { PublicationStatus, type Prisma } from '@toonexpo/db';
import type { CityMapPlacementItem, PublicCityMapPlacement } from '@toonexpo/contracts';

type PlacementRow = Prisma.CityMapPlacementGetPayload<{
  include: {
    building: { select: { name: true; displayOrder: true } };
    project: { select: { name: true; address: true; city: true } };
    glbMediaAsset: { select: { fileUrl: true } };
  };
}>;

const toNumber = (value: { toNumber?: () => number } | number): number => {
  if (typeof value === 'number') {
    return value;
  }
  return value.toNumber?.() ?? Number(value);
};

export const toCityMapPlacementItem = (row: PlacementRow): CityMapPlacementItem => ({
  id: row.id,
  buildingId: row.buildingId,
  projectId: row.projectId,
  glbMediaAssetId: row.glbMediaAssetId,
  glbUrl: row.glbMediaAsset.fileUrl,
  longitude: toNumber(row.longitude),
  latitude: toNumber(row.latitude),
  altitude: row.altitude,
  rotationX: row.rotationX,
  rotationY: row.rotationY,
  rotationZ: row.rotationZ,
  scale: row.scale,
  minZoom: row.minZoom,
  publicationStatus: row.publicationStatus,
  labelOverride: row.labelOverride,
  buildingName: row.building.name,
  buildingDisplayOrder: row.building.displayOrder,
  projectName: row.project.name,
  projectAddress: row.project.address,
  projectCity: row.project.city,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const toPublicCityMapPlacement = (row: PlacementRow): PublicCityMapPlacement => ({
  id: row.id,
  buildingId: row.buildingId,
  projectId: row.projectId,
  glbUrl: row.glbMediaAsset.fileUrl,
  longitude: toNumber(row.longitude),
  latitude: toNumber(row.latitude),
  altitude: row.altitude,
  rotationX: row.rotationX,
  rotationY: row.rotationY,
  rotationZ: row.rotationZ,
  scale: row.scale,
  minZoom: row.minZoom,
  label: row.labelOverride?.trim() || row.building.name,
  buildingName: row.building.name,
  projectName: row.project.name,
  address: row.project.address,
  city: row.project.city,
});

export const PUBLIC_VISIBILITY: PublicationStatus = PublicationStatus.published;
