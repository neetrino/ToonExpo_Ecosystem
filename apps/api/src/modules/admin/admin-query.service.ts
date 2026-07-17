import { Inject, Injectable } from '@nestjs/common';
import { PLATFORM_SETTING_KEYS } from '@toonexpo/contracts';
import {
  APARTMENT_STATUSES,
  DEAL_STAGES,
  PARTNER_TYPES,
  PUBLICATION_STATUSES,
  QR_SCAN_PURPOSES,
  REQUEST_SOURCES,
  type AuditEntityType,
  type PartnerType,
  type PublicationStatus,
  type ReadinessTargetType,
} from '@toonexpo/domain';

import { PrismaService } from '../../common/prisma.service';

const AUDIT_LIMIT = 200;
const INTEGRATION_LIMIT = 100;
const CHECK_IN_LIMIT = 30;
const LOOKBACK_DAYS = 30;
const DAY_MS = 86_400_000;

@Injectable()
export class AdminQueryService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async users(): Promise<unknown> {
    const rows = await this.prisma.client.user.findMany({
      where: { role: { not: 'BUYER' } },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        members: { select: { company: { select: { name: true } } }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(({ members, ...user }) => ({
      ...user,
      companyName: members[0]?.company.name ?? null,
    }));
  }

  async companies(): Promise<unknown> {
    const [companies, groups] = await Promise.all([
      this.prisma.client.company.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logoUrl: true,
          phone: true,
          email: true,
          website: true,
          city: true,
          address: true,
          createdAt: true,
          _count: { select: { members: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.client.project.groupBy({
        by: ['companyId', 'status'],
        _count: { _all: true },
      }),
    ]);
    const byCompany = new Map<string, { draft: number; published: number; archived: number }>();
    for (const group of groups) {
      const counts = byCompany.get(group.companyId) ?? { draft: 0, published: 0, archived: 0 };
      counts[group.status.toLowerCase() as 'draft' | 'published' | 'archived'] = group._count._all;
      byCompany.set(group.companyId, counts);
    }
    return companies.map(({ _count, ...company }) => ({
      ...company,
      membersCount: _count.members,
      projectsCount: byCompany.get(company.id) ?? { draft: 0, published: 0, archived: 0 },
    }));
  }

  async projects(status?: PublicationStatus): Promise<unknown> {
    const projects = await this.prisma.client.project.findMany({
      where: status ? { status } : undefined,
      select: {
        id: true,
        name: true,
        status: true,
        updatedAt: true,
        description: true,
        company: { select: { name: true } },
        _count: { select: { buildings: true, media: true, canvases: true } },
        buildings: {
          select: {
            status: true,
            floors: { select: { status: true, _count: { select: { apartments: true } } } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      companyName: project.company.name,
      status: project.status,
      buildingsCount: project._count.buildings,
      updatedAt: project.updatedAt,
      completenessMissingKeys: projectMissingKeys(project),
    }));
  }

  async partners(type?: PartnerType): Promise<unknown> {
    const rows = await this.prisma.client.partner.findMany({
      where: type ? { type } : undefined,
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        status: true,
        updatedAt: true,
        _count: { select: { bankOffers: true } },
      },
      orderBy: { name: 'asc' },
    });
    return rows.map(({ _count, ...partner }) => ({ ...partner, offersCount: _count.bankOffers }));
  }

  partner(id: string): Promise<unknown> {
    return this.prisma.client.partner.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        logoUrl: true,
        description: true,
        phone: true,
        email: true,
        website: true,
        serviceCategories: true,
        status: true,
        companyId: true,
        bankOffers: {
          orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
          select: {
            id: true,
            title: true,
            description: true,
            interestRate: true,
            minDownPaymentPercent: true,
            maxTermMonths: true,
            maxAmountAmd: true,
            featured: true,
            status: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  partnerOptions(): Promise<unknown> {
    return this.prisma.client.partner.findMany({
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' },
    });
  }

  async settings(): Promise<unknown> {
    const rows = await this.prisma.client.platformSetting.findMany({
      select: { key: true, value: true, updatedAt: true },
    });
    const byKey = new Map(rows.map((row) => [row.key, row]));
    return PLATFORM_SETTING_KEYS.map((key) => ({
      key,
      value: byKey.get(key)?.value ?? null,
      updatedAt: byKey.get(key)?.updatedAt ?? null,
    }));
  }

  async audit(entityType?: AuditEntityType): Promise<unknown> {
    const rows = await this.prisma.client.auditLog.findMany({
      where: entityType ? { entityType } : undefined,
      orderBy: { createdAt: 'desc' },
      take: AUDIT_LIMIT,
      select: {
        id: true,
        actorRole: true,
        action: true,
        entityType: true,
        entityId: true,
        detail: true,
        createdAt: true,
        actorUser: { select: { email: true, name: true } },
      },
    });
    return rows.map(({ actorUser, ...row }) => ({
      ...row,
      actorEmail: actorUser.email,
      actorName: actorUser.name,
    }));
  }

  integrations(): Promise<unknown> {
    return this.prisma.client.integrationAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: INTEGRATION_LIMIT,
      select: {
        id: true,
        direction: true,
        operation: true,
        status: true,
        externalRef: true,
        createdAt: true,
      },
    });
  }

  async exhibitionEvents(): Promise<unknown> {
    const rows = await this.prisma.client.exhibitionEvent.findMany({
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        code: true,
        startDate: true,
        endDate: true,
        status: true,
        updatedAt: true,
        _count: { select: { checkIns: true } },
      },
    });
    return rows.map(({ _count, ...event }) => ({ ...event, checkInCount: _count.checkIns }));
  }

  async recentCheckIns(eventId?: string): Promise<unknown> {
    const rows = await this.prisma.client.checkIn.findMany({
      where: eventId ? { eventId } : undefined,
      orderBy: { checkedInAt: 'desc' },
      take: CHECK_IN_LIMIT,
      select: {
        id: true,
        checkedInAt: true,
        event: { select: { name: true } },
        buyerProfile: { select: { user: { select: { name: true } } } },
        checkedInByUser: { select: { name: true } },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      checkedInAt: row.checkedInAt,
      eventName: row.event.name,
      buyerName: row.buyerProfile.user.name,
      staffName: row.checkedInByUser.name,
    }));
  }

  categories(activeOnly: boolean): Promise<unknown> {
    return this.prisma.client.readinessCategory.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: activeOnly ? { sortOrder: 'asc' } : [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        key: true,
        name: true,
        description: !activeOnly,
        weight: true,
        sortOrder: true,
        serviceCategoryKey: true,
        active: !activeOnly,
        updatedAt: !activeOnly,
      },
    });
  }

  companyOptions(): Promise<unknown> {
    return this.prisma.client.company.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  }

  projectOptions(): Promise<unknown> {
    return this.prisma.client.project.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, companyId: true },
    });
  }

  async assessments(targetType?: ReadinessTargetType): Promise<unknown> {
    const rows = await this.prisma.client.readinessAssessment.findMany({
      where: { archivedAt: null, ...(targetType ? { targetType } : {}) },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        targetType: true,
        companyId: true,
        projectId: true,
        status: true,
        overallScore: true,
        updatedAt: true,
        company: { select: { name: true } },
        project: { select: { name: true } },
        evaluatedByUser: { select: { email: true } },
      },
    });
    return rows.map(({ company, project, evaluatedByUser, ...row }) => ({
      ...row,
      companyName: company.name,
      projectName: project?.name ?? null,
      evaluatorEmail: evaluatedByUser?.email ?? null,
    }));
  }

