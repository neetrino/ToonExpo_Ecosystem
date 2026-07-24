import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  CreateAdminManualDealBody,
  CrmDealDetail,
  CrmDealListResponse,
  IntakeCreateResult,
} from '@toonexpo/contracts';
import { CompanyType, RequestSource, type CrmDealStatus, type Prisma } from '@toonexpo/db';

import { PrismaService } from '../../prisma/prisma.service.js';
import { entityNotFound } from '../../portal/utils/access.js';
import { CRM_DEFAULT_PAGE_SIZE, CRM_MIN_PAGE } from '../crm.constants.js';
import { buildCrmDealSearchWhere } from '../crm-deal-search.js';
import { RequestIntakeService } from '../intake/request-intake.service.js';
import { mapDealDetail, mapDealListItem } from '../mappers/crm.mapper.js';
import { DealStatusService } from '../status/deal-status.service.js';

export type ListAdminDealsQuery = {
  page?: number;
  pageSize?: number;
  status?: CrmDealStatus;
  source?: RequestSource;
  sources?: RequestSource[];
  projectId?: string;
  assignedUserId?: string;
  companyId?: string;
  companyIds?: string[];
  q?: string;
};

/**
 * Platform-admin CRM overview + manual lead intake for builders.
 */
@Injectable()
export class AdminCrmDealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly intake: RequestIntakeService,
    private readonly dealStatus: DealStatusService,
  ) {}

  async list(query: ListAdminDealsQuery): Promise<CrmDealListResponse> {
    const page = query.page ?? CRM_MIN_PAGE;
    const pageSize = query.pageSize ?? CRM_DEFAULT_PAGE_SIZE;
    const searchWhere = buildCrmDealSearchWhere(query.q);
    const companyIds =
      query.companyIds && query.companyIds.length > 0
        ? query.companyIds
        : query.companyId
          ? [query.companyId]
          : [];
    const sources =
      query.sources && query.sources.length > 0
        ? query.sources
        : query.source
          ? [query.source]
          : [];

    const where: Prisma.CrmDealWhereInput = {};

    if (companyIds.length === 1) {
      where.companyId = companyIds[0]!;
    } else if (companyIds.length > 1) {
      where.companyId = { in: companyIds };
    }
    if (query.status) {
      where.status = query.status;
    }
    if (sources.length === 1) {
      where.source = sources[0]!;
    } else if (sources.length > 1) {
      where.source = { in: sources };
    }
    if (query.projectId) {
      where.projectId = query.projectId;
    }
    if (query.assignedUserId) {
      where.assignedUserId = query.assignedUserId;
    }
    if (searchWhere) {
      Object.assign(where, searchWhere);
    }

    const [total, rows] = await this.prisma.db.$transaction([
      this.prisma.db.crmDeal.count({ where }),
      this.prisma.db.crmDeal.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          company: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
          buyerProfile: {
            select: { id: true, name: true, phone: true, email: true },
          },
          assignedUser: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      data: rows.map(mapDealListItem),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  async getById(dealId: string): Promise<CrmDealDetail> {
    const row = await this.prisma.db.crmDeal.findFirst({
      where: { id: dealId },
      include: {
        company: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        buyerProfile: {
          select: { id: true, name: true, phone: true, email: true },
        },
        assignedUser: { select: { id: true, name: true } },
        requests: { orderBy: { createdAt: 'asc' } },
        apartmentLinks: {
          include: { apartment: { select: { number: true } } },
          orderBy: { createdAt: 'asc' },
        },
        notes: {
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!row) {
      throw entityNotFound('Deal');
    }
    return mapDealDetail(row);
  }

  async createManual(
    actorUserId: string,
    body: CreateAdminManualDealBody,
  ): Promise<IntakeCreateResult> {
    const company = await this.prisma.db.company.findFirst({
      where: { id: body.companyId, type: CompanyType.builder },
      select: { id: true },
    });
    if (!company) {
      throw new BadRequestException('Company must be an active builder');
    }

    let buyerProfileId: string | null = null;
    if (body.contactEmail?.trim()) {
      const profile = await this.prisma.db.buyerProfile.findFirst({
        where: {
          email: { equals: body.contactEmail.trim(), mode: 'insensitive' },
        },
        select: { id: true },
      });
      buyerProfileId = profile?.id ?? null;
    }

    return this.intake.create({
      source: RequestSource.manual_builder_entry,
      builderCompanyId: company.id,
      buyerProfileId,
      projectId: body.projectId ?? null,
      apartmentId: null,
      note: body.note ?? null,
      createdByUserId: actorUserId,
      contactName: body.contactName.trim(),
      contactPhone: body.contactPhone?.trim() ?? null,
      contactEmail: body.contactEmail?.trim() ?? null,
    });
  }

  async updateStatus(
    actorUserId: string,
    dealId: string,
    body: { status: CrmDealStatus; lostReason?: string },
  ): Promise<CrmDealDetail> {
    const deal = await this.prisma.db.crmDeal.findFirst({
      where: { id: dealId },
      select: { id: true, companyId: true, status: true },
    });
    if (!deal) {
      throw entityNotFound('Deal');
    }

    if (body.status !== deal.status) {
      await this.dealStatus.applyStatusChange({
        dealId: deal.id,
        companyId: deal.companyId,
        from: deal.status,
        to: body.status,
        lostReason: body.lostReason ?? null,
        actorUserId,
      });
    }

    return this.getById(dealId);
  }
}
