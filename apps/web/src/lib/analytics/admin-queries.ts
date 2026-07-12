import { prisma } from '@toonexpo/db';
import {
  APARTMENT_STATUSES,
  DEAL_STAGES,
  PARTNER_TYPES,
  PUBLICATION_STATUSES,
  QR_SCAN_PURPOSES,
  REQUEST_SOURCES,
} from '@toonexpo/domain';

import { mapGroupCounts, type NamedCount } from './aggregates';
import { ANALYTICS_LOOKBACK_DAYS, analyticsLookbackStart } from './constants';

export type CheckInEventCount = {
  eventId: string;
  eventName: string;
  count: number;
};

export type ReadinessCompanyAverage = {
  companyId: string;
  companyName: string;
  avgScore: number | null;
  assessmentCount: number;
};

export type AdminAnalyticsSnapshot = {
  lookbackDays: number;
  projectViewsTotal: number;
  projectViewsLastPeriod: number;
  dealsBySource: NamedCount[];
  dealsBySourceLastPeriod: NamedCount[];
  dealsByStage: NamedCount[];
  qrScansByPurpose: NamedCount[];
  qrScansByPurposeLastPeriod: NamedCount[];
  checkInsByEvent: CheckInEventCount[];
  projectsByStatus: NamedCount[];
  apartmentsByStatus: NamedCount[];
  readinessAvgByCompany: ReadinessCompanyAverage[];
  partnersByType: NamedCount[];
};

function countsFromGroups(
  groups: ReadonlyArray<{ value: string; count: number }>,
  keys: ReadonlyArray<string>,
): NamedCount[] {
  return mapGroupCounts(
    groups.map((group) => ({ key: group.value, count: group.count })),
    keys,
  );
}

async function countProjectViews(since?: Date): Promise<number> {
  return prisma.analyticsEvent.count({
    where: {
      type: 'PROJECT_VIEW',
      ...(since ? { createdAt: { gte: since } } : {}),
    },
  });
}

async function loadDealSourceCounts(since?: Date): Promise<NamedCount[]> {
  const groups = await prisma.deal.groupBy({
    by: ['source'],
    where: since ? { createdAt: { gte: since } } : undefined,
    _count: { _all: true },
  });
  return countsFromGroups(
    groups.map((group) => ({ value: group.source, count: group._count._all })),
    REQUEST_SOURCES,
  );
}

async function loadDealStageCounts(): Promise<NamedCount[]> {
  const groups = await prisma.deal.groupBy({
    by: ['stage'],
    _count: { _all: true },
  });
  return countsFromGroups(
    groups.map((group) => ({ value: group.stage, count: group._count._all })),
    DEAL_STAGES,
  );
}

async function loadQrPurposeCounts(since?: Date): Promise<NamedCount[]> {
  const groups = await prisma.qrScanLog.groupBy({
    by: ['purpose'],
    where: since ? { scannedAt: { gte: since } } : undefined,
    _count: { _all: true },
  });
  return countsFromGroups(
    groups.map((group) => ({ value: group.purpose, count: group._count._all })),
    QR_SCAN_PURPOSES,
  );
}

async function loadCheckInsByEvent(): Promise<CheckInEventCount[]> {
  const groups = await prisma.checkIn.groupBy({
    by: ['eventId'],
    _count: { _all: true },
  });
  if (groups.length === 0) {
    return [];
  }

  const events = await prisma.exhibitionEvent.findMany({
    where: { id: { in: groups.map((group) => group.eventId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(events.map((event) => [event.id, event.name]));

  return groups.map((group) => ({
    eventId: group.eventId,
    eventName: nameById.get(group.eventId) ?? group.eventId,
    count: group._count._all,
  }));
}

async function loadProjectsByStatus(): Promise<NamedCount[]> {
  const groups = await prisma.project.groupBy({
    by: ['status'],
    _count: { _all: true },
  });
  return countsFromGroups(
    groups.map((group) => ({ value: group.status, count: group._count._all })),
    PUBLICATION_STATUSES,
  );
}

async function loadApartmentsByStatus(): Promise<NamedCount[]> {
  const groups = await prisma.apartment.groupBy({
    by: ['status'],
    _count: { _all: true },
  });
  return countsFromGroups(
    groups.map((group) => ({ value: group.status, count: group._count._all })),
    APARTMENT_STATUSES,
  );
}

async function loadPartnersByType(): Promise<NamedCount[]> {
  const groups = await prisma.partner.groupBy({
    by: ['type'],
    _count: { _all: true },
  });
  return countsFromGroups(
    groups.map((group) => ({ value: group.type, count: group._count._all })),
    PARTNER_TYPES,
  );
}

async function loadReadinessAvgByCompany(): Promise<ReadinessCompanyAverage[]> {
  const groups = await prisma.readinessAssessment.groupBy({
    by: ['companyId'],
    where: { archivedAt: null, overallScore: { not: null } },
    _avg: { overallScore: true },
    _count: { _all: true },
  });
  if (groups.length === 0) {
    return [];
  }

  const companies = await prisma.company.findMany({
    where: { id: { in: groups.map((group) => group.companyId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(companies.map((company) => [company.id, company.name]));

  return groups.map((group) => ({
    companyId: group.companyId,
    companyName: nameById.get(group.companyId) ?? group.companyId,
    avgScore: group._avg.overallScore,
    assessmentCount: group._count._all,
  }));
}

/** Global BigProjects admin analytics aggregates (docs: 03-BigProjects-Analytics). */
export async function loadAdminAnalytics(): Promise<AdminAnalyticsSnapshot> {
  const since = analyticsLookbackStart();

  const [
    projectViewsTotal,
    projectViewsLastPeriod,
    dealsBySource,
    dealsBySourceLastPeriod,
    dealsByStage,
    qrScansByPurpose,
    qrScansByPurposeLastPeriod,
    checkInsByEvent,
    projectsByStatus,
    apartmentsByStatus,
    readinessAvgByCompany,
    partnersByType,
  ] = await Promise.all([
    countProjectViews(),
    countProjectViews(since),
    loadDealSourceCounts(),
    loadDealSourceCounts(since),
    loadDealStageCounts(),
    loadQrPurposeCounts(),
    loadQrPurposeCounts(since),
    loadCheckInsByEvent(),
    loadProjectsByStatus(),
    loadApartmentsByStatus(),
    loadReadinessAvgByCompany(),
    loadPartnersByType(),
  ]);

  return {
    lookbackDays: ANALYTICS_LOOKBACK_DAYS,
    projectViewsTotal,
    projectViewsLastPeriod,
    dealsBySource,
    dealsBySourceLastPeriod,
    dealsByStage,
    qrScansByPurpose,
    qrScansByPurposeLastPeriod,
    checkInsByEvent,
    projectsByStatus,
    apartmentsByStatus,
    readinessAvgByCompany,
    partnersByType,
  };
}