  async assessment(id: string): Promise<unknown> {
    const row = await this.prisma.client.readinessAssessment.findFirst({
      where: { id, archivedAt: null },
      include: {
        company: { select: { name: true } },
        project: { select: { name: true } },
        evaluatedByUser: { select: { email: true } },
        categoryScores: {
          orderBy: { category: { sortOrder: 'asc' } },
          include: { category: true },
        },
      },
    });
    if (!row) return null;
    return {
      id: row.id,
      targetType: row.targetType,
      companyId: row.companyId,
      companyName: row.company.name,
      projectId: row.projectId,
      projectName: row.project?.name ?? null,
      status: row.status,
      overallScore: row.overallScore,
      recommendation: row.recommendation,
      requiredActions: row.requiredActions,
      internalNotes: row.internalNotes,
      responsibleContact: row.responsibleContact,
      lastEvaluatedAt: row.lastEvaluatedAt,
      updatedAt: row.updatedAt,
      evaluatedByUserId: row.evaluatedByUserId,
      evaluatorEmail: row.evaluatedByUser?.email ?? null,
      categoryScores: row.categoryScores.map((score) => ({
        categoryId: score.categoryId,
        categoryKey: score.category.key,
        categoryName: score.category.name,
        serviceCategoryKey: score.category.serviceCategoryKey,
        score: score.score,
        status: score.status,
        recommendation: score.recommendation,
        requiredActions: score.requiredActions,
        internalNote: score.internalNote,
      })),
    };
  }

