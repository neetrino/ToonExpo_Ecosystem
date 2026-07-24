import { Injectable } from '@nestjs/common';
import type {
  CrmDealDetail,
  CrmDealListResponse,
  IntakeCreateResult,
  UpdateCrmDealBody,
} from '@toonexpo/contracts';
import { RequestSource, type CrmDealStatus } from '@toonexpo/db';

import type { CompanyMemberContext } from '../../company/types/company-member-context.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { entityNotFound } from '../../portal/utils/access.js';
import { CRM_DEFAULT_PAGE_SIZE, CRM_MIN_PAGE } from '../crm.constants.js';
import { buildCrmDealSearchWhere } from '../crm-deal-search.js';
import { RequestIntakeService } from '../intake/request-intake.service.js';
import { mapDealDetail, mapDealListItem } from '../mappers/crm.mapper.js';
import { DealStatusService } from '../status/deal-status.service.js';

export type ListDealsQuery = {
  page?: number;
  pageSize?: number;
  status?: CrmDealStatus;
  source?: RequestSource;
  projectId?: string;
  assignedUserId?: string;
  q?: string;
};

/**
 * Builder portal CRM deal list / detail / update operations.
 */
@Injectable()
export class PortalCrmDealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly intake: RequestIntakeService,
    private readonly dealStatus: DealStatusService,
  ) {}

  async list(member: CompanyMemberContext, query: ListDealsQuery): Promise<CrmDealListResponse> {
    const page = query.page ?? CRM_MIN_PAGE;
    const pageSize = query.pageSize ?? CRM_DEFAULT_PAGE_SIZE;
    const searchWhere = buildCrmDealSearchWhere(query.q);
    const where = {
      companyId: member.companyId,
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

  async getById(member: CompanyMemberContext, dealId: string): Promise<CrmDealDetail> {
    const row = await this.loadDealOrThrow(member.companyId, dealId);
    return mapDealDetail(row);
  }

  async update(
    member: CompanyMemberContext,
    dealId: string,
    actorUserId: string,
    body: UpdateCrmDealBody,
  ): Promise<CrmDealDetail> {
    const deal = await this.prisma.db.crmDeal.findFirst({
      where: { id: dealId, companyId: member.companyId },
      select: { id: true, status: true },
    });
    if (!deal) {
      throw entityNotFound('Deal');
    }

    if (body.assignedUserId !== undefined && body.assignedUserId !== null) {
      await this.dealStatus.assertAssigneeInCompany(member.companyId, body.assignedUserId);
    }

    if (body.status !== undefined && body.status !== deal.status) {
      await this.dealStatus.applyStatusChange({
        dealId: deal.id,
        companyId: member.companyId,
        from: deal.status,
        to: body.status,
        lostReason: body.lostReason ?? null,
        actorUserId,
      });
    }

    await this.prisma.db.crmDeal.update({
      where: { id: deal.id },
      data: {
        ...(body.assignedUserId !== undefined ? { assignedUserId: body.assignedUserId } : {}),
        ...(body.projectId !== undefined ? { projectId: body.projectId } : {}),
        ...(body.status === undefined && body.lostReason !== undefined
          ? { lostReason: body.lostReason }
          : {}),
      },
    });

    return this.getById(member, dealId);
  }

  async createFromScan(
    member: CompanyMemberContext,
    actorUserId: string,
    body: {
      scanEventId: string;
      projectId?: string;
      apartmentId?: string;
      note?: string;
    },
  ): Promise<IntakeCreateResult> {
    const scan = await this.prisma.db.qrScanEvent.findFirst({
      where: {
        id: body.scanEventId,
        scannerCompanyId: member.companyId,
      },
      select: { id: true, buyerProfileId: true },
    });
    if (!scan) {
      throw entityNotFound('Scan event');
    }

    return this.intake.create({
      source: RequestSource.builder_buyer_qr_scan,
      builderCompanyId: member.companyId,
      buyerProfileId: scan.buyerProfileId,
      projectId: body.projectId ?? null,
      apartmentId: body.apartmentId ?? null,
      note: body.note ?? null,
      scanEventId: scan.id,
      createdByUserId: actorUserId,
    });
  }

  async createManual(
    member: CompanyMemberContext,
    actorUserId: string,
    body: {
      contactName: string;
      contactPhone?: string;
      contactEmail?: string;
      projectId?: string;
      apartmentId?: string;
      note?: string;
    },
  ): Promise<IntakeCreateResult> {
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
      builderCompanyId: member.companyId,
      buyerProfileId,
      projectId: body.projectId ?? null,
      apartmentId: body.apartmentId ?? null,
      note: body.note ?? null,
      createdByUserId: actorUserId,
      contactName: body.contactName.trim(),
      contactPhone: body.contactPhone?.trim() ?? null,
      contactEmail: body.contactEmail?.trim() ?? null,
    });
  }

  private async loadDealOrThrow(companyId: string, dealId: string) {
    const row = await this.prisma.db.crmDeal.findFirst({
      where: { id: dealId, companyId },
      include: {
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
    return row;
  }
}
