import { describe, expect, it } from "vitest";
import type { VenueMapPublishRequestBody } from "@toonexpo/contracts";

import {
  BOS_VENUE_MAP_CUSTOM_LABEL_PRIVACY_MESSAGE,
  BOS_VENUE_MAP_DUPLICATE_CODE_MESSAGE,
  BOS_VENUE_MAP_EMPTY_CELLS_MESSAGE,
  BOS_VENUE_MAP_HIDDEN_PRIVACY_MESSAGE,
} from "../integrations.constants.js";
import { validateVenueMapPublishPayload } from "./bos-venue-map-publish.validator.js";

const CHECKSUM = "a".repeat(64);

const baseBody = (
  areas: VenueMapPublishRequestBody["content"]["areas"],
): VenueMapPublishRequestBody => ({
  request_id: "req-1",
  schema_version: "venue-map.v1",
  bos_venue_plan_id: "plan-1",
  bos_event_cycle_id: "cycle-1",
  bos_event_cycle_code: "2026",
  snapshot_version: 1,
  checksum: CHECKSUM,
  published_at: "2026-08-12T08:00:00.000Z",
  content: {
    title: "Hall A",
    background: {
      url: "https://cdn.example.com/map.png",
      width: 2000,
      height: 1000,
      pixels_per_meter: 20,
      grid_origin_x: 0,
      grid_origin_y: 0,
    },
    areas,
  },
});

describe("validateVenueMapPublishPayload", () => {
  it("accepts a hidden area without occupant identity", () => {
    const errors = validateVenueMapPublishPayload(
      baseBody([
        {
          code: "A1",
          square_meters: 12,
          cells: [{ x: 0, y: 0 }],
          public_display_mode: "hidden",
        },
      ]),
    );
    expect(errors).toEqual([]);
  });

  it("rejects hidden areas that include occupant identity", () => {
    const errors = validateVenueMapPublishPayload(
      baseBody([
        {
          code: "A1",
          square_meters: 12,
          cells: [{ x: 0, y: 0 }],
          public_display_mode: "hidden",
          occupant: { organization_name: "Secret Co" },
        },
      ]),
    );
    expect(errors[0]).toContain(BOS_VENUE_MAP_HIDDEN_PRIVACY_MESSAGE);
  });

  it("rejects custom_label areas that include occupant identity", () => {
    const errors = validateVenueMapPublishPayload(
      baseBody([
        {
          code: "A1",
          square_meters: 12,
          cells: [{ x: 0, y: 0 }],
          public_display_mode: "custom_label",
          custom_label: "Cafe",
          occupant: { organization_name: "Secret Co" },
        },
      ]),
    );
    expect(errors[0]).toContain(BOS_VENUE_MAP_CUSTOM_LABEL_PRIVACY_MESSAGE);
  });

  it("rejects duplicate area codes and empty cells", () => {
    const errors = validateVenueMapPublishPayload(
      baseBody([
        {
          code: "A1",
          square_meters: 12,
          cells: [{ x: 0, y: 0 }],
          public_display_mode: "organization",
          occupant: { organization_name: "Builder" },
        },
        {
          code: "A1",
          square_meters: 8,
          cells: [],
          public_display_mode: "organization",
          occupant: { organization_name: "Other" },
        },
      ]),
    );
    expect(errors.some((item) => item.includes(BOS_VENUE_MAP_DUPLICATE_CODE_MESSAGE))).toBe(
      true,
    );
    expect(errors.some((item) => item.includes(BOS_VENUE_MAP_EMPTY_CELLS_MESSAGE))).toBe(true);
  });
});
