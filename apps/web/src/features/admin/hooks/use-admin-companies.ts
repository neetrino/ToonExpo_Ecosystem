'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CompanyType, CreateCompanyRequest, UpdateCompanyRequest } from '@toonexpo/contracts';

import {
  createAdminCompany,
  deleteAdminCompany,
  getAdminCompany,
  getAdminProjectScope,
  listAdminCompanies,
  listAdminCompanyProjects,
  listAdminProjects,
  resendAdminCompanyInvite,
  setAdminProjectFeaturedOnHome,
  updateAdminCompany,
  type ListAdminProjectsParams,
} from '@/features/admin/api/admin-companies-api';
import {
  ADMIN_COMPANIES_QUERY_KEY,
  ADMIN_PROJECTS_QUERY_KEY,
  ADMIN_READINESS_ASSESSMENTS_QUERY_KEY,
  adminCompanyProjectsQueryKey,
  adminCompanyQueryKey,
  adminProjectScopeQueryKey,
  adminProjectsQueryKey,
} from '@/features/admin/constants';

export type AdminCompaniesQueryOptions = {
  type?: CompanyType;
  search?: string;
};

/**
 * Paginated company list for the admin companies table.
 * Keeps the previous page visible while a new search/page loads.
 */
export const useAdminCompaniesQuery = (
  page: number,
  pageSize: number,
  options: AdminCompaniesQueryOptions = {},
) =>
  useQuery({
    queryKey: [
      ...ADMIN_COMPANIES_QUERY_KEY,
      { page, pageSize, type: options.type ?? null, search: options.search ?? '' },
    ],
    queryFn: () => listAdminCompanies(page, pageSize, options),
    placeholderData: keepPreviousData,
  });

/**
 * Active builder companies for admin pickers (Buildings / Projects / Readiness).
 */
export const useAdminBuilderCompaniesQuery = (pageSize: number) =>
  useAdminCompaniesQuery(1, pageSize, { type: 'builder' });

/**
 * Single company detail for the admin edit screen.
 */
export const useAdminCompanyQuery = (id: string) =>
  useQuery({
    queryKey: adminCompanyQueryKey(id),
    queryFn: () => getAdminCompany(id),
    enabled: id.length > 0,
  });

/**
 * Lists all projects for a company (readiness and other admin pickers).
 */
export const useAdminCompanyProjectsQuery = (companyId: string, enabled = true) =>
  useQuery({
    queryKey: adminCompanyProjectsQueryKey(companyId),
    queryFn: () => listAdminCompanyProjects(companyId),
    enabled: enabled && companyId.length > 0,
  });

/**
 * Paginated cross-company projects list for the admin projects page.
 * Keeps the previous page visible while a new search/page loads.
 */
export const useAdminProjectsQuery = (params: ListAdminProjectsParams) =>
  useQuery({
    queryKey: adminProjectsQueryKey(params),
    queryFn: () => listAdminProjects(params),
    placeholderData: keepPreviousData,
  });

/**
 * Resolves builder company id for admin project detail routes.
 */
export const useAdminProjectScopeQuery = (projectId: string) =>
  useQuery({
    queryKey: adminProjectScopeQueryKey(projectId),
    queryFn: () => getAdminProjectScope(projectId),
    enabled: projectId.length > 0,
  });

/**
 * Creates a company and invites the first admin.
 */
export const useCreateAdminCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCompanyRequest) => createAdminCompany(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_COMPANIES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_READINESS_ASSESSMENTS_QUERY_KEY });
    },
  });
};

/**
 * Patches company fields.
 */
export const useUpdateAdminCompanyMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateCompanyRequest) => updateAdminCompany(id, body),
    onSuccess: (company) => {
      queryClient.setQueryData(adminCompanyQueryKey(id), company);
      void queryClient.invalidateQueries({ queryKey: ADMIN_COMPANIES_QUERY_KEY });
    },
  });
};

/**
 * Resends the set-password invite email.
 */
export const useResendAdminInviteMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resendAdminCompanyInvite(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminCompanyQueryKey(id) });
    },
  });
};

/**
 * Deletes a company and refreshes list + readiness queries.
 */
export const useDeleteAdminCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminCompany(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: adminCompanyQueryKey(id) });
      void queryClient.invalidateQueries({ queryKey: ADMIN_COMPANIES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_READINESS_ASSESSMENTS_QUERY_KEY });
    },
  });
};

/**
 * Pins or unpins a project on the public homepage.
 */
export const useSetAdminProjectFeaturedOnHomeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { projectId: string; featuredOnHome: boolean }) =>
      setAdminProjectFeaturedOnHome(input.projectId, input.featuredOnHome),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
    },
  });
};
