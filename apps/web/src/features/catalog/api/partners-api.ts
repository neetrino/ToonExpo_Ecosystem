import type {
  PublicPartnerDetail,
  PublicPartnerListResponse,
  PartnerCompanyType,
} from "@toonexpo/contracts";

import { PARTNERS_DEFAULT_PAGE_SIZE } from "@/features/partners/constants";
import { apiFetch } from "@/shared/api/client";
import { partnersFetch } from "@/shared/api/public-fetch";

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

  return apiFetch<PublicPartnerListResponse>({
    path: `/partners${toSearchParams(params)}`,
    ...partnersFetch(),
  });
};

export const getPublicPartnerBySlug = (
  slug: string,
  options: PublicPartnersRequestOptions = {},
): Promise<PublicPartnerDetail> =>
  apiFetch<PublicPartnerDetail>({
    path: `/partners/${encodeURIComponent(slug)}${options.locale ? `?locale=${encodeURIComponent(options.locale)}` : ""}`,
    ...partnersFetch(),
  });