  async analytics(): Promise<unknown> {
    const client = this.prisma.client;
    const since = new Date(Date.now() - LOOKBACK_DAYS * DAY_MS);
    const count = (
      type: 'PROJECT_VIEW' | 'APARTMENT_VIEW' | 'BOOTH_SELECTED' | 'ROUTE_REQUESTED',
      recent = false,
    ) =>
      client.analyticsEvent.count({
        where: { type, ...(recent ? { createdAt: { gte: since } } : {}) },
      });
    const [
      projectViewsTotal,
      projectViewsLastPeriod,
      apartmentViewsTotal,
      apartmentViewsLastPeriod,
      boothSelectedTotal,
      boothSelectedLastPeriod,
      routeRequestedTotal,
      routeRequestedLastPeriod,
      dealSources,
      recentDealSources,
      dealStages,
      qrPurposes,
      recentQrPurposes,
      projects,
      apartments,
      partners,
    ] = await Promise.all([
      count('PROJECT_VIEW'),
      count('PROJECT_VIEW', true),
      count('APARTMENT_VIEW'),
      count('APARTMENT_VIEW', true),
      count('BOOTH_SELECTED'),
      count('BOOTH_SELECTED', true),
      count('ROUTE_REQUESTED'),
      count('ROUTE_REQUESTED', true),
      client.deal.groupBy({ by: ['source'], _count: { _all: true } }),
      client.deal.groupBy({
        by: ['source'],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
      }),
      client.deal.groupBy({ by: ['stage'], _count: { _all: true } }),
      client.qrScanLog.groupBy({ by: ['purpose'], _count: { _all: true } }),
      client.qrScanLog.groupBy({
        by: ['purpose'],
        where: { scannedAt: { gte: since } },
        _count: { _all: true },
      }),
      client.project.groupBy({ by: ['status'], _count: { _all: true } }),
      client.apartment.groupBy({ by: ['status'], _count: { _all: true } }),
      client.partner.groupBy({ by: ['type'], _count: { _all: true } }),
    ]);
    return {
      lookbackDays: LOOKBACK_DAYS,
      projectViewsTotal,
      projectViewsLastPeriod,
      apartmentViewsTotal,
      apartmentViewsLastPeriod,
      boothSelectedTotal,
      boothSelectedLastPeriod,
      routeRequestedTotal,
      routeRequestedLastPeriod,
      dealsBySource: stableCounts(dealSources, 'source', REQUEST_SOURCES),
      dealsBySourceLastPeriod: stableCounts(recentDealSources, 'source', REQUEST_SOURCES),
      dealsByStage: stableCounts(dealStages, 'stage', DEAL_STAGES),
      qrScansByPurpose: stableCounts(qrPurposes, 'purpose', QR_SCAN_PURPOSES),
      qrScansByPurposeLastPeriod: stableCounts(recentQrPurposes, 'purpose', QR_SCAN_PURPOSES),
      checkInsByEvent: await this.checkInsByEvent(),
      projectsByStatus: stableCounts(projects, 'status', PUBLICATION_STATUSES),
      apartmentsByStatus: stableCounts(apartments, 'status', APARTMENT_STATUSES),
      readinessAvgByCompany: await this.readinessAverages(),
      partnersByType: stableCounts(partners, 'type', PARTNER_TYPES),
    };
  }

  private async checkInsByEvent(): Promise<unknown> {
    const groups = await this.prisma.client.checkIn.groupBy({
      by: ['eventId'],
      _count: { _all: true },
    });
    const events = await this.prisma.client.exhibitionEvent.findMany({
      where: { id: { in: groups.map((row) => row.eventId) } },
      select: { id: true, name: true },
    });
    const names = new Map(events.map((event) => [event.id, event.name]));
    return groups.map((row) => ({
      eventId: row.eventId,
      eventName: names.get(row.eventId) ?? row.eventId,
      count: row._count._all,
    }));
  }

  private async readinessAverages(): Promise<unknown> {
    const groups = await this.prisma.client.readinessAssessment.groupBy({
      by: ['companyId'],
      where: { archivedAt: null, overallScore: { not: null } },
      _avg: { overallScore: true },
      _count: { _all: true },
    });
    const companies = await this.prisma.client.company.findMany({
      where: { id: { in: groups.map((row) => row.companyId) } },
      select: { id: true, name: true },
    });
    const names = new Map(companies.map((company) => [company.id, company.name]));
    return groups.map((row) => ({
      companyId: row.companyId,
      companyName: names.get(row.companyId) ?? row.companyId,
      avgScore: row._avg.overallScore,
      assessmentCount: row._count._all,
    }));
  }
}

type ProjectCompletenessInput = {
  description: string | null;
  _count: { media: number; canvases: number };
  buildings: Array<{
    status: PublicationStatus;
    floors: Array<{ status: PublicationStatus; _count: { apartments: number } }>;
  }>;
};

function projectMissingKeys(project: ProjectCompletenessInput): string[] {
  const missing: string[] = [];
  if (project._count.media === 0) missing.push('MISSING_COVER_MEDIA');
  if (!project.description?.trim()) missing.push('MISSING_DESCRIPTION');
  const buildings = project.buildings.filter((row) => row.status === 'PUBLISHED');
  if (buildings.length === 0) missing.push('MISSING_PUBLISHED_BUILDING');
  const floors = buildings.flatMap((row) =>
    row.floors.filter((floor) => floor.status === 'PUBLISHED'),
  );
  if (floors.length === 0) missing.push('MISSING_PUBLISHED_FLOOR');
  if (!floors.some((floor) => floor._count.apartments > 0)) missing.push('MISSING_APARTMENT');
  if (project._count.canvases === 0) missing.push('MISSING_CANVAS');
  return missing;
}

function stableCounts<T extends Record<string, unknown>>(
  groups: T[],
  field: keyof T,
  keys: readonly string[],
): Array<{ key: string; count: number }> {
  const counts = new Map(
    groups.map((row) => [String(row[field]), (row._count as { _all: number })._all]),
  );
  return keys.map((key) => ({ key, count: counts.get(key) ?? 0 }));
}
