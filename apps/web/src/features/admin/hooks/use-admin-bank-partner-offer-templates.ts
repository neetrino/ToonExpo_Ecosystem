'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateBankPartnerOfferTemplateBody,
  UpdateBankPartnerOfferTemplateBody,
} from '@toonexpo/contracts';

import {
  createAdminBankPartnerOfferTemplate,
  deleteAdminBankPartnerOfferTemplate,
  listAdminBankPartnerOfferTemplates,
  updateAdminBankPartnerOfferTemplate,
  type ListAdminTemplatesParams,
} from '@/features/admin/api/admin-bank-partner-offer-templates-api';

export const ADMIN_BANK_PARTNER_OFFER_TEMPLATES_QUERY_KEY = [
  'admin',
  'bank-partner-offer-templates',
] as const;

export const useAdminBankPartnerOfferTemplatesQuery = (
  params: ListAdminTemplatesParams = {},
) =>
  useQuery({
    queryKey: [...ADMIN_BANK_PARTNER_OFFER_TEMPLATES_QUERY_KEY, params],
    queryFn: () => listAdminBankPartnerOfferTemplates(params),
  });

export const useCreateBankPartnerOfferTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBankPartnerOfferTemplateBody) =>
      createAdminBankPartnerOfferTemplate(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_BANK_PARTNER_OFFER_TEMPLATES_QUERY_KEY,
      });
    },
  });
};

export const useUpdateBankPartnerOfferTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateBankPartnerOfferTemplateBody;
    }) => updateAdminBankPartnerOfferTemplate(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_BANK_PARTNER_OFFER_TEMPLATES_QUERY_KEY,
      });
    },
  });
};

export const useDeleteBankPartnerOfferTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminBankPartnerOfferTemplate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_BANK_PARTNER_OFFER_TEMPLATES_QUERY_KEY,
      });
    },
  });
};
