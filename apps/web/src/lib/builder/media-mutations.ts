import type { MediaAssetIdInput, MediaAssetUpsertInput } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';

import { type BuilderMutationResult } from './mutation-result';

type MediaOwnerHint = {
  projectId: string | null;
  apartmentId: string | null;
};

function isOwnerXorValid(input: { projectId?: string; apartmentId?: string }): boolean {
  const hasProject = Boolean(input.projectId);
  const hasApartment = Boolean(input.apartmentId);
  return hasProject !== hasApartment;
}

async function findOwnedMediaAsset(
  companyId: string,
  mediaAssetId: string,
): Promise<MediaOwnerHint | null> {
  const asset = await prisma.mediaAsset.findFirst({
    where: {
      id: mediaAssetId,
      OR: [
        { project: { companyId } },
        { apartment: { floor: { building: { project: { companyId } } } } },
      ],
    },
    select: { projectId: true, apartmentId: true },
  });
  return asset ?? null;
}

export async function addMediaAsset(
  companyId: string,
  input: MediaAssetUpsertInput,
): Promise<BuilderMutationResult<{ mediaAssetId: string }>> {
  if (!isOwnerXorValid(input)) {
    return { ok: false, errorKey: 'invalidInput' };
  }

  return prisma.$transaction(async (tx) => {
    if (input.projectId) {
      const project = await tx.project.findFirst({
        where: { id: input.projectId, companyId },
        select: { id: true },
      });
      if (!project) {
        return { ok: false, errorKey: 'notFound' };
      }

      const asset = await tx.mediaAsset.create({
        data: {
          projectId: project.id,
          url: input.url,
          alt: input.alt ?? null,
          sortOrder: input.sortOrder,
        },
        select: { id: true },
      });
      return { ok: true, mediaAssetId: asset.id };
    }

    const apartment = await tx.apartment.findFirst({
      where: {
        id: input.apartmentId,
        floor: { building: { project: { companyId } } },
      },
      select: { id: true },
    });
    if (!apartment) {
      return { ok: false, errorKey: 'notFound' };
    }

    const asset = await tx.mediaAsset.create({
      data: {
        apartmentId: apartment.id,
        url: input.url,
        alt: input.alt ?? null,
        sortOrder: input.sortOrder,
      },
      select: { id: true },
    });
    return { ok: true, mediaAssetId: asset.id };
  });
}

export async function updateMediaAsset(
  companyId: string,
  input: MediaAssetUpsertInput & { mediaAssetId: string },
): Promise<BuilderMutationResult<{ mediaAssetId: string }>> {
  const owned = await findOwnedMediaAsset(companyId, input.mediaAssetId);
  if (!owned) {
    return { ok: false, errorKey: 'notFound' };
  }

  const result = await prisma.mediaAsset.updateMany({
    where: { id: input.mediaAssetId },
    data: {
      url: input.url,
      alt: input.alt ?? null,
      sortOrder: input.sortOrder,
    },
  });

  if (result.count === 0) {
    return { ok: false, errorKey: 'notFound' };
  }

  return { ok: true, mediaAssetId: input.mediaAssetId };
}

export async function deleteMediaAsset(
  companyId: string,
  input: MediaAssetIdInput,
): Promise<BuilderMutationResult<{ mediaAssetId: string }>> {
  const owned = await findOwnedMediaAsset(companyId, input.mediaAssetId);
  if (!owned) {
    return { ok: false, errorKey: 'notFound' };
  }

  const result = await prisma.mediaAsset.deleteMany({
    where: { id: input.mediaAssetId },
  });

  if (result.count === 0) {
    return { ok: false, errorKey: 'notFound' };
  }

  return { ok: true, mediaAssetId: input.mediaAssetId };
}
