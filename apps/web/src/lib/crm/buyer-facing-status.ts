import type { DealStage } from '@toonexpo/domain';

/**
 * Buyer-facing statuses per docs/02-ToonExpo-Ecosystem/01-Modules/07-QR-System/03-Buyer-History-And-Visibility.md
 * (Buyer-Friendly Status section).
 */
export const BUYER_FACING_STATUSES = [
  'request_sent',
  'builder_received',
  'in_contact',
  'offer_preparing',
  'reserved',
  'closed',
  'cancelled',
] as const;

export type BuyerFacingStatus = (typeof BUYER_FACING_STATUSES)[number];

/** Maps internal CRM pipeline stages to buyer-visible status labels. */
export function mapDealStageToBuyerStatus(stage: DealStage): BuyerFacingStatus {
  switch (stage) {
    case 'NEW_REQUEST':
      return 'request_sent';
    case 'ASSIGNED':
      return 'builder_received';
    case 'CONTACTED':
    case 'FOLLOW_UP_NEEDED':
      return 'in_contact';
    case 'APARTMENT_SELECTED':
      return 'offer_preparing';
    case 'RESERVED':
      return 'reserved';
    case 'CONVERTED':
    case 'CLOSED':
      return 'closed';
    case 'LOST':
      return 'cancelled';
  }
}
