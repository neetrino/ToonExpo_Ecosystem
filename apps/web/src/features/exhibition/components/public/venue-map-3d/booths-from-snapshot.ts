import type { PublicVenueMapArea, PublicVenueMapSnapshotResponse } from '@toonexpo/contracts';

import type {
  VenueBooth,
  VenueBoothKind,
} from '@/features/exhibition/components/public/venue-map-3d/venue-map-booths';
import {
  HALL_BOOTHS,
  type HallBooth,
} from '@/features/exhibition/components/public/venue-map-3d/venue-hall-booths';
import { resolveVenueMapAreaTitle } from '@/features/exhibition/utils/resolve-venue-map-area-title';

const BIG_BOOTH_SQM = 100;

const kindFor = (hall: HallBooth, sqm: number, named: boolean): VenueBoothKind => {
  if (hall.kind === 'svc') return 'svc';
  if (!named) return 'open';
  if (hall.kind === 'big' || sqm >= BIG_BOOTH_SQM) return 'big';
  return 'booth';
};

const publishedBooth = (hall: HallBooth, area: PublicVenueMapArea | undefined): VenueBooth => {
  const title = area ? resolveVenueMapAreaTitle(area) : '';
  const named = Boolean(area && area.displayMode !== 'hidden' && title !== area.code);
  const sqm = area?.areaSqm ?? hall.sqm;
  return {
    id: area?.id ?? hall.code,
    name: named ? title : null,
    sqm,
    code: hall.code,
    kind: kindFor(hall, sqm, named),
    href: area?.company?.href ?? null,
    searchText: [hall.code, title, area?.name ?? '', area?.company?.name ?? '']
      .join(' ')
      .toLowerCase(),
    parts: hall.parts,
  };
};

/**
 * Puts each published area on the matching hall booth (M01, S02, …).
 * Geometry stays the traced floor plan, so the public map matches BOS.
 */
export const boothsFromSnapshot = (snapshot: PublicVenueMapSnapshotResponse): VenueBooth[] => {
  const byCode = new Map(snapshot.areas.map((area) => [area.code, area]));
  return HALL_BOOTHS.map((hall) => publishedBooth(hall, byCode.get(hall.code)));
};
