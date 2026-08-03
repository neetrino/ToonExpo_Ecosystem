/**
 * Cheap dedupe / signature helpers for preserved OSM MultiPolygon sibling parts.
 */

import type { PreservedOsmSiblingPart } from '@/features/geo-map/types';
import { footprintArea } from '@/features/geo-map/utils/building-identification';

const SIBLING_DEDUPE_COORD_DECIMALS = 7;

/**
 * Cheap geometry key for sibling-part dedupe: outer-ring length, first
 * coordinate (~7 decimals), and planar footprint area.
 */
export const preservedSiblingPartDedupeKey = (part: PreservedOsmSiblingPart): string => {
  const outer = part.geometry.coordinates[0] ?? [];
  const [lng = 0, lat = 0] = outer[0] ?? [];
  return [
    outer.length,
    lng.toFixed(SIBLING_DEDUPE_COORD_DECIMALS),
    lat.toFixed(SIBLING_DEDUPE_COORD_DECIMALS),
    footprintArea(part.geometry),
  ].join(':');
};

/** Dedupes preserved sibling parts by {@link preservedSiblingPartDedupeKey}. */
export const dedupePreservedSiblingParts = (
  parts: readonly PreservedOsmSiblingPart[],
): PreservedOsmSiblingPart[] => {
  const seen = new Set<string>();
  const result: PreservedOsmSiblingPart[] = [];
  for (const part of parts) {
    const key = preservedSiblingPartDedupeKey(part);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(part);
  }
  return result;
};

/** Deterministic change signature from dedupe keys + extrusion heights. */
export const buildPreservedPartsSignature = (parts: readonly PreservedOsmSiblingPart[]): string =>
  [...parts]
    .map((part) => `${preservedSiblingPartDedupeKey(part)}:${part.heightM}:${part.minHeightM}`)
    .sort()
    .join('|');
