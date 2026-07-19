import type {
  ApartmentDetail,
  BuilderDetail,
  BuilderSummary,
  BuildingDetail,
  FloorDetail,
  ListProjectsQuery,
  PaginatedResponse,
  ProjectDetail,
  ProjectListItem,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";
import { ApiError, isApiErrorStatus } from "@/shared/api/errors";
import {
  catalogListFetch,
  catalogProjectFetch,
} from "@/shared/api/public-fetch";

export type CatalogRequestOptions = {
  locale?: string | undefined;
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
 * Anonymous Next Data Cache — never send cookies (price personalization is
 * auth-only on the API; favorites use separate buyer endpoints).
 */
export const listProjects = (
  query: ListProjectsQuery = {},
  options: CatalogRequestOptions = {},
): Promise<PaginatedResponse<ProjectListItem>> => {
  const merged: ListProjectsQuery = { ...query };
  if (options.locale) {
    merged.locale = options.locale;
  }

  return apiFetch<PaginatedResponse<ProjectListItem>>({
    path: `/projects${toSearchParams(merged)}`,
    ...catalogListFetch(),
  });
};

/**
 * Loads a published project. Returns null on 404.
 */
export const getProject = async (
  projectId: string,
  options: CatalogRequestOptions = {},
): Promise<ProjectDetail | null> => {
  try {
    return await apiFetch<ProjectDetail>({
      path: `/projects/${encodeURIComponent(projectId)}${localeQuery(options.locale)}`,
      ...catalogProjectFetch(projectId),
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
  options: CatalogRequestOptions = {},
): Promise<ApartmentDetail | null> => {
  try {
    return await apiFetch<ApartmentDetail>({
      path: `/apartments/${encodeURIComponent(apartmentId)}${localeQuery(options.locale)}`,
      ...catalogListFetch(),
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
export const listBuilders = (
  options: CatalogRequestOptions = {},
): Promise<BuilderSummary[]> => {
  return apiFetch<BuilderSummary[]>({
    path: `/builders${localeQuery(options.locale)}`,
    ...catalogListFetch(),
  });
};

/**
 * Loads a builder profile with published projects. Returns null on 404.
 */
export const getBuilder = async (
  builderId: string,
  options: CatalogRequestOptions = {},
): Promise<BuilderDetail | null> => {
  try {
    return await apiFetch<BuilderDetail>({
      path: `/builders/${encodeURIComponent(builderId)}${localeQuery(options.locale)}`,
      ...catalogListFetch(),
    });
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      return null;
    }
    throw error;
  }
};

/**
 * Loads a published building. Returns null on 404.
 * Pass `projectId` when known so the per-project cache tag is applied.
 */
export const getBuilding = async (
  buildingId: string,
  options: CatalogRequestOptions & { projectId?: string } = {},
): Promise<BuildingDetail | null> => {
  try {
    return await apiFetch<BuildingDetail>({
      path: `/buildings/${encodeURIComponent(buildingId)}${localeQuery(options.locale)}`,
      ...(options.projectId
        ? catalogProjectFetch(options.projectId)
        : catalogListFetch()),
    });
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      return null;
    }
    throw error;
  }
};

/**
 * Loads a published floor. Returns null on 404.
 * Pass `projectId` when known so the per-project cache tag is applied.
 */
export const getFloor = async (
  floorId: string,
  options: CatalogRequestOptions & { projectId?: string } = {},
): Promise<FloorDetail | null> => {
  try {
    return await apiFetch<FloorDetail>({
      path: `/floors/${encodeURIComponent(floorId)}${localeQuery(options.locale)}`,
      ...(options.projectId
        ? catalogProjectFetch(options.projectId)
        : catalogListFetch()),
    });
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      return null;
    }
    throw error;
  }
};

export { ApiError };
