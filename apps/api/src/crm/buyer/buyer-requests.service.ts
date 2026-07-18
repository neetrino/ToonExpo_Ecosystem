import { Injectable } from "@nestjs/common";
import type {
  BuyerRequestListResponse,
  IntakeCreateResult,
} from "@toonexpo/contracts";
import { PublicationStatus, RequestSource } from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import { entityNotFound } from "../../portal/utils/access.js";
import {
  CRM_DEFAULT_PAGE_SIZE,
  CRM_MIN_PAGE,
} from "../crm.constants.js";
import { RequestIntakeService } from "../intake/request-intake.service.js";
import { mapBuyerRequestItem } from "../mappers/crm.mapper.js";

/**
 * Buyer-facing request creation and history (no internal CRM notes).
 */
@Injectable()
export class BuyerRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly intake: RequestIntakeService,
  ) {}

  async createFromBuyer(
    userId: string,
    body: { projectId: string; apartmentId?: string; note?: string },
  ): Promise<IntakeCreateResult> {
    const profile = await this.prisma.db.buyerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw entityNotFound("Buyer profile");
    }

    const project = await this.prisma.db.project.findFirst({
      where: {
        id: body.projectId,
        publicationStatus: PublicationStatus.published,
      },
      select: { id: true, builderCompanyId: true },
    });
    if (!project) {
      throw entityNotFound("Project");
    }

    if (body.apartmentId) {
      const apartment = await this.prisma.db.apartment.findFirst({
        where: {
          id: body.apartmentId,
          projectId: project.id,
          publicationStatus: PublicationStatus.published,
        },
        select: { id: true },
      });
      if (!apartment) {
        throw entityNotFound("Apartment");
      }
    }

    return this.intake.create({
      source: RequestSource.buyer_project_request,
      builderCompanyId: project.builderCompanyId,
      buyerProfileId: profile.id,
      projectId: project.id,
      apartmentId: body.apartmentId ?? null,
      note: body.note ?? null,
      createdByUserId: userId,
    });
  }

  async listMine(
    userId: string,
    page = CRM_MIN_PAGE,
    pageSize = CRM_DEFAULT_PAGE_SIZE,
  ): Promise<BuyerRequestListResponse> {
    const profile = await this.prisma.db.buyerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw entityNotFound("Buyer profile");
    }

    const where = { buyerProfileId: profile.id };
    const [total, rows] = await this.prisma.db.$transaction([
      this.prisma.db.request.count({ where }),
      this.prisma.db.request.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          builderCompany: { select: { id: true, name: true } },
          project: { select: { name: true } },
          crmDeal: { select: { id: true, status: true } },
        },
      }),
    ]);

    return {
      data: rows.map(mapBuyerRequestItem),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }
}
