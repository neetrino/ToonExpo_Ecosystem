import { Inject, Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/prisma.service';

const REPORT_LIMIT = 5000;
const LOOKBACK_DAYS = 30;
const DAY_MS = 86_400_000;
const FORMULA_LEADING = /^[=+\-@\t\r]/;

export const ADMIN_REPORT_NAMES = ['deals', 'checkins', 'project-views', 'audit'] as const;
export type AdminReportName = (typeof ADMIN_REPORT_NAMES)[number];

@Injectable()
export class AdminReportService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async build(report: AdminReportName): Promise<string> {
    switch (report) {
      case 'deals':
        return this.deals();
      case 'checkins':
        return this.checkIns();
      case 'project-views':
        return this.projectViews();
      case 'audit':
        return this.audit();
    }
  }

  private async deals(): Promise<string> {
    const rows = await this.prisma.client.deal.findMany({
      orderBy: { createdAt: 'desc' },
      take: REPORT_LIMIT,
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
    return csv(
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
        iso(row.createdAt),
        iso(row.lastActivityAt),
      ]),
    );
  }

  private async checkIns(): Promise<string> {
    const rows = await this.prisma.client.checkIn.findMany({
      orderBy: { checkedInAt: 'desc' },
      take: REPORT_LIMIT,
      select: {
        checkedInAt: true,
        status: true,
        event: { select: { name: true, code: true } },
        buyerProfile: { select: { user: { select: { name: true, email: true } } } },
      },
    });
    return csv(
      ['event', 'eventCode', 'buyerName', 'buyerEmail', 'status', 'checkedInAt'],
      rows.map((row) => [
        row.event.name,
        row.event.code,
        row.buyerProfile.user.name,
        row.buyerProfile.user.email,
        row.status,
        iso(row.checkedInAt),
      ]),
    );
  }

  private async projectViews(): Promise<string> {
    const groups = await this.prisma.client.analyticsEvent.groupBy({
      by: ['projectId', 'companyId'],
      where: {
        type: 'PROJECT_VIEW',
        createdAt: { gte: new Date(Date.now() - LOOKBACK_DAYS * DAY_MS) },
        projectId: { not: null },
      },
      _count: { _all: true },
    });
    const ranked = [...groups].sort((a, b) => b._count._all - a._count._all).slice(0, REPORT_LIMIT);
    const [projects, companies] = await Promise.all([
      this.prisma.client.project.findMany({
        where: { id: { in: ranked.flatMap((row) => (row.projectId ? [row.projectId] : [])) } },
        select: { id: true, name: true },
      }),
      this.prisma.client.company.findMany({
        where: { id: { in: ranked.map((row) => row.companyId) } },
        select: { id: true, name: true },
      }),
    ]);
    const projectNames = new Map(projects.map((row) => [row.id, row.name]));
    const companyNames = new Map(companies.map((row) => [row.id, row.name]));
    return csv(
      ['project', 'company', 'viewCount', 'lookbackDays'],
      ranked.map((row) => [
        row.projectId ? (projectNames.get(row.projectId) ?? row.projectId) : '',
        companyNames.get(row.companyId) ?? row.companyId,
        row._count._all,
        LOOKBACK_DAYS,
      ]),
    );
  }

  private async audit(): Promise<string> {
    const rows = await this.prisma.client.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: REPORT_LIMIT,
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
    return csv(
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
        iso(row.createdAt),
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
}

type CsvCell = string | number | null | undefined;

function iso(value: Date | null | undefined): string {
  return value?.toISOString() ?? '';
}

function csv(headers: string[], rows: CsvCell[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(','));
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

function escapeCell(value: CsvCell): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return String(value);
  const safe = FORMULA_LEADING.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}
