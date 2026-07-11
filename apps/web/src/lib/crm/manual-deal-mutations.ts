import type { ManualDealInput } from '@toonexpo/contracts';

import {
  findCompanyApartment,
  isCompanyMember,
  isCompanyProject,
  type TransactionClient,
} from './deal-mutation-helpers';
import type { CrmMutationResult } from './mutation-result';

const DEFAULT_MANUAL_NOTE = 'Manual builder entry.';

type ManualDealContext = {
  apartmentId?: string;
  projectIds: string[];
};

async function resolveManualDealContext(
  tx: TransactionClient,
  companyId: string,
  input: ManualDealInput,
): Promise<CrmMutationResult<ManualDealContext>> {
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

  const projectIds: string[] = input.projectId ? [input.projectId] : [];
  let apartmentId: string | undefined;

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

  return { ok: true, apartmentId, projectIds };
}

async function insertManualDeal(
  tx: TransactionClient,
  companyId: string,
  input: ManualDealInput,
  context: ManualDealContext,
  actorUserId?: string,
): Promise<string> {
  const now = new Date();
  const noteBody = input.message ?? DEFAULT_MANUAL_NOTE;
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
      createdByUserId: actorUserId,
      lastActivityAt: now,
      apartments: context.apartmentId
        ? { create: { apartmentId: context.apartmentId } }
        : undefined,
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

  return deal.id;
}

export async function runCreateManualDealTransaction(
  tx: TransactionClient,
  companyId: string,
  input: ManualDealInput,
  actorUserId?: string,
): Promise<CrmMutationResult<{ dealId: string; affectedProjectIds: string[] }>> {
  const context = await resolveManualDealContext(tx, companyId, input);
  if (!context.ok) {
    return context;
  }

  const dealId = await insertManualDeal(tx, companyId, input, context, actorUserId);
  return { ok: true, dealId, affectedProjectIds: context.projectIds };
}
