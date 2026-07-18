import type { CrmDealStatus } from "@toonexpo/contracts";

/**
 * Allowed CRM status transitions (mirrors API deal-status.transitions).
 * Terminal: converted, closed, lost.
 */
export const CRM_STATUS_TRANSITIONS: Readonly<
  Record<CrmDealStatus, readonly CrmDealStatus[]>
> = {
  new_request: ["assigned", "contacted", "closed", "lost"],
  assigned: ["contacted", "follow_up_needed", "closed", "lost"],
  contacted: ["follow_up_needed", "apartment_selected", "closed", "lost"],
  follow_up_needed: ["contacted", "apartment_selected", "closed", "lost"],
  apartment_selected: ["reserved", "follow_up_needed", "closed", "lost"],
  reserved: ["converted", "closed", "lost"],
  converted: [],
  closed: [],
  lost: [],
};

export const CRM_STATUSES_REQUIRING_APARTMENT: readonly CrmDealStatus[] = [
  "apartment_selected",
  "reserved",
  "converted",
];

export const CRM_OPEN_DEAL_STATUSES: readonly CrmDealStatus[] = [
  "new_request",
  "assigned",
  "contacted",
  "follow_up_needed",
  "apartment_selected",
  "reserved",
];

/**
 * Returns true when `to` is an allowed next status from `from` (or same).
 */
export const isCrmStatusTransitionAllowed = (
  from: CrmDealStatus,
  to: CrmDealStatus,
): boolean => {
  if (from === to) {
    return true;
  }
  return CRM_STATUS_TRANSITIONS[from].includes(to);
};

/**
 * Options for a status select: current status plus allowed transitions.
 */
export const getCrmStatusSelectOptions = (
  current: CrmDealStatus,
): CrmDealStatus[] => {
  const next = CRM_STATUS_TRANSITIONS[current];
  return [current, ...next.filter((status) => status !== current)];
};

/**
 * True when target status requires at least one linked apartment.
 */
export const crmStatusRequiresApartment = (status: CrmDealStatus): boolean =>
  CRM_STATUSES_REQUIRING_APARTMENT.includes(status);
