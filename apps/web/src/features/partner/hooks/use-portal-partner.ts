"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreatePartnerOfferBody,
  UpdatePartnerOfferBody,
  UpdatePortalPartnerBody,
} from "@toonexpo/contracts";

import {
  createPortalPartnerOffer,
  deletePortalPartnerOffer,
  getPortalPartner,
  updatePortalPartner,
  updatePortalPartnerOffer,
} from "@/features/partner/api/portal-partner-api";
import { PORTAL_PARTNER_QUERY_KEY } from "@/features/partners/constants";

export const usePortalPartnerQuery = () =>
  useQuery({
    queryKey: PORTAL_PARTNER_QUERY_KEY,
    queryFn: () => getPortalPartner(),
  });

export const useUpdatePortalPartnerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePortalPartnerBody) => updatePortalPartner(body),
    onSuccess: (partner) => {
      queryClient.setQueryData(PORTAL_PARTNER_QUERY_KEY, partner);
    },
  });
};

export const useCreatePortalPartnerOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePartnerOfferBody) => createPortalPartnerOffer(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PORTAL_PARTNER_QUERY_KEY });
    },
  });
};

export const useUpdatePortalPartnerOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      offerId,
      body,
    }: {
      offerId: string;
      body: UpdatePartnerOfferBody;
    }) => updatePortalPartnerOffer(offerId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PORTAL_PARTNER_QUERY_KEY });
    },
  });
};

export const useDeletePortalPartnerOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offerId: string) => deletePortalPartnerOffer(offerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PORTAL_PARTNER_QUERY_KEY });
    },
  });
};
