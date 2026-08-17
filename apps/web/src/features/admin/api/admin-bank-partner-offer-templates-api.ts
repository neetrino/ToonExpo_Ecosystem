import type {
  ApplyProjectBankPartnerOffersBody,
  ApplyProjectBankPartnerOffersResponse,
  BankPartnerOfferTemplateItem,
  BankPartnerOfferTemplateListResponse,
  CreateBankPartnerOfferTemplateBody,
  ProjectBankPartnerOfferItem,
  ProjectBankPartnerOfferListResponse,
  UpdateBankPartnerOfferTemplateBody,
  UpdateProjectBankPartnerOfferBody,
} from '@toonexpo/contracts';

import type { CatalogScope } from '@/features/builder/catalog-scope';
import { apiFetch } from '@/shared/api/client';

const jsonCredentials = {
  credentials: 'include' as const,
  headers: { 'Content-Type': 'application/json' },
};

export type ListAdminTemplatesParams = {
  partnerCompanyId?: string;
  publicationStatus?: 'draft' | 'published' | 'archived';
  publishedOnly?: boolean;
};

export const listAdminBankPartnerOfferTemplates = (
  params: ListAdminTemplatesParams = {},
): Promise<BankPartnerOfferTemplateListResponse> => {
  const search = new URLSearchParams();
  if (params.partnerCompanyId) {
    search.set('partnerCompanyId', params.partnerCompanyId);
  }
  if (params.publicationStatus) {
    search.set('publicationStatus', params.publicationStatus);
  }
  if (params.publishedOnly) {
    search.set('publishedOnly', 'true');
  }
  const query = search.toString();
  return apiFetch<BankPartnerOfferTemplateListResponse>({
    path:
      query.length > 0
        ? `/admin/bank-partner-offer-templates?${query}`
        : '/admin/bank-partner-offer-templates',
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
};

export const createAdminBankPartnerOfferTemplate = (
  body: CreateBankPartnerOfferTemplateBody,
): Promise<BankPartnerOfferTemplateItem> =>
  apiFetch<BankPartnerOfferTemplateItem>({
    path: '/admin/bank-partner-offer-templates',
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateAdminBankPartnerOfferTemplate = (
  id: string,
  body: UpdateBankPartnerOfferTemplateBody,
): Promise<BankPartnerOfferTemplateItem> =>
  apiFetch<BankPartnerOfferTemplateItem>({
    path: `/admin/bank-partner-offer-templates/${encodeURIComponent(id)}`,
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteAdminBankPartnerOfferTemplate = (id: string): Promise<void> =>
  apiFetch<void>({
    path: `/admin/bank-partner-offer-templates/${encodeURIComponent(id)}`,
    method: 'DELETE',
    credentials: 'include',
  });

const templatesListPath = (scope: CatalogScope): string =>
  scope.mode === 'admin'
    ? '/admin/bank-partner-offer-templates?publishedOnly=true'
    : '/portal/bank-partner-offer-templates';

const projectOffersBasePath = (scope: CatalogScope, projectId: string): string =>
  scope.mode === 'admin'
    ? `/admin/projects/${encodeURIComponent(projectId)}/bank-partner-offers`
    : `/portal/projects/${encodeURIComponent(projectId)}/bank-partner-offers`;

export const listSelectableTemplates = (
  scope: CatalogScope,
): Promise<BankPartnerOfferTemplateListResponse> =>
  apiFetch<BankPartnerOfferTemplateListResponse>({
    path: templatesListPath(scope),
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

export const listProjectBankPartnerOffers = (
  scope: CatalogScope,
  projectId: string,
): Promise<ProjectBankPartnerOfferListResponse> =>
  apiFetch<ProjectBankPartnerOfferListResponse>({
    path: projectOffersBasePath(scope, projectId),
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
    path: `${projectOffersBasePath(scope, projectId)}/apply`,
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
    path: `${projectOffersBasePath(scope, projectId)}/${encodeURIComponent(offerId)}`,
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
    path: `${projectOffersBasePath(scope, projectId)}/${encodeURIComponent(offerId)}`,
    method: 'DELETE',
    credentials: 'include',
  });
