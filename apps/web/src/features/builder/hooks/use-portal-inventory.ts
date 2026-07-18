"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BulkCreatePortalApartmentsRequest,
  CreatePortalBuildingRequest,
  CreatePortalFloorRequest,
  UpdatePortalApartmentRequest,
} from "@toonexpo/contracts";

import {
  bulkCreatePortalApartments,
  getPortalApartment,
  listPortalApartments,
  updatePortalApartment,
} from "@/features/builder/api/portal-apartments-api";
import { createPortalBuilding } from "@/features/builder/api/portal-buildings-api";
import { createPortalFloor } from "@/features/builder/api/portal-floors-api";
import {
  PORTAL_PROJECTS_QUERY_KEY,
  portalApartmentQueryKey,
  portalFloorApartmentsQueryKey,
  portalProjectQueryKey,
} from "@/features/builder/constants";

/**
 * Apartments on a floor.
 */
export const usePortalFloorApartmentsQuery = (floorId: string) =>
  useQuery({
    queryKey: portalFloorApartmentsQueryKey(floorId),
    queryFn: () => listPortalApartments(floorId),
    enabled: floorId.length > 0,
  });

/**
 * Single apartment detail.
 */
export const usePortalApartmentQuery = (id: string) =>
  useQuery({
    queryKey: portalApartmentQueryKey(id),
    queryFn: () => getPortalApartment(id),
    enabled: id.length > 0,
  });

const invalidateProject = (
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
) => {
  void queryClient.invalidateQueries({ queryKey: portalProjectQueryKey(projectId) });
  void queryClient.invalidateQueries({ queryKey: PORTAL_PROJECTS_QUERY_KEY });
};

/**
 * Creates a building under a project.
 */
export const useCreateBuildingMutation = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePortalBuildingRequest) =>
      createPortalBuilding(projectId, body),
    onSuccess: () => {
      invalidateProject(queryClient, projectId);
    },
  });
};

/**
 * Creates a floor under a building.
 */
export const useCreateFloorMutation = (
  projectId: string,
  buildingId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePortalFloorRequest) =>
      createPortalFloor(buildingId, body),
    onSuccess: () => {
      invalidateProject(queryClient, projectId);
    },
  });
};

/**
 * Bulk-creates apartments on a floor.
 */
export const useBulkCreateApartmentsMutation = (
  projectId: string,
  floorId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: BulkCreatePortalApartmentsRequest) =>
      bulkCreatePortalApartments(floorId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalFloorApartmentsQueryKey(floorId),
      });
      invalidateProject(queryClient, projectId);
    },
  });
};

/**
 * Patches an apartment.
 */
export const useUpdateApartmentMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdatePortalApartmentRequest) =>
      updatePortalApartment(id, body),
    onSuccess: (apartment) => {
      queryClient.setQueryData(portalApartmentQueryKey(id), apartment);
      void queryClient.invalidateQueries({
        queryKey: portalFloorApartmentsQueryKey(apartment.floorId),
      });
      invalidateProject(queryClient, apartment.projectId);
    },
  });
};
