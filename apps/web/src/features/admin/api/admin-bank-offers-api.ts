import type {
  BankOfferListItem,
  BankOfferListResponse,
  CreateBankOfferBody,
  UpdateBankOfferBody,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

const jsonCredentials = {
  credentials: "include" as const,
  headers: { "Content-Type": "application/json" },
};

export type ListAdminBankOffersParams = {
  partnerCompanyId?: string;
};

export const listAdminBankOffers = (
  params: ListAdminBankOffersParams = {},
): Promise<BankOfferListResponse> => {
  const search = new URLSearchParams();
  if (params.partnerCompanyId) {
    search.set("partnerCompanyId", params.partnerCompanyId);
  }
  const query = search.toString();

  return apiFetch<BankOfferListResponse>({
    path: query.length > 0 ? `/admin/bank-offers?${query}` : "/admin/bank-offers",
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
};

export const getAdminBankOffer = (id: string): Promise<BankOfferListItem> =>
  apiFetch<BankOfferListItem>({
    path: `/admin/bank-offers/${encodeURIComponent(id)}`,
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

export const createAdminBankOffer = (
  body: CreateBankOfferBody,
): Promise<BankOfferListItem> =>
  apiFetch<BankOfferListItem>({
    path: "/admin/bank-offers",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateAdminBankOffer = (
  id: string,
  body: UpdateBankOfferBody,
): Promise<BankOfferListItem> =>
  apiFetch<BankOfferListItem>({
    path: `/admin/bank-offers/${encodeURIComponent(id)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteAdminBankOffer = (id: string): Promise<void> =>
  apiFetch<void>({
    path: `/admin/bank-offers/${encodeURIComponent(id)}`,
    method: "DELETE",
    credentials: "include",
  });
