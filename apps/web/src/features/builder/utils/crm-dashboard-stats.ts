import type { CrmDealListItem, CrmDealStatus } from "@toonexpo/contracts";

import { CRM_OPEN_DEAL_STATUSES } from "./crm-status-transitions";

export type CrmDashboardStats = {
  openByStatus: Record<CrmDealStatus, number>;
  openTotal: number;
  createdToday: number;
};

const emptyOpenByStatus = (): Record<CrmDealStatus, number> => ({
  new_request: 0,
  assigned: 0,
  contacted: 0,
  follow_up_needed: 0,
  apartment_selected: 0,
  reserved: 0,
  converted: 0,
  closed: 0,
  lost: 0,
});

const startOfLocalDay = (now: Date): Date => {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Aggregates open-pipeline and "created today" counts from a deal list page.
 */
export const aggregateCrmDashboardStats = (
  deals: readonly CrmDealListItem[],
  now: Date = new Date(),
): CrmDashboardStats => {
  const openByStatus = emptyOpenByStatus();
  const dayStart = startOfLocalDay(now).getTime();
  let openTotal = 0;
  let createdToday = 0;

  for (const deal of deals) {
    if (CRM_OPEN_DEAL_STATUSES.includes(deal.status)) {
      openByStatus[deal.status] += 1;
      openTotal += 1;
    }
    if (new Date(deal.createdAt).getTime() >= dayStart) {
      createdToday += 1;
    }
  }

  return { openByStatus, openTotal, createdToday };
};
