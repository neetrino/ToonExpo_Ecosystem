"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from "@toonexpo/contracts";

import {
  createAdminCompany,
  getAdminCompany,
  listAdminCompanies,
  listAdminCompanyProjects,
  resendAdminCompanyInvite,
  updateAdminCompany,
} from "@/features/admin/api/admin-companies-api";
import {
  ADMIN_COMPANIES_QUERY_KEY,
  adminCompanyProjectsQueryKey,
  adminCompanyQueryKey,
} from "@/features/admin/constants";

/**
 * Paginated company list for the admin companies table.
 */
export const useAdminCompaniesQuery = (page: number, pageSize: number) =>
  useQuery({
    queryKey: [...ADMIN_COMPANIES_QUERY_KEY, { page, pageSize }],
    queryFn: () => listAdminCompanies(page, pageSize),
  });

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
export const useAdminCompanyProjectsQuery = (
  companyId: string,
  enabled = true,
) =>
  useQuery({
    queryKey: adminCompanyProjectsQueryKey(companyId),
    queryFn: () => listAdminCompanyProjects(companyId),
    enabled: enabled && companyId.length > 0,
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
