import type {
  PortalPartnerDetail,
  UpdatePortalPartnerBody,
  CreatePartnerOfferBody,
  UpdatePartnerOfferBody,
  PartnerOfferItem,
} from "@toonexpo/contracts";

import {
  jsonCredentials,
  withPortalCookie,
  type PortalRequestOptions,
} from "@/features/builder/api/portal-request";
import { apiFetch } from "@/shared/api/client";

export const getPortalPartner = (
  options: PortalRequestOptions = {},
): Promise<PortalPartnerDetail> =>
  apiFetch<PortalPartnerDetail>(
    withPortalCookie(
      {
        path: "/portal/partner",
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );

export const updatePortalPartner = (
  body: UpdatePortalPartnerBody,
): Promise<PortalPartnerDetail> =>
  apiFetch<PortalPartnerDetail>({
    path: "/portal/partner",
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const createPortalPartnerOffer = (
  body: CreatePartnerOfferBody,
): Promise<PartnerOfferItem> =>
  apiFetch<PartnerOfferItem>({
    path: "/portal/partner/offers",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updatePortalPartnerOffer = (
  offerId: string,
  body: UpdatePartnerOfferBody,
): Promise<PartnerOfferItem> =>
  apiFetch<PartnerOfferItem>({
    path: `/portal/partner/offers/${encodeURIComponent(offerId)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deletePortalPartnerOffer = (offerId: string): Promise<void> =>
  apiFetch<void>({
    path: `/portal/partner/offers/${encodeURIComponent(offerId)}`,
    method: "DELETE",
    credentials: "include",
  });
