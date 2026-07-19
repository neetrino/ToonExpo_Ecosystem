"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  PortalCreateBankOfferBody,
  PortalUpdateBankOfferBody,
} from "@toonexpo/contracts";

import {
  createPortalBankOffer,
  deletePortalBankOffer,
  listPortalBankOffers,
  updatePortalBankOffer,
} from "@/features/partner/api/portal-bank-offers-api";
import { PORTAL_BANK_OFFERS_QUERY_KEY } from "@/features/mortgage/constants";

export const usePortalBankOffersQuery = () =>
  useQuery({
    queryKey: PORTAL_BANK_OFFERS_QUERY_KEY,
    queryFn: listPortalBankOffers,
  });

export const useCreatePortalBankOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PortalCreateBankOfferBody) => createPortalBankOffer(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PORTAL_BANK_OFFERS_QUERY_KEY });
    },
  });
};

export const useUpdatePortalBankOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PortalUpdateBankOfferBody }) =>
      updatePortalBankOffer(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PORTAL_BANK_OFFERS_QUERY_KEY });
    },
  });
};

export const useDeletePortalBankOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePortalBankOffer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PORTAL_BANK_OFFERS_QUERY_KEY });
    },
  });
};
