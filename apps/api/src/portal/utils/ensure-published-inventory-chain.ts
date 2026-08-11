import { PublicationStatus } from '@toonexpo/db';

import type { PrismaService } from '../../prisma/prisma.service.js';

type InventoryChainIds = {
  projectId: string;
  buildingId: string;
  floorId: string;
  apartmentId?: string;
};

/**
 * Publishes building → floor → apartment so public catalog nesting can include the unit.
 * Used when Admin/portal inventory is created or published under an already-published project.
 */
export const ensurePublishedInventoryChain = async (
  prisma: PrismaService,
  ids: InventoryChainIds,
): Promise<void> => {
  await prisma.db.building.updateMany({
    where: {
      id: ids.buildingId,
      projectId: ids.projectId,
      publicationStatus: { not: PublicationStatus.published },
    },
    data: { publicationStatus: PublicationStatus.published },
  });

  await prisma.db.floor.updateMany({
    where: {
      id: ids.floorId,
      buildingId: ids.buildingId,
      publicationStatus: { not: PublicationStatus.published },
    },
    data: { publicationStatus: PublicationStatus.published },
  });

  if (ids.apartmentId == null) {
    return;
  }

  await prisma.db.apartment.updateMany({
    where: {
      id: ids.apartmentId,
      floorId: ids.floorId,
      publicationStatus: { not: PublicationStatus.published },
    },
    data: { publicationStatus: PublicationStatus.published },
  });
};

/**
 * Publishes every building, floor, and apartment under a project (project publish cascade).
 */
export const cascadePublishProjectInventory = async (
  prisma: PrismaService,
  projectId: string,
): Promise<void> => {
  await prisma.db.building.updateMany({
    where: {
      projectId,
      publicationStatus: { not: PublicationStatus.published },
    },
    data: { publicationStatus: PublicationStatus.published },
  });

  await prisma.db.floor.updateMany({
    where: {
      building: { projectId },
      publicationStatus: { not: PublicationStatus.published },
    },
    data: { publicationStatus: PublicationStatus.published },
  });

  await prisma.db.apartment.updateMany({
    where: {
      projectId,
      publicationStatus: { not: PublicationStatus.published },
    },
    data: { publicationStatus: PublicationStatus.published },
  });
};
