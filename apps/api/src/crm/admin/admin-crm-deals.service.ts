import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  CreateAdminManualDealBody,
  CrmDealDetail,
  CrmDealListResponse,
  IntakeCreateResult,
} from '@toonexpo/contracts';
import { CompanyType, RequestSource, type CrmDealStatus } from '@toonexpo/db';

import { PrismaService } from '../../prisma/prisma.service.js';
import { entityNotFound } from '../../portal/utils/access.js';
import { CRM_DEFAULT_PAGE_SIZE, CRM_MIN_PAGE } from '../crm.constants.js';
import { buildCrmDealSearchWhere } from '../crm-deal-search.js';
import { RequestIntakeService } from '../intake/request-intake.service.js';
import { mapDealDetail, mapDealListItem } from '../mappers/crm.mapper.js';

export type ListAdminDealsQuery = {
  page?: number;
  pageSize?: number;
  status?: CrmDealStatus;
  source?: RequestSource;
  projectId?: string;
  assignedUserId?: string;
  companyId?: string;
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
  ) {}

  async list(query: ListAdminDealsQuery): Promise<CrmDealListResponse> {
    const page = query.page ?? CRM_MIN_PAGE;
    const pageSize = query.pageSize ?? CRM_DEFAULT_PAGE_SIZE;
    const searchWhere = buildCrmDealSearchWhere(query.q);
    const where = {
      ...(query.companyId ? { companyId: query.companyId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.source ? { source: query.source } : {}),
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.assignedUserId ? { assignedUserId: query.assignedUserId } : {}),
      ...(searchWhere ?? {}),
    };

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
}
