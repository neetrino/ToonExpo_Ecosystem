import type {
  ApplyProjectBankPartnerOffersBody,
  ApplyProjectBankPartnerOffersResponse,
  ProjectBankPartnerOfferItem,
  ProjectBankPartnerOfferListResponse,
  UpdateProjectBankPartnerOfferBody,
} from '@toonexpo/contracts';

import type { CatalogScope } from '@/features/builder/catalog-scope';
import { apiFetch } from '@/shared/api/client';

const jsonCredentials = {
  credentials: 'include' as const,
  headers: { 'Content-Type': 'application/json' },
};

const offersBasePath = (scope: CatalogScope, projectId: string): string =>
  scope.mode === 'admin'
    ? `/admin/projects/${encodeURIComponent(projectId)}/bank-partner-offers`
    : `/portal/projects/${encodeURIComponent(projectId)}/bank-partner-offers`;

export const listProjectBankPartnerOffers = (
  scope: CatalogScope,
  projectId: string,
): Promise<ProjectBankPartnerOfferListResponse> =>
  apiFetch<ProjectBankPartnerOfferListResponse>({
    path: offersBasePath(scope, projectId),
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

export const applyProjectBankPartnerOffers = (
  scope: CatalogScope,
  projectId: string,
  body: ApplyProjectBankPartnerOffersBody,
): Promise<ApplyProjectBankPartnerOffersResponse> =>
  apiFetch<ApplyProjectBankPartnerOffersResponse>({
    path: `${offersBasePath(scope, projectId)}/apply`,
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateProjectBankPartnerOffer = (
  scope: CatalogScope,
  projectId: string,
  offerId: string,
  body: UpdateProjectBankPartnerOfferBody,
): Promise<ProjectBankPartnerOfferItem> =>
  apiFetch<ProjectBankPartnerOfferItem>({
    path: `${offersBasePath(scope, projectId)}/${encodeURIComponent(offerId)}`,
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteProjectBankPartnerOffer = (
  scope: CatalogScope,
  projectId: string,
  offerId: string,
): Promise<void> =>
  apiFetch<void>({
    path: `${offersBasePath(scope, projectId)}/${encodeURIComponent(offerId)}`,
    method: 'DELETE',
    credentials: 'include',
  });
