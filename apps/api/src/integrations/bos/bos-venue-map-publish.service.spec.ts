import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VenueMapPublishRequestBody } from "@toonexpo/contracts";
import { MapPublicationReceiptStatus } from "@toonexpo/db";

import type { WebRevalidationService } from "../../common/web-revalidation/web-revalidation.service.js";
import type { PrismaService } from "../../prisma/prisma.service.js";
import {
  BOS_VENUE_MAP_BACKGROUND_FAILED_MESSAGE,
  BOS_VENUE_MAP_CHECKSUM_CONFLICT_MESSAGE,
  BOS_VENUE_MAP_HIDDEN_PRIVACY_MESSAGE,
  BOS_VENUE_MAP_STALE_VERSION_MESSAGE,
} from "../integrations.constants.js";
import type { BosVenueMapBackgroundService } from "./bos-venue-map-background.service.js";
import { BosVenueMapPublishService } from "./bos-venue-map-publish.service.js";

const CHECKSUM = "a".repeat(64);

const validBody = (
  overrides: Partial<VenueMapPublishRequestBody> = {},
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
    areas: [
      {
        code: "A1",
        square_meters: 24,
        cells: [{ x: 0, y: 0 }],
        public_display_mode: "organization",
        occupant: { organization_name: "Builder Co", toonexpo_company_id: "co_1" },
      },
    ],
  },
  ...overrides,
});

describe("BosVenueMapPublishService", () => {
  const receiptFindUnique = vi.fn();
  const receiptCreate = vi.fn();
  const snapshotFindUnique = vi.fn();
  const snapshotFindFirst = vi.fn();
  const snapshotCreate = vi.fn();
  const snapshotUpdateMany = vi.fn();
  const companyFindMany = vi.fn();
  const ingest = vi.fn();
  const revalidateExhibition = vi.fn();

  let service: BosVenueMapPublishService;

  beforeEach(() => {
    vi.clearAllMocks();
    receiptCreate.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      requestId: data["requestId"],
      bosVenuePlanId: data["bosVenuePlanId"],
      snapshotVersion: data["snapshotVersion"],
      checksum: data["checksum"],
      status: data["status"],
      snapshotId: data["snapshotId"] ?? null,
      validationErrors: data["validationErrors"] ?? [],
      activatedAt: data["activatedAt"] ?? null,
    }));
    snapshotCreate.mockResolvedValue({ id: "snap_1" });
    companyFindMany.mockResolvedValue([{ id: "co_1" }]);
    ingest.mockResolvedValue({ mediaAssetId: "media_1" });

    const prisma = {
      db: {
        mapPublicationReceipt: {
          findUnique: receiptFindUnique,
          create: receiptCreate,
        },
        publicVenueMapSnapshot: {
          findUnique: snapshotFindUnique,
          findFirst: snapshotFindFirst,
          create: snapshotCreate,
          updateMany: snapshotUpdateMany,
        },
        company: { findMany: companyFindMany },
      },
    } as unknown as PrismaService;

    service = new BosVenueMapPublishService(
      prisma,
      { ingest } as unknown as BosVenueMapBackgroundService,
      { revalidateExhibition } as unknown as WebRevalidationService,
    );
  });

  it("replays an existing request_id without ingesting again", async () => {
    receiptFindUnique.mockResolvedValue({
      requestId: "req-1",
      bosVenuePlanId: "plan-1",
      snapshotVersion: 1,
      checksum: CHECKSUM,
      status: MapPublicationReceiptStatus.published,
      snapshotId: "snap_1",
      validationErrors: [],
      activatedAt: new Date("2026-08-12T08:00:00.000Z"),
    });

    const result = await service.publish(validBody());
    expect(result.status).toBe("published");
    expect(ingest).not.toHaveBeenCalled();
    expect(receiptCreate).not.toHaveBeenCalled();
    expect(revalidateExhibition).not.toHaveBeenCalled();
  });

  it("rejects hidden areas that leak occupant identity", async () => {
    receiptFindUnique.mockResolvedValue(null);
    const result = await service.publish(
      validBody({
        content: {
          title: "Hall A",
          background: validBody().content.background,
          areas: [
            {
              code: "A1",
              square_meters: 12,
              cells: [{ x: 0, y: 0 }],
              public_display_mode: "hidden",
              occupant: { organization_name: "Secret" },
            },
          ],
        },
      }),
    );
    expect(result.status).toBe("rejected");
    expect(result.validation_errors?.[0]).toContain(BOS_VENUE_MAP_HIDDEN_PRIVACY_MESSAGE);
    expect(ingest).not.toHaveBeenCalled();
  });

  it("returns already_published for the same version and checksum", async () => {
    receiptFindUnique.mockResolvedValue(null);
    snapshotFindUnique.mockResolvedValue({
      id: "snap_1",
      checksum: CHECKSUM,
      activatedAt: new Date("2026-08-12T08:00:00.000Z"),
    });

    const result = await service.publish(validBody({ request_id: "req-2" }));
    expect(result.status).toBe("already_published");
    expect(result.toonexpo_snapshot_id).toBe("snap_1");
    expect(ingest).not.toHaveBeenCalled();
  });

  it("rejects the same version with a different checksum", async () => {
    receiptFindUnique.mockResolvedValue(null);
    snapshotFindUnique.mockResolvedValue({
      id: "snap_1",
      checksum: "b".repeat(64),
      activatedAt: new Date("2026-08-12T08:00:00.000Z"),
    });

    const result = await service.publish(validBody());
    expect(result.status).toBe("rejected");
    expect(result.validation_errors).toEqual([BOS_VENUE_MAP_CHECKSUM_CONFLICT_MESSAGE]);
  });

  it("rejects an older version when a newer snapshot exists", async () => {
    receiptFindUnique.mockResolvedValue(null);
    snapshotFindUnique.mockResolvedValue(null);
    snapshotFindFirst.mockResolvedValue({ id: "snap_newer" });

    const result = await service.publish(validBody());
    expect(result.status).toBe("rejected");
    expect(result.validation_errors).toEqual([BOS_VENUE_MAP_STALE_VERSION_MESSAGE]);
  });

  it("publishes a new snapshot and activates it", async () => {
    receiptFindUnique.mockResolvedValue(null);
    snapshotFindUnique.mockResolvedValue(null);
    snapshotFindFirst.mockResolvedValue(null);

    const result = await service.publish(validBody());
    expect(result.status).toBe("published");
    expect(result.toonexpo_snapshot_id).toBe("snap_1");
    expect(ingest).toHaveBeenCalledOnce();
    expect(snapshotUpdateMany).toHaveBeenCalledOnce();
    expect(snapshotCreate).toHaveBeenCalledOnce();
    expect(revalidateExhibition).toHaveBeenCalledOnce();
  });

  it("returns failed when background ingest throws", async () => {
    receiptFindUnique.mockResolvedValue(null);
    snapshotFindUnique.mockResolvedValue(null);
    snapshotFindFirst.mockResolvedValue(null);
    ingest.mockRejectedValue(new Error("network"));

    const result = await service.publish(validBody());
    expect(result.status).toBe("failed");
    expect(result.validation_errors).toEqual([BOS_VENUE_MAP_BACKGROUND_FAILED_MESSAGE]);
  });
});
