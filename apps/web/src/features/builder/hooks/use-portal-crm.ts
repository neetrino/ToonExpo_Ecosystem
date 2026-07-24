'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AttachCrmDealApartmentBody,
  CreateCrmActivityBody,
  CreateCrmNoteBody,
  CreateDealFromScanBody,
  CreateManualDealBody,
  UpdateCrmActivityBody,
  UpdateCrmDealBody,
} from '@toonexpo/contracts';

import {
  addCrmActivity,
  addCrmNote,
  attachCrmDealApartment,
  createCrmDealFromScan,
  createManualCrmDeal,
  deleteCrmDeal,
  detachCrmDealApartment,
  getCrmDeal,
  listCrmDeals,
  updateCrmActivity,
  updateCrmDeal,
  type ListCrmDealsParams,
} from '@/features/builder/api/portal-crm-api';
import { PORTAL_CRM_DEALS_QUERY_KEY, portalCrmDealQueryKey } from '@/features/builder/constants';

/**
 * Paginated CRM deals with optional filters.
 */
export const useCrmDealsQuery = (params: ListCrmDealsParams) =>
  useQuery({
    queryKey: [...PORTAL_CRM_DEALS_QUERY_KEY, params],
    queryFn: () => listCrmDeals(params),
    placeholderData: keepPreviousData,
  });

/**
 * Single CRM deal detail.
 */
export const useCrmDealQuery = (id: string) =>
  useQuery({
    queryKey: portalCrmDealQueryKey(id),
    queryFn: () => getCrmDeal(id),
    enabled: id.length > 0,
  });

const invalidateCrmLists = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: PORTAL_CRM_DEALS_QUERY_KEY });
};

/**
 * Creates a manual CRM deal.
 */
export const useCreateManualDealMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateManualDealBody) => createManualCrmDeal(body),
    onSuccess: () => {
      invalidateCrmLists(queryClient);
    },
  });
};

/**
 * Creates a deal from a QR scan event.
 */
export const useCreateDealFromScanMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDealFromScanBody) => createCrmDealFromScan(body),
    onSuccess: () => {
      invalidateCrmLists(queryClient);
    },
  });
};

/**
 * Patches deal status / assignee / project.
 */
export const useUpdateCrmDealMutation = (dealId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateCrmDealBody) => updateCrmDeal(dealId, body),
    onSuccess: (deal) => {
      queryClient.setQueryData(portalCrmDealQueryKey(dealId), deal);
      invalidateCrmLists(queryClient);
    },
  });
};

/**
 * Deletes a CRM deal permanently.
 */
export const useDeleteCrmDealMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dealId: string) => deleteCrmDeal(dealId),
    onSuccess: (_result, dealId) => {
      queryClient.removeQueries({ queryKey: portalCrmDealQueryKey(dealId) });
      invalidateCrmLists(queryClient);
    },
  });
};

/**
 * Attaches an apartment to a deal.
 */
export const useAttachDealApartmentMutation = (dealId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AttachCrmDealApartmentBody) => attachCrmDealApartment(dealId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalCrmDealQueryKey(dealId),
      });
      invalidateCrmLists(queryClient);
    },
  });
};

/**
 * Detaches an apartment from a deal.
 */
export const useDetachDealApartmentMutation = (dealId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (apartmentId: string) => detachCrmDealApartment(dealId, apartmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalCrmDealQueryKey(dealId),
      });
      invalidateCrmLists(queryClient);
    },
  });
};

/**
 * Adds an internal note.
 */
export const useAddCrmNoteMutation = (dealId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCrmNoteBody) => addCrmNote(dealId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalCrmDealQueryKey(dealId),
      });
      invalidateCrmLists(queryClient);
    },
  });
};

/**
 * Adds a follow-up activity.
 */
export const useAddCrmActivityMutation = (dealId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCrmActivityBody) => addCrmActivity(dealId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalCrmDealQueryKey(dealId),
      });
      invalidateCrmLists(queryClient);
    },
  });
};

/**
 * Updates an activity (e.g. mark done).
 */
export const useUpdateCrmActivityMutation = (dealId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ activityId, body }: { activityId: string; body: UpdateCrmActivityBody }) =>
      updateCrmActivity(dealId, activityId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalCrmDealQueryKey(dealId),
      });
      invalidateCrmLists(queryClient);
    },
  });
};
