import { ApartmentSalesStatus, type Prisma } from '@toonexpo/db';

import {
  dealStatusForManualInventory,
  linkTypeForInventoryStatus,
} from '../../crm/status/crm-inventory-sync.js';
import { isCrmStatusTransitionAllowed } from '../../crm/status/deal-status.transitions.js';

type ManualSalesStatusSyncInput = {
  apartmentId: string;
  nextStatus: ApartmentSalesStatus;
  activeCrmDealId: string | null;
};

/**
 * Keeps the linked CRM deal / hold in sync after a manual inventory status write.
 */
export const syncManualSalesStatusToCrm = async (
  tx: Prisma.TransactionClient,
  input: ManualSalesStatusSyncInput,
): Promise<void> => {
  const dealId = input.activeCrmDealId;
  if (dealId == null) {
    return;
  }

  await tx.crmDealApartmentLink.updateMany({
    where: { crmDealId: dealId, apartmentId: input.apartmentId },
    data: { linkType: linkTypeForInventoryStatus(input.nextStatus) },
  });

  const deal = await tx.crmDeal.findUnique({
    where: { id: dealId },
    select: { status: true },
  });
  if (!deal) {
    return;
  }

  const nextDealStatus = dealStatusForManualInventory(input.nextStatus);
  if (
    deal.status === nextDealStatus ||
    !isCrmStatusTransitionAllowed(deal.status, nextDealStatus)
  ) {
    return;
  }

  await tx.crmDeal.update({
    where: { id: dealId },
    data: { status: nextDealStatus, lastActivityAt: new Date() },
  });
};
