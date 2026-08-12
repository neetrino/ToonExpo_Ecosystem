import type { CompanyType } from '../auth.js';
import type { VenueMapPublicDisplayMode } from '../integrations.js';

export type PublicVenueMapCellRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PublicVenueMapCompanyLink = {
  id: string;
  name: string;
  type: CompanyType;
  href: string | null;
};

export type PublicVenueMapArea = {
  id: string;
  code: string;
  name: string | null;
  displayMode: VenueMapPublicDisplayMode;
  publicLabel: string | null;
  areaSqm: number;
  rects: PublicVenueMapCellRect[];
  labelX: number;
  labelY: number;
  company: PublicVenueMapCompanyLink | null;
};

export type PublicVenueMapSnapshotResponse = {
  id: string;
  title: string;
  snapshotVersion: number;
  mapWidth: number;
  mapHeight: number;
  backgroundUrl: string;
  areas: PublicVenueMapArea[];
};
