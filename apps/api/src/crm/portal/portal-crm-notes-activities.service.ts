import { Injectable } from "@nestjs/common";
import type {
  CrmActivityItem,
  CrmNoteItem,
  CreateCrmActivityBody,
  CreateCrmNoteBody,
  UpdateCrmActivityBody,
} from "@toonexpo/contracts";
import { CrmActivityStatus, CrmNoteVisibility } from "@toonexpo/db";

import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { entityNotFound } from "../../portal/utils/access.js";
import { mapActivityItem, mapNoteItem } from "../mappers/crm.mapper.js";
import { DealStatusService } from "../status/deal-status.service.js";

/**
 * CRM notes and follow-up activities for builder portal deals.
 */
@Injectable()
export class PortalCrmNotesActivitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dealStatus: DealStatusService,
  ) {}

  async addNote(
    member: CompanyMemberContext,
    dealId: string,
    authorUserId: string,
    body: CreateCrmNoteBody,
  ): Promise<CrmNoteItem> {
    await this.assertDealInCompany(member.companyId, dealId);
    const note = await this.prisma.db.crmNote.create({
      data: {
        crmDealId: dealId,
        authorUserId,
        body: body.body.trim(),
        visibility: CrmNoteVisibility.internal,
      },
      include: { author: { select: { name: true } } },
    });
    await this.touchDeal(dealId);
    return mapNoteItem(note);
  }

  async addActivity(
    member: CompanyMemberContext,
    dealId: string,
    actorUserId: string,
    body: CreateCrmActivityBody,
  ): Promise<CrmActivityItem> {
    await this.assertDealInCompany(member.companyId, dealId);
    if (body.assignedUserId) {
      await this.dealStatus.assertAssigneeInCompany(
        member.companyId,
        body.assignedUserId,
      );
    }
    const activity = await this.prisma.db.crmFollowUpActivity.create({
      data: {
        crmDealId: dealId,
        type: body.type,
        title: body.title.trim(),
        description: body.description?.trim() ?? null,
        dueAt: body.dueAt ? new Date(body.dueAt) : null,
        assignedUserId: body.assignedUserId ?? null,
        createdByUserId: actorUserId,
        status: CrmActivityStatus.planned,
      },
    });
    await this.prisma.db.crmDeal.update({
      where: { id: dealId },
      data: {
        lastActivityAt: new Date(),
        ...(body.dueAt ? { nextFollowUpAt: new Date(body.dueAt) } : {}),
      },
    });
    return mapActivityItem(activity);
  }

  async updateActivity(
    member: CompanyMemberContext,
    dealId: string,
    activityId: string,
    body: UpdateCrmActivityBody,
  ): Promise<CrmActivityItem> {
    await this.assertDealInCompany(member.companyId, dealId);
    const existing = await this.prisma.db.crmFollowUpActivity.findFirst({
      where: { id: activityId, crmDealId: dealId },
      select: { id: true },
    });
    if (!existing) {
      throw entityNotFound("Activity");
    }
    if (body.assignedUserId) {
      await this.dealStatus.assertAssigneeInCompany(
        member.companyId,
        body.assignedUserId,
      );
    }

    const completedAt =
      body.status === CrmActivityStatus.done ? new Date() : undefined;
    const clearedCompletedAt =
      body.status === CrmActivityStatus.planned ||
      body.status === CrmActivityStatus.cancelled
        ? null
        : undefined;

    const activity = await this.prisma.db.crmFollowUpActivity.update({
      where: { id: activityId },
      data: {
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.title !== undefined ? { title: body.title.trim() } : {}),
        ...(body.description !== undefined
          ? { description: body.description }
          : {}),
        ...(body.dueAt !== undefined
          ? { dueAt: body.dueAt ? new Date(body.dueAt) : null }
          : {}),
        ...(body.assignedUserId !== undefined
          ? { assignedUserId: body.assignedUserId }
          : {}),
        ...(completedAt !== undefined ? { completedAt } : {}),
        ...(clearedCompletedAt !== undefined
          ? { completedAt: clearedCompletedAt }
          : {}),
      },
    });
    await this.touchDeal(dealId);
    return mapActivityItem(activity);
  }

  private async assertDealInCompany(
    companyId: string,
    dealId: string,
  ): Promise<void> {
    const deal = await this.prisma.db.crmDeal.findFirst({
      where: { id: dealId, companyId },
      select: { id: true },
    });
    if (!deal) {
      throw entityNotFound("Deal");
    }
  }

  private async touchDeal(dealId: string): Promise<void> {
    await this.prisma.db.crmDeal.update({
      where: { id: dealId },
      data: { lastActivityAt: new Date() },
    });
  }
}
