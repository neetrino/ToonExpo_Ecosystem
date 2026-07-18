"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateBoothAssignmentRequest,
  CreateBoothRequest,
  CreateEventRequest,
  CreateVenueMapRequest,
  RouteGraphPayload,
  UpdateBoothAssignmentRequest,
  UpdateBoothRequest,
  UpdateEventRequest,
  UpdateVenueMapRequest,
} from "@toonexpo/contracts";
import { useLocale } from "next-intl";

import {
  createAdminBooth,
  createAdminBoothAssignment,
  createAdminEvent,
  createAdminVenueMap,
  deleteAdminBooth,
  deleteAdminBoothAssignment,
  deleteAdminVenueMap,
  getAdminEvent,
  getAdminEventCheckInSummary,
  getAdminVenueMapRouteGraph,
  listAdminBoothAssignments,
  listAdminEvents,
  listAdminEventVenueMaps,
  listAdminVenueMapBooths,
  replaceAdminVenueMapRouteGraph,
  updateAdminBooth,
  updateAdminBoothAssignment,
  updateAdminEvent,
  updateAdminVenueMap,
} from "@/features/exhibition/api/admin-exhibition-api";
import {
  getPublicCurrentEvent,
  getPublicVenueMapBooths,
  getPublicVenueMapEntranceNodes,
  getPublicVenueMapRoute,
  searchPublicVenueMapBooths,
} from "@/features/exhibition/api/public-exhibition-api";
import {
  ADMIN_EVENTS_QUERY_KEY,
  EXPO_SEARCH_MIN_LENGTH,
  adminBoothAssignmentsQueryKey,
  adminEventCheckInSummaryQueryKey,
  adminEventQueryKey,
  adminEventVenueMapsQueryKey,
  adminVenueMapBoothsQueryKey,
  adminVenueMapRouteGraphQueryKey,
  publicCurrentEventQueryKey,
  publicVenueMapBoothsQueryKey,
  publicVenueMapEntranceNodesQueryKey,
  publicVenueMapSearchQueryKey,
} from "@/features/exhibition/constants";

export const usePublicCurrentEventQuery = () =>
  useQuery({
    queryKey: publicCurrentEventQueryKey(),
    queryFn: () => getPublicCurrentEvent(),
  });

export const usePublicVenueMapBoothsQuery = (mapId: string) => {
  const locale = useLocale();
  return useQuery({
    queryKey: publicVenueMapBoothsQueryKey(mapId, locale),
    queryFn: () => getPublicVenueMapBooths(mapId, locale),
    enabled: mapId.length > 0,
  });
};

export const usePublicVenueMapSearchQuery = (mapId: string, query: string) => {
  const locale = useLocale();
  const trimmed = query.trim();
  return useQuery({
    queryKey: publicVenueMapSearchQueryKey(mapId, trimmed, locale),
    queryFn: () => searchPublicVenueMapBooths(mapId, trimmed, locale),
    enabled: mapId.length > 0 && trimmed.length >= EXPO_SEARCH_MIN_LENGTH,
  });
};

export const usePublicVenueMapEntranceNodesQuery = (mapId: string) =>
  useQuery({
    queryKey: publicVenueMapEntranceNodesQueryKey(mapId),
    queryFn: () => getPublicVenueMapEntranceNodes(mapId),
    enabled: mapId.length > 0,
  });

export const usePublicVenueMapRouteQuery = (
  mapId: string,
  fromNodeId: string | null,
  toBoothId: string | null,
  enabled: boolean,
) =>
  useQuery({
    queryKey: [
      ...publicVenueMapBoothsQueryKey(mapId, "route"),
      fromNodeId,
      toBoothId,
    ],
    queryFn: () =>
      getPublicVenueMapRoute(mapId, fromNodeId ?? "", toBoothId ?? ""),
    enabled:
      enabled &&
      mapId.length > 0 &&
      Boolean(fromNodeId) &&
      Boolean(toBoothId),
  });

export const useAdminEventsQuery = () =>
  useQuery({
    queryKey: ADMIN_EVENTS_QUERY_KEY,
    queryFn: () => listAdminEvents(),
  });

