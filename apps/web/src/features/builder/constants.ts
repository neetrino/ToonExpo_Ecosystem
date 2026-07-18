/** Mirrors NestJS portal DTO limits. */
export const PORTAL_PROJECT_NAME_MAX_LENGTH = 200;
export const PORTAL_SLUG_MAX_LENGTH = 120;
export const PORTAL_DESCRIPTION_MAX_LENGTH = 8000;
export const PORTAL_LOCATION_MAX_LENGTH = 500;
export const PORTAL_CITY_MAX_LENGTH = 120;
export const PORTAL_ADDRESS_MAX_LENGTH = 500;
export const PORTAL_BUILDING_NAME_MAX_LENGTH = 200;
export const PORTAL_APARTMENT_NUMBER_MAX_LENGTH = 64;
export const PORTAL_BULK_APARTMENTS_MAX = 200;
export const PORTAL_STATUS_REASON_MAX_LENGTH = 500;

export const PORTAL_DEFAULT_PAGE_SIZE = 20;
export const PORTAL_MAX_PAGE_SIZE = 50;

export const PUBLICATION_STATUSES = [
  "draft",
  "published",
  "archived",
] as const;

export const APARTMENT_SALES_STATUSES = [
  "available",
  "reserved",
  "sold",
] as const;

export const PRICE_VISIBILITY_OPTIONS = [
  "public",
  "by_request",
  "visible_after_login",
] as const;

export const COMPANY_MEMBER_ROLES = ["company_admin", "member"] as const;

export const COMPANY_MEMBER_STATUSES = [
  "active",
  "inactive",
  "removed",
] as const;

export const TRANSLATION_LOCALES = ["hy", "ru", "en"] as const;

export const PORTAL_PROJECTS_QUERY_KEY = ["portal", "projects"] as const;

export const portalProjectQueryKey = (id: string) =>
  [...PORTAL_PROJECTS_QUERY_KEY, id] as const;

export const portalFloorApartmentsQueryKey = (floorId: string) =>
  ["portal", "floors", floorId, "apartments"] as const;

export const portalApartmentQueryKey = (id: string) =>
  ["portal", "apartments", id] as const;

export const COMPANY_MEMBERS_QUERY_KEY = ["company", "members"] as const;

export const COMPANY_PROFILE_QUERY_KEY = ["company", "me"] as const;

export const PORTAL_CRM_DEALS_QUERY_KEY = ["portal", "crm", "deals"] as const;

export const portalCrmDealQueryKey = (id: string) =>
  [...PORTAL_CRM_DEALS_QUERY_KEY, id] as const;
