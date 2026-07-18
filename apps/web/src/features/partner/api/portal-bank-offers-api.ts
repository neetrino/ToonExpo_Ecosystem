import type {
  BankOfferListItem,
  BankOfferListResponse,
  PortalCreateBankOfferBody,
  PortalUpdateBankOfferBody,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

const jsonCredentials = {
  credentials: "include" as const,
  headers: { "Content-Type": "application/json" },
};

export const listPortalBankOffers = (): Promise<BankOfferListResponse> =>
  apiFetch<BankOfferListResponse>({
    path: "/portal/bank-offers",
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

export const createPortalBankOffer = (
  body: PortalCreateBankOfferBody,
): Promise<BankOfferListItem> =>
  apiFetch<BankOfferListItem>({
    path: "/portal/bank-offers",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updatePortalBankOffer = (
  id: string,
  body: PortalUpdateBankOfferBody,
): Promise<BankOfferListItem> =>
  apiFetch<BankOfferListItem>({
    path: `/portal/bank-offers/${encodeURIComponent(id)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deletePortalBankOffer = (id: string): Promise<void> =>
  apiFetch<void>({
    path: `/portal/bank-offers/${encodeURIComponent(id)}`,
    method: "DELETE",
    credentials: "include",
  });
