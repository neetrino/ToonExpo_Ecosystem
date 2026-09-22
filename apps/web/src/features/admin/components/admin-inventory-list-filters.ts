import type { AdminFloorListItem, ApartmentSalesStatus } from '@toonexpo/contracts';

import {
  decodeIntegratedFilterIds,
  encodeIntegratedFilterIds,
} from '@/shared/ui/integrated-search-filters.types';

export const ADMIN_INVENTORY_FILTER_COMPANY_KEY = 'companyId';
export const ADMIN_INVENTORY_FILTER_BUILDING_KEY = 'buildingId';
export const ADMIN_INVENTORY_FILTER_FLOOR_KEY = 'floorId';
export const ADMIN_INVENTORY_FILTER_SALES_STATUS_KEY = 'salesStatus';

export const ADMIN_INVENTORY_SALES_STATUSES = [
  'available',
  'reserved',
  'sold',
] as const satisfies readonly ApartmentSalesStatus[];

const SALES_STATUS_SET = new Set<string>(ADMIN_INVENTORY_SALES_STATUSES);

export { decodeIntegratedFilterIds, encodeIntegratedFilterIds };

export const resolveDraftOrAppliedIds = (
  draft: Record<string, string> | null,
  key: string,
  applied: readonly string[],
): string[] => {
  if (draft && key in draft) {
    return decodeIntegratedFilterIds(draft[key]);
  }
  return [...applied];
};

export const formatFloorOptionLabel = (floor: AdminFloorListItem): string => {
  const label =
    floor.displayLabel?.trim() || floor.name?.trim() || `Floor ${floor.number}`;
  return `${label} · ${floor.buildingName}`;
};

export const parseIdListParam = (searchParams: URLSearchParams, key: string): string[] => {
  const all = searchParams.getAll(key);
  if (all.length === 0) {
    return [];
  }
  return decodeIntegratedFilterIds(all.join(','));
};

/**
 * Parses a sales-status query value; returns undefined when missing or invalid.
 */
export const parseSalesStatusParam = (
  value: string | null | undefined,
): ApartmentSalesStatus | undefined => {
  const trimmed = value?.trim();
  if (!trimmed || !SALES_STATUS_SET.has(trimmed)) {
    return undefined;
  }
  return trimmed as ApartmentSalesStatus;
};
