import type {
  AdminAnalyticsOverview,
  CrmDealStatus,
  ReadinessScoreStatus,
  RequestSource,
} from "@toonexpo/contracts";
import { AnalyticsEventType, CheckInStatus } from "@toonexpo/db";

import {
  ANALYTICS_ADMIN_TOP_PROJECTS_LIMIT,
  ANALYTICS_WEAKEST_CATEGORIES_LIMIT,
} from "../analytics.constants.js";
import type { ResolvedAnalyticsDateRange } from "../analytics.types.js";
import { createdAtInRange } from "../utils/resolve-date-range.js";
import { loadAdminFavoritesSummary } from "../utils/favorites-aggregates.js";
import type { PrismaService } from "../../prisma/prisma.service.js";
import { loadAdminPlatformActivity } from "./admin-analytics-platform-activity.js";

export const loadAdminAnalyticsOverview = async (
  prisma: PrismaService,
  range: ResolvedAnalyticsDateRange,
): Promise<AdminAnalyticsOverview> => {
  const dateFilter = createdAtInRange(range);

  const [
    platformBundle,
    topProjectGroups,
    requestGroups,
    dealGroups,
    qrScanGroups,
    checkInGroups,
    assessmentGroups,
    weakestCategories,
    favorites,
  ] = await Promise.all([
    loadAdminPlatformActivity(prisma, range),
    prisma.db.analyticsEvent.groupBy({
      by: ["projectId"],
      where: {
        eventType: AnalyticsEventType.project_view,
        projectId: { not: null },
        createdAt: dateFilter,
      },
      _count: { _all: true },
      orderBy: { _count: { projectId: "desc" } },
      take: ANALYTICS_ADMIN_TOP_PROJECTS_LIMIT,
    }),
    prisma.db.request.groupBy({
      by: ["source"],
      where: { createdAt: dateFilter },
      _count: { _all: true },
    }),
    prisma.db.crmDeal.groupBy({
      by: ["status"],
      where: { lastActivityAt: dateFilter },
      _count: { _all: true },
    }),
    prisma.db.analyticsEvent.groupBy({
      by: ["source"],
      where: {
        eventType: AnalyticsEventType.qr_scanned,
        createdAt: dateFilter,
      },
      _count: { _all: true },
    }),
    prisma.db.checkInRecord.groupBy({
      by: ["status"],
      where: { checkedInAt: dateFilter },
      _count: { _all: true },
    }),
    prisma.db.readinessAssessment.groupBy({
      by: ["status"],
      where: { archivedAt: null },
      _count: { _all: true },
    }),
    loadWeakestReadinessCategories(prisma),
    loadAdminFavoritesSummary(prisma),
  ]);

  const projectIds = topProjectGroups
    .map((row) => row.projectId)
    .filter((id): id is string => id != null);
  const projectMeta = await loadProjectMeta(prisma, projectIds);

  const requestsTotal = requestGroups.reduce(
    (sum, row) => sum + row._count._all,
    0,
  );

  return {
    range: { from: range.fromIso, to: range.toIso },
    platformActivity: platformBundle.platformActivity,
    activitySeries: platformBundle.activitySeries,
    activityGrowth: platformBundle.activityGrowth,
    topProjectsByViews: topProjectGroups
      .filter((row) => row.projectId != null)
      .map((row) => {
        const id = row.projectId as string;
        const meta = projectMeta.get(id);
        return {
          entityId: id,
          name: meta?.name ?? null,
          viewCount: row._count._all,
          coverUrl: meta?.coverUrl ?? null,
        };
      }),
    favorites,
    requests: {
      total: requestsTotal,
      bySource: requestGroups.map((row) => ({
        source: row.source as RequestSource,
        count: row._count._all,
      })),
    },
    dealsByStatus: dealGroups.map((row) => ({
      status: row.status as CrmDealStatus,
      count: row._count._all,
    })),
    qrScansByContext: qrScanGroups.map((row) => ({
      context: row.source ?? "unknown",
      count: row._count._all,
    })),
    checkIns: summarizeCheckIns(checkInGroups),
    readiness: {
      assessmentsByStatus: assessmentGroups.map((row) => ({
        status: row.status as ReadinessScoreStatus,
        count: row._count._all,
      })),
      weakestCategories,
    },
  };
};

type ProjectMeta = { name: string; coverUrl: string | null };

const loadProjectMeta = async (
  prisma: PrismaService,
  projectIds: string[],
): Promise<Map<string, ProjectMeta>> => {
  if (projectIds.length === 0) {
    return new Map();
  }

  const rows = await prisma.db.project.findMany({
    where: { id: { in: projectIds } },
    select: {
      id: true,
      name: true,
      coverMedia: { select: { fileUrl: true, thumbnailUrl: true } },
    },
  });

  return new Map(
    rows.map((row) => [
      row.id,
      {
        name: row.name,
        coverUrl: row.coverMedia?.thumbnailUrl ?? row.coverMedia?.fileUrl ?? null,
      },
    ]),
  );
};

const summarizeCheckIns = (
  groups: Array<{ status: CheckInStatus; _count: { _all: number } }>,
) => {
  let allowed = 0;
  let duplicate = 0;
  let denied = 0;

  for (const row of groups) {
    if (row.status === CheckInStatus.allowed) {
      allowed += row._count._all;
      continue;
    }
    if (row.status === CheckInStatus.duplicate_checkin) {
      duplicate += row._count._all;
      continue;
    }
    denied += row._count._all;
  }

  return { allowed, duplicate, denied };
};

const loadWeakestReadinessCategories = async (prisma: PrismaService) => {
  const rows = await prisma.db.readinessScore.groupBy({
    by: ["categoryId"],
    where: {
      score: { not: null },
      assessment: { archivedAt: null },
    },
    _avg: { score: true },
    orderBy: { _avg: { score: "asc" } },
    take: ANALYTICS_WEAKEST_CATEGORIES_LIMIT,
  });

  if (rows.length === 0) {
    return [];
  }

  const categories = await prisma.db.readinessCategory.findMany({
    where: { id: { in: rows.map((row) => row.categoryId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(categories.map((row) => [row.id, row.name]));

  return rows
    .filter((row) => row._avg.score != null)
    .map((row) => ({
      categoryId: row.categoryId,
      categoryName: nameById.get(row.categoryId) ?? row.categoryId,
      averageScore: Math.round(row._avg.score as number),
    }));
};
