import { ApartmentSalesStatus, PriceVisibility } from '../src/index.js';

export const SEED_ID_PREFIX = 'seed_';

export const SEED_DRAFT_PROJECT_ID = `${SEED_ID_PREFIX}project_draft_hidden`;

export const DEFAULT_PRICE_CURRENCY = 'AMD';
export const PLACEHOLDER_IMAGE_BASE = 'https://placehold.co';

/**
 * Maps local `/demo/...` (or `/images/...`) paths to R2 public URLs when
 * `R2_PUBLIC_URL` is set. Absolute http(s) URLs are returned unchanged.
 */
export const toSeedMediaUrl = (pathOrUrl: string): string => {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }

  const base = process.env['R2_PUBLIC_URL']?.trim().replace(/\/$/, '');
  if (!base) {
    return pathOrUrl;
  }

  const normalized = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${normalized}`;
};

/** Local demo covers under apps/web/public/demo (uploaded to R2 as `demo/*`). */
export const DEMO_COVER_BY_PROJECT: Record<string, string> = {
  [`${SEED_ID_PREFIX}project_northern_avenue`]: '/demo/northern-avenue.webp',
  [`${SEED_ID_PREFIX}project_cascade_view`]: '/demo/cascade-view.webp',
  [`${SEED_ID_PREFIX}project_arabkir_park`]: '/demo/arabkir-park.webp',
  [`${SEED_ID_PREFIX}project_davtashen_sky`]: '/demo/davtashen-sky.webp',
};

export const DEMO_LOGO_BY_BUILDER: Record<string, string> = {
  [`${SEED_ID_PREFIX}company_glendale`]: '/demo/builder-glendale.webp',
  [`${SEED_ID_PREFIX}company_cascade`]: '/demo/builder-cascade.webp',
  [`${SEED_ID_PREFIX}company_yerevan_city`]: '/demo/builder-ycb.webp',
};

/** Fallback logo for non-seed builders missing logoMediaId (local demo only). */
export const DEMO_ORPHAN_BUILDER_LOGO = '/demo/builder-cascade.webp';

export type SeedBuilder = {
  id: string;
  name: string;
  logoId: string;
};

export type SeedBuildingPlan = {
  id: string;
  name: string;
  floors: number[];
  aptsPerFloor: number;
  basePrice: number;
};

export type SeedApartmentDefaults = {
  areaBase: number;
  areaPerRoom: number;
  pricePerRoom?: number;
  pricePerIndex?: number;
  ceilingHeightM?: number;
  finishingStatus?: string;
  handoverDescription?: string;
};

export type SeedProjectPlan = {
  id: string;
  builderId: string;
  name: string;
  slug: string;
  address: string;
  district: string;
  coverId: string;
  buildings: SeedBuildingPlan[];
  city?: string;
  locationText?: string;
  shortDescription?: string;
  fullDescription?: string;
  projectType?: string;
  constructionStatus?: string;
  completionDate?: string;
  amenities?: string[] | Record<string, unknown>;
  nearbyPlaces?: string[] | Record<string, unknown>;
  apartmentDefaults?: SeedApartmentDefaults;
};

export type SeedApartment = {
  id: string;
  number: string;
  rooms: number;
  bedrooms: number;
  areaTotal: number;
  price: number;
  salesStatus: ApartmentSalesStatus;
  priceVisibility: PriceVisibility;
  planMediaId: string;
};

export const SEED_BUILDERS: SeedBuilder[] = [
  {
    id: `${SEED_ID_PREFIX}company_glendale`,
    name: 'Glendale Hills',
    logoId: `${SEED_ID_PREFIX}media_logo_glendale`,
  },
  {
    id: `${SEED_ID_PREFIX}company_cascade`,
    name: 'Cascade Development',
    logoId: `${SEED_ID_PREFIX}media_logo_cascade`,
  },
  {
    id: `${SEED_ID_PREFIX}company_yerevan_city`,
    name: 'Yerevan City Builders',
    logoId: `${SEED_ID_PREFIX}media_logo_ycb`,
  },
];

