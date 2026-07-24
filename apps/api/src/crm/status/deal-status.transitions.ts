import { CrmDealStatus } from '@toonexpo/db';

import type { BuyerFacingRequestStatus } from '@toonexpo/contracts';

/**
 * Allowed CRM status transitions (minimal graph from Constructor CRM docs).
 * Terminal: converted, closed, lost.
 */
export const CRM_STATUS_TRANSITIONS: Readonly<Record<CrmDealStatus, readonly CrmDealStatus[]>> = {
  [CrmDealStatus.new_request]: [
    CrmDealStatus.assigned,
    CrmDealStatus.contacted,
    CrmDealStatus.closed,
    CrmDealStatus.lost,
  ],
  [CrmDealStatus.assigned]: [
    CrmDealStatus.contacted,
    CrmDealStatus.follow_up_needed,
    CrmDealStatus.closed,
    CrmDealStatus.lost,
  ],
  [CrmDealStatus.contacted]: [
    CrmDealStatus.follow_up_needed,
    CrmDealStatus.apartment_selected,
    CrmDealStatus.closed,
    CrmDealStatus.lost,
  ],
  [CrmDealStatus.follow_up_needed]: [
    CrmDealStatus.contacted,
    CrmDealStatus.apartment_selected,
    CrmDealStatus.closed,
    CrmDealStatus.lost,
  ],
  [CrmDealStatus.apartment_selected]: [
    CrmDealStatus.reserved,
    CrmDealStatus.follow_up_needed,
    CrmDealStatus.closed,
    CrmDealStatus.lost,
  ],
  [CrmDealStatus.reserved]: [CrmDealStatus.converted, CrmDealStatus.closed, CrmDealStatus.lost],
  [CrmDealStatus.converted]: [],
  [CrmDealStatus.closed]: [],
  [CrmDealStatus.lost]: [],
};

/**
 * Returns true when `to` is an allowed next status from `from`.
 * Moving back to `new_request` is always allowed (Kanban reset).
 */
export const isCrmStatusTransitionAllowed = (from: CrmDealStatus, to: CrmDealStatus): boolean => {
  if (from === to) {
    return true;
  }
  if (to === CrmDealStatus.new_request) {
    return true;
  }
  return CRM_STATUS_TRANSITIONS[from].includes(to);
};

/**
 * Maps CRM pipeline status to buyer-facing history status.
 */
export const mapDealStatusToBuyerFacing = (status: CrmDealStatus): BuyerFacingRequestStatus => {
  switch (status) {
    case CrmDealStatus.new_request:
      return 'request_sent';
    case CrmDealStatus.assigned:
      return 'builder_received';
    case CrmDealStatus.contacted:
    case CrmDealStatus.follow_up_needed:
      return 'in_contact';
    case CrmDealStatus.apartment_selected:
      return 'apartment_selected';
    case CrmDealStatus.reserved:
      return 'reserved';
    case CrmDealStatus.converted:
    case CrmDealStatus.closed:
      return 'closed';
    case CrmDealStatus.lost:
      return 'cancelled';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
};
