import type {
  PublicPartnerDetail,
  PublicPartnerListResponse,
  PartnerCompanyType,
} from "@toonexpo/contracts";

import { PARTNERS_DEFAULT_PAGE_SIZE } from "@/features/partners/constants";
import { apiFetch } from "@/shared/api/client";

export type ListPublicPartnersQuery = {
  page?: number;
  pageSize?: number;
  type?: PartnerCompanyType;
  featured?: boolean;
  locale?: string;
};

const toSearchParams = (query: ListPublicPartnersQuery): string => {
  const params = new URLSearchParams();
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? PARTNERS_DEFAULT_PAGE_SIZE));
  if (query.type) {
    params.set("type", query.type);
  }
  if (query.featured != null) {
    params.set("featured", String(query.featured));
  }
  if (query.locale) {
    params.set("locale", query.locale);
  }
  return `?${params.toString()}`;
};

export type PublicPartnersRequestOptions = {
  locale?: string | undefined;
  cookieHeader?: string | undefined;
};

const buildFetchOptions = (
  path: string,
  options: PublicPartnersRequestOptions = {},
) => {
  const init = {
    path,
    method: "GET" as const,
    cache: "no-store" as const,
    credentials: "include" as const,
  };

  if (!options.cookieHeader) {
    return init;
  }

  return {
    ...init,
    headers: { Cookie: options.cookieHeader },
  };
};

export const listPublicPartners = (
  query: ListPublicPartnersQuery,
  options: PublicPartnersRequestOptions = {},
): Promise<PublicPartnerListResponse> => {
  const locale = options.locale ?? query.locale;
  const params: ListPublicPartnersQuery = {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? PARTNERS_DEFAULT_PAGE_SIZE,
  };
  if (query.type) {
    params.type = query.type;
  }
  if (query.featured != null) {
    params.featured = query.featured;
  }
  if (locale) {
    params.locale = locale;
  }

  return apiFetch<PublicPartnerListResponse>(
    buildFetchOptions(`/partners${toSearchParams(params)}`, options),
  );
};

export const getPublicPartnerBySlug = (
  slug: string,
  options: PublicPartnersRequestOptions = {},
): Promise<PublicPartnerDetail> =>
  apiFetch<PublicPartnerDetail>(
    buildFetchOptions(
      `/partners/${encodeURIComponent(slug)}${options.locale ? `?locale=${encodeURIComponent(options.locale)}` : ""}`,
      options,
    ),
  );
