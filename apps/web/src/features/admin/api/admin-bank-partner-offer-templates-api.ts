import type {
  BankPartnerOfferTemplateItem,
  BankPartnerOfferTemplateListResponse,
  CreateBankPartnerOfferTemplateBody,
  UpdateBankPartnerOfferTemplateBody,
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

/**
 * Published templates for Finance Import picker (admin or builder portal).
 */
export const listSelectableTemplates = (
  scope: CatalogScope,
): Promise<BankPartnerOfferTemplateListResponse> =>
  apiFetch<BankPartnerOfferTemplateListResponse>({
    path: templatesListPath(scope),
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
