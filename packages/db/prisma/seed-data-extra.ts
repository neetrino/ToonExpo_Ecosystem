import { SEED_ID_PREFIX, type SeedBuilder, type SeedProjectPlan } from './seed-data.js';

/** Extra demo builders (luxury catalog volume). */
export const SEED_BUILDERS_EXTRA: SeedBuilder[] = [
  {
    id: `${SEED_ID_PREFIX}company_ararat_premium`,
    name: 'Ararat Premium',
    logoId: `${SEED_ID_PREFIX}media_logo_ararat`,
  },
  {
    id: `${SEED_ID_PREFIX}company_vahagni`,
    name: 'Vahagni Estates',
    logoId: `${SEED_ID_PREFIX}media_logo_vahagni`,
  },
  {
    id: `${SEED_ID_PREFIX}company_silva`,
    name: 'Silva Development',
    logoId: `${SEED_ID_PREFIX}media_logo_silva`,
  },
];

type ExtraProjectInput = {
  key: string;
  builderId: string;
  name: string;
  slug: string;
  address: string;
  district: string;
  floors: number[];
  aptsPerFloor: number;
  basePrice: number;
  buildingName?: string;
};

const DEMO_COVER_CYCLE = [
  '/demo/northern-avenue.webp',
  '/demo/cascade-view.webp',
  '/demo/arabkir-park.webp',
  '/demo/davtashen-sky.webp',
  '/demo/building-a.webp',
  '/demo/building-b.webp',
  '/demo/mortgage-hero.webp',
  '/demo/expo-venue.webp',
] as const;

const DEMO_LOGO_CYCLE = [
  '/demo/builder-glendale.webp',
  '/demo/builder-cascade.webp',
  '/demo/builder-ycb.webp',
] as const;

const B = {
  glendale: `${SEED_ID_PREFIX}company_glendale`,
  cascade: `${SEED_ID_PREFIX}company_cascade`,
  ycb: `${SEED_ID_PREFIX}company_yerevan_city`,
  ararat: `${SEED_ID_PREFIX}company_ararat_premium`,
  vahagni: `${SEED_ID_PREFIX}company_vahagni`,
  silva: `${SEED_ID_PREFIX}company_silva`,
} as const;

