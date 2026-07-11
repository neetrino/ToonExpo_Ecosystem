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
