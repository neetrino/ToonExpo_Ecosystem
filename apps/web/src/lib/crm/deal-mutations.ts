import type { DealActivityInput, DealAssignInput, ManualDealInput } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';

import {
  findCompanyApartment,
  findCompanyDeal,
  isCompanyMember,
  isCompanyProject,
  statusChangeBody,
} from './deal-mutation-helpers';
import type { CrmMutationResult } from './mutation-result';

export { updateDealStage } from './deal-stage-mutations';
export { linkDealApartment, unlinkDealApartment } from './deal-apartment-mutations';

const MANUAL_SOURCE = 'MANUAL_BUILDER_ENTRY' as const;
const DEFAULT_MANUAL_NOTE = 'Manual builder entry.';

/**
 * Adds a COMMENT or FOLLOW_UP activity. FOLLOW_UP may set nextFollowUpAt on the deal.
 * Assignment/status audits use STATUS_CHANGE elsewhere; notes stay COMMENT/FOLLOW_UP (doc 05).
 */
export async function addDealActivity(
  companyId: string,
  input: DealActivityInput,
  actorUserId?: string,
): Promise<CrmMutationResult> {
  return prisma.$transaction(async (tx) => {
    const deal = await findCompanyDeal(tx, companyId, input.dealId);
    if (!deal) {
      return { ok: false, errorKey: 'notFound' };
    }

    const now = new Date();
    await tx.dealActivity.create({
      data: {
        dealId: deal.id,
        authorUserId: actorUserId,
        type: input.type,
        body: input.body,
      },
    });

    await tx.deal.update({
      where: { id: deal.id },
      data: {
        lastActivityAt: now,
        ...(input.type === 'FOLLOW_UP' && input.nextFollowUpAt
          ? { nextFollowUpAt: input.nextFollowUpAt }
          : {}),
      },
    });

    return { ok: true, dealId: deal.id };
  });
}

/**
 * Assigns a company member (or clears assignee). NEW_REQUEST auto-moves to ASSIGNED (doc 02).
 * Writes COMMENT for assignment change (STATUS_CHANGE reserved for pipeline stages).
 */
export async function assignDeal(
  companyId: string,
  input: DealAssignInput,
  actorUserId?: string,
): Promise<CrmMutationResult> {
  return prisma.$transaction(async (tx) => {
    const deal = await findCompanyDeal(tx, companyId, input.dealId);
    if (!deal) {
      return { ok: false, errorKey: 'notFound' };
    }

    if (input.assigneeUserId !== null) {
      const member = await isCompanyMember(tx, companyId, input.assigneeUserId);
      if (!member) {
        return { ok: false, errorKey: 'notFound' };
      }
    }

    const now = new Date();
    const nextStage = deal.stage === 'NEW_REQUEST' ? 'ASSIGNED' : deal.stage;
    const stageChanged = nextStage !== deal.stage;

    await tx.deal.update({
      where: { id: deal.id },
      data: {
        assignedUserId: input.assigneeUserId,
        stage: nextStage,
        lastActivityAt: now,
      },
    });

    if (stageChanged) {
      await tx.dealActivity.create({
        data: {
          dealId: deal.id,
          authorUserId: actorUserId,
          type: 'STATUS_CHANGE',
          body: statusChangeBody(deal.stage, nextStage),
        },
      });
    }

    const assigneeLabel = input.assigneeUserId ?? 'null';
    await tx.dealActivity.create({
      data: {
        dealId: deal.id,
        authorUserId: actorUserId,
        type: 'COMMENT',
        body: `Assignment updated → ${assigneeLabel}`,
      },
    });

    return { ok: true, dealId: deal.id };
  });
}

/**
 * Creates a manual CRM deal for the builder company (source MANUAL_BUILDER_ENTRY).
 * Ignores client companyId / buyerUserId — session companyId is authoritative.
 */
export async function createManualDeal(
  companyId: string,
  input: ManualDealInput,
  actorUserId?: string,
): Promise<CrmMutationResult<{ dealId: string; affectedProjectIds: string[] }>> {
  return prisma.$transaction(async (tx) => {
    if (input.projectId) {
      const owned = await isCompanyProject(tx, companyId, input.projectId);
      if (!owned) {
        return { ok: false, errorKey: 'notFound' };
      }
    }

    if (input.assignedUserId) {
      const member = await isCompanyMember(tx, companyId, input.assignedUserId);
      if (!member) {
        return { ok: false, errorKey: 'notFound' };
      }
    }

    let apartmentId: string | undefined;
    const projectIds: string[] = [];
    if (input.projectId) {
      projectIds.push(input.projectId);
    }

    if (input.apartmentId) {
      const apartment = await findCompanyApartment(tx, companyId, input.apartmentId);
      if (!apartment) {
        return { ok: false, errorKey: 'notFound' };
      }
      apartmentId = apartment.id;
      if (!projectIds.includes(apartment.projectId)) {
        projectIds.push(apartment.projectId);
      }
    }

    const now = new Date();
    const noteBody = input.message ?? DEFAULT_MANUAL_NOTE;
    const deal = await tx.deal.create({
      data: {
        companyId,
        projectId: input.projectId,
        stage: 'NEW_REQUEST',
        source: MANUAL_SOURCE,
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
        title: input.title,
        message: input.message,
        assignedUserId: input.assignedUserId,
        createdByUserId: actorUserId,
        lastActivityAt: now,
        apartments: apartmentId ? { create: { apartmentId } } : undefined,
        activities: {
          create: {
            authorUserId: actorUserId,
            type: 'COMMENT',
            body: noteBody,
          },
        },
      },
      select: { id: true },
    });

    return { ok: true, dealId: deal.id, affectedProjectIds: projectIds };
  });
}
