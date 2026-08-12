import type { VenueMapPublishRequestBody, VenueMapSnapshotArea } from "@toonexpo/contracts";

import {
  BOS_VENUE_MAP_CUSTOM_LABEL_PRIVACY_MESSAGE,
  BOS_VENUE_MAP_DUPLICATE_CODE_MESSAGE,
  BOS_VENUE_MAP_EMPTY_CELLS_MESSAGE,
  BOS_VENUE_MAP_HIDDEN_PRIVACY_MESSAGE,
} from "../integrations.constants.js";

/**
 * Business-level snapshot checks that class-validator cannot express.
 */
export const validateVenueMapPublishPayload = (
  body: VenueMapPublishRequestBody,
): string[] => {
  const errors: string[] = [];
  const codes = new Set<string>();

  for (const area of body.content.areas) {
    collectAreaErrors(area, codes, errors);
  }

  return errors;
};

const collectAreaErrors = (
  area: VenueMapSnapshotArea,
  codes: Set<string>,
  errors: string[],
): void => {
  if (codes.has(area.code)) {
    errors.push(`${BOS_VENUE_MAP_DUPLICATE_CODE_MESSAGE}: ${area.code}`);
  }
  codes.add(area.code);

  if (area.cells.length === 0) {
    errors.push(`${BOS_VENUE_MAP_EMPTY_CELLS_MESSAGE}: ${area.code}`);
  }

  if (area.public_display_mode === "hidden") {
    if (area.occupant !== undefined || area.custom_label !== undefined) {
      errors.push(`${BOS_VENUE_MAP_HIDDEN_PRIVACY_MESSAGE}: ${area.code}`);
    }
    return;
  }

  if (area.public_display_mode === "custom_label" && area.occupant !== undefined) {
    errors.push(`${BOS_VENUE_MAP_CUSTOM_LABEL_PRIVACY_MESSAGE}: ${area.code}`);
  }
};
