import type { AdminFloorListItem } from '@toonexpo/contracts';

export const ADMIN_INVENTORY_FILTER_COMPANY_KEY = 'companyId';
export const ADMIN_INVENTORY_FILTER_BUILDING_KEY = 'buildingId';
export const ADMIN_INVENTORY_FILTER_FLOOR_KEY = 'floorId';

export const resolveDraftOrApplied = (
  draft: Record<string, string> | null,
  key: string,
  applied: string | undefined,
): string | undefined => {
  if (draft && key in draft) {
    const value = draft[key]?.trim();
    return value || undefined;
  }
  return applied;
};

export const formatFloorOptionLabel = (floor: AdminFloorListItem): string => {
  const label =
    floor.displayLabel?.trim() || floor.name?.trim() || `Floor ${floor.number}`;
  return `${label} · ${floor.buildingName}`;
};
