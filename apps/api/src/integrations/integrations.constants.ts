import type { BosRequestedModule } from "@toonexpo/contracts";

/** Module keys accepted on the BOS provisioning wire contract. */
export const BOS_REQUESTED_MODULES = [
  "builder_portal",
  "constructor_crm",
  "readiness",
  "partner_profile",
  "bank_offers",
  "analytics",
] as const satisfies readonly BosRequestedModule[];

/** Terminal stored statuses that replay without side effects. */
export const BOS_TERMINAL_REPLAY_STATUSES = [
  "success",
  "linked_existing",
] as const;

/** Stored statuses eligible for retry continuation. */
export const BOS_RETRY_STATUSES = ["failed", "partial"] as const;

/** Safe message returned to BOS when email is linked elsewhere. */
export const BOS_EMAIL_CONFLICT_MESSAGE =
  "Primary contact email is already linked to another participant";

/** Safe message when the contact belongs to another company. */
export const BOS_CROSS_COMPANY_MESSAGE =
  "Primary contact is already assigned to another company";

/** Safe message when invitation delivery failed but entities exist. */
export const BOS_INVITE_RETRY_MESSAGE =
  "Account created but invitation could not be sent; please retry the request";

/** Maximum request_id length accepted from BOS. */
export const BOS_REQUEST_ID_MAX_LENGTH = 128;

/** Maximum bos_company_id length accepted from BOS. */
export const BOS_COMPANY_ID_MAX_LENGTH = 128;

/** Maximum event cycle field length accepted from BOS. */
export const BOS_EVENT_CYCLE_MAX_LENGTH = 128;

/** VenueMapSnapshotV1 schema version accepted on the wire. */
export const BOS_VENUE_MAP_SCHEMA_VERSION = "venue-map.v1" as const;

/** SHA-256 hex digest length for BOS snapshot checksums. */
export const BOS_VENUE_MAP_CHECKSUM_LENGTH = 64;

/** Maximum areas in one published snapshot. */
export const BOS_VENUE_MAP_MAX_AREAS = 500;

/** Maximum grid cells per area. */
export const BOS_VENUE_MAP_MAX_CELLS_PER_AREA = 20_000;

/** Maximum background image URL length. */
export const BOS_VENUE_MAP_BACKGROUND_URL_MAX_LENGTH = 2048;

/**
 * ADAPTIVE VALUE — confirm with owner.
 * Timeout for copying the BOS background image into R2.
 */
export const BOS_VENUE_MAP_BACKGROUND_FETCH_TIMEOUT_MS = 15_000;

/** MediaAsset.relatedEntityType for ingested BOS venue backgrounds. */
export const BOS_VENUE_MAP_MEDIA_ENTITY_TYPE = "bos_venue_plan";

export const BOS_VENUE_MAP_HIDDEN_PRIVACY_MESSAGE =
  "Hidden areas must omit occupant identity and custom_label";

export const BOS_VENUE_MAP_CUSTOM_LABEL_PRIVACY_MESSAGE =
  "custom_label areas must omit occupant identity";

export const BOS_VENUE_MAP_DUPLICATE_CODE_MESSAGE =
  "Area codes must be unique within a snapshot";

export const BOS_VENUE_MAP_EMPTY_CELLS_MESSAGE =
  "Each area must include at least one cell";

export const BOS_VENUE_MAP_STALE_VERSION_MESSAGE =
  "Older snapshot version cannot replace a newer accepted version";

export const BOS_VENUE_MAP_CHECKSUM_CONFLICT_MESSAGE =
  "Same snapshot version with a different checksum is rejected";

export const BOS_VENUE_MAP_BACKGROUND_FAILED_MESSAGE =
  "Background image could not be copied into ToonExpo storage";

export const BOS_VENUE_MAP_STORE_FAILED_MESSAGE =
  "Snapshot could not be stored";
