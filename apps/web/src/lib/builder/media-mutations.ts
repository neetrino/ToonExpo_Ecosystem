import type { MediaAssetIdInput, MediaAssetUpsertInput } from '@toonexpo/contracts';
import { prisma, type Prisma } from '@toonexpo/db';

import { type BuilderMutationResult } from './mutation-result';

type MediaOwnerHint = {
  projectId: string | null;
  apartmentId: string | null;
};

type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

function isOwnerXorValid(input: { projectId?: string; apartmentId?: string }): boolean {
  const hasProject = Boolean(input.projectId);
  const hasApartment = Boolean(input.apartmentId);
  return hasProject !== hasApartment;
}

function ownedMediaWhere(companyId: string, mediaAssetId: string): Prisma.MediaAssetWhereInput {
  return {
    id: mediaAssetId,
    OR: [
      { project: { companyId } },
      { apartment: { floor: { building: { project: { companyId } } } } },
    ],
  };
}

async function findOwnedMediaAsset(
  tx: TransactionClient,
  companyId: string,
  mediaAssetId: string,
): Promise<MediaOwnerHint | null> {
  const asset = await tx.mediaAsset.findFirst({
    where: ownedMediaWhere(companyId, mediaAssetId),
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
  return prisma.$transaction(async (tx) => {
    const owned = await findOwnedMediaAsset(tx, companyId, input.mediaAssetId);
    if (!owned) {
      return { ok: false, errorKey: 'notFound' };
    }

    const result = await tx.mediaAsset.updateMany({
      where: ownedMediaWhere(companyId, input.mediaAssetId),
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
  });
}

export async function deleteMediaAsset(
  companyId: string,
  input: MediaAssetIdInput,
): Promise<BuilderMutationResult<{ mediaAssetId: string }>> {
  return prisma.$transaction(async (tx) => {
    const owned = await findOwnedMediaAsset(tx, companyId, input.mediaAssetId);
    if (!owned) {
      return { ok: false, errorKey: 'notFound' };
    }

    const result = await tx.mediaAsset.deleteMany({
      where: ownedMediaWhere(companyId, input.mediaAssetId),
    });

    if (result.count === 0) {
      return { ok: false, errorKey: 'notFound' };
    }

    return { ok: true, mediaAssetId: input.mediaAssetId };
  });
}
