'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { listPortalFloors } from '@/features/builder/api/portal-floors-api';
import {
  listPortalInventoryApartments,
  listPortalInventoryBuildings,
  listPortalInventoryFloors,
  type ListPortalInventoryParams,
} from '@/features/builder/api/portal-inventory-api';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import {
  portalInventoryApartmentsQueryKey,
  portalInventoryBuildingsQueryKey,
  portalInventoryFloorsQueryKey,
} from '@/features/builder/constants';

const toParams = (
  page: number,
  pageSize: number,
  buildingId?: string,
  projectId?: string,
  search?: string,
): ListPortalInventoryParams => ({
  page,
  pageSize,
  ...(buildingId ? { buildingId } : {}),
  ...(projectId ? { projectId } : {}),
  ...(search ? { search } : {}),
});

/**
 * Paginated buildings for the builder buildings hub.
 */
export const usePortalInventoryBuildingsQuery = (
  page: number,
  pageSize: number,
  projectId?: string,
  search?: string,
) => {
  const scope = useCatalogScope();
  const params = toParams(page, pageSize, undefined, projectId, search);
  return useQuery({
    queryKey: [...portalInventoryBuildingsQueryKey(params), scope],
    queryFn: () => listPortalInventoryBuildings(params, { scope }),
    placeholderData: keepPreviousData,
  });
};

/**
 * Paginated floors for the builder floors hub.
 */
export const usePortalInventoryFloorsQuery = (
  page: number,
  pageSize: number,
  buildingId?: string,
  search?: string,
) => {
  const scope = useCatalogScope();
  const params = toParams(page, pageSize, buildingId, undefined, search);
  return useQuery({
    queryKey: [...portalInventoryFloorsQueryKey(params), scope],
    queryFn: () => listPortalInventoryFloors(params, { scope }),
    placeholderData: keepPreviousData,
  });
};

/**
 * Paginated apartments for the builder apartments hub.
 */
export const usePortalInventoryApartmentsQuery = (
  page: number,
  pageSize: number,
  buildingId?: string,
  search?: string,
) => {
  const scope = useCatalogScope();
  const params = toParams(page, pageSize, buildingId, undefined, search);
  return useQuery({
    queryKey: [...portalInventoryApartmentsQueryKey(params), scope],
    queryFn: () => listPortalInventoryApartments(params, { scope }),
    placeholderData: keepPreviousData,
  });
};

/**
 * Floors under a building for create-apartment picker.
 */
export const usePortalBuildingFloorsQuery = (buildingId: string) => {
  const scope = useCatalogScope();
  return useQuery({
    queryKey: ['portal', 'buildings', buildingId, 'floors', scope] as const,
    queryFn: () => listPortalFloors(buildingId, { scope }),
    enabled: buildingId.length > 0,
  });
};
