'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ApplyProjectBankPartnerOffersBody,
  UpdateProjectBankPartnerOfferBody,
} from '@toonexpo/contracts';

import {
  applyProjectBankPartnerOffers,
  deleteProjectBankPartnerOffer,
  listProjectBankPartnerOffers,
  listSelectableTemplates,
  updateProjectBankPartnerOffer,
} from '@/features/admin/api/admin-bank-partner-offer-templates-api';
import type { CatalogScope } from '@/features/builder/catalog-scope';

export const projectBankPartnerOffersQueryKey = (
  scope: CatalogScope,
  projectId: string,
) => ['project-bank-partner-offers', scope, projectId] as const;

export const selectableTemplatesQueryKey = (scope: CatalogScope) =>
  ['selectable-bank-partner-offer-templates', scope] as const;

export const useProjectBankPartnerOffersQuery = (
  scope: CatalogScope,
  projectId: string,
) =>
  useQuery({
    queryKey: projectBankPartnerOffersQueryKey(scope, projectId),
    queryFn: () => listProjectBankPartnerOffers(scope, projectId),
  });

export const useSelectableTemplatesQuery = (scope: CatalogScope) =>
  useQuery({
    queryKey: selectableTemplatesQueryKey(scope),
    queryFn: () => listSelectableTemplates(scope),
  });

export const useApplyProjectBankPartnerOffersMutation = (
  scope: CatalogScope,
  projectId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApplyProjectBankPartnerOffersBody) =>
      applyProjectBankPartnerOffers(scope, projectId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectBankPartnerOffersQueryKey(scope, projectId),
      });
    },
  });
};

export const useUpdateProjectBankPartnerOfferMutation = (
  scope: CatalogScope,
  projectId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      offerId,
      body,
    }: {
      offerId: string;
      body: UpdateProjectBankPartnerOfferBody;
    }) => updateProjectBankPartnerOffer(scope, projectId, offerId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectBankPartnerOffersQueryKey(scope, projectId),
      });
    },
  });
};

export const useDeleteProjectBankPartnerOfferMutation = (
  scope: CatalogScope,
  projectId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offerId: string) =>
      deleteProjectBankPartnerOffer(scope, projectId, offerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: projectBankPartnerOffersQueryKey(scope, projectId),
      });
    },
  });
};
