import { Injectable } from '@nestjs/common';
import type {
  ActivityStatusUpdateInput,
  DealActivityInput,
  DealApartmentLinkInput,
  DealAssignInput,
  DealStageUpdateInput,
  ManualDealInput,
} from '@toonexpo/contracts';
import { Prisma } from '@toonexpo/db';

import { type PrismaService } from '../../common/prisma.service';
import {
  apartmentIds,
  claim,
  findApartment,
  findDeal,
  InventoryConflictError,
  isMember,
  projectIds,
  recomputeFollowUp,
  release,
  REQUIRED_APARTMENT_STAGES,
  type Tx,
} from './crm-mutation.helpers';

const UNIQUE_CONSTRAINT_ERROR = 'P2002';

@Injectable()
export class CrmMutationService {
  constructor(private readonly prisma: PrismaService) {}

  async stage(companyId: string, input: DealStageUpdateInput, userId: string) {
    try {
      return await this.prisma.client.$transaction(async (tx) => {
        const deal = await findDeal(tx, companyId, input.dealId);
        if (!deal) return fail('notFound');
        const ids = await apartmentIds(tx, deal.id);
        const affectedProjectIds = await projectIds(tx, deal.projectId, ids);
        if (deal.stage === input.stage) return ok(deal.id, affectedProjectIds);
        if (REQUIRED_APARTMENT_STAGES.includes(input.stage) && !ids.length) {
          return fail('apartmentRequired');
        }
        if (input.stage === 'RESERVED' && deal.stage !== 'RESERVED') {
          await claim(tx, ids, 'RESERVED', deal.id, userId);
        } else if (input.stage === 'CONVERTED') {
          await claim(tx, ids, 'SOLD', deal.id, userId);
        } else if (deal.stage === 'RESERVED') {
          await release(tx, ids, deal.id, userId);
        }
        await tx.deal.update({
          where: { id: deal.id },
          data: { stage: input.stage, lastActivityAt: new Date() },
        });
        await tx.dealActivity.create({
          data: {
            dealId: deal.id,
            authorUserId: userId,
            type: 'STATUS_CHANGE',
            body: `${deal.stage}→${input.stage}`,
          },
        });
        return ok(deal.id, affectedProjectIds);
      });
    } catch (error) {
      if (error instanceof InventoryConflictError) return fail('reservationConflict');
      throw error;
    }
  }

  async link(companyId: string, input: DealApartmentLinkInput) {
    try {
      return await this.prisma.client.$transaction(async (tx) => {
        const deal = await findDeal(tx, companyId, input.dealId);
        const apartment = await findApartment(tx, companyId, input.apartmentId);
        if (!deal || !apartment) return fail('notFound');
        await tx.dealApartment.create({
          data: {
            dealId: deal.id,
            apartmentId: apartment.id,
            priceAmdSnapshot: apartment.priceAmd,
            statusSnapshot: apartment.status,
          },
        });
        return ok(deal.id, uniqueProjects(deal.projectId, apartment.projectId));
      });
    } catch (error) {
      if (isUnique(error)) return fail('invalidInput');
      throw error;
    }
  }

  unlink(companyId: string, input: DealApartmentLinkInput, userId: string) {
    return this.prisma.client.$transaction(async (tx) => {
      const deal = await findDeal(tx, companyId, input.dealId);
      const apartment = await findApartment(tx, companyId, input.apartmentId);
      if (!deal || !apartment) return fail('notFound');
      const ids = await apartmentIds(tx, deal.id);
      if (REQUIRED_APARTMENT_STAGES.includes(deal.stage) && ids.length <= 1) {
        return fail('apartmentRequired');
      }
      const deleted = await tx.dealApartment.deleteMany({
        where: { dealId: deal.id, apartmentId: input.apartmentId },
      });
      if (!deleted.count) return fail('notFound');
      await release(tx, [input.apartmentId], deal.id, userId);
      return ok(deal.id, uniqueProjects(deal.projectId, apartment.projectId));
    });
  }

  activity(companyId: string, input: DealActivityInput, userId: string) {
    return this.prisma.client.$transaction(async (tx) => {
      const deal = await findDeal(tx, companyId, input.dealId);
      if (!deal) return fail('notFound');
      await tx.dealActivity.create({
        data: {
          dealId: deal.id,
          authorUserId: userId,
          type: input.type,
          body: input.body,
          status: input.type === 'FOLLOW_UP' ? 'PLANNED' : null,
          dueAt: input.type === 'FOLLOW_UP' ? (input.nextFollowUpAt ?? null) : null,
        },
      });
      await tx.deal.update({ where: { id: deal.id }, data: { lastActivityAt: new Date() } });
      if (input.type === 'FOLLOW_UP') await recomputeFollowUp(tx, deal.id);
      return { ok: true as const, dealId: deal.id };
    });
  }

