import type { ApartmentSalesStatus, ListProjectsQuery } from '@toonexpo/contracts';

export const PROJECT_PAGE_SIZE = 18;

export const CATALOG_PROJECTS_PATH = '/projects';
export const CATALOG_APARTMENTS_PATH = '/apartments';

export type CatalogListPath = typeof CATALOG_PROJECTS_PATH | typeof CATALOG_APARTMENTS_PATH;

const SALES_STATUSES = new Set<ApartmentSalesStatus>(['available', 'reserved', 'sold']);

export type ProjectFilterParams = {
  page: number;
  pageSize: number;
  salesStatus?: ApartmentSalesStatus;
  minPrice?: number;
  maxPrice?: number;
  rooms?: number[];
  city?: string;
  builderId?: string;
  /** Free-text keyword (project / builder / city). */
  q?: string;
};

/** Live-filter patch — `undefined` clears that field. */
export type ProjectFilterPatch = {
  [K in keyof ProjectFilterParams]?: ProjectFilterParams[K] | undefined;
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
 * Parses a shareable rooms query value (`"2"` / `"1,3,4"`).
 */
export const parseRoomsFilterValue = (value: string | undefined): number[] | undefined =>
  toPositiveIntList(value);

/**
 * Parses a sales-status query value; unknown values are ignored.
 */
export const parseSalesStatusFilter = (value: string): ApartmentSalesStatus | undefined => {
  return SALES_STATUSES.has(value as ApartmentSalesStatus)
    ? (value as ApartmentSalesStatus)
    : undefined;
};

const toPositiveIntList = (value: string | undefined): number[] | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = value
    .split(',')
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((item) => Number.isFinite(item) && item > 0);
  return parsed.length > 0 ? [...new Set(parsed)] : undefined;
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

  const readList = (key: string): string | undefined => {
    const value = searchParams[key];
    if (Array.isArray(value)) {
      return value.join(',');
    }
    return value;
  };

  const page = toPositiveInt(read('page')) ?? 1;
  const pageSize = toPositiveInt(read('pageSize')) ?? PROJECT_PAGE_SIZE;
  const salesStatus = parseSalesStatusFilter(read('salesStatus') ?? '');

  const city = read('city')?.trim() || undefined;
  const builderId = read('builderId')?.trim() || undefined;
  const q = read('q')?.trim() || undefined;
  const minPrice = toNonNegativeNumber(read('minPrice'));
  const maxPrice = toNonNegativeNumber(read('maxPrice'));
  const rooms = parseRoomsFilterValue(readList('rooms'));

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
  if (q) {
    filters.q = q;
  }

  return filters;
};

/**
 * Converts filter params to the NestJS list-projects query shape.
 */
export const toListProjectsQuery = (filters: ProjectFilterParams): ListProjectsQuery => {
  return {
    page: filters.page,
    pageSize: filters.pageSize,
    ...(filters.salesStatus ? { salesStatus: filters.salesStatus } : {}),
    ...(filters.minPrice != null ? { minPrice: filters.minPrice } : {}),
    ...(filters.maxPrice != null ? { maxPrice: filters.maxPrice } : {}),
    ...(filters.rooms != null && filters.rooms.length > 0 ? { rooms: filters.rooms } : {}),
    ...(filters.city ? { city: filters.city } : {}),
    ...(filters.builderId ? { builderId: filters.builderId } : {}),
    ...(filters.q ? { q: filters.q } : {}),
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
    params['page'] = String(page);
  }
  if (filters.pageSize !== PROJECT_PAGE_SIZE) {
    params['pageSize'] = String(filters.pageSize);
  }
  if (filters.salesStatus) {
    params['salesStatus'] = filters.salesStatus;
  }
  if (filters.minPrice != null) {
    params['minPrice'] = String(filters.minPrice);
  }
  if (filters.maxPrice != null) {
    params['maxPrice'] = String(filters.maxPrice);
  }
  if (filters.rooms != null && filters.rooms.length > 0) {
    params['rooms'] = filters.rooms.join(',');
  }
  if (filters.city) {
    params['city'] = filters.city;
  }
  if (filters.builderId) {
    params['builderId'] = filters.builderId;
  }
  if (filters.q) {
    params['q'] = filters.q;
  }

  return params;
};

const OPTIONAL_FILTER_KEYS = [
  'salesStatus',
  'minPrice',
  'maxPrice',
  'rooms',
  'city',
  'builderId',
  'q',
] as const;

const assignOptionalFilter = <K extends (typeof OPTIONAL_FILTER_KEYS)[number]>(
  target: ProjectFilterParams,
  key: K,
  value: ProjectFilterParams[K] | undefined,
): void => {
  if (value !== undefined) {
    target[key] = value;
  }
};

/**
 * Merges a live-filter patch; `undefined` values clear the field. Always page 1.
 */
export const mergeLiveCatalogFilters = (
  current: ProjectFilterParams,
  patch: ProjectFilterPatch,
): ProjectFilterParams => {
  const source: ProjectFilterPatch = { ...current, ...patch };
  const next: ProjectFilterParams = {
    page: 1,
    pageSize: current.pageSize,
  };

  for (const key of OPTIONAL_FILTER_KEYS) {
    assignOptionalFilter(next, key, source[key]);
  }

  return next;
};

/**
 * Shareable list URL for live catalog filters (always resets to page 1).
 */
export const buildCatalogFilterHref = (
  pathname: CatalogListPath,
  filters: ProjectFilterParams,
): string => {
  const query = new URLSearchParams(buildProjectSearchParams({ ...filters, page: 1 })).toString();
  return query.length > 0 ? `${pathname}?${query}` : pathname;
};
