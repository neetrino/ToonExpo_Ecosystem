"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateBoothAssignmentRequest,
  CreateBoothRequest,
  UpdateBoothAssignmentRequest,
  UpdateBoothRequest,
} from "@toonexpo/contracts";
import { useLocale } from "next-intl";

import {
  createAdminBooth,
  createAdminBoothAssignment,
  deleteAdminBooth,
  deleteAdminBoothAssignment,
  listAdminBoothAssignments,
  listAdminVenueMapBooths,
  updateAdminBooth,
  updateAdminBoothAssignment,
} from "@/features/exhibition/api/admin-exhibition-api";
import {
  getPublicVenueMapBooths,
  searchPublicVenueMapBooths,
} from "@/features/exhibition/api/public-exhibition-api";
import {
  EXPO_SEARCH_MIN_LENGTH,
  adminBoothAssignmentsQueryKey,
  adminVenueMapBoothsQueryKey,
  publicVenueMapBoothsQueryKey,
  publicVenueMapSearchQueryKey,
} from "@/features/exhibition/constants";

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

export const useAdminVenueMapBoothsQuery = (mapId: string) =>
  useQuery({
    queryKey: adminVenueMapBoothsQueryKey(mapId),
    queryFn: () => listAdminVenueMapBooths(mapId),
    enabled: mapId.length > 0,
  });

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assignmentId,
      body,
    }: {
      assignmentId: string;
      body: UpdateBoothAssignmentRequest;
    }) => updateAdminBoothAssignment(boothId, assignmentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminBoothAssignmentsQueryKey(boothId),
      });
    },
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
