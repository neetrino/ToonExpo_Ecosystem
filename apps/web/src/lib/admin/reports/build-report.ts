import { prisma } from '@toonexpo/db';

import { ANALYTICS_LOOKBACK_DAYS, analyticsLookbackStart } from '../../analytics/constants';

import { adminReportNameSchema, type AdminReportName, REPORT_ROW_LIMIT } from './constants';
import { buildCsv } from './csv';

export { adminReportNameSchema };
function formatIso(value: Date | null | undefined): string {
  return value ? value.toISOString() : '';
}

async function buildDealsCsv(): Promise<string> {
  const rows = await prisma.deal.findMany({
    orderBy: { createdAt: 'desc' },
    take: REPORT_ROW_LIMIT,
    select: {
      stage: true,
      source: true,
      contactName: true,
      contactEmail: true,
      createdAt: true,
      lastActivityAt: true,
      company: { select: { name: true } },
      project: { select: { name: true } },
    },
  });

  return buildCsv(
    [
      'company',
      'project',
      'stage',
      'source',
      'contactName',
      'contactEmail',
      'createdAt',
      'lastActivityAt',
    ],
    rows.map((row) => [
      row.company.name,
      row.project?.name ?? '',
      row.stage,
      row.source,
      row.contactName,
      row.contactEmail,
      formatIso(row.createdAt),
      formatIso(row.lastActivityAt),
    ]),
  );
}

async function buildCheckinsCsv(): Promise<string> {
  const rows = await prisma.checkIn.findMany({
    orderBy: { checkedInAt: 'desc' },
    take: REPORT_ROW_LIMIT,
    select: {
      checkedInAt: true,
      status: true,
      event: { select: { name: true, code: true } },
      buyerProfile: { select: { user: { select: { name: true, email: true } } } },
    },
  });

  return buildCsv(
    ['event', 'eventCode', 'buyerName', 'buyerEmail', 'status', 'checkedInAt'],
    rows.map((row) => [
      row.event.name,
      row.event.code,
      row.buyerProfile.user.name,
      row.buyerProfile.user.email,
      row.status,
      formatIso(row.checkedInAt),
    ]),
  );
}

async function buildProjectViewsCsv(): Promise<string> {
  const since = analyticsLookbackStart();
  const groups = await prisma.analyticsEvent.groupBy({
    by: ['projectId', 'companyId'],
    where: {
      type: 'PROJECT_VIEW',
      createdAt: { gte: since },
      projectId: { not: null },
    },
    _count: { _all: true },
  });

  const ranked = [...groups]
    .sort((left, right) => right._count._all - left._count._all)
    .slice(0, REPORT_ROW_LIMIT);

  const projectIds = ranked
    .map((group) => group.projectId)
    .filter((id): id is string => id !== null);
  const companyIds = [...new Set(ranked.map((group) => group.companyId))];

  const [projects, companies] = await Promise.all([
    prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, name: true },
    }),
    prisma.company.findMany({
      where: { id: { in: companyIds } },
      select: { id: true, name: true },
    }),
  ]);

  const projectNameById = new Map(projects.map((project) => [project.id, project.name]));
  const companyNameById = new Map(companies.map((company) => [company.id, company.name]));

  return buildCsv(
    ['project', 'company', 'viewCount', 'lookbackDays'],
    ranked.map((group) => [
      group.projectId ? (projectNameById.get(group.projectId) ?? group.projectId) : '',
      companyNameById.get(group.companyId) ?? group.companyId,
      group._count._all,
      ANALYTICS_LOOKBACK_DAYS,
    ]),
  );
}

async function buildAuditCsv(): Promise<string> {
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: REPORT_ROW_LIMIT,
    select: {
      action: true,
      entityType: true,
      entityId: true,
      detail: true,
      actorRole: true,
      createdAt: true,
      actorUser: { select: { email: true, name: true } },
      company: { select: { name: true } },
    },
  });

  return buildCsv(
    [
      'createdAt',
      'actorEmail',
      'actorName',
      'actorRole',
      'action',
      'entityType',
      'entityId',
      'company',
      'detail',
    ],
    rows.map((row) => [
      formatIso(row.createdAt),
      row.actorUser.email,
      row.actorUser.name,
      row.actorRole,
      row.action,
      row.entityType,
      row.entityId,
      row.company?.name ?? '',
      row.detail,
    ]),
  );
}

/** Builds CSV body for a validated admin report name. */
export async function buildAdminReportCsv(report: AdminReportName): Promise<string> {
  switch (report) {
    case 'deals':
      return buildDealsCsv();
    case 'checkins':
      return buildCheckinsCsv();
    case 'project-views':
      return buildProjectViewsCsv();
    case 'audit':
      return buildAuditCsv();
  }
}
