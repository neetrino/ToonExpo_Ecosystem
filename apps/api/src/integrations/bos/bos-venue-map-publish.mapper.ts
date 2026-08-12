import type { VenueMapPublishResponse, VenueMapPublishStatus } from "@toonexpo/contracts";
import type { Prisma } from "@toonexpo/db";

type ReceiptRecord = Prisma.MapPublicationReceiptGetPayload<object>;

export const toVenueMapPublishResponse = (
  receipt: ReceiptRecord,
): VenueMapPublishResponse => ({
  request_id: receipt.requestId,
  bos_venue_plan_id: receipt.bosVenuePlanId,
  accepted_snapshot_version: receipt.snapshotVersion,
  toonexpo_snapshot_id: receipt.snapshotId,
  status: receipt.status as VenueMapPublishStatus,
  ...(receipt.validationErrors.length > 0
    ? { validation_errors: receipt.validationErrors }
    : {}),
  ...(receipt.activatedAt
    ? { activated_at: receipt.activatedAt.toISOString() }
    : {}),
});
