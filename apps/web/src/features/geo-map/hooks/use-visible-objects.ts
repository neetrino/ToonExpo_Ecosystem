'use client';

import { useMemo } from 'react';

import type { GeoMapObject } from '@/features/geo-map/types';
import type { ObjectPositionOverride } from '@/features/geo-map/utils/apply-position-override';
import { applyPositionOverride } from '@/features/geo-map/utils/apply-position-override';
import type { LngLatBounds } from '@/features/geo-map/utils/geo-bounds';
import {
  splitObjectsByVisibility,
  type ObjectVisibilitySplit,
} from '@/features/geo-map/utils/object-visibility';

/**
 * Applies any in-progress drag override to `objects`, then splits the result
 * into markers (below `minZoom`) vs. models (at/above `minZoom`, in viewport).
 */
export const useVisibleObjects = (
  objects: GeoMapObject[],
  dragOverride: ObjectPositionOverride | null,
  zoom: number,
  bounds: LngLatBounds | null,
): ObjectVisibilitySplit => {
  const effectiveObjects = useMemo(
    () => applyPositionOverride(objects, dragOverride),
    [objects, dragOverride],
  );

  return useMemo(
    () => splitObjectsByVisibility(effectiveObjects, zoom, bounds),
    [effectiveObjects, zoom, bounds],
  );
};
