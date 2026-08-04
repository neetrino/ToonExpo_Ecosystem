import type { VisualHotspotTargetType } from '@toonexpo/contracts';
import { PublicationStatus } from '@toonexpo/db';

import type { PrismaService } from '../../prisma/prisma.service.js';

/**
 * Publishes hotspot targets so public map filtering does not drop Admin-drawn polygons.
 * Interactive Mapping saves hotspots as published for the public site — targets must match.
 */
export const ensurePublishedHotspotTarget = async (
  prisma: PrismaService,
  targetType: VisualHotspotTargetType,
  targetId: string,
): Promise<void> => {
  if (targetType === 'district') {
    await prisma.db.district.updateMany({
      where: {
        id: targetId,
        publicationStatus: { not: PublicationStatus.published },
      },
      data: { publicationStatus: PublicationStatus.published },
    });
    return;
  }

  if (targetType === 'building') {
    await prisma.db.building.updateMany({
      where: {
        id: targetId,
        publicationStatus: { not: PublicationStatus.published },
      },
      data: { publicationStatus: PublicationStatus.published },
    });
    return;
  }

  if (targetType === 'floor') {
    await prisma.db.floor.updateMany({
      where: {
        id: targetId,
        publicationStatus: { not: PublicationStatus.published },
      },
      data: { publicationStatus: PublicationStatus.published },
    });
    return;
  }

  await prisma.db.apartment.updateMany({
    where: {
      id: targetId,
      publicationStatus: { not: PublicationStatus.published },
    },
    data: { publicationStatus: PublicationStatus.published },
  });
};
