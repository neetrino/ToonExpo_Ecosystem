import type { FavoriteToggleInput } from '@toonexpo/contracts';
import { Prisma, prisma } from '@toonexpo/db';
import type { FavoriteTargetType } from '@toonexpo/domain';

import { scheduleAnalyticsEvent } from '@/lib/analytics/record-event';

export type FavoriteMutationErrorKey = 'unauthorized' | 'invalidInput' | 'notFound' | 'rateLimited';

export type FavoriteMutationResult =
  { ok: true; favorited: boolean } | { ok: false; errorKey: FavoriteMutationErrorKey };

type ResolvedTarget = {
  targetType: FavoriteTargetType;
  targetId: string;
  companyId: string;
  projectId: string;
  apartmentId?: string;
};

async function resolvePublishedTarget(input: FavoriteToggleInput): Promise<ResolvedTarget | null> {
  if (input.targetType === 'PROJECT') {
    const project = await prisma.project.findFirst({
      where: { id: input.targetId, status: 'PUBLISHED' },
      select: { id: true, companyId: true },
    });
    if (!project) {
      return null;
    }
    return {
      targetType: 'PROJECT',
      targetId: project.id,
      companyId: project.companyId,
      projectId: project.id,
    };
  }

  const apartment = await prisma.apartment.findFirst({
    where: {
      id: input.targetId,
      floor: {
        status: 'PUBLISHED',
        building: {
          status: 'PUBLISHED',
          project: { status: 'PUBLISHED' },
        },
      },
    },
    select: {
      id: true,
      floor: {
        select: {
          building: {
            select: {
              project: { select: { id: true, companyId: true } },
            },
          },
        },
      },
    },
  });
  if (!apartment) {
    return null;
  }

  const project = apartment.floor.building.project;
  return {
    targetType: 'APARTMENT',
    targetId: apartment.id,
    companyId: project.companyId,
    projectId: project.id,
    apartmentId: apartment.id,
  };
}

function scheduleFavoriteAnalytics(
  type: 'FAVORITE_ADDED' | 'FAVORITE_REMOVED',
  target: ResolvedTarget,
): void {
  scheduleAnalyticsEvent({
    type,
    companyId: target.companyId,
    projectId: target.projectId,
    apartmentId: target.apartmentId,
  });
}

/** Adds a favorite for the buyer. Idempotent when already saved. */
export async function addFavorite(
  userId: string,
  input: FavoriteToggleInput,
): Promise<FavoriteMutationResult> {
  const target = await resolvePublishedTarget(input);
  if (!target) {
    return { ok: false, errorKey: 'notFound' };
  }

  try {
    await prisma.favorite.create({
      data: {
        userId,
        targetType: target.targetType,
        targetId: target.targetId,
      },
    });
    scheduleFavoriteAnalytics('FAVORITE_ADDED', target);
    return { ok: true, favorited: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { ok: true, favorited: true };
    }
    throw error;
  }
}

/** Removes a favorite for the buyer. Idempotent when already absent. */
export async function removeFavorite(
  userId: string,
  input: FavoriteToggleInput,
): Promise<FavoriteMutationResult> {
  const target = await resolvePublishedTarget(input);
  if (!target) {
    // Still allow delete of orphan favorites (target unpublished later).
    const deleted = await prisma.favorite.deleteMany({
      where: {
        userId,
        targetType: input.targetType,
        targetId: input.targetId,
      },
    });
    return deleted.count > 0 ? { ok: true, favorited: false } : { ok: false, errorKey: 'notFound' };
  }

  const deleted = await prisma.favorite.deleteMany({
    where: {
      userId,
      targetType: target.targetType,
      targetId: target.targetId,
    },
  });

  if (deleted.count > 0) {
    scheduleFavoriteAnalytics('FAVORITE_REMOVED', target);
  }

  return { ok: true, favorited: false };
}

/** Toggle favorite on/off for a buyer. Returns resulting favorited state. */
export async function toggleFavorite(
  userId: string,
  input: FavoriteToggleInput,
): Promise<FavoriteMutationResult> {
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_targetType_targetId: {
        userId,
        targetType: input.targetType,
        targetId: input.targetId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    return removeFavorite(userId, input);
  }
  return addFavorite(userId, input);
}
