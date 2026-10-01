import {
  ApartmentSalesStatus,
  CrmStatusSource,
  PublicationStatus,
  type Prisma,
} from '@toonexpo/db';

import { insertApartmentWithUniqueSlug } from '../apartments/apartment-slug.js';
import type {
  DuplicateApartmentTranslation,
  DuplicateFloorSource,
} from './duplicate-floor.types.js';

type CopiedApartmentParams = {
  userId: string;
  projectId: string;
  buildingId: string;
  floorId: string;
};

type SourceApartment = DuplicateFloorSource['apartments'][number];

const copiedFeatures = (
  features: Prisma.JsonValue,
): Prisma.InputJsonValue | undefined => {
  if (features == null) {
    return undefined;
  }
  return features as Prisma.InputJsonValue;
};

const copiedApartmentExtras = (
  source: SourceApartment,
  userId: string,
): Pick<Prisma.ApartmentUncheckedCreateInput, 'features' | 'statusHistory' | 'galleryImages'> => {
  const features = copiedFeatures(source.features);
  return {
    ...(features !== undefined ? { features } : {}),
    statusHistory: {
      create: {
        previousStatus: null,
        newStatus: ApartmentSalesStatus.available,
        changedByUserId: userId,
        reason: 'initial',
      },
    },
    ...(source.galleryImages.length > 0
      ? {
          galleryImages: {
            create: source.galleryImages.map((image) => ({
              mediaAssetId: image.mediaAssetId,
              sortOrder: image.sortOrder,
            })),
          },
        }
      : {}),
  };
};

/**
 * Inventory clone: same unit data, available for sale, no CRM or homepage pin.
 */
export const buildCopiedApartmentData = (
  source: SourceApartment,
  params: CopiedApartmentParams,
): Omit<Prisma.ApartmentUncheckedCreateInput, 'slug'> => ({
  projectId: params.projectId,
  buildingId: params.buildingId,
  floorId: params.floorId,
  number: source.number,
  salesStatus: ApartmentSalesStatus.available,
  publicationStatus: source.publicationStatus,
  rooms: source.rooms,
  bedrooms: source.bedrooms,
  bathrooms: source.bathrooms,
  areaTotal: source.areaTotal,
  areaLiving: source.areaLiving,
  balconyArea: source.balconyArea,
  price: source.price,
  priceCurrency: source.priceCurrency,
  priceVisibility: source.priceVisibility,
  description: source.description,
  planMediaId: source.planMediaId,
  coverMediaId: source.coverMediaId,
  tinderMediaId: source.tinderMediaId,
  matterportUrl: source.matterportUrl,
  external3dUrl: source.external3dUrl,
  orientation: source.orientation,
  viewType: source.viewType,
  verified: source.verified,
  featuredOnHome: false,
  crmStatusSource: CrmStatusSource.manual,
  createdByUserId: params.userId,
  updatedByUserId: params.userId,
  lastStatusChangedAt: new Date(),
  lastStatusChangedByUserId: params.userId,
  ...copiedApartmentExtras(source, params.userId),
});

/**
 * Copies every apartment onto the new floor and returns source id → new id.
 */
export const copyFloorApartments = async (
  tx: Prisma.TransactionClient,
  source: DuplicateFloorSource,
  newFloorId: string,
  userId: string,
): Promise<Map<string, string>> => {
  const ids = new Map<string, string>();
  for (const apartment of source.apartments) {
    const created = await insertApartmentWithUniqueSlug<{ id: string }>(
      tx,
      source.building.project.slug,
      apartment.number,
      buildCopiedApartmentData(apartment, {
        userId,
        projectId: source.building.projectId,
        buildingId: source.building.id,
        floorId: newFloorId,
      }),
    );
    ids.set(apartment.id, created.id);
  }
  return ids;
};

/**
 * Copies apartment description translations onto the new unit ids.
 */
export const copyApartmentTranslations = async (
  tx: Prisma.TransactionClient,
  rows: readonly DuplicateApartmentTranslation[],
  apartmentIds: ReadonlyMap<string, string>,
  userId: string,
): Promise<void> => {
  const data = rows.flatMap((row) => {
    const entityId = apartmentIds.get(row.entityId);
    if (!entityId) {
      return [];
    }
    return [
      {
        entityType: row.entityType,
        entityId,
        fieldName: row.fieldName,
        locale: row.locale,
        value: row.value,
        updatedByUserId: userId,
      },
    ];
  });
  if (data.length === 0) {
    return;
  }
  await tx.translation.createMany({ data });
};

export const copiedFloorPublishes = (
  source: DuplicateFloorSource,
  floorStatus: PublicationStatus,
): boolean =>
  floorStatus === PublicationStatus.published ||
  source.apartments.some((apartment) => apartment.publicationStatus === PublicationStatus.published);
