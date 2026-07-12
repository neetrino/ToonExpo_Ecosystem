export const PLATFORM_ROLES = [
  'BIGPROJECTS_ADMIN',
  'BUILDER',
  'PARTNER',
  'BUYER',
  'ENTRANCE_STAFF',
] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const PUBLICATION_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export const APARTMENT_STATUSES = ['AVAILABLE', 'RESERVED', 'SOLD'] as const;

export type ApartmentStatus = (typeof APARTMENT_STATUSES)[number];

/**
 * Apartment price disclosure (v1).
 * Docs: 05-Projects/02-Entity-Fields + 05-Public-Buyer-Experience.
 * Prisma enum uses the same UPPER_SNAKE keys.
 */
export const PRICE_VISIBILITIES = [
  'PUBLIC',
  'BY_REQUEST',
  'HIDDEN',
  'VISIBLE_AFTER_LOGIN',
] as const;

export type PriceVisibility = (typeof PRICE_VISIBILITIES)[number];

/** Public DTO discriminator for how price is shown to the viewer. */
export const PRICE_DISPLAY_MODES = ['AMOUNT', 'BY_REQUEST', 'HIDDEN', 'LOGIN_REQUIRED'] as const;

export type PriceDisplayMode = (typeof PRICE_DISPLAY_MODES)[number];

/** Constructor CRM pipeline stages (v1). Docs: 09-Constructor-CRM/02-CRM-Pipeline-And-Statuses. */
export const DEAL_STAGES = [
  'NEW_REQUEST',
  'ASSIGNED',
  'CONTACTED',
  'FOLLOW_UP_NEEDED',
  'APARTMENT_SELECTED',
  'RESERVED',
  'CONVERTED',
  'CLOSED',
  'LOST',
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

/** Intake / deal source channels (v1). Docs: 08-CRM-Lead-Intake/07-Entity-Fields. */
export const REQUEST_SOURCES = [
  'PROJECT_PAGE',
  'APARTMENT_PAGE',
  'BUILDER_QR_SCAN',
  'MANUAL_BUILDER_ENTRY',
  'EVENT_INTERACTION',
] as const;

export type RequestSource = (typeof REQUEST_SOURCES)[number];

/** Minimal deal timeline activity types (v1). Docs: 09-Constructor-CRM/07-Entity-Fields. */
export const DEAL_ACTIVITY_TYPES = ['COMMENT', 'FOLLOW_UP', 'STATUS_CHANGE'] as const;

export type DealActivityType = (typeof DEAL_ACTIVITY_TYPES)[number];

/** CRM follow-up lifecycle (v1). Docs: 09-Constructor-CRM/05-Clients-Activities-Notes. */
export const ACTIVITY_STATUSES = ['PLANNED', 'DONE', 'CANCELLED'] as const;

export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

/** QR scan context / purpose (v1). Docs: 07-QR-System/06-Entity-Fields. */
export const QR_SCAN_PURPOSES = [
  'BUILDER_SCAN',
  'ENTRANCE_CHECKIN',
  'BUYER_SELF_VIEW',
  'UNKNOWN',
] as const;

export type QrScanPurpose = (typeof QR_SCAN_PURPOSES)[number];

/**
 * Partner / participant types (v1). Docs: 11-Partners-Participants/02-Partner-Types-And-Profiles.
 * Prisma enum uses the same UPPER_SNAKE keys.
 */
export const PARTNER_TYPES = [
  'BANK',
  'IT_COMPANY',
  'SPONSOR',
  'SUPPLIER',
  'INSURANCE',
  'LEGAL',
  'DESIGN_FURNITURE',
  'SERVICE_COMPANY',
  'OTHER',
] as const;

export type PartnerType = (typeof PARTNER_TYPES)[number];

/**
 * Readiness assessment / category statuses (v1).
 * Docs: 10-Builder-Readiness/02-Assessment-Model + 03-Categories-Scoring-And-Statuses.
 */
export const READINESS_STATUSES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'NEEDS_IMPROVEMENT',
  'READY',
  'BLOCKED',
] as const;

export type ReadinessStatus = (typeof READINESS_STATUSES)[number];

/** Assessment target types (v1). Docs: 10-Builder-Readiness/02-Assessment-Model. */
export const READINESS_TARGET_TYPES = ['BUILDER_COMPANY', 'PROJECT'] as const;

export type ReadinessTargetType = (typeof READINESS_TARGET_TYPES)[number];

/**
 * Exhibition event lifecycle (v1). Docs: 12-Exhibition-Map-Checkin/07-Entity-Fields.
 * Operational status — not PublicationStatus (draft/published/archived).
 */
