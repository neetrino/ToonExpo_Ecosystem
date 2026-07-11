import type { ApartmentStatus, DealStage } from '@toonexpo/domain';

export const DEAL_STAGE_BADGE_CLASS: Record<DealStage, string> = {
  NEW_REQUEST: 'crm-stage-badge crm-stage-badge--new',
  ASSIGNED: 'crm-stage-badge crm-stage-badge--assigned',
  CONTACTED: 'crm-stage-badge crm-stage-badge--contacted',
  FOLLOW_UP_NEEDED: 'crm-stage-badge crm-stage-badge--follow-up',
  APARTMENT_SELECTED: 'crm-stage-badge crm-stage-badge--apartment',
  RESERVED: 'crm-stage-badge crm-stage-badge--reserved',
  CONVERTED: 'crm-stage-badge crm-stage-badge--converted',
  CLOSED: 'crm-stage-badge crm-stage-badge--closed',
  LOST: 'crm-stage-badge crm-stage-badge--lost',
};

export const APARTMENT_STATUS_BADGE_CLASS: Record<ApartmentStatus, string> = {
  AVAILABLE: 'portal-apartment-status portal-apartment-status--AVAILABLE',
  RESERVED: 'portal-apartment-status portal-apartment-status--RESERVED',
  SOLD: 'portal-apartment-status portal-apartment-status--SOLD',
};
