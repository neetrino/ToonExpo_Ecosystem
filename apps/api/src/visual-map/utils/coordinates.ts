import { BadRequestException } from "@nestjs/common";

import {
  VISUAL_MAP_COORD_MAX,
  VISUAL_MAP_COORD_MIN,
} from "../visual-map.constants.js";

/**
 * Validates hotspot coordinates are within 0–100 inclusive.
 */
export const assertValidCoordinates = (
  xPercent: number,
  yPercent: number,
): void => {
  const invalid =
    xPercent < VISUAL_MAP_COORD_MIN ||
    xPercent > VISUAL_MAP_COORD_MAX ||
    yPercent < VISUAL_MAP_COORD_MIN ||
    yPercent > VISUAL_MAP_COORD_MAX;

  if (invalid) {
    throw new BadRequestException(
      `Coordinates must be between ${VISUAL_MAP_COORD_MIN} and ${VISUAL_MAP_COORD_MAX}`,
    );
  }
};
