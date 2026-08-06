import type { AdminGeoMapModelItem, PublicGeoMapModelItem } from '@toonexpo/contracts';
import type { Prisma } from '@toonexpo/db';

const toIso = (value: Date): string => value.toISOString();

const decimalToString = (value: Prisma.Decimal): string => value.toString();

type AdminGeoMapModelRow = Prisma.ProjectMapModelGetPayload<{
  include: {
    project: { select: { name: true; slug: true } };
    mediaAsset: { select: { fileUrl: true; title: true } };
  };
}>;

type PublicGeoMapModelRow = Prisma.ProjectMapModelGetPayload<{
  include: {
    project: {
      select: {
        id: true;
        name: true;
        slug: true;
        address: true;
        city: true;
        district: true;
        builderCompany: { select: { logoMedia: { select: { fileUrl: true } } } };
      };
    };
    mediaAsset: { select: { fileUrl: true } };
  };
}>;

export const toAdminGeoMapModelItem = (row: AdminGeoMapModelRow): AdminGeoMapModelItem => ({
  id: row.id,
  projectId: row.projectId,
  projectName: row.project?.name ?? null,
  projectSlug: row.project?.slug ?? null,
  mediaAssetId: row.mediaAssetId,
  mediaTitle: row.mediaAsset.title,
  modelUrl: row.mediaAsset.fileUrl,
  sourceOsmId: row.sourceOsmId,
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

export const toPublicGeoMapModelItem = (row: PublicGeoMapModelRow): PublicGeoMapModelItem => {
  if (!row.project) {
    throw new Error('Public geo-map model is missing required project relation');
  }

  return {
    projectId: row.project.id,
    projectSlug: row.project.slug,
    projectName: row.project.name,
    logoUrl: row.project.builderCompany.logoMedia?.fileUrl ?? null,
    address: row.project.address,
    city: row.project.city,
    district: row.project.district,
    longitude: decimalToString(row.longitude),
    latitude: decimalToString(row.latitude),
    modelUrl: row.mediaAsset.fileUrl,
    sourceOsmId: row.sourceOsmId,
    altitudeM: decimalToString(row.altitudeM),
    headingDeg: decimalToString(row.headingDeg),
    pitchDeg: decimalToString(row.pitchDeg),
    rollDeg: decimalToString(row.rollDeg),
    scale: decimalToString(row.scale),
    minZoom: decimalToString(row.minZoom),
  };
};
