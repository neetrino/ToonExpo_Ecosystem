import type { PublicVenueMapArea } from '@toonexpo/contracts';

export const resolveVenueMapAreaTitle = (area: PublicVenueMapArea): string => {
  if (area.displayMode === 'hidden') {
    return area.code;
  }
  return area.publicLabel?.trim() || area.name?.trim() || area.code;
};
