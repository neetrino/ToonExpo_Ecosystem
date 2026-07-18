import { BadRequestException } from "@nestjs/common";
import type {
  VisualHotspotTargetType,
  VisualMapContextType,
} from "@toonexpo/contracts";
import { VisualHotspotTargetType as DbTargetType } from "@toonexpo/db";

import { CONTEXT_TARGET_TYPE } from "../visual-map.constants.js";

/**
 * Returns the allowed hotspot target type for a canvas context.
 */
export const expectedTargetType = (
  contextType: VisualMapContextType,
): VisualHotspotTargetType => CONTEXT_TARGET_TYPE[contextType];

/**
 * Ensures the hotspot target type matches the canvas context layer.
 */
export const assertTargetTypeMatchesContext = (
  contextType: VisualMapContextType,
  targetType: VisualHotspotTargetType,
): void => {
  if (expectedTargetType(contextType) !== targetType) {
    throw new BadRequestException(
      `Target type "${targetType}" is invalid for ${contextType} canvas`,
    );
  }
};

export const toDbTargetType = (
  targetType: VisualHotspotTargetType,
): DbTargetType => targetType as DbTargetType;
