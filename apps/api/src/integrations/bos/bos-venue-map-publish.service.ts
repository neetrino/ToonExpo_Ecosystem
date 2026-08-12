import { Injectable, Logger } from "@nestjs/common";
import type { VenueMapPublishRequestBody, VenueMapPublishResponse } from "@toonexpo/contracts";
import {
  MapPublicationReceiptStatus,
  PublicVenueMapSnapshotStatus,
} from "@toonexpo/db";

import { WebRevalidationService } from "../../common/web-revalidation/web-revalidation.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import {
  BOS_VENUE_MAP_BACKGROUND_FAILED_MESSAGE,
  BOS_VENUE_MAP_CHECKSUM_CONFLICT_MESSAGE,
  BOS_VENUE_MAP_STALE_VERSION_MESSAGE,
  BOS_VENUE_MAP_STORE_FAILED_MESSAGE,
} from "../integrations.constants.js";
import { BosVenueMapBackgroundService } from "./bos-venue-map-background.service.js";
import {
  collectOccupantCompanyIds,
  toSnapshotCreateData,
} from "./bos-venue-map-publish.areas.js";
import { toVenueMapPublishResponse } from "./bos-venue-map-publish.mapper.js";
import { validateVenueMapPublishPayload } from "./bos-venue-map-publish.validator.js";

type SnapshotIdentity = {
  id: string;
  checksum: string;
  activatedAt: Date | null;
};

/**
 * Inbound BOS VenueMapSnapshotV1 publication: validate, copy media, activate immutably.
 */
@Injectable()
export class BosVenueMapPublishService {
  private readonly logger = new Logger(BosVenueMapPublishService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly background: BosVenueMapBackgroundService,
    private readonly webRevalidation: WebRevalidationService,
  ) {}

  async publish(body: VenueMapPublishRequestBody): Promise<VenueMapPublishResponse> {
    const existingReceipt = await this.prisma.db.mapPublicationReceipt.findUnique({
      where: { requestId: body.request_id },
    });
    if (existingReceipt) {
      return toVenueMapPublishResponse(existingReceipt);
    }

    const validationErrors = validateVenueMapPublishPayload(body);
    if (validationErrors.length > 0) {
      return this.storeReceipt(body, MapPublicationReceiptStatus.rejected, validationErrors);
    }

    const existingSnapshot = await this.findSnapshot(
      body.bos_venue_plan_id,
      body.snapshot_version,
    );
    if (existingSnapshot) {
      return this.replayOrReject(body, existingSnapshot);
    }

    if (await this.hasNewerVersion(body.bos_venue_plan_id, body.snapshot_version)) {
      return this.storeReceipt(body, MapPublicationReceiptStatus.rejected, [
        BOS_VENUE_MAP_STALE_VERSION_MESSAGE,
      ]);
    }

    return this.ingestAndActivate(body);
  }

  private replayOrReject(
    body: VenueMapPublishRequestBody,
    existing: SnapshotIdentity,
  ): Promise<VenueMapPublishResponse> {
    if (existing.checksum === body.checksum.toLowerCase()) {
      return this.storeReceipt(
        body,
        MapPublicationReceiptStatus.already_published,
        [],
        existing,
      );
    }
    return this.storeReceipt(body, MapPublicationReceiptStatus.rejected, [
      BOS_VENUE_MAP_CHECKSUM_CONFLICT_MESSAGE,
    ]);
  }

