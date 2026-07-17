import type { PublicCanvas, PublicHotspot } from '@toonexpo/contracts';

import { serverApiRequest } from '@/lib/api/server';

export type PublicCanvasContext =
  | { projectId: string }
  | { buildingId: string }
  | { floorId: string };

type HotspotRow = {
  id: string;
  x: number;
  y: number;
  label: string | null;
  building: { id: string; name: string; status: string } | null;
  floor: {
    id: string;
    name: string;
    level: number;
    buildingId: string;
    status: string;
    building: { status: string };
  } | null;
  apartment: {
    id: string;
    code: string;
    status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
    floorId: string;
    floor: { buildingId: string; status: string; building: { status: string } };
  } | null;
};

export function mapPublicHotspot(row: HotspotRow): PublicHotspot | null {
  if (row.building?.status === 'PUBLISHED') {
    return {
      id: row.id,
      x: row.x,
      y: row.y,
      label: row.label,
      target: { type: 'building', buildingId: row.building.id, name: row.building.name },
    };
  }
  if (row.floor?.status === 'PUBLISHED' && row.floor.building.status === 'PUBLISHED') {
    return {
      id: row.id,
      x: row.x,
      y: row.y,
      label: row.label,
      target: {
        type: 'floor',
        floorId: row.floor.id,
        buildingId: row.floor.buildingId,
        name: row.floor.name,
        level: row.floor.level,
      },
    };
  }
  if (
    row.apartment &&
    row.apartment.floor.status === 'PUBLISHED' &&
    row.apartment.floor.building.status === 'PUBLISHED'
  ) {
    return {
      id: row.id,
      x: row.x,
      y: row.y,
      label: row.label,
      target: {
        type: 'apartment',
        apartmentId: row.apartment.id,
        floorId: row.apartment.floorId,
        buildingId: row.apartment.floor.buildingId,
        code: row.apartment.code,
        status: row.apartment.status,
      },
    };
  }
  return null;
}

export function resolvePublishedCanvas(
  context: PublicCanvasContext,
): Promise<PublicCanvas | null> {
  const query = new URLSearchParams(context).toString();
  return serverApiRequest<PublicCanvas | null>(`/visual-map/public?${query}`);
}
