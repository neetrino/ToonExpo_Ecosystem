import type { CrmDealStatus, RequestSource } from '@toonexpo/contracts';

/** Kanban column order (left → right). */
export const CRM_KANBAN_STATUSES: readonly CrmDealStatus[] = [
  'new_request',
  'assigned',
  'contacted',
  'follow_up_needed',
  'apartment_selected',
  'reserved',
  'converted',
  'closed',
  'lost',
] as const;

export const CRM_BOARD_REQUEST_SOURCES: readonly RequestSource[] = [
  'buyer_project_request',
  'builder_buyer_qr_scan',
  'manual_builder_entry',
  'event_interaction',
] as const;

/** Top accent bar colors for columns (ToonExpo brand palette). */
export const CRM_KANBAN_COLUMN_ACCENT: Record<CrmDealStatus, string> = {
  new_request: 'bg-brand',
  assigned: 'bg-ink-muted',
  contacted: 'bg-brand-secondary',
  follow_up_needed: 'bg-accent',
  apartment_selected: 'bg-brand',
  reserved: 'bg-brand-secondary',
  converted: 'bg-success',
  closed: 'bg-ink-muted',
  lost: 'bg-danger',
};

export type CrmBoardMode = 'edit' | 'readonly';
