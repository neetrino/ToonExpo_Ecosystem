'use client';

import { useQuery } from '@tanstack/react-query';

import {
  getAdminBosProvisioning,
  listAdminBosProvisioning,
  type ListAdminBosProvisioningParams,
} from '@/features/admin/api/admin-bos-provisioning-api';
import {
  ADMIN_BOS_PROVISIONING_QUERY_KEY,
  adminBosProvisioningQueryKey,
} from '@/features/admin/constants';

export const useAdminBosProvisioningListQuery = (params: ListAdminBosProvisioningParams) =>
  useQuery({
    queryKey: [...ADMIN_BOS_PROVISIONING_QUERY_KEY, params],
    queryFn: () => listAdminBosProvisioning(params),
  });

export const useAdminBosProvisioningDetailQuery = (id: string) =>
  useQuery({
    queryKey: adminBosProvisioningQueryKey(id),
    queryFn: () => getAdminBosProvisioning(id),
    enabled: id.length > 0,
  });
