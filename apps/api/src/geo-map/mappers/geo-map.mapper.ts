import type { AdminGeoMapModelItem, PublicGeoMapModelItem } from '@toonexpo/contracts';
import type { Prisma } from '@toonexpo/db';

const toIso = (value: Date): string => value.toISOString();

const decimalToString = (value: Prisma.Decimal): string => value.toString();

type AdminGeoMapModelRow = Prisma.ProjectMapModelGetPayload<{
  include: {
    project: { select: { name: true; slug: true } };
    mediaAsset: { select: { fileUrl: true } };
  };
}>;

type PublicGeoMapModelRow = Prisma.ProjectMapModelGetPayload<{
  include: {
    project: { select: { id: true; name: true; slug: true } };
    mediaAsset: { select: { fileUrl: true } };
  };
}>;

export const toAdminGeoMapModelItem = (row: AdminGeoMapModelRow): AdminGeoMapModelItem => ({
  id: row.id,
  projectId: row.projectId,
  projectName: row.project.name,
  projectSlug: row.project.slug,
  mediaAssetId: row.mediaAssetId,
  modelUrl: row.mediaAsset.fileUrl,
  longitude: decimalToString(row.longitude),
  latitude: decimalToString(row.latitude),
  altitudeM: decimalToString(row.altitudeM),
  headingDeg: decimalToString(row.headingDeg),
  pitchDeg: decimalToString(row.pitchDeg),
  rollDeg: decimalToString(row.rollDeg),
  scale: decimalToString(row.scale),
  minZoom: decimalToString(row.minZoom),
  isPublished: row.isPublished,
  createdByUserId: row.createdByUserId,
  updatedByUserId: row.updatedByUserId,
  createdAt: toIso(row.createdAt),
  updatedAt: toIso(row.updatedAt),
});

export const toPublicGeoMapModelItem = (row: PublicGeoMapModelRow): PublicGeoMapModelItem => ({
  projectId: row.project.id,
  projectSlug: row.project.slug,
  projectName: row.project.name,
  longitude: decimalToString(row.longitude),
  latitude: decimalToString(row.latitude),
  modelUrl: row.mediaAsset.fileUrl,
  altitudeM: decimalToString(row.altitudeM),
  headingDeg: decimalToString(row.headingDeg),
  pitchDeg: decimalToString(row.pitchDeg),
  rollDeg: decimalToString(row.rollDeg),
  scale: decimalToString(row.scale),
  minZoom: decimalToString(row.minZoom),
});
