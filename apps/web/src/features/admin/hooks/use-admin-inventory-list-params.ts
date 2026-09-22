'use client';

import type { ApartmentSalesStatus } from '@toonexpo/contracts';
import { useSearchParams } from 'next/navigation';

import {
  parseIdListParam,
  parseSalesStatusParam,
} from '@/features/admin/components/admin-inventory-list-filters';
import { ADMIN_INVENTORY_DEFAULT_PAGE_SIZE } from '@/features/admin/constants';

const FIRST_PAGE = 1;

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < FIRST_PAGE) {
    return FIRST_PAGE;
  }
  return Math.floor(parsed);
};

/**
 * Reads pagination and inventory filter query params for admin hub lists.
 */
export const useAdminInventoryListParams = (): {
  page: number;
  pageSize: number;
  companyIds: string[];
  buildingIds: string[];
  floorIds: string[];
  companyId?: string;
  buildingId?: string;
  floorId?: string;
  projectId?: string;
  salesStatus?: ApartmentSalesStatus;
} => {
  const searchParams = useSearchParams();
  const companyIds = parseIdListParam(searchParams, 'companyId');
  const buildingIds = parseIdListParam(searchParams, 'buildingId');
  const floorIds = parseIdListParam(searchParams, 'floorId');
  const projectId = searchParams.get('projectId')?.trim() || undefined;
  const salesStatus = parseSalesStatusParam(searchParams.get('salesStatus'));
  return {
    page: parsePage(searchParams.get('page')),
    pageSize: ADMIN_INVENTORY_DEFAULT_PAGE_SIZE,
    companyIds,
    buildingIds,
    floorIds,
    ...(companyIds[0] ? { companyId: companyIds[0] } : {}),
    ...(buildingIds[0] ? { buildingId: buildingIds[0] } : {}),
    ...(floorIds[0] ? { floorId: floorIds[0] } : {}),
    ...(projectId ? { projectId } : {}),
    ...(salesStatus ? { salesStatus } : {}),
  };
};