export const SEED_PROJECTS: SeedProjectPlan[] = [
  {
    id: `${SEED_ID_PREFIX}project_northern_avenue`,
    builderId: SEED_BUILDERS[0]!.id,
    name: 'Northern Avenue Residences',
    slug: 'northern-avenue-residences',
    address: 'Northern Avenue 10',
    district: 'Kentron',
    coverId: `${SEED_ID_PREFIX}media_cover_northern`,
    buildings: [
      {
        id: `${SEED_ID_PREFIX}building_northern_a`,
        name: 'Building A',
        floors: [3, 4, 5],
        aptsPerFloor: 4,
        basePrice: 55_000_000,
      },
      {
        id: `${SEED_ID_PREFIX}building_northern_b`,
        name: 'Building B',
        floors: [2, 3],
        aptsPerFloor: 3,
        basePrice: 48_000_000,
      },
    ],
  },
  {
    id: `${SEED_ID_PREFIX}project_cascade_view`,
    builderId: SEED_BUILDERS[1]!.id,
    name: 'Cascade View',
    slug: 'cascade-view',
    address: 'Isahakyan Street 28',
    district: 'Kentron',
    coverId: `${SEED_ID_PREFIX}media_cover_cascade`,
    buildings: [
      {
        id: `${SEED_ID_PREFIX}building_cascade_1`,
        name: 'Tower 1',
        floors: [5, 6, 7],
        aptsPerFloor: 3,
        basePrice: 62_000_000,
      },
    ],
  },
  {
    id: `${SEED_ID_PREFIX}project_arabkir_park`,
    builderId: SEED_BUILDERS[2]!.id,
    name: 'Arabkir Park Homes',
    slug: 'arabkir-park-homes',
    address: 'Komitas Avenue 45',
    district: 'Arabkir',
    coverId: `${SEED_ID_PREFIX}media_cover_arabkir`,
    buildings: [
      {
        id: `${SEED_ID_PREFIX}building_arabkir_a`,
        name: 'Block A',
        floors: [1, 2, 3, 4],
        aptsPerFloor: 3,
        basePrice: 38_000_000,
      },
    ],
  },
  {
    id: `${SEED_ID_PREFIX}project_davtashen_sky`,
    builderId: SEED_BUILDERS[0]!.id,
    name: 'Davtashen Skyline',
    slug: 'davtashen-skyline',
    address: 'Davtashen 3rd District 12',
    district: 'Davtashen',
    coverId: `${SEED_ID_PREFIX}media_cover_davtashen`,
    buildings: [
      {
        id: `${SEED_ID_PREFIX}building_davtashen_1`,
        name: 'Building 1',
        floors: [8, 9],
        aptsPerFloor: 4,
        basePrice: 42_000_000,
      },
    ],
  },
];

export const imageUrl = (label: string): string =>
  `${PLACEHOLDER_IMAGE_BASE}/1200x800/1a1a1a/f5f5f5/png?text=${encodeURIComponent(label)}`;

export const demoCoverUrl = (projectId: string, label: string): string =>
  toSeedMediaUrl(DEMO_COVER_BY_PROJECT[projectId] ?? imageUrl(label));

export const demoLogoUrl = (builderId: string, label: string): string =>
  toSeedMediaUrl(DEMO_LOGO_BY_BUILDER[builderId] ?? imageUrl(label));

export const DEMO_APARTMENT_PLAN_URL = '/demo/apartment-plan.webp';
export const DEMO_FLOOR_PLAN_URL = '/demo/floor-plan.webp';
export const DEMO_BUILDING_COVER_A = '/demo/building-a.webp';
export const DEMO_BUILDING_COVER_B = '/demo/building-b.webp';
export const DEMO_PARTNER_BANK_LOGO = '/demo/partner-bank.webp';
export const DEMO_PARTNER_COVER = '/demo/partner-cover.webp';
export const DEMO_PARTNER_IT_LOGO = '/demo/partner-it.webp';
export const DEMO_VENUE_MAP_URL = '/demo/venue-map.webp';
export const DEMO_VISUAL_MAP_URL = '/demo/visual-map.webp';

const DEFAULT_AREA_BASE = 42;
const DEFAULT_AREA_PER_ROOM = 18;
const DEFAULT_PRICE_PER_ROOM = 12_000_000;
const DEFAULT_PRICE_PER_INDEX = 500_000;

export const buildApartments = (
  projectKey: string,
  buildingKey: string,
  floorNumber: number,
  count: number,
  basePrice: number,
  apartmentDefaults?: SeedApartmentDefaults,
): SeedApartment[] => {
  const apartments: SeedApartment[] = [];
  const statuses = [
    ApartmentSalesStatus.available,
    ApartmentSalesStatus.reserved,
    ApartmentSalesStatus.sold,
    ApartmentSalesStatus.available,
  ];
  const areaBase = apartmentDefaults?.areaBase ?? DEFAULT_AREA_BASE;
  const areaPerRoom = apartmentDefaults?.areaPerRoom ?? DEFAULT_AREA_PER_ROOM;
  const pricePerRoom = apartmentDefaults?.pricePerRoom ?? DEFAULT_PRICE_PER_ROOM;
  const pricePerIndex = apartmentDefaults?.pricePerIndex ?? DEFAULT_PRICE_PER_INDEX;

  for (let index = 1; index <= count; index += 1) {
    const rooms = (index % 3) + 1;
    const id = `${SEED_ID_PREFIX}apt_${projectKey}_${buildingKey}_f${floorNumber}_${index}`;
    apartments.push({
      id,
      number: `${floorNumber}${String(index).padStart(2, '0')}`,
      rooms,
      bedrooms: rooms,
      areaTotal: areaBase + rooms * areaPerRoom + index,
      price: basePrice + rooms * pricePerRoom + index * pricePerIndex,
      salesStatus: statuses[(index - 1) % statuses.length] ?? ApartmentSalesStatus.available,
      priceVisibility:
        index === 1
          ? PriceVisibility.visible_after_login
          : index === 2
            ? PriceVisibility.by_request
            : PriceVisibility.public,
      planMediaId: `${SEED_ID_PREFIX}media_plan_${projectKey}_${buildingKey}_f${floorNumber}_${index}`,
    });
  }

  return apartments;
};
