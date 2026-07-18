import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CrmDealStatus,
  RequestSource,
  RequestStatus,
  type Prisma,
} from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import { AnalyticsService } from "../../analytics/analytics.service.js";
import {
  findOpenDealForBuyer,
  toApartmentLinkCreateData,
  toDedupActivityData,
} from "./intake.helpers.js";
import type {
  IntakeCreateContext,
  IntakeCreateOutcome,
} from "./request-intake.types.js";

type Tx = Prisma.TransactionClient;

/**
 * Unified CRM lead intake: one use case for all request sources.
 * Deduplicates open deals by builder company + buyer profile.
 */
@Injectable()
export class RequestIntakeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  async create(context: IntakeCreateContext): Promise<IntakeCreateOutcome> {
    this.assertSourceRequirements(context);
    await this.validateProjectAndApartment(context);

    if (context.buyerProfileId && !context.forceNewDeal) {
      const existing = await findOpenDealForBuyer(
        this.prisma.db,
        context.builderCompanyId,
        context.buyerProfileId,
      );
      if (existing) {
        return this.attachToExistingDeal(existing.id, context);
      }
    }

    return this.createNewDealAndRequest(context);
  }

  private assertSourceRequirements(context: IntakeCreateContext): void {
    if (
      context.source === RequestSource.buyer_project_request &&
      (!context.buyerProfileId || !context.projectId)
    ) {
      throw new BadRequestException(
        "buyer_project_request requires buyer and projectId",
      );
    }
    if (
      context.source === RequestSource.builder_buyer_qr_scan &&
      (!context.buyerProfileId || !context.scanEventId)
    ) {
      throw new BadRequestException(
        "builder_buyer_qr_scan requires buyer and scanEventId",
      );
    }
    if (
      context.source === RequestSource.manual_builder_entry &&
      !context.contactName?.trim()
    ) {
      throw new BadRequestException(
        "manual_builder_entry requires contactName",
      );
    }
  }

  private async validateProjectAndApartment(
    context: IntakeCreateContext,
  ): Promise<void> {
    if (context.projectId) {
      const project = await this.prisma.db.project.findFirst({
        where: {
          id: context.projectId,
          builderCompanyId: context.builderCompanyId,
        },
        select: { id: true },
      });
      if (!project) {
        throw new NotFoundException("Project not found");
      }
    }
    if (!context.apartmentId) {
      return;
    }
    const apartment = await this.prisma.db.apartment.findFirst({
      where: {
        id: context.apartmentId,
        project: { builderCompanyId: context.builderCompanyId },
        ...(context.projectId ? { projectId: context.projectId } : {}),
      },
      select: { id: true, projectId: true },
    });
    if (!apartment) {
      throw new NotFoundException("Apartment not found");
    }
    if (context.projectId && apartment.projectId !== context.projectId) {
      throw new BadRequestException("Apartment does not belong to project");
    }
  }

  private async resolveActivityActorId(
    context: IntakeCreateContext,
  ): Promise<string | null> {
    if (context.createdByUserId) {
      return context.createdByUserId;
    }
    if (!context.buyerProfileId) {
      return null;
    }
    const profile = await this.prisma.db.buyerProfile.findUnique({
      where: { id: context.buyerProfileId },
      select: { userId: true },
    });
    return profile?.userId ?? null;
  }

  private async attachToExistingDeal(
    dealId: string,
    context: IntakeCreateContext,
  ): Promise<IntakeCreateOutcome> {
    const actorId = await this.resolveActivityActorId(context);
    const result = await this.prisma.db.$transaction(async (tx) => {
      const request = await tx.request.create({
        data: this.toRequestData(context, dealId),
      });
      await this.maybeLinkApartment(tx, dealId, context);
      if (actorId) {
        await tx.crmFollowUpActivity.create({
          data: {
            crmDealId: dealId,
            ...toDedupActivityData({
              source: context.source,
              note: context.note,
              createdByUserId: actorId,
            }),
          },
        });
      }
      const deal = await tx.crmDeal.update({
        where: { id: dealId },
        data: { lastActivityAt: new Date() },
        select: { id: true, status: true, source: true },
      });
      return { request, deal };
    });

    this.trackRequestCreated(result.request.id, result.deal.id, context);

    return {
      requestId: result.request.id,
      dealId: result.deal.id,
      deduplicated: true,
      dealStatus: result.deal.status,
      source: result.deal.source,
    };
  }

  private async createNewDealAndRequest(
    context: IntakeCreateContext,
  ): Promise<IntakeCreateOutcome> {
    const assignCreator =
      context.source === RequestSource.builder_buyer_qr_scan ||
      context.source === RequestSource.manual_builder_entry;

    const result = await this.prisma.db.$transaction(async (tx) => {
      const deal = await tx.crmDeal.create({
        data: {
          companyId: context.builderCompanyId,
          buyerProfileId: context.buyerProfileId ?? null,
          source: context.source,
          status: CrmDealStatus.new_request,
          message: context.note ?? null,
          contactName: context.contactName ?? null,
          contactPhone: context.contactPhone ?? null,
          contactEmail: context.contactEmail ?? null,
          createdByUserId: context.createdByUserId ?? null,
          assignedUserId: assignCreator
            ? (context.createdByUserId ?? null)
            : null,
          projectId: context.projectId ?? null,
          lastActivityAt: new Date(),
        },
      });
      const request = await tx.request.create({
        data: this.toRequestData(context, deal.id),
      });
      await tx.crmDeal.update({
        where: { id: deal.id },
        data: { primaryRequestId: request.id },
      });
      await this.maybeLinkApartment(tx, deal.id, context);
      return { request, deal };
    });

    this.trackRequestCreated(result.request.id, result.deal.id, context);

    return {
      requestId: result.request.id,
      dealId: result.deal.id,
      deduplicated: false,
      dealStatus: result.deal.status,
      source: result.deal.source,
    };
  }

  private toRequestData(context: IntakeCreateContext, dealId: string) {
    return {
      buyerProfileId: context.buyerProfileId ?? null,
      builderCompanyId: context.builderCompanyId,
      projectId: context.projectId ?? null,
      apartmentId: context.apartmentId ?? null,
      source: context.source,
      status: RequestStatus.attached,
      note: context.note ?? null,
      scanEventId: context.scanEventId ?? null,
      createdByUserId: context.createdByUserId ?? null,
      crmDealId: dealId,
    };
  }

  private async maybeLinkApartment(
    tx: Tx,
    dealId: string,
    context: IntakeCreateContext,
  ): Promise<void> {
    if (!context.apartmentId) {
      return;
    }
    const apartment = await tx.apartment.findUnique({
      where: { id: context.apartmentId },
      select: {
        salesStatus: true,
        price: true,
        priceVisibility: true,
      },
    });
    if (!apartment) {
      return;
    }
    const linkData = toApartmentLinkCreateData({
      apartmentId: context.apartmentId,
      createdByUserId: context.createdByUserId ?? null,
      salesStatus: apartment.salesStatus,
      price: apartment.price,
      priceVisibility: apartment.priceVisibility,
    });
    await tx.crmDealApartmentLink.upsert({
      where: {
        crmDealId_apartmentId: {
          crmDealId: dealId,
          apartmentId: context.apartmentId,
        },
      },
      create: { crmDealId: dealId, ...linkData },
      update: {},
    });
  }

  private trackRequestCreated(
    requestId: string,
    crmDealId: string,
    context: IntakeCreateContext,
  ): void {
    this.analytics.track({
      eventType: "request_created",
      source: context.source,
      requestId,
      crmDealId,
      projectId: context.projectId ?? null,
      companyId: context.builderCompanyId,
      actorUserId: context.createdByUserId ?? null,
    });
  }
}
