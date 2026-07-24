import type {
  CrmDealDetail,
  CrmDealListResponse,
  CrmDealStatus,
  RequestSource,
} from '@toonexpo/contracts';

import { apiFetch } from '@/shared/api/client';

export type ListAdminCrmDealsParams = {
  page: number;
  pageSize: number;
  status?: CrmDealStatus;
  source?: RequestSource;
  projectId?: string;
  companyId?: string;
  q?: string;
};

/**
 * GET /admin/crm/deals — cross-company CRM overview.
 */
export const listAdminCrmDeals = (
  params: ListAdminCrmDealsParams,
): Promise<CrmDealListResponse> => {
  const search = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.status) {
    search.set('status', params.status);
  }
  if (params.source) {
    search.set('source', params.source);
  }
  if (params.projectId) {
    search.set('projectId', params.projectId);
  }
  if (params.companyId) {
    search.set('companyId', params.companyId);
  }
  if (params.q) {
    search.set('q', params.q);
  }

  return apiFetch({
    path: `/admin/crm/deals?${search.toString()}`,
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
};

/**
 * GET /admin/crm/deals/:id — read-only deal detail.
 */
export const getAdminCrmDeal = (id: string): Promise<CrmDealDetail> =>
  apiFetch({
    path: `/admin/crm/deals/${encodeURIComponent(id)}`,
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
