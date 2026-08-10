import type {
  PlatformActivityGrowth,
  PlatformActivitySeriesPoint,
  PlatformActivitySummary,
} from "@toonexpo/contracts";
import {
  AccountType,
  CompanyStatus,
  CompanyType,
  PartnerCompanyStatus,
  PublicationStatus,
} from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import type { ResolvedAnalyticsDateRange } from "../analytics.types.js";
import { createdAtInRange } from "../utils/resolve-date-range.js";
import {
  countByUtcDay,
  enumerateUtcDayKeys,
  previousAnalyticsDateRange,
  toTrendMetric,
} from "../utils/analytics-trend.js";

type PlatformActivityBundle = {
  platformActivity: PlatformActivitySummary;
  activitySeries: PlatformActivitySeriesPoint[];
  activityGrowth: PlatformActivityGrowth;
};

/**
 * KPI totals (vs stock at range start), daily series, and new-entity growth.
 */
export const loadAdminPlatformActivity = async (
  prisma: PrismaService,
  range: ResolvedAnalyticsDateRange,
): Promise<PlatformActivityBundle> => {
  const previous = previousAnalyticsDateRange(range);
  const beforeFrom = { lt: range.from };
  const inRange = createdAtInRange(range);
  const inPrevious = createdAtInRange(previous);

  const buyerWhere = { accountType: AccountType.buyer };
  const builderWhere = { type: CompanyType.builder, status: CompanyStatus.active };
  const partnerWhere = {
    status: PartnerCompanyStatus.active,
    publicationStatus: PublicationStatus.published,
  };
  const publishedProjectWhere = { publicationStatus: PublicationStatus.published };
  const publishedApartmentWhere = { publicationStatus: PublicationStatus.published };

  const [
    totalUsers,
    usersAtStart,
    registeredBuyers,
    buyersAtStart,
    activeBuilders,
    buildersAtStart,
    activePartners,
    partnersAtStart,
    publishedProjects,
    projectsAtStart,
    publishedApartments,
    apartmentsAtStart,
    newUsers,
    prevNewUsers,
    newProjects,
    prevNewProjects,
    newApartments,
    prevNewApartments,
    userCreatedRows,
    projectCreatedRows,
  ] = await Promise.all([
    prisma.db.user.count(),
    prisma.db.user.count({ where: { createdAt: beforeFrom } }),
    prisma.db.user.count({ where: buyerWhere }),
    prisma.db.user.count({ where: { ...buyerWhere, createdAt: beforeFrom } }),
    prisma.db.company.count({ where: builderWhere }),
    prisma.db.company.count({ where: { ...builderWhere, createdAt: beforeFrom } }),
    prisma.db.partnerCompany.count({ where: partnerWhere }),
    prisma.db.partnerCompany.count({
      where: { ...partnerWhere, createdAt: beforeFrom },
    }),
    prisma.db.project.count({ where: publishedProjectWhere }),
    prisma.db.project.count({
      where: { ...publishedProjectWhere, createdAt: beforeFrom },
    }),
    prisma.db.apartment.count({ where: publishedApartmentWhere }),
    prisma.db.apartment.count({
      where: { ...publishedApartmentWhere, createdAt: beforeFrom },
    }),
    prisma.db.user.count({ where: { createdAt: inRange } }),
    prisma.db.user.count({ where: { createdAt: inPrevious } }),
    prisma.db.project.count({
      where: { ...publishedProjectWhere, createdAt: inRange },
    }),
    prisma.db.project.count({
      where: { ...publishedProjectWhere, createdAt: inPrevious },
    }),
    prisma.db.apartment.count({
      where: { ...publishedApartmentWhere, createdAt: inRange },
    }),
    prisma.db.apartment.count({
      where: { ...publishedApartmentWhere, createdAt: inPrevious },
    }),
    prisma.db.user.findMany({
      where: { createdAt: inRange },
      select: { createdAt: true },
    }),
    prisma.db.project.findMany({
      where: { ...publishedProjectWhere, createdAt: inRange },
      select: { createdAt: true },
    }),
  ]);

  const userByDay = countByUtcDay(userCreatedRows.map((row) => row.createdAt));
  const projectByDay = countByUtcDay(projectCreatedRows.map((row) => row.createdAt));
  const activitySeries = enumerateUtcDayKeys(range).map((date) => ({
    date,
    users: userByDay.get(date) ?? 0,
    projects: projectByDay.get(date) ?? 0,
  }));

  return {
    platformActivity: {
      totalUsers: toTrendMetric(totalUsers, usersAtStart),
      registeredBuyers: toTrendMetric(registeredBuyers, buyersAtStart),
      activeBuilderCompanies: toTrendMetric(activeBuilders, buildersAtStart),
      activePartners: toTrendMetric(activePartners, partnersAtStart),
      publishedProjects: toTrendMetric(publishedProjects, projectsAtStart),
      publishedApartments: toTrendMetric(publishedApartments, apartmentsAtStart),
    },
    activitySeries,
    activityGrowth: {
      newUsers: toTrendMetric(newUsers, prevNewUsers),
      newProjects: toTrendMetric(newProjects, prevNewProjects),
      newApartments: toTrendMetric(newApartments, prevNewApartments),
    },
  };
};
