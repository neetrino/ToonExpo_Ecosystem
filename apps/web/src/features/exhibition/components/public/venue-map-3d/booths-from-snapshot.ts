import type { PublicVenueMapSnapshotResponse } from '@toonexpo/contracts';

import type {
  VenueBooth,
  VenueBoothKind,
} from '@/features/exhibition/components/public/venue-map-3d/venue-map-booths';
import { resolveVenueMapAreaTitle } from '@/features/exhibition/utils/resolve-venue-map-area-title';

/** Main hall footprint from the floor plan, in PDF points. */
const HALL_X = 137;
const HALL_Y = 779;
const HALL_WIDTH = 2236;
const HALL_HEIGHT = 637;
const BIG_BOOTH_SQM = 200;

const kindFor = (sqm: number, named: boolean): VenueBoothKind => {
  if (!named) return 'open';
  if (sqm >= BIG_BOOTH_SQM) return 'big';
  return 'booth';
};

/**
 * Places the published BOS areas onto the 3D hall floor.
 * Rects stay in the snapshot's pixel space and are fitted into the hall.
 */
export const boothsFromSnapshot = (snapshot: PublicVenueMapSnapshotResponse): VenueBooth[] => {
  const scale = Math.min(HALL_WIDTH / snapshot.mapWidth, HALL_HEIGHT / snapshot.mapHeight);
  const offsetX = HALL_X + (HALL_WIDTH - snapshot.mapWidth * scale) / 2;
  const offsetY = HALL_Y + (HALL_HEIGHT - snapshot.mapHeight * scale) / 2;

  return snapshot.areas.flatMap((area) => {
    if (area.rects.length === 0) return [];
    const title = resolveVenueMapAreaTitle(area);
    const named = area.displayMode !== 'hidden' && title !== area.code;
    return [
      {
        id: area.id,
        name: named ? title : null,
        sqm: area.areaSqm,
        code: area.code,
        kind: kindFor(area.areaSqm, named),
        href: area.company?.href ?? null,
        searchText: [area.code, area.name ?? '', area.publicLabel ?? '', area.company?.name ?? '']
          .join(' ')
          .toLowerCase(),
        parts: area.rects.map(
          (rect) =>
            [
              offsetX + rect.x * scale,
              offsetY + rect.y * scale,
              offsetX + (rect.x + rect.width) * scale,
              offsetY + (rect.y + rect.height) * scale,
            ] as const,
        ),
      },
    ];
  });
};
