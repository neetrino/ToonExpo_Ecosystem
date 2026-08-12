import type {
  PublicPartnerDetail,
  PublicPartnerFacetsResponse,
  PublicPartnerListResponse,
  PartnerCompanyType,
} from "@toonexpo/contracts";

import { PARTNERS_DEFAULT_PAGE_SIZE } from "@/features/partners/constants";
import { apiFetch } from "@/shared/api/client";
import { partnersFetch } from "@/shared/api/public-fetch";

export type ListPublicPartnersQuery = {
  page?: number;
  pageSize?: number;
  /** One or more partner types; omitted / empty = all. */
  types?: PartnerCompanyType[];
  featured?: boolean;
  locale?: string;
};

const toSearchParams = (query: ListPublicPartnersQuery): string => {
  const params = new URLSearchParams();
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? PARTNERS_DEFAULT_PAGE_SIZE));
  if (query.types != null && query.types.length > 0) {
    params.set("type", query.types.join(","));
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
  if (query.types != null && query.types.length > 0) {
    params.types = query.types;
  }
  if (query.featured != null) {
    params.featured = query.featured;
  }
  if (locale) {
    params.locale = locale;
  }

  return apiFetch<PublicPartnerListResponse>({
    path: `/partners${toSearchParams(params)}`,
    ...partnersFetch(),
  });
};

export const listPublicPartnerFacets = (): Promise<PublicPartnerFacetsResponse> =>
  apiFetch<PublicPartnerFacetsResponse>({
    path: "/partners/facets",
    ...partnersFetch(),
  });

export const getPublicPartnerBySlug = (
  slug: string,
  options: PublicPartnersRequestOptions = {},
): Promise<PublicPartnerDetail> =>
  apiFetch<PublicPartnerDetail>({
    path: `/partners/${encodeURIComponent(slug)}${options.locale ? `?locale=${encodeURIComponent(options.locale)}` : ""}`,
    ...partnersFetch(),
  });
