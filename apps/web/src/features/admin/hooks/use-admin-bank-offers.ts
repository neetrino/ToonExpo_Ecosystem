"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateBankOfferBody, UpdateBankOfferBody } from "@toonexpo/contracts";

import {
  createAdminBankOffer,
  deleteAdminBankOffer,
  listAdminBankOffers,
  updateAdminBankOffer,
  type ListAdminBankOffersParams,
} from "@/features/admin/api/admin-bank-offers-api";
import { ADMIN_BANK_OFFERS_QUERY_KEY } from "@/features/mortgage/constants";

export const useAdminBankOffersQuery = (params: ListAdminBankOffersParams = {}) =>
  useQuery({
    queryKey: [...ADMIN_BANK_OFFERS_QUERY_KEY, params],
    queryFn: () => listAdminBankOffers(params),
  });

export const useCreateBankOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBankOfferBody) => createAdminBankOffer(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_BANK_OFFERS_QUERY_KEY });
    },
  });
};

export const useUpdateBankOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBankOfferBody }) =>
      updateAdminBankOffer(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_BANK_OFFERS_QUERY_KEY });
    },
  });
};

export const useDeleteBankOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminBankOffer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_BANK_OFFERS_QUERY_KEY });
    },
  });
};
