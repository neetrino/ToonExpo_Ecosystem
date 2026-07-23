'use client';

import { useQuery } from '@tanstack/react-query';

import {
  listAdminApartments,
  listAdminBuildings,
  listAdminFloors,
} from '@/features/admin/api/admin-inventory-api';
import {
  adminApartmentsQueryKey,
  adminBuildingsQueryKey,
  adminFloorsQueryKey,
} from '@/features/admin/constants';

/**
 * Paginated buildings list for the admin buildings hub.
 */
export const useAdminBuildingsQuery = (page: number, pageSize: number, companyId?: string) =>
  useQuery({
    queryKey: adminBuildingsQueryKey({
      page,
      pageSize,
      ...(companyId ? { companyId } : {}),
    }),
    queryFn: () =>
      listAdminBuildings({
        page,
        pageSize,
        ...(companyId ? { companyId } : {}),
      }),
  });

/**
 * Paginated floors list for the admin floors hub.
 */
export const useAdminFloorsQuery = (page: number, pageSize: number, companyId?: string) =>
  useQuery({
    queryKey: adminFloorsQueryKey({
      page,
      pageSize,
      ...(companyId ? { companyId } : {}),
    }),
    queryFn: () =>
      listAdminFloors({
        page,
        pageSize,
        ...(companyId ? { companyId } : {}),
      }),
  });

/**
 * Paginated apartments list for the admin apartments hub.
 */
export const useAdminApartmentsQuery = (page: number, pageSize: number, companyId?: string) =>
  useQuery({
    queryKey: adminApartmentsQueryKey({
      page,
      pageSize,
      ...(companyId ? { companyId } : {}),
    }),
    queryFn: () =>
      listAdminApartments({
        page,
        pageSize,
        ...(companyId ? { companyId } : {}),
      }),
  });
