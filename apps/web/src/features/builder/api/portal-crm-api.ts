import type {
  AttachCrmDealApartmentBody,
  CreateCrmActivityBody,
  CreateCrmNoteBody,
  CreateDealFromScanBody,
  CreateManualDealBody,
  CrmActivityItem,
  CrmApartmentLinkItem,
  CrmDealDetail,
  CrmDealListResponse,
  CrmDealStatus,
  CrmNoteItem,
  IntakeCreateResult,
  RequestSource,
  UpdateCrmActivityBody,
  UpdateCrmDealBody,
} from '@toonexpo/contracts';

import { apiFetch } from '@/shared/api/client';

import { jsonCredentials } from './portal-request';

export type ListCrmDealsParams = {
  page: number;
  pageSize: number;
  status?: CrmDealStatus;
  source?: RequestSource;
  projectId?: string;
  assignedUserId?: string;
  q?: string;
};

/**
 * GET /portal/crm/deals — paginated company deals.
 */
export const listCrmDeals = (params: ListCrmDealsParams): Promise<CrmDealListResponse> => {
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
  if (params.assignedUserId) {
    search.set('assignedUserId', params.assignedUserId);
  }
  if (params.q) {
    search.set('q', params.q);
  }

  return apiFetch({
    path: `/portal/crm/deals?${search.toString()}`,
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
};

/**
 * GET /portal/crm/deals/:id
 */
export const getCrmDeal = (id: string): Promise<CrmDealDetail> =>
  apiFetch({
    path: `/portal/crm/deals/${encodeURIComponent(id)}`,
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

/**
 * PATCH /portal/crm/deals/:id
 */
export const updateCrmDeal = (id: string, body: UpdateCrmDealBody): Promise<CrmDealDetail> =>
  apiFetch({
    path: `/portal/crm/deals/${encodeURIComponent(id)}`,
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * POST /portal/crm/deals — manual contact intake.
 */
export const createManualCrmDeal = (body: CreateManualDealBody): Promise<IntakeCreateResult> =>
  apiFetch({
    path: '/portal/crm/deals',
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * POST /portal/crm/deals/from-scan
 */
export const createCrmDealFromScan = (body: CreateDealFromScanBody): Promise<IntakeCreateResult> =>
  apiFetch({
    path: '/portal/crm/deals/from-scan',
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * POST /portal/crm/deals/:id/notes
 */
export const addCrmNote = (dealId: string, body: CreateCrmNoteBody): Promise<CrmNoteItem> =>
  apiFetch({
    path: `/portal/crm/deals/${encodeURIComponent(dealId)}/notes`,
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * POST /portal/crm/deals/:id/apartments
 */
export const attachCrmDealApartment = (
  dealId: string,
  body: AttachCrmDealApartmentBody,
): Promise<CrmApartmentLinkItem> =>
  apiFetch({
    path: `/portal/crm/deals/${encodeURIComponent(dealId)}/apartments`,
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * DELETE /portal/crm/deals/:id/apartments/:apartmentId
 */
export const detachCrmDealApartment = (dealId: string, apartmentId: string): Promise<void> =>
  apiFetch({
    path: `/portal/crm/deals/${encodeURIComponent(dealId)}/apartments/${encodeURIComponent(apartmentId)}`,
    method: 'DELETE',
    ...jsonCredentials,
  });

/**
 * POST /portal/crm/deals/:id/activities
 */
export const addCrmActivity = (
  dealId: string,
  body: CreateCrmActivityBody,
): Promise<CrmActivityItem> =>
  apiFetch({
    path: `/portal/crm/deals/${encodeURIComponent(dealId)}/activities`,
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * PATCH /portal/crm/deals/:id/activities/:activityId
 */
export const updateCrmActivity = (
  dealId: string,
  activityId: string,
  body: UpdateCrmActivityBody,
): Promise<CrmActivityItem> =>
  apiFetch({
    path: `/portal/crm/deals/${encodeURIComponent(dealId)}/activities/${encodeURIComponent(activityId)}`,
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });
