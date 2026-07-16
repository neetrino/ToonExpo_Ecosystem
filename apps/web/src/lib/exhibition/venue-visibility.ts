import type { ExhibitionEventStatus } from '@toonexpo/domain';

/**
 * Public venue map visibility rule (Sprint 7.6).
 * Reuses ExhibitionEventStatus — no mapPublished flag.
 * Visitor-visible when the event is ACTIVE (the operational “live” status).
 */
export const PUBLIC_VENUE_MAP_EVENT_STATUSES = [
  'ACTIVE',
] as const satisfies ReadonlyArray<ExhibitionEventStatus>;

export type PublicVenueMapEventStatus = (typeof PUBLIC_VENUE_MAP_EVENT_STATUSES)[number];

export function isPublicVenueMapEventStatus(
  status: ExhibitionEventStatus,
): status is PublicVenueMapEventStatus {
  return (PUBLIC_VENUE_MAP_EVENT_STATUSES as ReadonlyArray<string>).includes(status);
}
