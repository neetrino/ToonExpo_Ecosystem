import { BadRequestException } from '@nestjs/common';
import type { PrismaClient } from '@toonexpo/db';

import { PORTAL_APARTMENT_GALLERY_MAX } from '../portal.constants.js';

type GalleryDb = Pick<PrismaClient, 'apartmentGalleryImage' | 'mediaAsset' | 'apartment'>;

const dedupePreserveOrder = (ids: readonly string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const id of ids) {
    const trimmed = id.trim();
    if (trimmed.length === 0 || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
};

/**
 * Replaces apartment gallery rows and syncs `coverMediaId` to the main image.
 */
export const replaceApartmentGallery = async (params: {
  db: GalleryDb;
  apartmentId: string;
  companyId: string;
  galleryMediaIds: readonly string[];
  coverMediaId?: string | null | undefined;
}): Promise<void> => {
  const orderedIds = dedupePreserveOrder(params.galleryMediaIds);
  if (orderedIds.length > PORTAL_APARTMENT_GALLERY_MAX) {
    throw new BadRequestException(
      `Apartment gallery supports at most ${PORTAL_APARTMENT_GALLERY_MAX} images`,
    );
  }

  if (orderedIds.length > 0) {
    const owned = await params.db.mediaAsset.findMany({
      where: { id: { in: orderedIds }, ownerCompanyId: params.companyId },
      select: { id: true },
    });
    if (owned.length !== orderedIds.length) {
      throw new BadRequestException('One or more gallery media assets are invalid');
    }
  }

  let nextCover: string | null = null;
  if (orderedIds.length === 0) {
    nextCover = null;
  } else if (params.coverMediaId != null && params.coverMediaId.trim().length > 0) {
    const coverId = params.coverMediaId.trim();
    if (!orderedIds.includes(coverId)) {
      throw new BadRequestException('Cover image must be one of the gallery images');
    }
    nextCover = coverId;
  } else {
    nextCover = orderedIds[0] ?? null;
  }

  await params.db.apartmentGalleryImage.deleteMany({
    where: { apartmentId: params.apartmentId },
  });

  if (orderedIds.length > 0) {
    await params.db.apartmentGalleryImage.createMany({
      data: orderedIds.map((mediaAssetId, index) => ({
        apartmentId: params.apartmentId,
        mediaAssetId,
        sortOrder: index,
      })),
    });
  }

  await params.db.apartment.update({
    where: { id: params.apartmentId },
    data: { coverMediaId: nextCover },
  });
};

/**
 * Applies gallery / cover sync inside an apartment update transaction.
 */
export const syncApartmentGalleryOnUpdate = async (params: {
  db: GalleryDb;
  apartmentId: string;
  companyId: string;
  galleryMediaIds?: string[] | undefined;
  coverMediaId?: string | null | undefined;
}): Promise<void> => {
  if (params.galleryMediaIds !== undefined) {
    await replaceApartmentGallery({
      db: params.db,
      apartmentId: params.apartmentId,
      companyId: params.companyId,
      galleryMediaIds: params.galleryMediaIds,
      coverMediaId: params.coverMediaId,
    });
    return;
  }

  if (params.coverMediaId === undefined || params.coverMediaId == null) {
    return;
  }

  const existingGallery = await params.db.apartmentGalleryImage.findMany({
    where: { apartmentId: params.apartmentId },
    orderBy: { sortOrder: 'asc' },
    select: { mediaAssetId: true },
  });
  const ids = existingGallery.map((row) => row.mediaAssetId);
  if (!ids.includes(params.coverMediaId)) {
    ids.unshift(params.coverMediaId);
  }
  await replaceApartmentGallery({
    db: params.db,
    apartmentId: params.apartmentId,
    companyId: params.companyId,
    galleryMediaIds: ids,
    coverMediaId: params.coverMediaId,
  });
};

export const apartmentGalleryInclude = {
  galleryImages: {
    orderBy: { sortOrder: 'asc' as const },
    select: {
      sortOrder: true,
      mediaAsset: {
        select: {
          id: true,
          fileUrl: true,
          thumbnailUrl: true,
          altText: true,
        },
      },
    },
  },
} as const;