const EXTRA_PROJECT_INPUTS: ExtraProjectInput[] = [
  {
    key: 'ajapnyak_terrace',
    builderId: B.glendale,
    name: 'Ajapnyak Terrace',
    slug: 'ajapnyak-terrace',
    address: 'Bashinjaghyan 18',
    district: 'Ajapnyak',
    floors: [4, 5],
    aptsPerFloor: 3,
    basePrice: 36_000_000,
  },
  {
    key: 'malatia_gardens',
    builderId: B.ycb,
    name: 'Malatia Gardens',
    slug: 'malatia-gardens',
    address: 'Sheram Street 7',
    district: 'Malatia-Sebastia',
    floors: [2, 3, 4],
    aptsPerFloor: 2,
    basePrice: 32_000_000,
  },
  {
    key: 'erebuni_plaza',
    builderId: B.ararat,
    name: 'Erebuni Plaza',
    slug: 'erebuni-plaza',
    address: 'Erebuni Avenue 22',
    district: 'Erebuni',
    floors: [6, 7],
    aptsPerFloor: 3,
    basePrice: 34_000_000,
  },
  {
    key: 'nor_nork_heights',
    builderId: B.vahagni,
    name: 'Nor Nork Heights',
    slug: 'nor-nork-heights',
    address: 'Moldovakan 41',
    district: 'Nor Nork',
    floors: [8, 9],
    aptsPerFloor: 3,
    basePrice: 40_000_000,
  },
  {
    key: 'kanaker_ridge',
    builderId: B.cascade,
    name: 'Kanaker Ridge',
    slug: 'kanaker-ridge',
    address: 'Kanaker 5th Street 9',
    district: 'Kanaker-Zeytun',
    floors: [3, 4, 5],
    aptsPerFloor: 2,
    basePrice: 44_000_000,
  },
  {
    key: 'shengavit_park',
    builderId: B.silva,
    name: 'Shengavit Park Residences',
    slug: 'shengavit-park-residences',
    address: 'Baghramyan Extension 3',
    district: 'Shengavit',
    floors: [2, 3],
    aptsPerFloor: 3,
    basePrice: 30_000_000,
  },
  {
    key: 'kentron_lofts',
    builderId: B.ararat,
    name: 'Kentron Lofts',
    slug: 'kentron-lofts',
    address: 'Abovyan Street 15',
    district: 'Kentron',
    floors: [5, 6],
    aptsPerFloor: 2,
    basePrice: 78_000_000,
    buildingName: 'Loft Wing',
  },
  {
    key: 'republic_square_view',
    builderId: B.glendale,
    name: 'Republic Square View',
    slug: 'republic-square-view',
    address: 'Amiryan 12',
    district: 'Kentron',
    floors: [7, 8, 9],
    aptsPerFloor: 2,
    basePrice: 95_000_000,
    buildingName: 'Tower East',
  },
  {
    key: 'opera_gardens',
    builderId: B.cascade,
    name: 'Opera Gardens',
    slug: 'opera-gardens',
    address: 'Tumanyan 8',
    district: 'Kentron',
    floors: [4, 5],
    aptsPerFloor: 3,
    basePrice: 88_000_000,
  },
  {
    key: 'komitas_avenue_one',
    builderId: B.ycb,
    name: 'Komitas Avenue One',
    slug: 'komitas-avenue-one',
    address: 'Komitas Avenue 62',
    district: 'Arabkir',
    floors: [3, 4, 5],
    aptsPerFloor: 3,
    basePrice: 48_000_000,
  },
  {
    key: 'vahan_teryan_court',
    builderId: B.vahagni,
    name: 'Vahan Teryan Court',
    slug: 'vahan-teryan-court',
    address: 'Teryan 21',
    district: 'Kentron',
    floors: [5, 6],
    aptsPerFloor: 2,
    basePrice: 72_000_000,
  },
  {
    key: 'tsitsernakaberd_view',
    builderId: B.silva,
    name: 'Tsitsernakaberd View',
    slug: 'tsitsernakaberd-view',
    address: 'Atenq 4',
    district: 'Kentron',
    floors: [6, 7],
    aptsPerFloor: 3,
    basePrice: 68_000_000,
  },
  {
    key: 'hrazdan_riverfront',
    builderId: B.ararat,
    name: 'Hrazdan Riverfront',
    slug: 'hrazdan-riverfront',
    address: 'Kievyan Bridge 2',
    district: 'Arabkir',
    floors: [4, 5, 6],
    aptsPerFloor: 2,
    basePrice: 58_000_000,
  },
  {
    key: 'nork_marash_estate',
    builderId: B.vahagni,
    name: 'Nork-Marash Estate',
    slug: 'nork-marash-estate',
    address: 'Nork-Marash 14',
    district: 'Nork-Marash',
    floors: [2, 3],
    aptsPerFloor: 2,
    basePrice: 110_000_000,
    buildingName: 'Villa Block',
  },
  {
    key: 'avan_panorama',
    builderId: B.glendale,
    name: 'Avan Panorama',
    slug: 'avan-panorama',
    address: 'Avan 2nd District 5',
    district: 'Avan',
    floors: [5, 6],
    aptsPerFloor: 3,
    basePrice: 39_000_000,
  },
  {
    key: 'zeytun_grove',
    builderId: B.cascade,
    name: 'Zeytun Grove',
    slug: 'zeytun-grove',
    address: 'Zeytun 11',
    district: 'Kanaker-Zeytun',
    floors: [3, 4],
    aptsPerFloor: 3,
    basePrice: 41_000_000,
  },
  {
    key: 'davtashen_parkside',
    builderId: B.ycb,
    name: 'Davtashen Parkside',
    slug: 'davtashen-parkside',
    address: 'Davtashen 4th District 8',
    district: 'Davtashen',
    floors: [7, 8],
    aptsPerFloor: 3,
    basePrice: 43_000_000,
  },
  {
    key: 'silikyan_hills',
    builderId: B.silva,
    name: 'Silikyan Hills',
    slug: 'silikyan-hills',
    address: 'Silikyan 19',
    district: 'Ajapnyak',
    floors: [2, 3, 4],
    aptsPerFloor: 2,
    basePrice: 35_000_000,
  },
  {
    key: 'charents_boulevard',
    builderId: B.ararat,
    name: 'Charents Boulevard',
    slug: 'charents-boulevard',
    address: 'Charents 33',
    district: 'Kentron',
    floors: [5, 6],
    aptsPerFloor: 2,
    basePrice: 82_000_000,
  },
  {
    key: 'baghramyan_residence',
    builderId: B.vahagni,
    name: 'Baghramyan Residence',
    slug: 'baghramyan-residence',
    address: 'Baghramyan 26',
    district: 'Kentron',
    floors: [4, 5],
    aptsPerFloor: 2,
    basePrice: 105_000_000,
    buildingName: 'Residence A',
  },
  {
    key: 'saralanj_view',
    builderId: B.cascade,
    name: 'Saralanj View',
    slug: 'saralanj-view',
    address: 'Saralanj 6',
    district: 'Kentron',
    floors: [6, 7, 8],
    aptsPerFloor: 2,
    basePrice: 92_000_000,
  },
  {
    key: 'yerevan_mall_district',
    builderId: B.ycb,
    name: 'Yerevan Mall District',
    slug: 'yerevan-mall-district',
    address: 'Arshakunyats 34',
    district: 'Shengavit',
    floors: [9, 10],
    aptsPerFloor: 4,
    basePrice: 37_000_000,
  },
];

/**
 * Builds extra published seed projects for a richer public catalog.
 */
export const buildExtraSeedProjects = (): SeedProjectPlan[] =>
  EXTRA_PROJECT_INPUTS.map((input) => ({
    id: `${SEED_ID_PREFIX}project_${input.key}`,
    builderId: input.builderId,
    name: input.name,
    slug: input.slug,
    address: input.address,
    district: input.district,
    coverId: `${SEED_ID_PREFIX}media_cover_${input.key}`,
    buildings: [
      {
        id: `${SEED_ID_PREFIX}building_${input.key}_1`,
        name: input.buildingName ?? 'Building 1',
        floors: input.floors,
        aptsPerFloor: input.aptsPerFloor,
        basePrice: input.basePrice,
      },
    ],
  }));

/** Cover URLs for extra projects (cycles local demo photography). */
export const DEMO_COVER_BY_PROJECT_EXTRA: Record<string, string> = Object.fromEntries(
  EXTRA_PROJECT_INPUTS.map((input, index) => [
    `${SEED_ID_PREFIX}project_${input.key}`,
    DEMO_COVER_CYCLE[index % DEMO_COVER_CYCLE.length],
  ]),
);

/** Logo URLs for extra builders. */
export const DEMO_LOGO_BY_BUILDER_EXTRA: Record<string, string> = Object.fromEntries(
  SEED_BUILDERS_EXTRA.map((builder, index) => [
    builder.id,
    DEMO_LOGO_CYCLE[index % DEMO_LOGO_CYCLE.length],
  ]),
);
