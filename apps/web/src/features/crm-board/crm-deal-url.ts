import type { CrmDealListItem } from '@toonexpo/contracts';

/** Query param for open CRM deal sheet (buyer display name, not id). */
export const CRM_DEAL_URL_PARAM = 'deal';

const UNNAMED_DEAL_URL_NAME = 'unnamed';

/**
 * Stable display name used in the CRM sheet URL (`?deal=…`).
 */
export const getCrmDealUrlName = (deal: CrmDealListItem): string => {
  const raw =
    deal.buyer.name?.trim() ||
    deal.buyer.phone?.trim() ||
    deal.buyer.email?.trim() ||
    UNNAMED_DEAL_URL_NAME;
  return raw;
};

/**
 * Resolves a deal from the board list by URL name (case-insensitive).
 * First match wins when names collide.
 */
export const findCrmDealByUrlName = (
  deals: readonly CrmDealListItem[],
  urlName: string,
): CrmDealListItem | undefined => {
  const needle = urlName.trim().toLowerCase();
  if (!needle) {
    return undefined;
  }
  return deals.find((deal) => getCrmDealUrlName(deal).toLowerCase() === needle);
};
