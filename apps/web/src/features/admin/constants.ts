/** Mirrors NestJS admin company DTO limits. */
export const COMPANY_NAME_MAX_LENGTH = 200;
export const COMPANY_DESCRIPTION_MAX_LENGTH = 4000;
export const COMPANY_SHORT_DESCRIPTION_MAX_LENGTH = 400;
export const ADMIN_COMPANIES_DEFAULT_PAGE_SIZE = 18;
export const ADMIN_COMPANIES_MAX_PAGE_SIZE = 50;

/**
 * Shared list page size for admin inventory (projects/buildings/floors/apartments/users).
 * Card grids use 2–3 columns; 18 fills both without a lone card on the last row.
 */
export const ADMIN_INVENTORY_DEFAULT_PAGE_SIZE = 18;

export const COMPANY_TYPES = ['builder', 'partner', 'bank', 'service'] as const;

export const COMPANY_STATUSES = ['active', 'inactive', 'pending'] as const;

/** TanStack Query keys for platform admin companies. */
export const ADMIN_COMPANIES_QUERY_KEY = ['admin', 'companies'] as const;

export const ADMIN_USERS_QUERY_KEY = ['admin', 'users'] as const;

export const adminUsersQueryKey = (params: {
  page: number;
  pageSize: number;
  accountType?: string;
  status?: string;
  search?: string;
}) => [...ADMIN_USERS_QUERY_KEY, params] as const;

export const ADMIN_CRM_DEALS_QUERY_KEY = ['admin', 'crm', 'deals'] as const;

export const adminCrmDealQueryKey = (id: string) => [...ADMIN_CRM_DEALS_QUERY_KEY, id] as const;

/** Kanban board page size for admin CRM overview. */
export const ADMIN_CRM_BOARD_PAGE_SIZE = 100;

export const adminCompanyQueryKey = (id: string) => [...ADMIN_COMPANIES_QUERY_KEY, id] as const;

export const adminCompanyProjectsQueryKey = (companyId: string) =>
  [...ADMIN_COMPANIES_QUERY_KEY, companyId, 'projects'] as const;

export const ADMIN_PROJECTS_QUERY_KEY = ['admin', 'projects'] as const;

export const adminProjectsQueryKey = (params: {
  page: number;
  pageSize: number;
  companyId?: string;
  search?: string;
}) => [...ADMIN_PROJECTS_QUERY_KEY, params] as const;

/** Debounce before the admin projects search hits the API. */
export const ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS = 300;

export const adminProjectScopeQueryKey = (projectId: string) =>
  [...ADMIN_PROJECTS_QUERY_KEY, projectId, 'scope'] as const;

export const ADMIN_BUILDINGS_QUERY_KEY = ['admin', 'buildings'] as const;
export const ADMIN_FLOORS_QUERY_KEY = ['admin', 'floors'] as const;
export const ADMIN_APARTMENTS_QUERY_KEY = ['admin', 'apartments'] as const;

export const adminBuildingInventoryGlanceQueryKey = (buildingId: string) =>
  [...ADMIN_BUILDINGS_QUERY_KEY, buildingId, 'inventory-glance'] as const;

export const adminBuildingsQueryKey = (params: {
  page: number;
  pageSize: number;
  companyId?: string;
  projectId?: string;
  search?: string;
}) => [...ADMIN_BUILDINGS_QUERY_KEY, params] as const;

export const adminFloorsQueryKey = (params: {
  page: number;
  pageSize: number;
  companyId?: string;
  buildingId?: string;
  search?: string;
}) => [...ADMIN_FLOORS_QUERY_KEY, params] as const;

export const adminApartmentsQueryKey = (params: {
  page: number;
  pageSize: number;
  companyId?: string;
  buildingId?: string;
  floorId?: string;
  search?: string;
}) => [...ADMIN_APARTMENTS_QUERY_KEY, params] as const;

export const ADMIN_READINESS_ASSESSMENTS_QUERY_KEY = ['admin', 'readiness', 'assessments'] as const;

export const adminReadinessAssessmentQueryKey = (id: string) =>
  [...ADMIN_READINESS_ASSESSMENTS_QUERY_KEY, id] as const;

export const ADMIN_ANALYTICS_QUERY_KEY = ['admin', 'analytics'] as const;

export const adminAnalyticsQueryKey = (from: string, to: string) =>
  [...ADMIN_ANALYTICS_QUERY_KEY, from, to] as const;

/** Mirrors NestJS admin BOS provisioning DTO limits. */
export const ADMIN_BOS_PROVISIONING_DEFAULT_PAGE_SIZE = 18;

export const ADMIN_BOS_PROVISIONING_QUERY_KEY = [
  'admin',
  'integrations',
  'bos',
  'provisioning',
] as const;

export const adminBosProvisioningQueryKey = (id: string) =>
  [...ADMIN_BOS_PROVISIONING_QUERY_KEY, id] as const;

export const BOS_PROVISIONING_STATUSES = [
  'success',
  'linked_existing',
  'failed',
  'partial',
] as const;

/** localStorage key for admin management portal rail collapse. */
export const ADMIN_RAIL_COLLAPSED_STORAGE_KEY = 'toonexpo.admin.rail-collapsed';

/** localStorage keys for admin list/cards view preference. */
export const ADMIN_VIEW_MODE_KEYS = {
  companies: 'admin-companies',
  users: 'admin-users',
  projects: 'admin-projects',
  buildings: 'admin-buildings',
  floors: 'admin-floors',
  apartments: 'admin-apartments',
  partners: 'admin-partners',
  bankOffers: 'admin-bank-offers',
  templates: 'admin-templates',
  serviceProviderCategories: 'admin-service-provider-categories',
  serviceProviders: 'admin-service-providers',
  readinessAssessments: 'admin-readiness-assessments',
  readinessCategories: 'admin-readiness-categories',
  events: 'admin-events',
  bos: 'admin-bos-provisioning',
} as const;
