import type { EntityFavoriteCount, FavoritesSummary } from "@toonexpo/contracts";
import {
  FavoriteTargetType,
  PublicationStatus,
} from "@toonexpo/db";

import {
  FAVORITES_ADMIN_TOP_PROJECTS_LIMIT,
  FAVORITES_PORTAL_TOP_PROJECTS_LIMIT,
} from "../../favorites/favorites.constants.js";
import type { PrismaService } from "../../prisma/prisma.service.js";

type FavoriteCountGroup = {
  targetId: string;
  _count: { _all: number };
};

export const loadAdminFavoritesSummary = async (
  prisma: PrismaService,
): Promise<FavoritesSummary> => {
  const [total, projectGroups] = await Promise.all([
    prisma.db.buyerFavorite.count(),
    prisma.db.buyerFavorite.groupBy({
      by: ["targetId"],
      where: { targetType: FavoriteTargetType.project },
      _count: { _all: true },
      orderBy: { _count: { targetId: "desc" } },
      take: FAVORITES_ADMIN_TOP_PROJECTS_LIMIT,
    }),
  ]);

  const topProjects = await mapProjectFavoriteGroups(prisma, projectGroups);

  return { total, topProjects };
};

export const loadPortalFavoritesSummary = async (
  prisma: PrismaService,
  companyId: string,
): Promise<FavoritesSummary> => {
  const companyProjectIds = await projectIdsForCompany(prisma, companyId);
  if (companyProjectIds.length === 0) {
    return { total: 0, topProjects: [] };
  }

  const [projectFavoriteTotal, apartmentFavoriteRows, projectGroups] =
    await Promise.all([
      prisma.db.buyerFavorite.count({
        where: {
          targetType: FavoriteTargetType.project,
          targetId: { in: companyProjectIds },
        },
      }),
      prisma.db.buyerFavorite.findMany({
        where: { targetType: FavoriteTargetType.apartment },
        select: { targetId: true },
      }),
      loadPortalTopProjectGroups(prisma, companyId, companyProjectIds),
    ]);

  const apartmentIds = apartmentFavoriteRows.map((row) => row.targetId);
  const scopedApartmentCount =
    apartmentIds.length === 0
      ? 0
      : await prisma.db.apartment.count({
          where: {
            id: { in: apartmentIds },
            project: { builderCompanyId: companyId },
          },
        });

  const topProjects = await mapProjectFavoriteGroups(prisma, projectGroups);

  return {
    total: projectFavoriteTotal + scopedApartmentCount,
    topProjects,
  };
};

const projectIdsForCompany = async (
  prisma: PrismaService,
  companyId: string,
): Promise<string[]> => {
  const rows = await prisma.db.project.findMany({
    where: { builderCompanyId: companyId },
    select: { id: true },
  });

  return rows.map((row) => row.id);
};

const loadPortalTopProjectGroups = async (
  prisma: PrismaService,
  companyId: string,
  companyProjectIds: string[],
): Promise<FavoriteCountGroup[]> => {
  const [directProjectGroups, apartmentFavoriteGroups] = await Promise.all([
    prisma.db.buyerFavorite.groupBy({
      by: ["targetId"],
      where: {
        targetType: FavoriteTargetType.project,
        targetId: { in: companyProjectIds },
      },
      _count: { _all: true },
    }),
    prisma.db.buyerFavorite.groupBy({
      by: ["targetId"],
      where: { targetType: FavoriteTargetType.apartment },
      _count: { _all: true },
    }),
  ]);

  const apartmentIds = apartmentFavoriteGroups.map((row) => row.targetId);
  const apartments =
    apartmentIds.length === 0
      ? []
      : await prisma.db.apartment.findMany({
          where: {
            id: { in: apartmentIds },
            project: { builderCompanyId: companyId },
          },
          select: { id: true, projectId: true },
        });
  const projectIdByApartmentId = new Map(
    apartments.map((row) => [row.id, row.projectId]),
  );

  const countsByProjectId = new Map<string, number>();

  for (const row of directProjectGroups) {
    countsByProjectId.set(
      row.targetId,
      (countsByProjectId.get(row.targetId) ?? 0) + row._count._all,
    );
  }

  for (const row of apartmentFavoriteGroups) {
    const projectId = projectIdByApartmentId.get(row.targetId);
    if (!projectId) {
      continue;
    }
    countsByProjectId.set(
      projectId,
      (countsByProjectId.get(projectId) ?? 0) + row._count._all,
    );
  }

  return [...countsByProjectId.entries()]
    .map(([targetId, count]) => ({
      targetId,
      _count: { _all: count },
    }))
    .sort((left, right) => right._count._all - left._count._all)
    .slice(0, FAVORITES_PORTAL_TOP_PROJECTS_LIMIT);
};

const mapProjectFavoriteGroups = async (
  prisma: PrismaService,
  groups: FavoriteCountGroup[],
): Promise<EntityFavoriteCount[]> => {
  if (groups.length === 0) {
    return [];
  }

  const projectIds = groups.map((row) => row.targetId);
  const projects = await prisma.db.project.findMany({
    where: {
      id: { in: projectIds },
      publicationStatus: PublicationStatus.published,
    },
    select: { id: true, name: true },
  });
  const nameById = new Map(projects.map((row) => [row.id, row.name]));

  return groups
    .filter((row) => nameById.has(row.targetId))
    .map((row) => ({
      entityId: row.targetId,
      name: nameById.get(row.targetId) ?? null,
      favoriteCount: row._count._all,
    }));
};
