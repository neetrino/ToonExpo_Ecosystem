import { BadRequestException } from '@nestjs/common';
import type { VisualHotspotTargetType, VisualMapContextType } from '@toonexpo/contracts';
import { VisualHotspotTargetType as DbTargetType } from '@toonexpo/db';

import { CONTEXT_ALLOWED_TARGET_TYPES, CONTEXT_TARGET_TYPE } from '../visual-map.constants.js';

/**
 * Returns the primary hotspot target type for a canvas context.
 */
export const expectedTargetType = (contextType: VisualMapContextType): VisualHotspotTargetType =>
  CONTEXT_TARGET_TYPE[contextType];

/**
 * Ensures the hotspot target type is allowed for the canvas context layer.
 */
export const assertTargetTypeMatchesContext = (
  contextType: VisualMapContextType,
  targetType: VisualHotspotTargetType,
): void => {
  const allowed = CONTEXT_ALLOWED_TARGET_TYPES[contextType] as readonly string[];
  if (!allowed.includes(targetType)) {
    throw new BadRequestException(
      `Target type "${targetType}" is invalid for ${contextType} canvas`,
    );
  }
};

export const toDbTargetType = (targetType: VisualHotspotTargetType): DbTargetType =>
  targetType as DbTargetType;
