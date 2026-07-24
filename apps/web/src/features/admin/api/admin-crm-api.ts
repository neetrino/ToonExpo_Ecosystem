import type {
  CreateAdminManualDealBody,
  CrmDealDetail,
  CrmDealListResponse,
  CrmDealStatus,
  IntakeCreateResult,
  RequestSource,
  UpdateCrmDealBody,
} from '@toonexpo/contracts';

import { apiFetch } from '@/shared/api/client';

export type ListAdminCrmDealsParams = {
  page: number;
  pageSize: number;
  status?: CrmDealStatus;
  source?: RequestSource;
  sources?: RequestSource[];
  projectId?: string;
  companyId?: string;
  companyIds?: string[];
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
  if (params.sources && params.sources.length > 0) {
    search.set('sources', params.sources.join(','));
  } else if (params.source) {
    search.set('source', params.source);
  }
  if (params.projectId) {
    search.set('projectId', params.projectId);
  }
  if (params.companyIds && params.companyIds.length > 0) {
    search.set('companyIds', params.companyIds.join(','));
  } else if (params.companyId) {
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
 * GET /admin/crm/deals/:id — deal detail.
 */
export const getAdminCrmDeal = (id: string): Promise<CrmDealDetail> =>
  apiFetch({
    path: `/admin/crm/deals/${encodeURIComponent(id)}`,
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

/**
 * POST /admin/crm/deals — create manual deal for a builder.
 */
export const createAdminManualCrmDeal = (
  body: CreateAdminManualDealBody,
): Promise<IntakeCreateResult> =>
  apiFetch({
    path: '/admin/crm/deals',
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

/**
 * PATCH /admin/crm/deals/:id — Kanban status move.
 */
export const updateAdminCrmDeal = (id: string, body: UpdateCrmDealBody): Promise<CrmDealDetail> =>
  apiFetch({
    path: `/admin/crm/deals/${encodeURIComponent(id)}`,
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

/**
 * DELETE /admin/crm/deals/:id
 */
export const deleteAdminCrmDeal = (id: string): Promise<void> =>
  apiFetch({
    path: `/admin/crm/deals/${encodeURIComponent(id)}`,
    method: 'DELETE',
    credentials: 'include',
  });
