import type { PublicVenueMapArea } from '@toonexpo/contracts';

export const matchesVenueMapSearch = (area: PublicVenueMapArea, query: string): boolean => {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) {
    return true;
  }

  const haystack = [
    area.code,
    area.name ?? '',
    area.publicLabel ?? '',
    area.company?.name ?? '',
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalized);
};
