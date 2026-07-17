import { Injectable } from '@nestjs/common';
import { DEAL_STAGES, REQUEST_SOURCES } from '@toonexpo/domain';

import { type PrismaService } from '../../common/prisma.service';

const LOOKBACK_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class BuilderAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async load(companyId: string) {
    const since = new Date(Date.now() - LOOKBACK_DAYS * DAY_MS);
    const [projects, apartments, stages, sources, qrCount, readiness] = await Promise.all([
      this.prisma.client.project.findMany({
        where: { companyId },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.client.apartment.findMany({
        where: { floor: { building: { project: { companyId } } } },
        select: { id: true },
      }),
      this.prisma.client.deal.groupBy({
        by: ['stage'],
        where: { companyId },
        _count: { _all: true },
      }),
      this.prisma.client.deal.groupBy({
        by: ['source'],
        where: { companyId },
        _count: { _all: true },
      }),
      this.prisma.client.deal.count({ where: { companyId, source: 'BUILDER_QR_SCAN' } }),
      this.prisma.client.readinessAssessment.findMany({
        where: { companyId, archivedAt: null },
        select: {
          id: true,
          targetType: true,
          status: true,
          overallScore: true,
          project: { select: { name: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);
    const projectViews = await this.projectViews(companyId, projects, since);
    const apartmentViews = await this.apartmentViews(
      companyId,
      apartments.map(({ id }) => id),
      since,
    );
    return {
      lookbackDays: LOOKBACK_DAYS,
      projectViews,
      apartmentViewsTotal: apartmentViews.total,
      apartmentViewsLastPeriod: apartmentViews.recent,
      dealsByStage: groups(stages.map((row) => ({ key: row.stage, count: row._count._all })), DEAL_STAGES),
      dealsBySource: groups(
        sources.map((row) => ({ key: row.source, count: row._count._all })),
        REQUEST_SOURCES,
      ),
      qrScanCreatedDealsCount: qrCount,
      readiness: readiness.map((row) => ({
        id: row.id,
        label: row.targetType === 'PROJECT' ? (row.project?.name ?? row.id) : 'BUILDER_COMPANY',
        status: row.status,
        overallScore: row.overallScore,
      })),
    };
  }

  private async projectViews(
    companyId: string,
    projects: Array<{ id: string; name: string }>,
    since: Date,
  ) {
    const ids = projects.map(({ id }) => id);
    if (!ids.length) return [];
    const [all, recent] = await Promise.all([
      this.prisma.client.analyticsEvent.groupBy({
        by: ['projectId'],
        where: { companyId, type: 'PROJECT_VIEW', projectId: { in: ids } },
        _count: { _all: true },
      }),
      this.prisma.client.analyticsEvent.groupBy({
        by: ['projectId'],
        where: { companyId, type: 'PROJECT_VIEW', projectId: { in: ids }, createdAt: { gte: since } },
        _count: { _all: true },
      }),
    ]);
    const totals = new Map(all.map((row) => [row.projectId, row._count._all]));
    const latest = new Map(recent.map((row) => [row.projectId, row._count._all]));
    return projects.map(({ id, name }) => ({
      projectId: id,
      projectName: name,
      total: totals.get(id) ?? 0,
      lastPeriod: latest.get(id) ?? 0,
    }));
  }

  private async apartmentViews(companyId: string, ids: string[], since: Date) {
    if (!ids.length) return { total: 0, recent: 0 };
    const base = { companyId, type: 'APARTMENT_VIEW' as const, apartmentId: { in: ids } };
    const [total, recent] = await Promise.all([
      this.prisma.client.analyticsEvent.count({ where: base }),
      this.prisma.client.analyticsEvent.count({ where: { ...base, createdAt: { gte: since } } }),
    ]);
    return { total, recent };
  }
}

function groups<T extends string>(rows: Array<{ key: T; count: number }>, keys: readonly T[]) {
  const counts = new Map(rows.map((row) => [row.key, row.count]));
  return keys.map((key) => ({ key, count: counts.get(key) ?? 0 }));
}
