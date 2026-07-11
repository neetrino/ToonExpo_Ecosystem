import type { PublicHotspotTarget } from '@toonexpo/contracts';

export const BUILDING_ANCHOR_PREFIX = 'building';
export const FLOOR_ANCHOR_PREFIX = 'floor';
export const APARTMENT_ANCHOR_PREFIX = 'apartment';

/** In-page anchor href for a published hotspot target (v1 — no dedicated detail routes). */
export function buildPublicHotspotHref(target: PublicHotspotTarget): string {
  if (target.type === 'building') {
    return `#${BUILDING_ANCHOR_PREFIX}-${target.buildingId}`;
  }
  if (target.type === 'floor') {
    return `#${FLOOR_ANCHOR_PREFIX}-${target.floorId}`;
  }
  return `#${APARTMENT_ANCHOR_PREFIX}-${target.apartmentId}`;
}

export function buildBuildingAnchorId(buildingId: string): string {
  return `${BUILDING_ANCHOR_PREFIX}-${buildingId}`;
}

export function buildFloorAnchorId(floorId: string): string {
  return `${FLOOR_ANCHOR_PREFIX}-${floorId}`;
}

export function buildApartmentAnchorId(apartmentId: string): string {
  return `${APARTMENT_ANCHOR_PREFIX}-${apartmentId}`;
}
