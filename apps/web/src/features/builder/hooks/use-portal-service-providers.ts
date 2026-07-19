"use client";

import { useQuery } from "@tanstack/react-query";

import { listPortalServiceProviders } from "@/features/builder/api/portal-service-providers-api";

export const portalServiceProvidersQueryKey = (categoryId: string) =>
  ["portal", "service-providers", categoryId] as const;

export const usePortalServiceProvidersQuery = (
  categoryId: string | null,
  enabled: boolean,
) =>
  useQuery({
    queryKey: portalServiceProvidersQueryKey(categoryId ?? ""),
    queryFn: () => listPortalServiceProviders(categoryId ?? ""),
    enabled: enabled && categoryId != null && categoryId.length > 0,
  });
