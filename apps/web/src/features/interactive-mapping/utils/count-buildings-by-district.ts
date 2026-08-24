import type { InteractiveMappingBuildingSummary } from '@toonexpo/contracts';

/**
 * Counts buildings per district id for mapping phase district pickers.
 */
export const countBuildingsByDistrict = (
  buildings: InteractiveMappingBuildingSummary[],
): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const building of buildings) {
    if (!building.districtId) {
      continue;
    }
    counts[building.districtId] = (counts[building.districtId] ?? 0) + 1;
  }
  return counts;
};
