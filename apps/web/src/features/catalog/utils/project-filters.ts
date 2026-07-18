import type { ApartmentSalesStatus, ListProjectsQuery } from "@toonexpo/contracts";

export const PROJECT_PAGE_SIZE = 12;

const SALES_STATUSES = new Set<ApartmentSalesStatus>([
  "available",
  "reserved",
  "sold",
]);

export type ProjectFilterParams = {
  page: number;
  pageSize: number;
  salesStatus?: ApartmentSalesStatus;
  minPrice?: number;
  maxPrice?: number;
  rooms?: number;
  city?: string;
  builderId?: string;
};

const toPositiveInt = (value: string | undefined): number | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const toNonNegativeNumber = (value: string | undefined): number | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

/**
 * Parses shareable URL search params into a typed projects list query.
 */
export const parseProjectFilters = (
  searchParams: Record<string, string | string[] | undefined>,
): ProjectFilterParams => {
  const read = (key: string): string | undefined => {
    const value = searchParams[key];
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  };

  const page = toPositiveInt(read("page")) ?? 1;
  const pageSize = toPositiveInt(read("pageSize")) ?? PROJECT_PAGE_SIZE;
  const salesStatusRaw = read("salesStatus");
  const salesStatus =
    salesStatusRaw && SALES_STATUSES.has(salesStatusRaw as ApartmentSalesStatus)
      ? (salesStatusRaw as ApartmentSalesStatus)
      : undefined;

  const city = read("city")?.trim() || undefined;
  const builderId = read("builderId")?.trim() || undefined;
  const minPrice = toNonNegativeNumber(read("minPrice"));
  const maxPrice = toNonNegativeNumber(read("maxPrice"));
  const rooms = toPositiveInt(read("rooms"));

  const filters: ProjectFilterParams = {
    page,
    pageSize: Math.min(pageSize, 50),
  };

  if (salesStatus) {
    filters.salesStatus = salesStatus;
  }
  if (minPrice != null) {
    filters.minPrice = minPrice;
  }
  if (maxPrice != null) {
    filters.maxPrice = maxPrice;
  }
  if (rooms != null) {
    filters.rooms = rooms;
  }
  if (city) {
    filters.city = city;
  }
  if (builderId) {
    filters.builderId = builderId;
  }

  return filters;
};

/**
 * Converts filter params to the NestJS list-projects query shape.
 */
export const toListProjectsQuery = (
  filters: ProjectFilterParams,
): ListProjectsQuery => {
  return {
    page: filters.page,
    pageSize: filters.pageSize,
    ...(filters.salesStatus ? { salesStatus: filters.salesStatus } : {}),
    ...(filters.minPrice != null ? { minPrice: filters.minPrice } : {}),
    ...(filters.maxPrice != null ? { maxPrice: filters.maxPrice } : {}),
    ...(filters.rooms != null ? { rooms: filters.rooms } : {}),
    ...(filters.city ? { city: filters.city } : {}),
    ...(filters.builderId ? { builderId: filters.builderId } : {}),
  };
};

/**
 * Builds a query-string object for pagination links, preserving filters.
 */
export const buildProjectSearchParams = (
  filters: ProjectFilterParams,
  pageOverride?: number,
): Record<string, string> => {
  const params: Record<string, string> = {};
  const page = pageOverride ?? filters.page;

  if (page > 1) {
    params["page"] = String(page);
  }
  if (filters.pageSize !== PROJECT_PAGE_SIZE) {
    params["pageSize"] = String(filters.pageSize);
  }
  if (filters.salesStatus) {
    params["salesStatus"] = filters.salesStatus;
  }
  if (filters.minPrice != null) {
    params["minPrice"] = String(filters.minPrice);
  }
  if (filters.maxPrice != null) {
    params["maxPrice"] = String(filters.maxPrice);
  }
  if (filters.rooms != null) {
    params["rooms"] = String(filters.rooms);
  }
  if (filters.city) {
    params["city"] = filters.city;
  }
  if (filters.builderId) {
    params["builderId"] = filters.builderId;
  }

  return params;
};
