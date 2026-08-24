import type { AdminFloorListItem } from '@toonexpo/contracts';

import {
  decodeIntegratedFilterIds,
  encodeIntegratedFilterIds,
} from '@/shared/ui/integrated-search-filters.types';

export const ADMIN_INVENTORY_FILTER_COMPANY_KEY = 'companyId';
export const ADMIN_INVENTORY_FILTER_BUILDING_KEY = 'buildingId';
export const ADMIN_INVENTORY_FILTER_FLOOR_KEY = 'floorId';

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