  activityStatus(companyId: string, input: ActivityStatusUpdateInput) {
    return this.prisma.client.$transaction(async (tx) => {
      const activity = await tx.dealActivity.findFirst({
        where: { id: input.activityId, deal: { companyId } },
        select: { id: true, dealId: true, type: true },
      });
      if (!activity) return fail('notFound');
      if (activity.type !== 'FOLLOW_UP') return fail('invalidInput');
      await tx.dealActivity.update({
        where: { id: activity.id },
        data: { status: input.status, completedAt: input.status === 'DONE' ? new Date() : null },
      });
      await recomputeFollowUp(tx, activity.dealId);
      return { ok: true as const, dealId: activity.dealId };
    });
  }

  assign(companyId: string, input: DealAssignInput, userId: string) {
    return this.prisma.client.$transaction(async (tx) => {
      const deal = await findDeal(tx, companyId, input.dealId);
      if (!deal) return fail('notFound');
      if (input.assigneeUserId && !(await isMember(tx, companyId, input.assigneeUserId))) {
        return fail('notFound');
      }
      const nextStage = deal.stage === 'NEW_REQUEST' ? 'ASSIGNED' : deal.stage;
      await tx.deal.update({
        where: { id: deal.id },
        data: {
          assignedUserId: input.assigneeUserId,
          stage: nextStage,
          lastActivityAt: new Date(),
        },
      });
      if (nextStage !== deal.stage) {
        await tx.dealActivity.create({
          data: {
            dealId: deal.id,
            authorUserId: userId,
            type: 'STATUS_CHANGE',
            body: `${deal.stage}→${nextStage}`,
          },
        });
      }
      await tx.dealActivity.create({
        data: {
          dealId: deal.id,
          authorUserId: userId,
          type: 'COMMENT',
          body: `Assignment updated → ${input.assigneeUserId ?? 'null'}`,
        },
      });
      return { ok: true as const, dealId: deal.id };
    });
  }

  manual(companyId: string, input: ManualDealInput, userId: string) {
    return this.prisma.client.$transaction((tx) => createManual(tx, companyId, input, userId));
  }
}

async function createManual(tx: Tx, companyId: string, input: ManualDealInput, userId: string) {
  if (input.projectId) {
    const project = await tx.project.findFirst({
      where: { id: input.projectId, companyId },
      select: { id: true },
    });
    if (!project) return fail('notFound');
  }
  if (input.assignedUserId && !(await isMember(tx, companyId, input.assignedUserId))) {
    return fail('notFound');
  }
  const apartment = input.apartmentId
    ? await findApartment(tx, companyId, input.apartmentId)
    : null;
  if (input.apartmentId && !apartment) return fail('notFound');
  const affectedProjectIds = uniqueProjects(input.projectId ?? null, apartment?.projectId);
  const deal = await tx.deal.create({
    data: {
      companyId,
      projectId: input.projectId,
      stage: 'NEW_REQUEST',
      source: 'MANUAL_BUILDER_ENTRY',
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      contactEmail: input.contactEmail,
      title: input.title,
      message: input.message,
      assignedUserId: input.assignedUserId,
      createdByUserId: userId,
      lastActivityAt: new Date(),
      apartments: apartment
        ? {
            create: {
              apartmentId: apartment.id,
              priceAmdSnapshot: apartment.priceAmd,
              statusSnapshot: apartment.status,
            },
          }
        : undefined,
      activities: {
        create: {
          authorUserId: userId,
          type: 'COMMENT',
          body: input.message ?? 'Manual builder entry.',
        },
      },
    },
    select: { id: true },
  });
  return ok(deal.id, affectedProjectIds);
}

function ok(dealId: string, affectedProjectIds: string[]) {
  return { ok: true as const, dealId, affectedProjectIds };
}

function fail(
  errorKey: 'notFound' | 'invalidInput' | 'apartmentRequired' | 'reservationConflict',
) {
  return { ok: false as const, errorKey };
}

function uniqueProjects(first: string | null, second?: string): string[] {
  return [...new Set([first, second].filter((id): id is string => Boolean(id)))];
}

function isUnique(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === UNIQUE_CONSTRAINT_ERROR
  );
}
