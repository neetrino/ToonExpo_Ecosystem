import type {
  AdminPartnerDetail,
  AdminPartnerListResponse,
  CreateAdminPartnerBody,
  CreatePartnerOfferBody,
  PartnerOfferItem,
  UpdateAdminPartnerBody,
  UpdatePartnerOfferBody,
} from "@toonexpo/contracts";

import {
  PARTNER_SEARCH_MIN_LENGTH,
  PARTNERS_DEFAULT_PAGE_SIZE,
} from "@/features/partners/constants";
import { apiFetch } from "@/shared/api/client";

const jsonCredentials = {
  credentials: "include" as const,
  headers: { "Content-Type": "application/json" },
};

export type ListAdminPartnersParams = {
  page: number;
  pageSize: number;
  type?: string;
  status?: string;
  publicationStatus?: string;
  search?: string;
};

export const listAdminPartners = (
  params: ListAdminPartnersParams,
): Promise<AdminPartnerListResponse> => {
  const search = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.type) {
    search.set("type", params.type);
  }
  if (params.status) {
    search.set("status", params.status);
  }
  if (params.publicationStatus) {
    search.set("publicationStatus", params.publicationStatus);
  }
  if (params.search && params.search.length >= PARTNER_SEARCH_MIN_LENGTH) {
    search.set("search", params.search);
  }

  return apiFetch<AdminPartnerListResponse>({
    path: `/admin/partners?${search.toString()}`,
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
};

export const getAdminPartner = (id: string): Promise<AdminPartnerDetail> =>
  apiFetch<AdminPartnerDetail>({
    path: `/admin/partners/${encodeURIComponent(id)}`,
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

export const createAdminPartner = (
  body: CreateAdminPartnerBody,
): Promise<AdminPartnerDetail> =>
  apiFetch<AdminPartnerDetail>({
    path: "/admin/partners",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateAdminPartner = (
  id: string,
  body: UpdateAdminPartnerBody,
): Promise<AdminPartnerDetail> =>
  apiFetch<AdminPartnerDetail>({
    path: `/admin/partners/${encodeURIComponent(id)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const createAdminPartnerOffer = (
  partnerId: string,
  body: CreatePartnerOfferBody,
): Promise<PartnerOfferItem> =>
  apiFetch<PartnerOfferItem>({
    path: `/admin/partners/${encodeURIComponent(partnerId)}/offers`,
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateAdminPartnerOffer = (
  partnerId: string,
  offerId: string,
  body: UpdatePartnerOfferBody,
): Promise<PartnerOfferItem> =>
  apiFetch<PartnerOfferItem>({
    path: `/admin/partners/${encodeURIComponent(partnerId)}/offers/${encodeURIComponent(offerId)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteAdminPartnerOffer = (
  partnerId: string,
  offerId: string,
): Promise<void> =>
  apiFetch<void>({
    path: `/admin/partners/${encodeURIComponent(partnerId)}/offers/${encodeURIComponent(offerId)}`,
    method: "DELETE",
    credentials: "include",
  });

export { PARTNERS_DEFAULT_PAGE_SIZE };
