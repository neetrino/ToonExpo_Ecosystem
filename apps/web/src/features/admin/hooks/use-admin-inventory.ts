'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  BulkCreatePortalApartmentsRequest,
  CreatePortalBuildingRequest,
  CreatePortalFloorRequest,
  UpdatePortalBuildingRequest,
  UpdatePortalFloorRequest,
} from '@toonexpo/contracts';

import type { ListAdminProjectsParams } from '@/features/admin/api/admin-companies-api';
import {
  getAdminBuildingInventoryGlance,
  listAdminApartments,
  listAdminBuildings,
  listAdminFloors,
} from '@/features/admin/api/admin-inventory-api';
import {
  ADMIN_APARTMENTS_QUERY_KEY,
  ADMIN_BUILDINGS_QUERY_KEY,
  ADMIN_FLOORS_QUERY_KEY,
  adminApartmentsQueryKey,
  adminBuildingInventoryGlanceQueryKey,
  adminBuildingsQueryKey,
  adminFloorsQueryKey,
} from '@/features/admin/constants';
import {
  bulkCreatePortalApartments,
  listPortalApartments,
} from '@/features/builder/api/portal-apartments-api';
import {
  createPortalBuilding,
  updatePortalBuilding,
} from '@/features/builder/api/portal-buildings-api';
import {
  createPortalFloor,
  listPortalFloors,
  updatePortalFloor,
} from '@/features/builder/api/portal-floors-api';
import type { CatalogScope } from '@/features/builder/catalog-scope';

const toListParams = (
  page: number,
  pageSize: number,
  companyId?: string,
  buildingId?: string,
): ListAdminProjectsParams => ({
  page,
  pageSize,
  ...(companyId ? { companyId } : {}),
  ...(buildingId ? { buildingId } : {}),
});

const adminCatalogScope = (companyId: string): CatalogScope => ({
  mode: 'admin',
  companyId,
});

/**
 * Paginated buildings list for the admin buildings hub.
 */
export const useAdminBuildingsQuery = (page: number, pageSize: number, companyId?: string) => {
  const params = toListParams(page, pageSize, companyId);
  return useQuery({
    queryKey: adminBuildingsQueryKey(params),
    queryFn: () => listAdminBuildings(params),
  });
};

/**
 * Paginated floors list for the admin floors hub.
 */
export const useAdminFloorsQuery = (
  page: number,
  pageSize: number,
  companyId?: string,
  buildingId?: string,
) => {
  const params = toListParams(page, pageSize, companyId, buildingId);
  return useQuery({
    queryKey: adminFloorsQueryKey(params),
    queryFn: () => listAdminFloors(params),
  });
};

/**
 * Paginated apartments list for the admin apartments hub.
 */
export const useAdminApartmentsQuery = (
  page: number,
  pageSize: number,
  companyId?: string,
  buildingId?: string,
) => {
  const params = toListParams(page, pageSize, companyId, buildingId);
  return useQuery({
    queryKey: adminApartmentsQueryKey(params),
    queryFn: () => listAdminApartments(params),
  });
};

/**
 * Building inventory glance for the admin Buildings hub sheet.
 */
export const useAdminBuildingInventoryGlanceQuery = (buildingId: string) =>
  useQuery({
    queryKey: adminBuildingInventoryGlanceQueryKey(buildingId),
    queryFn: () => getAdminBuildingInventoryGlance(buildingId),
    enabled: buildingId.length > 0,
  });

/**
 * Floors under a building (admin catalog scope) for create-apartment picker.
 */
export const useAdminBuildingFloorsQuery = (companyId: string, buildingId: string) =>
  useQuery({
    queryKey: ['admin', 'buildings', buildingId, 'floors', companyId] as const,
    queryFn: () => listPortalFloors(buildingId, { scope: adminCatalogScope(companyId) }),
    enabled: companyId.length > 0 && buildingId.length > 0,
  });

/**
 * Floor apartments via admin catalog scope (nested floor sheet).
 */
export const useAdminFloorApartmentsQuery = (companyId: string, floorId: string) =>
  useQuery({
    queryKey: ['admin', 'floors', floorId, 'apartments', companyId] as const,
    queryFn: () => listPortalApartments(floorId, { scope: adminCatalogScope(companyId) }),
    enabled: companyId.length > 0 && floorId.length > 0,
  });

const invalidateAdminInventory = (queryClient: ReturnType<typeof useQueryClient>): void => {
  void queryClient.invalidateQueries({ queryKey: ADMIN_BUILDINGS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: ADMIN_FLOORS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: ADMIN_APARTMENTS_QUERY_KEY });
};

/**
 * Creates a building under a project (admin catalog).
 */
export const useAdminCreateBuildingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      companyId: string;
      projectId: string;
      body: CreatePortalBuildingRequest;
    }) =>
      createPortalBuilding(input.projectId, input.body, {
        scope: adminCatalogScope(input.companyId),
      }),
    onSuccess: () => {
      invalidateAdminInventory(queryClient);
    },
  });
};

/**
 * Creates a floor under a building (admin catalog).
 */
export const useAdminCreateFloorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      companyId: string;
      buildingId: string;
      body: CreatePortalFloorRequest;
    }) =>
      createPortalFloor(input.buildingId, input.body, {
        scope: adminCatalogScope(input.companyId),
      }),
    onSuccess: (_floor, input) => {
      invalidateAdminInventory(queryClient);
      void queryClient.invalidateQueries({
        queryKey: adminBuildingInventoryGlanceQueryKey(input.buildingId),
      });
    },
  });
};

/**
 * Bulk-creates apartments on a floor (admin catalog).
 */
export const useAdminBulkCreateApartmentsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      companyId: string;
      floorId: string;
      body: BulkCreatePortalApartmentsRequest;
    }) =>
      bulkCreatePortalApartments(input.floorId, input.body, {
        scope: adminCatalogScope(input.companyId),
      }),
    onSuccess: () => {
      invalidateAdminInventory(queryClient);
    },
  });
};

/**
 * Updates building fields (admin catalog) — e.g. floorsCount.
 */
export const useAdminUpdateBuildingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      companyId: string;
      buildingId: string;
      body: UpdatePortalBuildingRequest;
    }) =>
      updatePortalBuilding(input.buildingId, input.body, {
        scope: adminCatalogScope(input.companyId),
      }),
    onSuccess: (_building, input) => {
      invalidateAdminInventory(queryClient);
      void queryClient.invalidateQueries({
        queryKey: adminBuildingInventoryGlanceQueryKey(input.buildingId),
      });
    },
  });
};

/**
 * Updates a floor (admin catalog) — e.g. floorplan media.
 */
export const useAdminUpdateFloorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      companyId: string;
      buildingId: string;
      floorId: string;
      body: UpdatePortalFloorRequest;
    }) =>
      updatePortalFloor(input.floorId, input.body, {
        scope: adminCatalogScope(input.companyId),
      }),
    onSuccess: (_floor, input) => {
      invalidateAdminInventory(queryClient);
      void queryClient.invalidateQueries({
        queryKey: adminBuildingInventoryGlanceQueryKey(input.buildingId),
      });
    },
  });
};
