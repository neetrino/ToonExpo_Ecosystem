'use client';

import { useMemo } from 'react';

import type { GeoMapObject } from '@/features/geo-map/types';
import type { ObjectTransformOverride } from '@/features/geo-map/utils/apply-position-override';
import { applyTransformOverride } from '@/features/geo-map/utils/apply-position-override';
import type { LngLatBounds } from '@/features/geo-map/utils/geo-bounds';
import {
  splitObjectsByVisibility,
  type ObjectVisibilitySplit,
} from '@/features/geo-map/utils/object-visibility';

/**
 * Applies admin transform preview then any in-progress drag override (drag wins
 * for lng/lat), then splits into markers vs. models by zoom/viewport.
 */
export const useVisibleObjects = (
  objects: GeoMapObject[],
  dragOverride: ObjectTransformOverride | null,
  zoom: number,
  bounds: LngLatBounds | null,
  transformOverride: ObjectTransformOverride | null = null,
): ObjectVisibilitySplit => {
  const effectiveObjects = useMemo(() => {
    const withPreview = applyTransformOverride(objects, transformOverride);
    return applyTransformOverride(withPreview, dragOverride);
  }, [objects, transformOverride, dragOverride]);

  return useMemo(
    () => splitObjectsByVisibility(effectiveObjects, zoom, bounds),
    [effectiveObjects, zoom, bounds],
  );
};
