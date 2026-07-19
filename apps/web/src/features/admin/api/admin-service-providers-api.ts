import type {
  AdminServiceProviderItem,
  AdminServiceProviderListResponse,
  CreateServiceProviderBody,
  CreateServiceProviderCategoryBody,
  ServiceProviderCategoryItem,
  ServiceProviderCategoryListResponse,
  UpdateServiceProviderBody,
  UpdateServiceProviderCategoryBody,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

const jsonCredentials = {
  credentials: "include" as const,
  headers: { "Content-Type": "application/json" },
};

export type ListAdminServiceProvidersParams = {
  categoryId?: string;
  active?: boolean;
  providerType?: string;
  search?: string;
};

export const listAdminServiceProviderCategories =
  (): Promise<ServiceProviderCategoryListResponse> =>
    apiFetch<ServiceProviderCategoryListResponse>({
      path: "/admin/service-provider-categories",
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

export const createAdminServiceProviderCategory = (
  body: CreateServiceProviderCategoryBody,
): Promise<ServiceProviderCategoryItem> =>
  apiFetch<ServiceProviderCategoryItem>({
    path: "/admin/service-provider-categories",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateAdminServiceProviderCategory = (
  id: string,
  body: UpdateServiceProviderCategoryBody,
): Promise<ServiceProviderCategoryItem> =>
  apiFetch<ServiceProviderCategoryItem>({
    path: `/admin/service-provider-categories/${encodeURIComponent(id)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteAdminServiceProviderCategory = (id: string): Promise<void> =>
  apiFetch<void>({
    path: `/admin/service-provider-categories/${encodeURIComponent(id)}`,
    method: "DELETE",
    credentials: "include",
  });

export const listAdminServiceProviders = (
  params: ListAdminServiceProvidersParams = {},
): Promise<AdminServiceProviderListResponse> => {
  const search = new URLSearchParams();
  if (params.categoryId) {
    search.set("categoryId", params.categoryId);
  }
  if (params.active != null) {
    search.set("active", String(params.active));
  }
  if (params.providerType) {
    search.set("providerType", params.providerType);
  }
  if (params.search) {
    search.set("search", params.search);
  }
  const query = search.toString();

  return apiFetch<AdminServiceProviderListResponse>({
    path:
      query.length > 0
        ? `/admin/service-providers?${query}`
        : "/admin/service-providers",
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
};

export const createAdminServiceProvider = (
  body: CreateServiceProviderBody,
): Promise<AdminServiceProviderItem> =>
  apiFetch<AdminServiceProviderItem>({
    path: "/admin/service-providers",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateAdminServiceProvider = (
  id: string,
  body: UpdateServiceProviderBody,
): Promise<AdminServiceProviderItem> =>
  apiFetch<AdminServiceProviderItem>({
    path: `/admin/service-providers/${encodeURIComponent(id)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteAdminServiceProvider = (id: string): Promise<void> =>
  apiFetch<void>({
    path: `/admin/service-providers/${encodeURIComponent(id)}`,
    method: "DELETE",
    credentials: "include",
  });
