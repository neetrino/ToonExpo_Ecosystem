import type { DealStage } from '@toonexpo/domain';

/** Open pipeline stages per 05-Deal-Creation-And-Deduplication.md */
export const OPEN_DEAL_STAGES = [
  'NEW_REQUEST',
  'ASSIGNED',
  'CONTACTED',
  'FOLLOW_UP_NEEDED',
  'APARTMENT_SELECTED',
  'RESERVED',
] as const satisfies readonly DealStage[];

/** Terminal stages — duplicates are allowed once a deal reaches these. */
export const TERMINAL_DEAL_STAGES = [
  'CONVERTED',
  'CLOSED',
  'LOST',
] as const satisfies readonly DealStage[];

/**
 * Recency window for public-request dedup when the doc does not specify one.
 * Combined with {@link OPEN_DEAL_STAGES} so only recent open deals are merged.
 */
export const DEDUP_RECENCY_WINDOW_HOURS = 24;

export const HONEYPOT_FIELD_NAME = 'website';
