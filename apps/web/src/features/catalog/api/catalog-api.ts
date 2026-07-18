import type {
  ApartmentDetail,
  BuilderSummary,
  ListProjectsQuery,
  PaginatedResponse,
  ProjectDetail,
  ProjectListItem,
} from "@toonexpo/contracts";

import { apiFetch, type ApiFetchOptions } from "@/shared/api/client";
import { ApiError, isApiErrorStatus } from "@/shared/api/errors";

const CATALOG_FETCH_INIT: RequestInit = {
  method: "GET",
  cache: "no-store",
  credentials: "include",
};

export type CatalogRequestOptions = {
  locale?: string | undefined;
  cookieHeader?: string | undefined;
};

const buildCatalogFetch = (
  path: string,
  cookieHeader?: string,
): ApiFetchOptions => {
  if (!cookieHeader) {
    return { path, ...CATALOG_FETCH_INIT };
  }

  return {
    path,
    ...CATALOG_FETCH_INIT,
    headers: { Cookie: cookieHeader },
  };
};

const toSearchParams = (query: ListProjectsQuery): string => {
  const params = new URLSearchParams();

  if (query.page != null) {
    params.set("page", String(query.page));
  }
  if (query.pageSize != null) {
    params.set("pageSize", String(query.pageSize));
  }
  if (query.salesStatus) {
    params.set("salesStatus", query.salesStatus);
  }
  if (query.minPrice != null) {
    params.set("minPrice", String(query.minPrice));
  }
  if (query.maxPrice != null) {
    params.set("maxPrice", String(query.maxPrice));
  }
  if (query.rooms != null) {
    params.set("rooms", String(query.rooms));
  }
  if (query.city) {
    params.set("city", query.city);
  }
  if (query.builderId) {
    params.set("builderId", query.builderId);
  }
  if (query.locale) {
    params.set("locale", query.locale);
  }

  const serialized = params.toString();
  return serialized.length > 0 ? `?${serialized}` : "";
};

const localeQuery = (locale?: string): string => {
  if (!locale) {
    return "";
  }
  return `?locale=${encodeURIComponent(locale)}`;
};

/**
 * Lists published projects with optional filters and pagination.
 */
export const listProjects = (
  query: ListProjectsQuery = {},
  options: CatalogRequestOptions = {},
): Promise<PaginatedResponse<ProjectListItem>> => {
  const merged: ListProjectsQuery = { ...query };
  if (options.locale) {
    merged.locale = options.locale;
  }

  return apiFetch<PaginatedResponse<ProjectListItem>>(
    buildCatalogFetch(`/projects${toSearchParams(merged)}`, options.cookieHeader),
  );
};

/**
 * Loads a published project. Returns null on 404.
 */
export const getProject = async (
  projectId: string,
  options: CatalogRequestOptions = {},
): Promise<ProjectDetail | null> => {
  try {
    return await apiFetch<ProjectDetail>(
      buildCatalogFetch(
        `/projects/${encodeURIComponent(projectId)}${localeQuery(options.locale)}`,
        options.cookieHeader,
      ),
    );
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      return null;
    }
    throw error;
  }
};

/**
 * Loads a published apartment. Returns null on 404.
 */
export const getApartment = async (
  apartmentId: string,
  options: CatalogRequestOptions = {},
): Promise<ApartmentDetail | null> => {
  try {
    return await apiFetch<ApartmentDetail>(
      buildCatalogFetch(
        `/apartments/${encodeURIComponent(apartmentId)}${localeQuery(options.locale)}`,
        options.cookieHeader,
      ),
    );
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      return null;
    }
    throw error;
  }
};

/**
 * Lists active builders with published project counts.
 */
export const listBuilders = (
  options: CatalogRequestOptions = {},
): Promise<BuilderSummary[]> => {
  return apiFetch<BuilderSummary[]>(
    buildCatalogFetch(`/builders${localeQuery(options.locale)}`, options.cookieHeader),
  );
};

export { ApiError };
