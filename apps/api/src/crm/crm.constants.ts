/**
 * CRM Lead Intake + Constructor CRM constants.
 * ADAPTIVE VALUES — confirm with owner before production tuning.
 */

import { CrmDealStatus } from "@toonexpo/db";

/** Default page size for CRM deal lists. */
export const CRM_DEFAULT_PAGE_SIZE = 20;

/** Maximum page size for CRM deal lists. */
export const CRM_MAX_PAGE_SIZE = 50;

export const CRM_MIN_PAGE = 1;

/** Max length for intake / CRM free-text notes. */
export const CRM_NOTE_MAX_LENGTH = 4000;

/** Max length for activity titles. */
export const CRM_ACTIVITY_TITLE_MAX_LENGTH = 200;

/** Max length for activity descriptions. */
export const CRM_ACTIVITY_DESCRIPTION_MAX_LENGTH = 4000;

/** Max length for lost reason. */
export const CRM_LOST_REASON_MAX_LENGTH = 500;

/** Max length for manual contact name. */
export const CRM_CONTACT_NAME_MAX_LENGTH = 200;

/** Open pipeline statuses used for intake deduplication. */
export const CRM_OPEN_DEAL_STATUSES: readonly CrmDealStatus[] = [
  CrmDealStatus.new_request,
  CrmDealStatus.assigned,
  CrmDealStatus.contacted,
  CrmDealStatus.follow_up_needed,
  CrmDealStatus.apartment_selected,
  CrmDealStatus.reserved,
] as const;

/** Terminal pipeline statuses (no further intake dedup merge). */
export const CRM_CLOSED_DEAL_STATUSES: readonly CrmDealStatus[] = [
  CrmDealStatus.converted,
  CrmDealStatus.closed,
  CrmDealStatus.lost,
] as const;

/** Statuses that require at least one apartment link. */
export const CRM_STATUSES_REQUIRING_APARTMENT: readonly CrmDealStatus[] = [
  CrmDealStatus.apartment_selected,
  CrmDealStatus.reserved,
  CrmDealStatus.converted,
] as const;
