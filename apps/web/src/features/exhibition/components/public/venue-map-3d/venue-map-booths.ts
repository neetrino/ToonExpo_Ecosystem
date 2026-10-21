export type VenueBoothKind = 'booth' | 'big' | 'svc' | 'open';

/** PDF points. 10 pt ≈ 1 m. */
export type VenueRect = readonly [number, number, number, number];

export type VenueBooth = {
  id: string;
  name: string | null;
  sqm: number | null;
  code: string;
  kind: VenueBoothKind;
  parts: VenueRect[];
  href: string | null;
  searchText: string;
};

export const boothLabel = (booth: VenueBooth): string => booth.name ?? booth.code;