export const EXHIBITION_EVENT_STATUSES = [
  'PLANNING',
  'ACTIVE',
  'COMPLETED',
  'ARCHIVED',
  'CANCELLED',
] as const;

export type ExhibitionEventStatus = (typeof EXHIBITION_EVENT_STATUSES)[number];

/**
 * Successful check-in record status (v1).
 * Denied/duplicate outcomes are action results, not persisted CheckIn rows.
 * Docs: 12-Exhibition-Map-Checkin/04-Entrance-Checkin-Scanner.
 */
export const CHECK_IN_STATUSES = ['ALLOWED'] as const;

export type CheckInStatus = (typeof CHECK_IN_STATUSES)[number];

/**
 * AnalyticsEvent.type values persisted in v1.
 * Docs: 14-Analytics/02-Metrics-And-Events + 06-Entity-Fields.
 *
 * Deferred (no feature yet, or already stored on domain tables):
 * - building_view / floor_view — no dedicated public pages
 * - builder_profile_view / partner_profile_view / mortgage_page_view — not instrumented
 * - bank_offer_selected — mortgage offer pick not tracked yet
 * - request_created — Deal rows cover requests
 * - qr_scanned / check_in_recorded — QrScanLog / CheckIn tables
 * - booth_selected / route_requested — venue map deferred
 * - crm_status_changed / readiness_status_changed — CRM / readiness own tables
 *
 * Note: favorite_* are aggregate counters only (no userId on AnalyticsEvent).
 * Buyer favorite lists remain private via the Favorite model.
 */
export const ANALYTICS_EVENT_TYPES = [
  'PROJECT_VIEW',
  'APARTMENT_VIEW',
  'FAVORITE_ADDED',
  'FAVORITE_REMOVED',
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

/**
 * Favorite.targetType values (v1).
 * Docs: 03-Buyer-Visitor-Area/04-Favorites-And-Saved-Apartments.
 * Builder/company favorites deferred.
 */
export const FAVORITE_TARGET_TYPES = ['PROJECT', 'APARTMENT'] as const;

export type FavoriteTargetType = (typeof FAVORITE_TARGET_TYPES)[number];

/**
 * Integration audit log direction (v1).
 * Docs: 15-Integrations/05-Errors-Idempotency-And-Audit.
 */
export const INTEGRATION_DIRECTIONS = ['INBOUND', 'OUTBOUND'] as const;

export type IntegrationDirection = (typeof INTEGRATION_DIRECTIONS)[number];

/**
 * Integration audit log status (v1).
 * Docs: 15-Integrations/05-Errors-Idempotency-And-Audit.
 */
export const INTEGRATION_AUDIT_STATUSES = ['RECEIVED', 'SUCCEEDED', 'FAILED'] as const;

export type IntegrationAuditStatus = (typeof INTEGRATION_AUDIT_STATUSES)[number];

/**
 * BOS provisioning result status returned to BOS (v1).
 * Docs: 15-Integrations/02-BOS-Account-Provisioning + 03-Integration-With-BOS/03-Integration-Contracts.
 */
export const BOS_PROVISIONING_STATUSES = ['success', 'linked_existing', 'failed'] as const;

export type BosProvisioningStatus = (typeof BOS_PROVISIONING_STATUSES)[number];

/**
 * Company types accepted on the BOS provisioning signal (v1).
 * Docs: 15-Integrations/02-BOS-Account-Provisioning.
 */
export const BOS_COMPANY_TYPES = ['builder', 'partner', 'bank'] as const;

export type BosCompanyType = (typeof BOS_COMPANY_TYPES)[number];

/**
 * Recommended ToonExpo module keys on provisioning requests (v1).
 * Stored on the audit/idempotency snapshot; role remains the access gate until module ACL exists.
 */
export const BOS_REQUESTED_MODULES = [
  'builder_portal',
  'constructor_crm',
  'readiness',
  'partner_profile',
  'bank_offers',
  'analytics',
] as const;

export type BosRequestedModule = (typeof BOS_REQUESTED_MODULES)[number];

/**
 * Platform audit log actions (v1).
 * Docs: 05-Projects §12 acceptance + 15-Integrations/05 audit conventions.
 */
export const AUDIT_ACTIONS = [
  'PUBLICATION_CHANGE',
  'PROVISION_ACCOUNT',
  'SETTINGS_UPDATE',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

/**
 * Entity kinds recorded on AuditLog (v1 publication + provisioning).
 */
export const AUDIT_ENTITY_TYPES = [
  'PROJECT',
  'BUILDING',
  'FLOOR',
  'PARTNER',
  'BANK_OFFER',
  'VISUAL_CANVAS',
  'EXHIBITION_EVENT',
  'USER',
  'PLATFORM_SETTING',
] as const;

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];
