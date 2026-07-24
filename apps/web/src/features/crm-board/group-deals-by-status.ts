import type { CrmDealListItem, CrmDealStatus } from '@toonexpo/contracts';

import { CRM_KANBAN_STATUSES } from '@/features/crm-board/constants';

export type CrmDealsByStatus = Record<CrmDealStatus, CrmDealListItem[]>;

/**
 * Groups deals into Kanban columns; preserves API order within each column.
 */
export const groupDealsByStatus = (deals: CrmDealListItem[]): CrmDealsByStatus => {
  const grouped = Object.fromEntries(
    CRM_KANBAN_STATUSES.map((status) => [status, [] as CrmDealListItem[]]),
  ) as CrmDealsByStatus;

  for (const deal of deals) {
    grouped[deal.status].push(deal);
  }

  return grouped;
};
