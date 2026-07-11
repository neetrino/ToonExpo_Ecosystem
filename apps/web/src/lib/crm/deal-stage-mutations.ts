import type { DealStageUpdateInput } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';
import type { DealStage } from '@toonexpo/domain';

import { STAGES_REQUIRING_APARTMENT } from './constants';
import {
  findCompanyDeal,
  hasReservationConflict,
  listDealApartmentIds,
  releaseApartmentsIfUnheld,
  setApartmentsStatus,
  statusChangeBody,
  type TransactionClient,
} from './deal-mutation-helpers';
import type { CrmMutationResult } from './mutation-result';

function requiresApartment(stage: DealStage): boolean {
  return (STAGES_REQUIRING_APARTMENT as readonly DealStage[]).includes(stage);
}

/**
 * Inventory sync (doc 04): reserved→RESERVED, converted→SOLD,
 * leave reserved (except to converted)→AVAILABLE if no other hold.
 */
async function syncInventoryForStageChange(
  tx: TransactionClient,
  dealId: string,
  from: DealStage,
  to: DealStage,
  apartmentIds: string[],
): Promise<'ok' | 'reservationConflict'> {
  if (to === 'RESERVED' && from !== 'RESERVED') {
    if (await hasReservationConflict(tx, apartmentIds, dealId)) {
      return 'reservationConflict';
    }
    await setApartmentsStatus(tx, apartmentIds, 'RESERVED');
    return 'ok';
  }

  if (to === 'CONVERTED') {
    await setApartmentsStatus(tx, apartmentIds, 'SOLD');
    return 'ok';
  }

  // Leaving RESERVED to any non-sale stage releases hold (doc 04).
  if (from === 'RESERVED') {
    await releaseApartmentsIfUnheld(tx, apartmentIds, dealId);
  }

  return 'ok';
}

/**
 * Updates deal stage with apartment and inventory rules from docs 02 + 04.
 */
export async function updateDealStage(
  companyId: string,
  input: DealStageUpdateInput,
  actorUserId?: string,
): Promise<CrmMutationResult<{ dealId: string; affectedProjectIds: string[] }>> {
  return prisma.$transaction(async (tx) => {
    const deal = await findCompanyDeal(tx, companyId, input.dealId);
    if (!deal) {
      return { ok: false, errorKey: 'notFound' };
    }

    if (deal.stage === input.stage) {
      return {
        ok: true,
        dealId: deal.id,
        affectedProjectIds: deal.projectId ? [deal.projectId] : [],
      };
    }

    const apartmentIds = await listDealApartmentIds(tx, deal.id);
    if (requiresApartment(input.stage) && apartmentIds.length === 0) {
      return { ok: false, errorKey: 'apartmentRequired' };
    }

    const sync = await syncInventoryForStageChange(
      tx,
      deal.id,
      deal.stage,
      input.stage,
      apartmentIds,
    );
    if (sync === 'reservationConflict') {
      return { ok: false, errorKey: 'reservationConflict' };
    }

    const now = new Date();
    await tx.deal.update({
      where: { id: deal.id },
      data: { stage: input.stage, lastActivityAt: now },
    });
    await tx.dealActivity.create({
      data: {
        dealId: deal.id,
        authorUserId: actorUserId,
        type: 'STATUS_CHANGE',
        body: statusChangeBody(deal.stage, input.stage),
      },
    });

    return {
      ok: true,
      dealId: deal.id,
      affectedProjectIds: deal.projectId ? [deal.projectId] : [],
    };
  });
}
