import type {
  AdminBosProvisioningDetail,
  AdminBosProvisioningListResponse,
  BosProvisioningStatus,
} from '@toonexpo/contracts';

import { ADMIN_BOS_PROVISIONING_DEFAULT_PAGE_SIZE } from '@/features/admin/constants';
import { apiFetch } from '@/shared/api/client';

export type ListAdminBosProvisioningParams = {
  page: number;
  pageSize: number;
  status?: BosProvisioningStatus;
};

export const listAdminBosProvisioning = (
  params: ListAdminBosProvisioningParams,
): Promise<AdminBosProvisioningListResponse> => {
  const search = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.status) {
    search.set('status', params.status);
  }

  return apiFetch<AdminBosProvisioningListResponse>({
    path: `/admin/integrations/bos/provisioning?${search.toString()}`,
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
};

export const getAdminBosProvisioning = (id: string): Promise<AdminBosProvisioningDetail> =>
  apiFetch<AdminBosProvisioningDetail>({
    path: `/admin/integrations/bos/provisioning/${encodeURIComponent(id)}`,
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

export { ADMIN_BOS_PROVISIONING_DEFAULT_PAGE_SIZE };
