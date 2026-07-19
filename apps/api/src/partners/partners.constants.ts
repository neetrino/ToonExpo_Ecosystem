/**
 * Partners module constants.
 */

export const PARTNERS_DEFAULT_PAGE_SIZE = 20;

export const PARTNERS_MAX_PAGE_SIZE = 50;

export const PARTNERS_MIN_PAGE = 1;

export const PARTNER_NAME_MAX_LENGTH = 200;

export const PARTNER_SLUG_MAX_LENGTH = 120;

export const PARTNER_DESCRIPTION_MAX_LENGTH = 8000;

export const PARTNER_WEBSITE_MAX_LENGTH = 500;

export const PARTNER_OFFER_TITLE_MAX_LENGTH = 200;

export const PARTNER_OFFER_TYPE_MAX_LENGTH = 64;

export const PARTNER_SEARCH_MIN_LENGTH = 1;

/** Company.type values allowed to receive a PartnerCompany profile. */
export const PARTNER_COMPATIBLE_COMPANY_TYPES = [
  "partner",
  "bank",
  "service",
] as const;
