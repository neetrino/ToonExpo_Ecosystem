'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  BulkCreatePortalApartmentsRequest,
  CreatePortalBuildingRequest,
  CreatePortalFloorRequest,
  UpdatePortalBuildingRequest,
  UpdatePortalFloorRequest,
} from '@toonexpo/contracts';

import type { ListAdminInventoryParams } from '@/features/admin/api/admin-companies-api';
import {
  getAdminBuildingInventoryGlance,
  listAdminApartments,
  listAdminBuildings,
  listAdminFloors,
  setAdminApartmentFeaturedOnHome,
} from '@/features/admin/api/admin-inventory-api';
import {
  ADMIN_APARTMENTS_QUERY_KEY,
  ADMIN_BUILDINGS_QUERY_KEY,
  ADMIN_FLOORS_QUERY_KEY,
  ADMIN_PROJECTS_QUERY_KEY,
  adminApartmentsQueryKey,
  adminBuildingInventoryGlanceQueryKey,
  adminBuildingsQueryKey,
  adminFloorsQueryKey,
} from '@/features/admin/constants';
import {
  isPlatformInventoryScope,
  PLATFORM_INVENTORY_SHEET_SCOPE,
  toCatalogMutationScope,
  type InventorySheetScope,
} from '@/features/admin/inventory-sheet-scope';
import {
  bulkCreatePortalApartments,
  listPortalApartments,
} from '@/features/builder/api/portal-apartments-api';
import {
  createPortalBuilding,
  deletePortalBuilding,
  updatePortalBuilding,
} from '@/features/builder/api/portal-buildings-api';
import {
  createPortalFloor,
  deletePortalFloor,
  listPortalFloors,
  updatePortalFloor,
} from '@/features/builder/api/portal-floors-api';
import { getPortalBuildingInventoryGlance } from '@/features/builder/api/portal-inventory-api';
import type { CatalogScope } from '@/features/builder/catalog-scope';
import {
  PORTAL_INVENTORY_APARTMENTS_QUERY_KEY,
  PORTAL_INVENTORY_BUILDINGS_QUERY_KEY,
  PORTAL_INVENTORY_FLOORS_QUERY_KEY,
  PORTAL_PROJECTS_QUERY_KEY,
} from '@/features/builder/constants';

const toListParams = (
  page: number,
  pageSize: number,
  companyId?: string | readonly string[],
  buildingId?: string | readonly string[],
  projectId?: string,
  search?: string,
  floorId?: string | readonly string[],
): ListAdminInventoryParams => ({
  page,
  pageSize,
  ...(companyId && (Array.isArray(companyId) ? companyId.length > 0 : companyId)
    ? { companyId }
    : {}),
  ...(buildingId && (Array.isArray(buildingId) ? buildingId.length > 0 : buildingId)
    ? { buildingId }
    : {}),
  ...(projectId ? { projectId } : {}),
  ...(floorId && (Array.isArray(floorId) ? floorId.length > 0 : floorId) ? { floorId } : {}),
  ...(search ? { search } : {}),
});

const adminCatalogScope = (companyId: string): CatalogScope => ({
  mode: 'admin',
  companyId,
});

/**
 * Paginated buildings list for the admin buildings hub.
 */
export const useAdminBuildingsQuery = (
  page: number,
  pageSize: number,
  companyId?: string | readonly string[],
  projectId?: string,
  options?: { enabled?: boolean; search?: string },
) => {
  const params = toListParams(
    page,
    pageSize,
    companyId,
    undefined,
    projectId,
    options?.search,
  );
  return useQuery({
    queryKey: adminBuildingsQueryKey(params),
    queryFn: () => listAdminBuildings(params),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
  });
};

/**
 * Paginated floors list for the admin floors hub.
 */
export const useAdminFloorsQuery = (
  page: number,
  pageSize: number,
  companyId?: string | readonly string[],
  buildingId?: string | readonly string[],
  search?: string,
  options?: { enabled?: boolean },
) => {
  const params = toListParams(page, pageSize, companyId, buildingId, undefined, search);
  return useQuery({
    queryKey: adminFloorsQueryKey(params),
    queryFn: () => listAdminFloors(params),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
  });
};

/**
 * Paginated apartments list for the admin apartments hub.
 */
export const useAdminApartmentsQuery = (
  page: number,
  pageSize: number,
  companyId?: string | readonly string[],
  buildingId?: string | readonly string[],
  search?: string,
  floorId?: string | readonly string[],
) => {
  const params = toListParams(page, pageSize, companyId, buildingId, undefined, search, floorId);
  return useQuery({
    queryKey: adminApartmentsQueryKey(params),
    queryFn: () => listAdminApartments(params),
    placeholderData: keepPreviousData,
  });
};

/**
 * Building inventory glance for Buildings hub / nested sheets.
 */
