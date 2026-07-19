import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import {
  CrmDealStatus,
  RequestSource,
  RequestStatus,
  type Prisma,
} from "@toonexpo/db";

import { AnalyticsService } from "../../analytics/analytics.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { isUniqueOpenDealViolation } from "./intake-unique.util.js";
import {
  findOpenDealForBuyer,
  toApartmentLinkCreateData,
  toDedupActivityData,
} from "./intake.helpers.js";
import {
  assertIntakeSourceRequirements,
  validateIntakeProjectAndApartment,
} from "./intake-validate.js";
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
    assertIntakeSourceRequirements(context);
    await validateIntakeProjectAndApartment(this.prisma.db, context);

    if (!context.buyerProfileId || context.forceNewDeal) {
      return this.createNewDealAndRequest(context);
    }

    return this.findOrCreateForBuyer(context);
  }

  private async findOrCreateForBuyer(
    context: IntakeCreateContext,
  ): Promise<IntakeCreateOutcome> {
    const buyerProfileId = context.buyerProfileId;
    if (!buyerProfileId) {
      throw new BadRequestException("buyerProfileId is required");
    }

    try {
      const outcome = await this.prisma.db.$transaction(async (tx) => {
        const existing = await findOpenDealForBuyer(
          tx,
          context.builderCompanyId,
          buyerProfileId,
        );
        if (existing) {
          return this.attachInTransaction(tx, existing.id, context);
        }
        return this.createInTransaction(tx, context);
      });
      this.trackRequestCreated(outcome.requestId, outcome.dealId, context);
      return outcome;
    } catch (error) {
      if (!isUniqueOpenDealViolation(error)) {
        throw error;
      }
      return this.attachAfterUniqueViolation(context, buyerProfileId);
    }
  }

  private async attachAfterUniqueViolation(
    context: IntakeCreateContext,
    buyerProfileId: string,
  ): Promise<IntakeCreateOutcome> {
    const existing = await findOpenDealForBuyer(
      this.prisma.db,
      context.builderCompanyId,
      buyerProfileId,
    );
    if (!existing) {
      throw new InternalServerErrorException(
        "Open deal conflict could not be resolved",
      );
    }
    return this.attachToExistingDeal(existing.id, context);
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
    const result = await this.prisma.db.$transaction(async (tx) =>
      this.attachInTransaction(tx, dealId, context, actorId),
    );
    this.trackRequestCreated(result.requestId, result.dealId, context);
    return result;
  }

  private async attachInTransaction(
    tx: Tx,
    dealId: string,
    context: IntakeCreateContext,
    actorId?: string | null,
  ): Promise<IntakeCreateOutcome> {
    const resolvedActorId =
      actorId === undefined
        ? await this.resolveActivityActorId(context)
        : actorId;
    const request = await tx.request.create({
      data: this.toRequestData(context, dealId),
    });
    await this.maybeLinkApartment(tx, dealId, context);
    if (resolvedActorId) {
      await tx.crmFollowUpActivity.create({
        data: {
          crmDealId: dealId,
          ...toDedupActivityData({
            source: context.source,
            note: context.note,
            createdByUserId: resolvedActorId,
          }),
        },
      });
    }
    const deal = await tx.crmDeal.update({
      where: { id: dealId },
      data: { lastActivityAt: new Date() },
      select: { id: true, status: true, source: true },
    });
    return {
      requestId: request.id,
      dealId: deal.id,
      deduplicated: true,
      dealStatus: deal.status,
      source: deal.source,
    };
  }

  private async createNewDealAndRequest(
    context: IntakeCreateContext,
  ): Promise<IntakeCreateOutcome> {
    const result = await this.prisma.db.$transaction(async (tx) =>
      this.createInTransaction(tx, context),
    );
    this.trackRequestCreated(result.requestId, result.dealId, context);
    return result;
  }

  private async createInTransaction(
    tx: Tx,
    context: IntakeCreateContext,
  ): Promise<IntakeCreateOutcome> {
    const assignCreator =
      context.source === RequestSource.builder_buyer_qr_scan ||
      context.source === RequestSource.manual_builder_entry;

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
    return {
      requestId: request.id,
      dealId: deal.id,
      deduplicated: false,
      dealStatus: deal.status,
      source: deal.source,
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