  private async ingestAndActivate(
    body: VenueMapPublishRequestBody,
  ): Promise<VenueMapPublishResponse> {
    let mediaAssetId: string;
    try {
      const ingested = await this.background.ingest(
        body.content.background,
        body.bos_venue_plan_id,
      );
      mediaAssetId = ingested.mediaAssetId;
    } catch (error) {
      this.logger.error({ err: error, requestId: body.request_id }, "BOS map background ingest failed");
      return this.storeReceipt(body, MapPublicationReceiptStatus.failed, [
        BOS_VENUE_MAP_BACKGROUND_FAILED_MESSAGE,
      ]);
    }

    try {
      return await this.persistActiveSnapshot(body, mediaAssetId);
    } catch (error) {
      this.logger.error({ err: error, requestId: body.request_id }, "BOS map snapshot persist failed");
      return this.storeReceipt(body, MapPublicationReceiptStatus.failed, [
        BOS_VENUE_MAP_STORE_FAILED_MESSAGE,
      ]);
    }
  }

  private async persistActiveSnapshot(
    body: VenueMapPublishRequestBody,
    backgroundMediaAssetId: string,
  ): Promise<VenueMapPublishResponse> {
    const knownCompanyIds = await this.resolveCompanyIds(body);
    const activatedAt = new Date();
    const snapshot = await this.prisma.db.publicVenueMapSnapshot.create({
      data: toSnapshotCreateData(body, backgroundMediaAssetId, knownCompanyIds, activatedAt),
    });

    await this.prisma.db.publicVenueMapSnapshot.updateMany({
      where: {
        bosVenuePlanId: body.bos_venue_plan_id,
        status: PublicVenueMapSnapshotStatus.active,
        id: { not: snapshot.id },
      },
      data: {
        status: PublicVenueMapSnapshotStatus.archived,
        archivedAt: activatedAt,
      },
    });

    const receipt = await this.prisma.db.mapPublicationReceipt.create({
      data: {
        requestId: body.request_id,
        bosVenuePlanId: body.bos_venue_plan_id,
        snapshotVersion: body.snapshot_version,
        checksum: body.checksum.toLowerCase(),
        status: MapPublicationReceiptStatus.published,
        snapshotId: snapshot.id,
        validationErrors: [],
        activatedAt,
      },
    });

    this.webRevalidation.revalidateExhibition();
    return toVenueMapPublishResponse(receipt);
  }

  private async resolveCompanyIds(
    body: VenueMapPublishRequestBody,
  ): Promise<Set<string>> {
    const ids = collectOccupantCompanyIds(body.content.areas);
    if (ids.length === 0) {
      return new Set();
    }
    const rows = await this.prisma.db.company.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    return new Set(rows.map((row) => row.id));
  }

  private async findSnapshot(
    bosVenuePlanId: string,
    snapshotVersion: number,
  ): Promise<SnapshotIdentity | null> {
    return this.prisma.db.publicVenueMapSnapshot.findUnique({
      where: {
        bosVenuePlanId_snapshotVersion: { bosVenuePlanId, snapshotVersion },
      },
      select: { id: true, checksum: true, activatedAt: true },
    });
  }

  private async hasNewerVersion(
    bosVenuePlanId: string,
    snapshotVersion: number,
  ): Promise<boolean> {
    const newer = await this.prisma.db.publicVenueMapSnapshot.findFirst({
      where: {
        bosVenuePlanId,
        snapshotVersion: { gt: snapshotVersion },
      },
      select: { id: true },
    });
    return newer !== null;
  }

  private async storeReceipt(
    body: VenueMapPublishRequestBody,
    status: MapPublicationReceiptStatus,
    validationErrors: string[],
    snapshot?: SnapshotIdentity,
  ): Promise<VenueMapPublishResponse> {
    const receipt = await this.prisma.db.mapPublicationReceipt.create({
      data: {
        requestId: body.request_id,
        bosVenuePlanId: body.bos_venue_plan_id,
        snapshotVersion: body.snapshot_version,
        checksum: body.checksum.toLowerCase(),
        status,
        snapshotId: snapshot?.id ?? null,
        validationErrors,
        activatedAt:
          status === MapPublicationReceiptStatus.already_published
            ? snapshot?.activatedAt ?? null
            : null,
      },
    });
    return toVenueMapPublishResponse(receipt);
  }
}
