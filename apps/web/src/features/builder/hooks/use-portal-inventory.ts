'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  BulkCreatePortalApartmentsRequest,
  CreatePortalBuildingRequest,
  CreatePortalFloorRequest,
  UpdatePortalApartmentRequest,
  UpdatePortalBuildingRequest,
  UpdatePortalFloorRequest,
} from '@toonexpo/contracts';

import {
  bulkCreatePortalApartments,
  getPortalApartment,
  listPortalApartments,
  updatePortalApartment,
} from '@/features/builder/api/portal-apartments-api';
import {
  createPortalBuilding,
  updatePortalBuilding,
} from '@/features/builder/api/portal-buildings-api';
import { createPortalFloor, updatePortalFloor } from '@/features/builder/api/portal-floors-api';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import {
  PORTAL_PROJECTS_QUERY_KEY,
  portalApartmentQueryKey,
  portalFloorApartmentsQueryKey,
  portalProjectQueryKey,
} from '@/features/builder/constants';

/**
 * Apartments on a floor.
 */
export const usePortalFloorApartmentsQuery = (floorId: string) => {
  const scope = useCatalogScope();
  return useQuery({
    queryKey: [...portalFloorApartmentsQueryKey(floorId), scope],
    queryFn: () => listPortalApartments(floorId, { scope }),
    enabled: floorId.length > 0,
  });
};

/**
 * Single apartment detail.
 */
export const usePortalApartmentQuery = (id: string) => {
  const scope = useCatalogScope();
  return useQuery({
    queryKey: [...portalApartmentQueryKey(id), scope],
    queryFn: () => getPortalApartment(id, { scope }),
    enabled: id.length > 0,
  });
};

const invalidateProject = (queryClient: ReturnType<typeof useQueryClient>, projectId: string) => {
  void queryClient.invalidateQueries({ queryKey: portalProjectQueryKey(projectId) });
  void queryClient.invalidateQueries({ queryKey: PORTAL_PROJECTS_QUERY_KEY });
};

/**
 * Creates a building under a project.
 */
export const useCreateBuildingMutation = (projectId: string) => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (body: CreatePortalBuildingRequest) =>
      createPortalBuilding(projectId, body, { scope }),
    onSuccess: () => {
      invalidateProject(queryClient, projectId);
    },
  });
};

/**
 * Creates a floor under a building.
 */
export const useCreateFloorMutation = (projectId: string, buildingId: string) => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (body: CreatePortalFloorRequest) => createPortalFloor(buildingId, body, { scope }),
    onSuccess: () => {
      invalidateProject(queryClient, projectId);
    },
  });
};

/**
 * Bulk-creates apartments on a floor.
 */
export const useBulkCreateApartmentsMutation = (projectId: string, floorId: string) => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (body: BulkCreatePortalApartmentsRequest) =>
      bulkCreatePortalApartments(floorId, body, { scope }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalFloorApartmentsQueryKey(floorId),
      });
      invalidateProject(queryClient, projectId);
    },
  });
};

/**
 * Patches a building.
 */
export const useUpdateBuildingMutation = (projectId: string, buildingId: string) => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (body: UpdatePortalBuildingRequest) =>
      updatePortalBuilding(buildingId, body, { scope }),
    onSuccess: () => {
      invalidateProject(queryClient, projectId);
    },
  });
};

/**
 * Patches a floor.
 */
export const useUpdateFloorMutation = (projectId: string, floorId: string) => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (body: UpdatePortalFloorRequest) => updatePortalFloor(floorId, body, { scope }),
    onSuccess: () => {
      invalidateProject(queryClient, projectId);
    },
  });
};

/**
 * Patches an apartment.
 */
export const useUpdateApartmentMutation = (id: string) => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (body: UpdatePortalApartmentRequest) => updatePortalApartment(id, body, { scope }),
    onSuccess: (apartment) => {
      queryClient.setQueryData([...portalApartmentQueryKey(id), scope], apartment);
      void queryClient.invalidateQueries({
        queryKey: portalFloorApartmentsQueryKey(apartment.floorId),
      });
      invalidateProject(queryClient, apartment.projectId);
    },
  });
};
