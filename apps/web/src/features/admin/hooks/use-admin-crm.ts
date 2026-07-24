'use client';

import { useQuery } from '@tanstack/react-query';

import {
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
  });

/**
 * Single admin CRM deal detail (read-only).
 */
export const useAdminCrmDealQuery = (id: string) =>
  useQuery({
    queryKey: adminCrmDealQueryKey(id),
    queryFn: () => getAdminCrmDeal(id),
    enabled: id.length > 0,
  });
