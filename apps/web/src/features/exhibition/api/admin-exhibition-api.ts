import type {
  BoothAssignmentListResponse,
  BoothAssignmentSummary,
  BoothListResponse,
  BoothSummary,
  CheckInSummaryResponse,
  CreateBoothAssignmentRequest,
  CreateBoothRequest,
  CreateEventRequest,
  CreateVenueMapRequest,
  EventListResponse,
  EventSummary,
  RouteGraphPayload,
  RouteGraphResponse,
  UpdateBoothAssignmentRequest,
  UpdateBoothRequest,
  UpdateEventRequest,
  UpdateVenueMapRequest,
  VenueMapListResponse,
  VenueMapSummary,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

const jsonCredentials = {
  credentials: "include" as const,
  headers: { "Content-Type": "application/json" },
};

export type AdminExhibitionRequestOptions = {
  cookieHeader?: string | undefined;
};

const withCookie = (
  options: Parameters<typeof apiFetch>[0],
  cookieHeader?: string,
): Parameters<typeof apiFetch>[0] => {
  if (!cookieHeader) {
    return options;
  }
  return {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> | undefined),
      Cookie: cookieHeader,
    },
  };
};

export const listAdminEvents = (
  options: AdminExhibitionRequestOptions = {},
): Promise<EventListResponse> =>
  apiFetch<EventListResponse>(
    withCookie(
      {
        path: "/admin/events",
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );

export const getAdminEvent = (
  id: string,
  options: AdminExhibitionRequestOptions = {},
): Promise<EventSummary> =>
  apiFetch<EventSummary>(
    withCookie(
      {
        path: `/admin/events/${encodeURIComponent(id)}`,
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );

export const createAdminEvent = (
  body: CreateEventRequest,
): Promise<EventSummary> =>
  apiFetch<EventSummary>({
    path: "/admin/events",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateAdminEvent = (
  id: string,
  body: UpdateEventRequest,
): Promise<EventSummary> =>
  apiFetch<EventSummary>({
    path: `/admin/events/${encodeURIComponent(id)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const getAdminEventCheckInSummary = (
  id: string,
  options: AdminExhibitionRequestOptions = {},
): Promise<CheckInSummaryResponse> =>
  apiFetch<CheckInSummaryResponse>(
    withCookie(
      {
        path: `/admin/events/${encodeURIComponent(id)}/check-in-summary`,
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );

export const listAdminEventVenueMaps = (
  eventId: string,
  options: AdminExhibitionRequestOptions = {},
): Promise<VenueMapListResponse> =>
  apiFetch<VenueMapListResponse>(
    withCookie(
      {
        path: `/admin/events/${encodeURIComponent(eventId)}/venue-maps`,
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );

export const createAdminVenueMap = (
  eventId: string,
  body: CreateVenueMapRequest,
): Promise<VenueMapSummary> =>
  apiFetch<VenueMapSummary>({
    path: `/admin/events/${encodeURIComponent(eventId)}/venue-maps`,
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateAdminVenueMap = (
  id: string,
  body: UpdateVenueMapRequest,
): Promise<VenueMapSummary> =>
  apiFetch<VenueMapSummary>({
    path: `/admin/venue-maps/${encodeURIComponent(id)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteAdminVenueMap = (id: string): Promise<void> =>
  apiFetch<void>({
    path: `/admin/venue-maps/${encodeURIComponent(id)}`,
    method: "DELETE",
    credentials: "include",
  });

export const listAdminVenueMapBooths = (
  mapId: string,
  options: AdminExhibitionRequestOptions = {},
): Promise<BoothListResponse> =>
  apiFetch<BoothListResponse>(
    withCookie(
      {
        path: `/admin/venue-maps/${encodeURIComponent(mapId)}/booths`,
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );

export const createAdminBooth = (
  mapId: string,
  body: CreateBoothRequest,
): Promise<BoothSummary> =>
  apiFetch<BoothSummary>({
    path: `/admin/venue-maps/${encodeURIComponent(mapId)}/booths`,
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateAdminBooth = (
  id: string,
  body: UpdateBoothRequest,
): Promise<BoothSummary> =>
  apiFetch<BoothSummary>({
    path: `/admin/booths/${encodeURIComponent(id)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteAdminBooth = (id: string): Promise<void> =>
  apiFetch<void>({
    path: `/admin/booths/${encodeURIComponent(id)}`,
    method: "DELETE",
    credentials: "include",
  });

export const listAdminBoothAssignments = (
  boothId: string,
  options: AdminExhibitionRequestOptions = {},
): Promise<BoothAssignmentListResponse> =>
  apiFetch<BoothAssignmentListResponse>(
    withCookie(
      {
        path: `/admin/booths/${encodeURIComponent(boothId)}/assignments`,
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );

export const createAdminBoothAssignment = (
  boothId: string,
  body: CreateBoothAssignmentRequest,
): Promise<BoothAssignmentSummary> =>
  apiFetch<BoothAssignmentSummary>({
    path: `/admin/booths/${encodeURIComponent(boothId)}/assignments`,
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateAdminBoothAssignment = (
  boothId: string,
  assignmentId: string,
  body: UpdateBoothAssignmentRequest,
): Promise<BoothAssignmentSummary> =>
  apiFetch<BoothAssignmentSummary>({
    path: `/admin/booths/${encodeURIComponent(boothId)}/assignments/${encodeURIComponent(assignmentId)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteAdminBoothAssignment = (
  boothId: string,
  assignmentId: string,
): Promise<void> =>
  apiFetch<void>({
    path: `/admin/booths/${encodeURIComponent(boothId)}/assignments/${encodeURIComponent(assignmentId)}`,
    method: "DELETE",
    credentials: "include",
  });

export const getAdminVenueMapRouteGraph = (
  mapId: string,
  options: AdminExhibitionRequestOptions = {},
): Promise<RouteGraphResponse> =>
  apiFetch<RouteGraphResponse>(
    withCookie(
      {
        path: `/admin/venue-maps/${encodeURIComponent(mapId)}/route-graph`,
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );

export const replaceAdminVenueMapRouteGraph = (
  mapId: string,
  body: RouteGraphPayload,
): Promise<RouteGraphResponse> =>
  apiFetch<RouteGraphResponse>({
    path: `/admin/venue-maps/${encodeURIComponent(mapId)}/route-graph`,
    method: "PUT",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });
