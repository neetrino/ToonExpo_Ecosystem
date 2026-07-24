'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateAdminManualDealBody } from '@toonexpo/contracts';

import {
  createAdminManualCrmDeal,
  getAdminCrmDeal,
  listAdminCrmDeals,
  type ListAdminCrmDealsParams,
} from '@/features/admin/api/admin-crm-api';
import { ADMIN_CRM_DEALS_QUERY_KEY, adminCrmDealQueryKey } from '@/features/admin/constants';

/**
 * Paginated admin CRM deals (cross-company).
 */
export const useAdminCrmDealsQuery = (params: ListAdminCrmDealsParams) =>
  useQuery({
    queryKey: [...ADMIN_CRM_DEALS_QUERY_KEY, params],
    queryFn: () => listAdminCrmDeals(params),
    placeholderData: keepPreviousData,
  });

/**
 * Single admin CRM deal detail.
 */
export const useAdminCrmDealQuery = (id: string) =>
  useQuery({
    queryKey: adminCrmDealQueryKey(id),
    queryFn: () => getAdminCrmDeal(id),
    enabled: id.length > 0,
  });

/**
 * Creates a manual CRM deal for a builder company.
 */
export const useCreateAdminManualDealMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAdminManualDealBody) => createAdminManualCrmDeal(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_CRM_DEALS_QUERY_KEY });
    },
  });
};
