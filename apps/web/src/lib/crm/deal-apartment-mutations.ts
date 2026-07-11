import { prisma, Prisma } from '@toonexpo/db';
import type { DealApartmentLinkInput } from '@toonexpo/contracts';
import type { DealStage } from '@toonexpo/domain';

import { UNIQUE_CONSTRAINT_ERROR } from '../builder/mutation-result';
import { STAGES_REQUIRING_APARTMENT } from './constants';
import {
  findCompanyApartment,
  findCompanyDeal,
  listDealApartmentIds,
  releaseApartmentsIfUnheld,
} from './deal-mutation-helpers';
import type { CrmMutationResult } from './mutation-result';

function requiresApartment(stage: DealStage): boolean {
  return (STAGES_REQUIRING_APARTMENT as readonly DealStage[]).includes(stage);
}

/** Links a company-owned apartment to a company deal. */
export async function linkDealApartment(
  companyId: string,
  input: DealApartmentLinkInput,
): Promise<CrmMutationResult<{ dealId: string; affectedProjectIds: string[] }>> {
  try {
    return await prisma.$transaction(async (tx) => {
      const deal = await findCompanyDeal(tx, companyId, input.dealId);
      if (!deal) {
        return { ok: false, errorKey: 'notFound' };
      }

      const apartment = await findCompanyApartment(tx, companyId, input.apartmentId);
      if (!apartment) {
        return { ok: false, errorKey: 'notFound' };
      }

      await tx.dealApartment.create({
        data: { dealId: deal.id, apartmentId: apartment.id },
      });

      const projectIds = new Set<string>();
      if (deal.projectId) {
        projectIds.add(deal.projectId);
      }
      projectIds.add(apartment.projectId);

      return { ok: true, dealId: deal.id, affectedProjectIds: [...projectIds] };
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR
    ) {
      return { ok: false, errorKey: 'invalidInput' };
    }
    throw error;
  }
}

/**
 * Unlinks an apartment. Refuses when it would leave RESERVED/CONVERTED with zero links.
 * Releases RESERVED inventory when no other active hold remains.
 */
export async function unlinkDealApartment(
  companyId: string,
  input: DealApartmentLinkInput,
): Promise<CrmMutationResult<{ dealId: string; affectedProjectIds: string[] }>> {
  return prisma.$transaction(async (tx) => {
    const deal = await findCompanyDeal(tx, companyId, input.dealId);
    if (!deal) {
      return { ok: false, errorKey: 'notFound' };
    }

    const existing = await tx.dealApartment.findUnique({
      where: {
        dealId_apartmentId: { dealId: deal.id, apartmentId: input.apartmentId },
      },
      select: { id: true },
    });
    if (!existing) {
      return { ok: false, errorKey: 'notFound' };
    }

    const apartment = await findCompanyApartment(tx, companyId, input.apartmentId);
    if (!apartment) {
      return { ok: false, errorKey: 'notFound' };
    }

    const apartmentIds = await listDealApartmentIds(tx, deal.id);
    if (requiresApartment(deal.stage) && apartmentIds.length <= 1) {
      return { ok: false, errorKey: 'apartmentRequired' };
    }

    await tx.dealApartment.delete({
      where: {
        dealId_apartmentId: { dealId: deal.id, apartmentId: input.apartmentId },
      },
    });

    await releaseApartmentsIfUnheld(tx, [input.apartmentId], deal.id);

    const projectIds = new Set<string>();
    if (deal.projectId) {
      projectIds.add(deal.projectId);
    }
    projectIds.add(apartment.projectId);

    return {
      ok: true,
      dealId: deal.id,
      affectedProjectIds: [...projectIds],
    };
  });
}
