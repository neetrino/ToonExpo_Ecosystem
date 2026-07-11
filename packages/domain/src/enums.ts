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
