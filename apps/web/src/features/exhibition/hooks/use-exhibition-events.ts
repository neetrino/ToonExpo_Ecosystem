"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateEventRequest,
  CreateVenueMapRequest,
  UpdateEventRequest,
  UpdateVenueMapRequest,
} from "@toonexpo/contracts";

import {
  createAdminEvent,
  createAdminVenueMap,
  deleteAdminVenueMap,
  getAdminEvent,
  listAdminEvents,
  listAdminEventVenueMaps,
  updateAdminEvent,
  updateAdminVenueMap,
} from "@/features/exhibition/api/admin-exhibition-api";
import { getPublicCurrentEvent } from "@/features/exhibition/api/public-exhibition-api";
import {
  ADMIN_EVENTS_QUERY_KEY,
  adminEventQueryKey,
  adminEventVenueMapsQueryKey,
  publicCurrentEventQueryKey,
} from "@/features/exhibition/constants";

export const usePublicCurrentEventQuery = () =>
  useQuery({
    queryKey: publicCurrentEventQueryKey(),
    queryFn: () => getPublicCurrentEvent(),
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

export const useAdminEventVenueMapsQuery = (eventId: string) =>
  useQuery({
    queryKey: adminEventVenueMapsQueryKey(eventId),
    queryFn: () => listAdminEventVenueMaps(eventId),
    enabled: eventId.length > 0,
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
