import type { ActivityStatusUpdateInput } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';
import type { ActivityStatus } from '@toonexpo/domain';

import { type TransactionClient } from './deal-mutation-helpers';
import type { CrmMutationResult } from './mutation-result';

/** Earliest PLANNED follow-up due date becomes deal.nextFollowUpAt. */
export async function recomputeDealNextFollowUpAt(
  tx: TransactionClient,
  dealId: string,
): Promise<void> {
  const next = await tx.dealActivity.findFirst({
    where: {
      dealId,
      type: 'FOLLOW_UP',
      status: 'PLANNED',
      dueAt: { not: null },
    },
    orderBy: { dueAt: 'asc' },
    select: { dueAt: true },
  });

  await tx.deal.update({
    where: { id: dealId },
    data: { nextFollowUpAt: next?.dueAt ?? null },
  });
}

async function findCompanyActivity(
  tx: TransactionClient,
  companyId: string,
  activityId: string,
): Promise<{
  id: string;
  dealId: string;
  type: 'COMMENT' | 'FOLLOW_UP' | 'STATUS_CHANGE';
  status: ActivityStatus | null;
} | null> {
  return tx.dealActivity.findFirst({
    where: { id: activityId, deal: { companyId } },
    select: { id: true, dealId: true, type: true, status: true },
  });
}

/** Updates follow-up lifecycle status; recomputes deal.nextFollowUpAt when needed. */
export async function setActivityStatus(
  companyId: string,
  input: ActivityStatusUpdateInput,
): Promise<CrmMutationResult> {
  return prisma.$transaction(async (tx) => {
    const activity = await findCompanyActivity(tx, companyId, input.activityId);
    if (!activity) {
      return { ok: false, errorKey: 'notFound' };
    }
    if (activity.type !== 'FOLLOW_UP') {
      return { ok: false, errorKey: 'invalidInput' };
    }

    const now = new Date();
    await tx.dealActivity.update({
      where: { id: activity.id },
      data: {
        status: input.status,
        completedAt: input.status === 'DONE' ? now : null,
      },
    });

    await recomputeDealNextFollowUpAt(tx, activity.dealId);

    return { ok: true, dealId: activity.dealId };
  });
}