export const useAdminBuildingInventoryGlanceQuery = (
  buildingId: string,
  sheetScope: InventorySheetScope = PLATFORM_INVENTORY_SHEET_SCOPE,
) =>
  useQuery({
    queryKey: [...adminBuildingInventoryGlanceQueryKey(buildingId), sheetScope],
    queryFn: () => {
      if (!isPlatformInventoryScope(sheetScope) && sheetScope.mode === 'portal') {
        return getPortalBuildingInventoryGlance(buildingId, { scope: sheetScope });
      }
      return getAdminBuildingInventoryGlance(buildingId);
    },
    enabled: buildingId.length > 0,
  });

/**
 * Floors under a building (catalog scope) for create-apartment picker.
 */
export const useAdminBuildingFloorsQuery = (
  companyId: string,
  buildingId: string,
  sheetScope: InventorySheetScope = PLATFORM_INVENTORY_SHEET_SCOPE,
) => {
  const scope = toCatalogMutationScope(sheetScope, companyId);
  return useQuery({
    queryKey: ['admin', 'buildings', buildingId, 'floors', scope] as const,
    queryFn: () => listPortalFloors(buildingId, { scope }),
    enabled: buildingId.length > 0 && (scope.mode === 'portal' || companyId.length > 0),
  });
};

/**
 * Floor apartments via catalog scope (nested floor sheet).
 */
export const useAdminFloorApartmentsQuery = (
  companyId: string,
  floorId: string,
  sheetScope: InventorySheetScope = PLATFORM_INVENTORY_SHEET_SCOPE,
) => {
  const scope = toCatalogMutationScope(sheetScope, companyId);
  return useQuery({
    queryKey: ['admin', 'floors', floorId, 'apartments', scope] as const,
    queryFn: () => listPortalApartments(floorId, { scope }),
    enabled: floorId.length > 0 && (scope.mode === 'portal' || companyId.length > 0),
  });
};
const invalidateAdminInventory = (queryClient: ReturnType<typeof useQueryClient>): void => {
  void queryClient.invalidateQueries({ queryKey: ADMIN_BUILDINGS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: ADMIN_FLOORS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: ADMIN_APARTMENTS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: PORTAL_PROJECTS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: PORTAL_INVENTORY_BUILDINGS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: PORTAL_INVENTORY_FLOORS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: PORTAL_INVENTORY_APARTMENTS_QUERY_KEY });
};

const mutationScope = (companyId: string, scope?: CatalogScope): CatalogScope =>
  scope ?? adminCatalogScope(companyId);

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
      scope?: CatalogScope;
    }) =>
      createPortalBuilding(input.projectId, input.body, {
        scope: mutationScope(input.companyId, input.scope),
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
      scope?: CatalogScope;
    }) =>
      createPortalFloor(input.buildingId, input.body, {
        scope: mutationScope(input.companyId, input.scope),
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
      buildingId?: string;
      body: BulkCreatePortalApartmentsRequest;
      scope?: CatalogScope;
    }) =>
      bulkCreatePortalApartments(input.floorId, input.body, {
        scope: mutationScope(input.companyId, input.scope),
      }),
    onSuccess: (_result, input) => {
      invalidateAdminInventory(queryClient);
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'floors', input.floorId, 'apartments'],
      });
      if (input.buildingId) {
        void queryClient.invalidateQueries({
          queryKey: adminBuildingInventoryGlanceQueryKey(input.buildingId),
        });
      }
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
      scope?: CatalogScope;
    }) =>
      updatePortalBuilding(input.buildingId, input.body, {
        scope: mutationScope(input.companyId, input.scope),
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
      scope?: CatalogScope;
    }) =>
      updatePortalFloor(input.floorId, input.body, {
        scope: mutationScope(input.companyId, input.scope),
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
 * Pins or unpins an apartment on the public homepage.
 */
export const useSetAdminApartmentFeaturedOnHomeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { apartmentId: string; featuredOnHome: boolean }) =>
      setAdminApartmentFeaturedOnHome(input.apartmentId, input.featuredOnHome),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_APARTMENTS_QUERY_KEY });
    },
  });
};

/**
 * Deletes a draft building (admin catalog).
 */
export const useAdminDeleteBuildingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { companyId: string; buildingId: string; scope?: CatalogScope }) =>
      deletePortalBuilding(input.buildingId, {
        scope: mutationScope(input.companyId, input.scope),
      }),
    onSuccess: () => {
      invalidateAdminInventory(queryClient);
    },
  });
};

/**
 * Deletes a draft floor (admin catalog).
 */
export const useAdminDeleteFloorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      companyId: string;
      buildingId: string;
      floorId: string;
      scope?: CatalogScope;
    }) =>
      deletePortalFloor(input.floorId, {
        scope: mutationScope(input.companyId, input.scope),
      }),
    onSuccess: (_result, input) => {
      invalidateAdminInventory(queryClient);
      void queryClient.invalidateQueries({
        queryKey: adminBuildingInventoryGlanceQueryKey(input.buildingId),
      });
    },
  });
};
