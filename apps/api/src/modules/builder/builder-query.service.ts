import { Injectable } from '@nestjs/common';
import { DEAL_STAGES, REQUEST_SOURCES } from '@toonexpo/domain';

import { PrismaService } from '../../common/prisma.service';

const STATUS_HISTORY_LIMIT = 10;
const ANALYTICS_LOOKBACK_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class BuilderQueryService {
  constructor(private readonly prisma: PrismaService) {}

  profile(companyId: string) {
    return this.prisma.client.company.findUnique({
      where: { id: companyId },
      select: {
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        phone: true,
        email: true,
        website: true,
        city: true,
        address: true,
      },
    });
  }

  async members(companyId: string) {
    const rows = await this.prisma.client.companyMember.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      userId: row.user.id,
      name: row.user.name?.trim() || row.user.email,
      email: row.user.email,
      role: row.role,
      joinedAt: row.createdAt,
    }));
  }

  async companyOptions(userId: string, admin: boolean) {
    if (admin) {
      return this.prisma.client.company.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      });
    }
    const rows = await this.prisma.client.companyMember.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { company: { select: { id: true, name: true } } },
    });
    return rows.map(({ company }) => company);
  }

  projectCounts(companyId: string) {
    return this.prisma.client.project.groupBy({
      by: ['status'],
      where: { companyId },
      _count: { _all: true },
    });
  }

  projects(companyId: string) {
    return this.prisma.client.project.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        status: true,
        updatedAt: true,
        description: true,
        _count: { select: { buildings: true, media: true, canvases: true } },
        buildings: {
          select: {
            status: true,
            floors: {
              select: { status: true, _count: { select: { apartments: true } } },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  project(companyId: string, projectId: string) {
    return this.prisma.client.project.findFirst({
      where: { id: projectId, companyId },
      select: {
        id: true,
        name: true,
        description: true,
        city: true,
        address: true,
        status: true,
        media: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, url: true, alt: true, sortOrder: true },
        },
        buildings: {
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            floors: {
              orderBy: { level: 'asc' },
              select: {
                id: true,
                name: true,
                level: true,
                status: true,
                apartments: {
                  orderBy: { code: 'asc' },
                  select: {
                    id: true,
                    code: true,
                    rooms: true,
                    areaSqm: true,
                    priceAmd: true,
                    priceVisibility: true,
                    matterportUrl: true,
                    status: true,
                    media: {
                      orderBy: { sortOrder: 'asc' },
                      select: { id: true, url: true, alt: true, sortOrder: true },
                    },
                    statusHistory: {
                      orderBy: { createdAt: 'desc' },
                      take: STATUS_HISTORY_LIMIT,
                      select: {
                        id: true,
                        oldStatus: true,
                        newStatus: true,
                        source: true,
                        reason: true,
                        createdAt: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  readiness(companyId: string) {
    return this.prisma.client.readinessAssessment.findMany({
      where: { companyId, archivedAt: null },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        targetType: true,
        companyId: true,
        projectId: true,
        status: true,
        overallScore: true,
        recommendation: true,
        requiredActions: true,
        responsibleContact: true,
        lastEvaluatedAt: true,
        updatedAt: true,
        project: { select: { name: true } },
        categoryScores: {
          orderBy: { category: { sortOrder: 'asc' } },
          select: {
            categoryId: true,
            score: true,
            status: true,
            recommendation: true,
            requiredActions: true,
            category: {
              select: { key: true, name: true, serviceCategoryKey: true },
            },
          },
        },
      },
    });
  }

  providers() {
    return this.prisma.client.partner.findMany({
      where: { status: 'PUBLISHED', type: 'SERVICE_COMPANY' },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        serviceCategories: true,
        phone: true,
        email: true,
        website: true,
        description: true,
      },
    });
  }

  async analytics(companyId: string) {
    const since = new Date(Date.now() - ANALYTICS_LOOKBACK_DAYS * DAY_MS);
    const [projects, apartmentIds, stages, sources, qrCount, readiness] = await Promise.all([
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
    const projectViews = await this.viewRows(companyId, projects, since);
    const apartmentViews = await this.viewCounts(companyId, apartmentIds.map(({ id }) => id), since);
    return {
      lookbackDays: ANALYTICS_LOOKBACK_DAYS,
      projectViews,
      apartmentViewsTotal: apartmentViews.total,
      apartmentViewsLastPeriod: apartmentViews.recent,
      dealsByStage: mapGroups(stages, DEAL_STAGES, 'stage'),
      dealsBySource: mapGroups(sources, REQUEST_SOURCES, 'source'),
      qrScanCreatedDealsCount: qrCount,
      readiness: readiness.map((row) => ({
        id: row.id,
        label: row.targetType === 'PROJECT' ? (row.project?.name ?? row.id) : 'BUILDER_COMPANY',
        status: row.status,
        overallScore: row.overallScore,
      })),
    };
  }

  private async viewRows(
    companyId: string,
    projects: Array<{ id: string; name: string }>,
    since: Date,
  ) {
    const ids = projects.map(({ id }) => id);
    if (ids.length === 0) return [];
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

  private async viewCounts(companyId: string, ids: string[], since: Date) {
    if (ids.length === 0) return { total: 0, recent: 0 };
    const base = { companyId, type: 'APARTMENT_VIEW' as const, apartmentId: { in: ids } };
    const [total, recent] = await Promise.all([
      this.prisma.client.analyticsEvent.count({ where: base }),
      this.prisma.client.analyticsEvent.count({ where: { ...base, createdAt: { gte: since } } }),
    ]);
    return { total, recent };
  }
}

function mapGroups<T extends string, F extends string>(
  groups: Array<Record<F, T> & { _count: { _all: number } }>,
  keys: readonly T[],
  field: F,
) {
  const counts = new Map(groups.map((group) => [group[field], group._count._all]));
  return keys.map((key) => ({ key, count: counts.get(key) ?? 0 }));
}
