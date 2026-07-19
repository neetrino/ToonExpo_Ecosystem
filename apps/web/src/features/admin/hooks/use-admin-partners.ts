"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateAdminPartnerBody,
  CreatePartnerOfferBody,
  UpdateAdminPartnerBody,
  UpdatePartnerOfferBody,
} from "@toonexpo/contracts";

import {
  createAdminPartner,
  createAdminPartnerOffer,
  deleteAdminPartnerOffer,
  getAdminPartner,
  listAdminPartners,
  updateAdminPartner,
  updateAdminPartnerOffer,
  type ListAdminPartnersParams,
} from "@/features/admin/api/admin-partners-api";
import {
  ADMIN_PARTNERS_QUERY_KEY,
  adminPartnerQueryKey,
} from "@/features/partners/constants";

export const useAdminPartnersQuery = (params: ListAdminPartnersParams) =>
  useQuery({
    queryKey: [...ADMIN_PARTNERS_QUERY_KEY, params],
    queryFn: () => listAdminPartners(params),
  });

export const useAdminPartnerQuery = (id: string) =>
  useQuery({
    queryKey: adminPartnerQueryKey(id),
    queryFn: () => getAdminPartner(id),
    enabled: id.length > 0,
  });

export const useCreatePartnerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAdminPartnerBody) => createAdminPartner(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_PARTNERS_QUERY_KEY });
    },
  });
};

export const useUpdatePartnerMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateAdminPartnerBody) => updateAdminPartner(id, body),
    onSuccess: (partner) => {
      queryClient.setQueryData(adminPartnerQueryKey(id), partner);
      void queryClient.invalidateQueries({ queryKey: ADMIN_PARTNERS_QUERY_KEY });
    },
  });
};

export const useCreatePartnerOfferMutation = (partnerId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePartnerOfferBody) =>
      createAdminPartnerOffer(partnerId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminPartnerQueryKey(partnerId),
      });
    },
  });
};

export const useUpdatePartnerOfferMutation = (partnerId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      offerId,
      body,
    }: {
      offerId: string;
      body: UpdatePartnerOfferBody;
    }) => updateAdminPartnerOffer(partnerId, offerId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminPartnerQueryKey(partnerId),
      });
    },
  });
};

export const useDeletePartnerOfferMutation = (partnerId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offerId: string) =>
      deleteAdminPartnerOffer(partnerId, offerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminPartnerQueryKey(partnerId),
      });
    },
  });
};
