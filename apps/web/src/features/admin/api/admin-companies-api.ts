import type {
  AdminCompanyProjectListResponse,
  AdminProjectListResponse,
  AdminProjectScope,
  CompanyListResponse,
  CompanyResponse,
  CreateCompanyRequest,
  ProvisionCompanyResponse,
  UpdateCompanyRequest,
} from '@toonexpo/contracts';

import { apiFetch, type ApiFetchOptions } from '@/shared/api/client';

const jsonCredentials = {
  credentials: 'include' as const,
  headers: { 'Content-Type': 'application/json' },
};

export type AdminRequestOptions = {
  cookieHeader?: string | undefined;
};

const withCookie = (options: ApiFetchOptions, cookieHeader?: string): ApiFetchOptions => {
  if (!cookieHeader) {
    return options;
  }
  return {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> | undefined),
      Cookie: cookieHeader,
    },
  };
};

/**
 * Lists companies for platform admin (paginated).
 */
export const listAdminCompanies = (
  page: number,
  pageSize: number,
  options: AdminRequestOptions = {},
): Promise<CompanyListResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  return apiFetch<CompanyListResponse>(
    withCookie(
      {
        path: `/admin/companies?${params.toString()}`,
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );
};

/**
 * Fetches a single company by id.
 */
export const getAdminCompany = (
  id: string,
  options: AdminRequestOptions = {},
): Promise<CompanyResponse> =>
  apiFetch<CompanyResponse>(
    withCookie(
      {
        path: `/admin/companies/${encodeURIComponent(id)}`,
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );

/**
 * Lists all projects for a company (admin project pickers).
 */
export const listAdminCompanyProjects = (
  companyId: string,
  options: AdminRequestOptions = {},
): Promise<AdminCompanyProjectListResponse> =>
  apiFetch<AdminCompanyProjectListResponse>(
    withCookie(
      {
        path: `/admin/companies/${encodeURIComponent(companyId)}/projects`,
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );

export type ListAdminProjectsParams = {
  page: number;
  pageSize: number;
  companyId?: string;
};

/**
 * Lists projects across companies for the admin projects page.
 */
export const listAdminProjects = (
  params: ListAdminProjectsParams,
  options: AdminRequestOptions = {},
): Promise<AdminProjectListResponse> => {
  const search = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.companyId) {
    search.set('companyId', params.companyId);
  }

  return apiFetch<AdminProjectListResponse>(
    withCookie(
      {
        path: `/admin/projects?${search.toString()}`,
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );
};

/**
 * Resolves builder company id for an admin project UI route.
 */
export const getAdminProjectScope = (
  projectId: string,
  options: AdminRequestOptions = {},
): Promise<AdminProjectScope> =>
  apiFetch<AdminProjectScope>(
    withCookie(
      {
        path: `/admin/projects/${encodeURIComponent(projectId)}/scope`,
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );

/**
 * Provisions a company with the first company_admin invite.
 */
export const createAdminCompany = (body: CreateCompanyRequest): Promise<ProvisionCompanyResponse> =>
  apiFetch<ProvisionCompanyResponse>({
    path: '/admin/companies',
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Patches company name, description, or status.
 */
export const updateAdminCompany = (
  id: string,
  body: UpdateCompanyRequest,
): Promise<CompanyResponse> =>
  apiFetch<CompanyResponse>({
    path: `/admin/companies/${encodeURIComponent(id)}`,
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Resends the set-password invite to the invited company admin.
 */
export const resendAdminCompanyInvite = (id: string): Promise<void> =>
  apiFetch<void>({
    path: `/admin/companies/${encodeURIComponent(id)}/resend-invite`,
    method: 'POST',
    credentials: 'include',
  });
