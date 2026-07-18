import type {
  ApartmentDetail,
  BuilderSummary,
  ListProjectsQuery,
  PaginatedResponse,
  ProjectDetail,
  ProjectListItem,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";
import { ApiError, isApiErrorStatus } from "@/shared/api/errors";

const CATALOG_FETCH_INIT: RequestInit = {
  method: "GET",
  cache: "no-store",
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

  const serialized = params.toString();
  return serialized.length > 0 ? `?${serialized}` : "";
};

/**
 * Lists published projects with optional filters and pagination.
 */
export const listProjects = (
  query: ListProjectsQuery = {},
): Promise<PaginatedResponse<ProjectListItem>> => {
  return apiFetch<PaginatedResponse<ProjectListItem>>({
    path: `/projects${toSearchParams(query)}`,
    ...CATALOG_FETCH_INIT,
  });
};

/**
 * Loads a published project. Returns null on 404.
 */
export const getProject = async (
  projectId: string,
): Promise<ProjectDetail | null> => {
  try {
    return await apiFetch<ProjectDetail>({
      path: `/projects/${encodeURIComponent(projectId)}`,
      ...CATALOG_FETCH_INIT,
    });
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
): Promise<ApartmentDetail | null> => {
  try {
    return await apiFetch<ApartmentDetail>({
      path: `/apartments/${encodeURIComponent(apartmentId)}`,
      ...CATALOG_FETCH_INIT,
    });
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
export const listBuilders = (): Promise<BuilderSummary[]> => {
  return apiFetch<BuilderSummary[]>({
    path: "/builders",
    ...CATALOG_FETCH_INIT,
  });
};

export { ApiError };
