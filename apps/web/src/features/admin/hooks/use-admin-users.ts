'use client';

import { useQuery } from '@tanstack/react-query';

import { listAdminUsers, type ListAdminUsersParams } from '@/features/admin/api/admin-users-api';
import { adminUsersQueryKey } from '@/features/admin/constants';

/**
 * Paginated platform users for the admin users directory.
 */
export const useAdminUsersQuery = (params: ListAdminUsersParams) =>
  useQuery({
    queryKey: adminUsersQueryKey(params),
    queryFn: () => listAdminUsers(params),
  });
