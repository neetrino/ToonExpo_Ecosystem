import type { DealStageUpdateInput } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';
import type { DealStage } from '@toonexpo/domain';

import { STAGES_REQUIRING_APARTMENT } from './constants';
import {
  claimApartmentsForDeal,
  collectAffectedProjectIds,
  CrmInventoryAbortError,
  findCompanyDeal,
  listDealApartmentIds,
  releaseApartmentsIfUnheld,
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
 *
 * Claim path uses conditional updateMany (not Serializable): race-safe under
 * Read Committed; on partial match throws CrmInventoryAbortError to roll back
 * (same abort-inside-tx pattern as ProvisionAbortError).
 */
async function syncInventoryForStageChange(
  tx: TransactionClient,
  dealId: string,
  from: DealStage,
  to: DealStage,
  apartmentIds: string[],
): Promise<void> {
  if (to === 'RESERVED' && from !== 'RESERVED') {
    const claim = await claimApartmentsForDeal(tx, apartmentIds, 'RESERVED', dealId);
    if (claim === 'reservationConflict') {
      throw new CrmInventoryAbortError();
    }
    return;
  }

  if (to === 'CONVERTED') {
    const claim = await claimApartmentsForDeal(tx, apartmentIds, 'SOLD', dealId);
    if (claim === 'reservationConflict') {
      throw new CrmInventoryAbortError();
    }
    return;
  }

  // Leaving RESERVED to any non-sale stage releases hold (doc 04).
  if (from === 'RESERVED') {
    await releaseApartmentsIfUnheld(tx, apartmentIds, dealId);
  }
}

/**
 * Updates deal stage with apartment and inventory rules from docs 02 + 04.
 */
export async function updateDealStage(
  companyId: string,
  input: DealStageUpdateInput,
  actorUserId?: string,
): Promise<CrmMutationResult<{ dealId: string; affectedProjectIds: string[] }>> {
  try {
    return await prisma.$transaction(async (tx) => {
      const deal = await findCompanyDeal(tx, companyId, input.dealId);
      if (!deal) {
        return { ok: false, errorKey: 'notFound' };
      }

      const apartmentIds = await listDealApartmentIds(tx, deal.id);
      const affectedProjectIds = await collectAffectedProjectIds(tx, deal.projectId, apartmentIds);

      if (deal.stage === input.stage) {
        return {
          ok: true,
          dealId: deal.id,
          affectedProjectIds,
        };
      }

      if (requiresApartment(input.stage) && apartmentIds.length === 0) {
        return { ok: false, errorKey: 'apartmentRequired' };
      }

      await syncInventoryForStageChange(tx, deal.id, deal.stage, input.stage, apartmentIds);

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
        affectedProjectIds,
      };
    });
  } catch (error) {
    if (error instanceof CrmInventoryAbortError) {
      return { ok: false, errorKey: 'reservationConflict' };
    }
    throw error;
  }
}
