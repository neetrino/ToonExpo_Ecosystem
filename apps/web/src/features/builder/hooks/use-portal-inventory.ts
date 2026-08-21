'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  BulkCreatePortalApartmentsRequest,
  CreatePortalBuildingRequest,
  CreatePortalFloorRequest,
  UpdatePortalApartmentRequest,
  UpdatePortalBuildingRequest,
  UpdatePortalFloorRequest,
  UpdatePortalPublicationRequest,
} from '@toonexpo/contracts';
import { ADMIN_APARTMENTS_QUERY_KEY } from '@/features/admin/constants';
import {
  bulkCreatePortalApartments,
  deletePortalApartment,
  getPortalApartment,
  listPortalApartments,
  updatePortalApartment,
  updatePortalApartmentPublication,
} from '@/features/builder/api/portal-apartments-api';
import {
  createPortalBuilding,
  updatePortalBuilding,
  updatePortalBuildingPriceOnRequest,
  updatePortalBuildingPublication,
} from '@/features/builder/api/portal-buildings-api';
import { createPortalFloor, updatePortalFloor } from '@/features/builder/api/portal-floors-api';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import {
  PORTAL_INVENTORY_APARTMENTS_QUERY_KEY,
  PORTAL_INVENTORY_BUILDINGS_QUERY_KEY,
  PORTAL_INVENTORY_FLOORS_QUERY_KEY,
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
  void queryClient.invalidateQueries({ queryKey: PORTAL_INVENTORY_BUILDINGS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: PORTAL_INVENTORY_FLOORS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: PORTAL_INVENTORY_APARTMENTS_QUERY_KEY });
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
 * Changes building publication status.
 */
export const useUpdateBuildingPublicationMutation = (projectId: string, buildingId: string) => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (body: UpdatePortalPublicationRequest) =>
      updatePortalBuildingPublication(buildingId, body, { scope }),
    onSuccess: () => {
      invalidateProject(queryClient, projectId);
    },
  });
};

/**
 * Toggles public price-on-request for a building (builder company_admin).
 */
export const useUpdateBuildingPriceOnRequestMutation = (projectId: string, buildingId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => updatePortalBuildingPriceOnRequest(buildingId, { enabled }),
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
      void queryClient.invalidateQueries({ queryKey: ADMIN_APARTMENTS_QUERY_KEY });
      invalidateProject(queryClient, apartment.projectId);
    },
  });
};

/**
 * Changes apartment publication status (and publishes parent building/floor when going live).
 */
export const useUpdateApartmentPublicationMutation = (id: string) => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (body: UpdatePortalPublicationRequest) =>
      updatePortalApartmentPublication(id, body, { scope }),
    onSuccess: (apartment) => {
      queryClient.setQueryData([...portalApartmentQueryKey(id), scope], apartment);
      void queryClient.invalidateQueries({
        queryKey: portalFloorApartmentsQueryKey(apartment.floorId),
      });
      void queryClient.invalidateQueries({ queryKey: ADMIN_APARTMENTS_QUERY_KEY });
      invalidateProject(queryClient, apartment.projectId);
    },
  });
};

type DeletePortalApartmentInput = {
  id: string;
  floorId: string;
  projectId: string;
};

/**
 * Deletes a draft apartment.
 */
export const useDeletePortalApartmentMutation = () => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (input: DeletePortalApartmentInput) => deletePortalApartment(input.id, { scope }),
    onSuccess: (_void, input) => {
      void queryClient.invalidateQueries({
        queryKey: portalFloorApartmentsQueryKey(input.floorId),
      });
      void queryClient.invalidateQueries({ queryKey: ADMIN_APARTMENTS_QUERY_KEY });
      invalidateProject(queryClient, input.projectId);
    },
  });
};
