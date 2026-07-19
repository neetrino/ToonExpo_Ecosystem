import type { PortalServiceProviderListResponse } from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

export const listPortalServiceProviders = (
  categoryId: string,
): Promise<PortalServiceProviderListResponse> => {
  const search = new URLSearchParams({ categoryId });
  return apiFetch<PortalServiceProviderListResponse>({
    path: `/portal/service-providers?${search.toString()}`,
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
};
