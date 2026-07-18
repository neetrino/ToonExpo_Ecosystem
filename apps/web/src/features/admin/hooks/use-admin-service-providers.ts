"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateServiceProviderBody,
  CreateServiceProviderCategoryBody,
  UpdateServiceProviderBody,
  UpdateServiceProviderCategoryBody,
} from "@toonexpo/contracts";

import {
  createAdminServiceProvider,
  createAdminServiceProviderCategory,
  deleteAdminServiceProvider,
  deleteAdminServiceProviderCategory,
  listAdminServiceProviderCategories,
  listAdminServiceProviders,
  updateAdminServiceProvider,
  updateAdminServiceProviderCategory,
  type ListAdminServiceProvidersParams,
} from "@/features/admin/api/admin-service-providers-api";

export const ADMIN_SERVICE_PROVIDER_CATEGORIES_QUERY_KEY = [
  "admin",
  "service-provider-categories",
] as const;

export const ADMIN_SERVICE_PROVIDERS_QUERY_KEY = [
  "admin",
  "service-providers",
] as const;

export const useAdminServiceProviderCategoriesQuery = () =>
  useQuery({
    queryKey: ADMIN_SERVICE_PROVIDER_CATEGORIES_QUERY_KEY,
    queryFn: listAdminServiceProviderCategories,
  });

export const useCreateServiceProviderCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateServiceProviderCategoryBody) =>
      createAdminServiceProviderCategory(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_SERVICE_PROVIDER_CATEGORIES_QUERY_KEY,
      });
    },
  });
};

export const useUpdateServiceProviderCategoryMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateServiceProviderCategoryBody) =>
      updateAdminServiceProviderCategory(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_SERVICE_PROVIDER_CATEGORIES_QUERY_KEY,
      });
    },
  });
};

export const useDeleteServiceProviderCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminServiceProviderCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_SERVICE_PROVIDER_CATEGORIES_QUERY_KEY,
      });
    },
  });
};

export const useAdminServiceProvidersQuery = (
  params: ListAdminServiceProvidersParams = {},
) =>
  useQuery({
    queryKey: [...ADMIN_SERVICE_PROVIDERS_QUERY_KEY, params],
    queryFn: () => listAdminServiceProviders(params),
  });

export const useCreateServiceProviderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateServiceProviderBody) =>
      createAdminServiceProvider(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_SERVICE_PROVIDERS_QUERY_KEY,
      });
    },
  });
};

export const useUpdateServiceProviderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateServiceProviderBody }) =>
      updateAdminServiceProvider(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_SERVICE_PROVIDERS_QUERY_KEY,
      });
    },
  });
};

export const useDeleteServiceProviderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminServiceProvider(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_SERVICE_PROVIDERS_QUERY_KEY,
      });
    },
  });
};
