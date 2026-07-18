/** Mirrors NestJS admin company DTO limits. */
export const COMPANY_NAME_MAX_LENGTH = 200;
export const COMPANY_DESCRIPTION_MAX_LENGTH = 4000;
export const ADMIN_COMPANIES_DEFAULT_PAGE_SIZE = 20;
export const ADMIN_COMPANIES_MAX_PAGE_SIZE = 50;

export const COMPANY_TYPES = [
  "builder",
  "partner",
  "bank",
  "service",
] as const;

export const COMPANY_STATUSES = ["active", "inactive", "pending"] as const;

/** TanStack Query keys for platform admin companies. */
export const ADMIN_COMPANIES_QUERY_KEY = ["admin", "companies"] as const;

export const adminCompanyQueryKey = (id: string) =>
  [...ADMIN_COMPANIES_QUERY_KEY, id] as const;

export const adminCompanyProjectsQueryKey = (companyId: string) =>
  [...ADMIN_COMPANIES_QUERY_KEY, companyId, "projects"] as const;

export const ADMIN_READINESS_CATEGORIES_QUERY_KEY = [
  "admin",
  "readiness",
  "categories",
] as const;

export const ADMIN_READINESS_ASSESSMENTS_QUERY_KEY = [
  "admin",
  "readiness",
  "assessments",
] as const;

export const adminReadinessAssessmentQueryKey = (id: string) =>
  [...ADMIN_READINESS_ASSESSMENTS_QUERY_KEY, id] as const;
