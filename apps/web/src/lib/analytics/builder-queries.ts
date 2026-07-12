import { prisma } from '@toonexpo/db';
import { DEAL_STAGES, REQUEST_SOURCES, type ReadinessStatus } from '@toonexpo/domain';

import { mapGroupCounts, type NamedCount } from './aggregates';
import { ANALYTICS_LOOKBACK_DAYS, analyticsLookbackStart } from './constants';

export type ProjectViewRow = {
  projectId: string;
  projectName: string;
  total: number;
  lastPeriod: number;
};

export type BuilderReadinessSnapshotRow = {
  id: string;
  label: string;
  status: ReadinessStatus;
  overallScore: number | null;
};

export type BuilderAnalyticsSnapshot = {
  lookbackDays: number;
  projectViews: ProjectViewRow[];
  dealsByStage: NamedCount[];
  dealsBySource: NamedCount[];
  qrScanCreatedDealsCount: number;
  readiness: BuilderReadinessSnapshotRow[];
};

type StageOrSourceGroup = {
  stage?: string;
  source?: string;
  _count: { _all: number };
};

function mapKeyedGroups(
  groups: ReadonlyArray<StageOrSourceGroup>,
  field: 'stage' | 'source',
  keys: ReadonlyArray<string>,
): NamedCount[] {
  const mapped = groups.map((group) => ({
    key: String(group[field]),
    count: group._count._all,
  }));
  return mapGroupCounts(mapped, keys);
}

async function loadProjectViewRows(companyId: string, since: Date): Promise<ProjectViewRow[]> {
  const projects = await prisma.project.findMany({
    where: { companyId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
  if (projects.length === 0) {
    return [];
  }

  const projectIds = projects.map((project) => project.id);
  const [totals, recent] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ['projectId'],
      where: {
        companyId,
        type: 'PROJECT_VIEW',
        projectId: { in: projectIds },
      },
      _count: { _all: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ['projectId'],
      where: {
        companyId,
        type: 'PROJECT_VIEW',
        projectId: { in: projectIds },
        createdAt: { gte: since },
      },
      _count: { _all: true },
    }),
  ]);

  const totalById = new Map(
    totals
      .filter((row): row is typeof row & { projectId: string } => row.projectId !== null)
      .map((row) => [row.projectId, row._count._all]),
  );
  const recentById = new Map(
    recent
      .filter((row): row is typeof row & { projectId: string } => row.projectId !== null)
      .map((row) => [row.projectId, row._count._all]),
  );

  return projects.map((project) => ({
    projectId: project.id,
    projectName: project.name,
    total: totalById.get(project.id) ?? 0,
    lastPeriod: recentById.get(project.id) ?? 0,
  }));
}

async function loadDealGroups(
  companyId: string,
): Promise<{ dealsByStage: NamedCount[]; dealsBySource: NamedCount[] }> {
  const [stageGroups, sourceGroups] = await Promise.all([
    prisma.deal.groupBy({
      by: ['stage'],
      where: { companyId },
      _count: { _all: true },
    }),
    prisma.deal.groupBy({
      by: ['source'],
      where: { companyId },
      _count: { _all: true },
    }),
  ]);

  return {
    dealsByStage: mapKeyedGroups(stageGroups, 'stage', DEAL_STAGES),
    dealsBySource: mapKeyedGroups(sourceGroups, 'source', REQUEST_SOURCES),
  };
}

async function loadQrScanCreatedDealsCount(companyId: string): Promise<number> {
  return prisma.deal.count({
    where: { companyId, source: 'BUILDER_QR_SCAN' },
  });
}

async function loadReadinessSnapshot(companyId: string): Promise<BuilderReadinessSnapshotRow[]> {
  const rows = await prisma.readinessAssessment.findMany({
    where: { companyId, archivedAt: null },
    select: {
      id: true,
      targetType: true,
      status: true,
      overallScore: true,
      project: { select: { name: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return rows.map((row) => ({
    id: row.id,
    label:
      row.targetType === 'PROJECT'
        ? (row.project?.name ?? row.id)
        : 'BUILDER_COMPANY',
    status: row.status,
    overallScore: row.overallScore,
  }));
}

/**
 * Company-scoped builder analytics (docs: 04-Builder-Analytics).
 * Every query includes `companyId` in `where` — never global.
 */
export async function loadBuilderAnalytics(companyId: string): Promise<BuilderAnalyticsSnapshot> {
  const since = analyticsLookbackStart();
  const [projectViews, dealGroups, qrScanCreatedDealsCount, readiness] = await Promise.all([
    loadProjectViewRows(companyId, since),
    loadDealGroups(companyId),
    loadQrScanCreatedDealsCount(companyId),
    loadReadinessSnapshot(companyId),
  ]);

  return {
    lookbackDays: ANALYTICS_LOOKBACK_DAYS,
    projectViews,
    dealsByStage: dealGroups.dealsByStage,
    dealsBySource: dealGroups.dealsBySource,
    qrScanCreatedDealsCount,
    readiness,
  };
}