export const useAdminEventQuery = (id: string) =>
  useQuery({
    queryKey: adminEventQueryKey(id),
    queryFn: () => getAdminEvent(id),
    enabled: id.length > 0,
  });

export const useAdminEventCheckInSummaryQuery = (id: string) =>
  useQuery({
    queryKey: adminEventCheckInSummaryQueryKey(id),
    queryFn: () => getAdminEventCheckInSummary(id),
    enabled: id.length > 0,
  });

export const useAdminEventVenueMapsQuery = (eventId: string) =>
  useQuery({
    queryKey: adminEventVenueMapsQueryKey(eventId),
    queryFn: () => listAdminEventVenueMaps(eventId),
    enabled: eventId.length > 0,
  });

export const useAdminVenueMapBoothsQuery = (mapId: string) =>
  useQuery({
    queryKey: adminVenueMapBoothsQueryKey(mapId),
    queryFn: () => listAdminVenueMapBooths(mapId),
    enabled: mapId.length > 0,
  });

export const useAdminVenueMapRouteGraphQuery = (mapId: string) =>
  useQuery({
    queryKey: adminVenueMapRouteGraphQueryKey(mapId),
    queryFn: () => getAdminVenueMapRouteGraph(mapId),
    enabled: mapId.length > 0,
  });

export const useCreateAdminEventMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEventRequest) => createAdminEvent(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_EVENTS_QUERY_KEY });
    },
  });
};

export const useUpdateAdminEventMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateEventRequest) => updateAdminEvent(id, body),
    onSuccess: (event) => {
      queryClient.setQueryData(adminEventQueryKey(id), event);
      void queryClient.invalidateQueries({ queryKey: ADMIN_EVENTS_QUERY_KEY });
    },
  });
};

export const useCreateAdminVenueMapMutation = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateVenueMapRequest) =>
      createAdminVenueMap(eventId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminEventVenueMapsQueryKey(eventId),
      });
    },
  });
};

export const useUpdateAdminVenueMapMutation = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateVenueMapRequest;
    }) => updateAdminVenueMap(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminEventVenueMapsQueryKey(eventId),
      });
    },
  });
};

export const useDeleteAdminVenueMapMutation = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminVenueMap(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminEventVenueMapsQueryKey(eventId),
      });
    },
  });
};

export const useCreateAdminBoothMutation = (mapId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBoothRequest) => createAdminBooth(mapId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminVenueMapBoothsQueryKey(mapId),
      });
    },
  });
};

export const useUpdateAdminBoothMutation = (mapId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateBoothRequest;
    }) => updateAdminBooth(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminVenueMapBoothsQueryKey(mapId),
      });
    },
  });
};

export const useDeleteAdminBoothMutation = (mapId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminBooth(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminVenueMapBoothsQueryKey(mapId),
      });
    },
  });
};

export const useAdminBoothAssignmentsQuery = (boothId: string) =>
  useQuery({
    queryKey: adminBoothAssignmentsQueryKey(boothId),
    queryFn: () => listAdminBoothAssignments(boothId),
    enabled: boothId.length > 0,
  });

export const useCreateAdminBoothAssignmentMutation = (boothId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBoothAssignmentRequest) =>
      createAdminBoothAssignment(boothId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminBoothAssignmentsQueryKey(boothId),
      });
    },
  });
};

export const useUpdateAdminBoothAssignmentMutation = (boothId: string) => {
  return useMutation({
    mutationFn: ({
      assignmentId,
      body,
    }: {
      assignmentId: string;
      body: UpdateBoothAssignmentRequest;
    }) => updateAdminBoothAssignment(boothId, assignmentId, body),
  });
};

export const useDeleteAdminBoothAssignmentMutation = (boothId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) =>
      deleteAdminBoothAssignment(boothId, assignmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminBoothAssignmentsQueryKey(boothId),
      });
    },
  });
};

export const useReplaceAdminRouteGraphMutation = (mapId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RouteGraphPayload) =>
      replaceAdminVenueMapRouteGraph(mapId, body),
    onSuccess: (graph) => {
      queryClient.setQueryData(adminVenueMapRouteGraphQueryKey(mapId), graph);
    },
  });
};
