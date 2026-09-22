'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  ADMIN_APARTMENTS_QUERY_KEY,
  ADMIN_BUILDINGS_QUERY_KEY,
  ADMIN_FLOORS_QUERY_KEY,
  ADMIN_PROJECTS_QUERY_KEY,
} from '@/features/admin/constants';
import {
  deleteSelectedSequentially,
} from '@/features/admin/utils/inventory-list-bulk-delete';
import { deletePortalApartment } from '@/features/builder/api/portal-apartments-api';
import { deletePortalBuilding } from '@/features/builder/api/portal-buildings-api';
import { deletePortalFloor } from '@/features/builder/api/portal-floors-api';
import { deletePortalProject } from '@/features/builder/api/portal-projects-api';
import type { CatalogScope } from '@/features/builder/catalog-scope';
import {
  PORTAL_INVENTORY_APARTMENTS_QUERY_KEY,
  PORTAL_INVENTORY_BUILDINGS_QUERY_KEY,
  PORTAL_INVENTORY_FLOORS_QUERY_KEY,
  PORTAL_PROJECTS_QUERY_KEY,
} from '@/features/builder/constants';

export type BulkDeleteTarget = {
  id: string;
  companyId?: string | undefined;
};

const adminCompanyScope = (companyId: string): CatalogScope => ({
  mode: 'admin',
  companyId,
});

const resolveScope = (
  companyId: string | undefined,
  catalogScope: CatalogScope | undefined,
): CatalogScope => {
  if (catalogScope) {
    return catalogScope;
  }
  if (!companyId) {
    throw new Error('Bulk delete requires companyId or catalogScope');
  }
  return adminCompanyScope(companyId);
};

/**
 * Deletes selected projects (admin or portal catalog scope).
 */
export const useBulkDeleteProjectsMutation = (catalogScope?: CatalogScope) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targets: readonly BulkDeleteTarget[]) =>
      deleteSelectedSequentially(targets.map((t) => t.id), async (id) => {
        const target = targets.find((item) => item.id === id);
        if (!target) {
          return;
        }
        await deletePortalProject(id, { scope: resolveScope(target.companyId, catalogScope) });
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PORTAL_PROJECTS_QUERY_KEY });
    },
  });
};

/**
 * Deletes selected buildings.
 */
export const useBulkDeleteBuildingsMutation = (catalogScope?: CatalogScope) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targets: readonly BulkDeleteTarget[]) =>
      deleteSelectedSequentially(targets.map((t) => t.id), async (id) => {
        const target = targets.find((item) => item.id === id);
        if (!target) {
          return;
        }
        await deletePortalBuilding(id, { scope: resolveScope(target.companyId, catalogScope) });
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_BUILDINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PORTAL_INVENTORY_BUILDINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PORTAL_PROJECTS_QUERY_KEY });
    },
  });
};

/**
 * Deletes selected floors.
 */
export const useBulkDeleteFloorsMutation = (catalogScope?: CatalogScope) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targets: readonly BulkDeleteTarget[]) =>
      deleteSelectedSequentially(targets.map((t) => t.id), async (id) => {
        const target = targets.find((item) => item.id === id);
        if (!target) {
          return;
        }
        await deletePortalFloor(id, { scope: resolveScope(target.companyId, catalogScope) });
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_FLOORS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_BUILDINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PORTAL_INVENTORY_FLOORS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PORTAL_INVENTORY_BUILDINGS_QUERY_KEY });
    },
  });
};

/**
 * Deletes selected apartments.
 */
export const useBulkDeleteApartmentsMutation = (catalogScope?: CatalogScope) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targets: readonly BulkDeleteTarget[]) =>
      deleteSelectedSequentially(targets.map((t) => t.id), async (id) => {
        const target = targets.find((item) => item.id === id);
        if (!target) {
          return;
        }
        await deletePortalApartment(id, { scope: resolveScope(target.companyId, catalogScope) });
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_APARTMENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_FLOORS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PORTAL_INVENTORY_APARTMENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PORTAL_INVENTORY_FLOORS_QUERY_KEY });
    },
  });
};
