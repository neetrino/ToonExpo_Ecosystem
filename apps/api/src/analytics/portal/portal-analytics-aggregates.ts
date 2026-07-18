import type {
  CrmDealStatus,
  PortalAnalyticsOverview,
  ReadinessScoreStatus,
  RequestSource,
} from "@toonexpo/contracts";
import {
  AnalyticsEventType,
  ApartmentSalesStatus,
  PublicationStatus,
  ReadinessAssessmentTargetType,
} from "@toonexpo/db";

import {
  ANALYTICS_BUILDER_TOP_ENTITIES_LIMIT,
} from "../analytics.constants.js";
import type { ResolvedAnalyticsDateRange } from "../analytics.types.js";
import { createdAtInRange } from "../utils/resolve-date-range.js";
import { loadPortalFavoritesSummary } from "../utils/favorites-aggregates.js";
import type { PrismaService } from "../../prisma/prisma.service.js";

export const loadPortalAnalyticsOverview = async (
  prisma: PrismaService,
  companyId: string,
  range: ResolvedAnalyticsDateRange,
): Promise<PortalAnalyticsOverview> => {
  const dateFilter = createdAtInRange(range);

  const [
    topProjectGroups,
    topApartmentGroups,
    requestGroups,
    dealGroups,
    apartmentSalesGroups,
    companyAssessment,
    projectAssessment,
    favorites,
  ] = await Promise.all([
    prisma.db.analyticsEvent.groupBy({
      by: ["projectId"],
      where: {
        eventType: AnalyticsEventType.project_view,
        companyId,
        projectId: { not: null },
        createdAt: dateFilter,
      },
      _count: { _all: true },
      orderBy: { _count: { projectId: "desc" } },
      take: ANALYTICS_BUILDER_TOP_ENTITIES_LIMIT,
    }),
    prisma.db.analyticsEvent.groupBy({
      by: ["apartmentId"],
      where: {
        eventType: AnalyticsEventType.apartment_view,
        companyId,
        apartmentId: { not: null },
        createdAt: dateFilter,
      },
      _count: { _all: true },
      orderBy: { _count: { apartmentId: "desc" } },
      take: ANALYTICS_BUILDER_TOP_ENTITIES_LIMIT,
    }),
    prisma.db.request.groupBy({
      by: ["source"],
      where: { builderCompanyId: companyId, createdAt: dateFilter },
      _count: { _all: true },
    }),
    prisma.db.crmDeal.groupBy({
      by: ["status"],
      where: { companyId, lastActivityAt: dateFilter },
      _count: { _all: true },
    }),
    prisma.db.apartment.groupBy({
      by: ["salesStatus"],
      where: {
        project: { builderCompanyId: companyId },
        publicationStatus: PublicationStatus.published,
      },
      _count: { _all: true },
    }),
    prisma.db.readinessAssessment.findFirst({
      where: {
        builderCompanyId: companyId,
        targetType: ReadinessAssessmentTargetType.builder_company,
        archivedAt: null,
      },
      orderBy: { createdAt: "desc" },
      select: { status: true, overallScore: true },
    }),
    prisma.db.readinessAssessment.findFirst({
      where: {
        builderCompanyId: companyId,
        targetType: ReadinessAssessmentTargetType.project,
        archivedAt: null,
      },
      orderBy: { createdAt: "desc" },
      select: { status: true, overallScore: true },
    }),
    loadPortalFavoritesSummary(prisma, companyId),
  ]);

  const projectIds = topProjectGroups
    .map((row) => row.projectId)
    .filter((id): id is string => id != null);
  const apartmentIds = topApartmentGroups
    .map((row) => row.apartmentId)
    .filter((id): id is string => id != null);

  const [projectNames, apartmentLabels] = await Promise.all([
    loadProjectNames(prisma, projectIds),
    loadApartmentLabels(prisma, apartmentIds),
  ]);

  const requestsTotal = requestGroups.reduce(
    (sum, row) => sum + row._count._all,
    0,
  );

  return {
    range: { from: range.fromIso, to: range.toIso },
    topProjectsByViews: topProjectGroups
      .filter((row) => row.projectId != null)
      .map((row) => ({
        entityId: row.projectId as string,
        name: projectNames.get(row.projectId as string) ?? null,
        viewCount: row._count._all,
      })),
    topApartmentsByViews: topApartmentGroups
      .filter((row) => row.apartmentId != null)
      .map((row) => ({
        entityId: row.apartmentId as string,
        name: apartmentLabels.get(row.apartmentId as string) ?? null,
        viewCount: row._count._all,
      })),
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
    apartmentSalesStatus: summarizeApartmentSales(
      apartmentSalesGroups as Array<{
        salesStatus: ApartmentSalesStatus;
        _count: { _all: number };
      }>,
    ),
    readiness: {
      companyStatus: (companyAssessment?.status ??
        null) as ReadinessScoreStatus | null,
      companyOverallScore: companyAssessment?.overallScore ?? null,
      projectStatus: (projectAssessment?.status ??
        null) as ReadinessScoreStatus | null,
      projectOverallScore: projectAssessment?.overallScore ?? null,
    },
  };
};

const loadProjectNames = async (
  prisma: PrismaService,
  projectIds: string[],
): Promise<Map<string, string>> => {
  if (projectIds.length === 0) {
    return new Map();
  }

  const rows = await prisma.db.project.findMany({
    where: { id: { in: projectIds } },
    select: { id: true, name: true },
  });

  return new Map(rows.map((row) => [row.id, row.name]));
};

const loadApartmentLabels = async (
  prisma: PrismaService,
  apartmentIds: string[],
): Promise<Map<string, string>> => {
  if (apartmentIds.length === 0) {
    return new Map();
  }

  const rows = await prisma.db.apartment.findMany({
    where: { id: { in: apartmentIds } },
    select: { id: true, number: true },
  });

  return new Map(rows.map((row) => [row.id, row.number]));
};

const summarizeApartmentSales = (
  groups: Array<{
    salesStatus: ApartmentSalesStatus;
    _count: { _all: number };
  }>,
) => {
  let available = 0;
  let reserved = 0;
  let sold = 0;

  for (const row of groups) {
    if (row.salesStatus === ApartmentSalesStatus.available) {
      available += row._count._all;
    } else if (row.salesStatus === ApartmentSalesStatus.reserved) {
      reserved += row._count._all;
    } else if (row.salesStatus === ApartmentSalesStatus.sold) {
      sold += row._count._all;
    }
  }

  return { available, reserved, sold };
};
