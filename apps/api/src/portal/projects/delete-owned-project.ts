import { FavoriteTargetType, type PrismaClient } from '@toonexpo/db';

import { TRANSLATION_ENTITY } from '../../catalog/utils/resolve-translation.js';

/**
 * Hard-deletes a project and nested inventory regardless of publication status.
 * Clears Restrict FKs (readiness, CRM apartment links) before the cascade delete.
 */
export const deleteOwnedProject = async (
  db: PrismaClient,
  projectId: string,
): Promise<void> => {
  const apartments = await db.apartment.findMany({
    where: { projectId },
    select: { id: true },
  });
  const apartmentIds = apartments.map((row) => row.id);

  await db.$transaction(async (tx) => {
    await tx.readinessAssessment.updateMany({
      where: { projectId },
      data: { projectId: null },
    });
    if (apartmentIds.length > 0) {
      await tx.crmDealApartmentLink.deleteMany({
        where: { apartmentId: { in: apartmentIds } },
      });
    }
    await tx.buyerFavorite.deleteMany({
      where: favoriteWhere(projectId, apartmentIds),
    });
    await tx.translation.deleteMany({
      where: translationWhere(projectId, apartmentIds),
    });
    await tx.project.delete({ where: { id: projectId } });
  });
};

const favoriteWhere = (projectId: string, apartmentIds: string[]) => ({
  OR: [
    { targetType: FavoriteTargetType.project, targetId: projectId },
    ...(apartmentIds.length > 0
      ? [{ targetType: FavoriteTargetType.apartment, targetId: { in: apartmentIds } }]
      : []),
  ],
});

const translationWhere = (projectId: string, apartmentIds: string[]) => ({
  OR: [
    { entityType: TRANSLATION_ENTITY.project, entityId: projectId },
    ...(apartmentIds.length > 0
      ? [{ entityType: TRANSLATION_ENTITY.apartment, entityId: { in: apartmentIds } }]
      : []),
  ],
});
