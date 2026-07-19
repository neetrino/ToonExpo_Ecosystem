import {
  ApartmentSalesStatus,
  PriceVisibility,
} from "../src/index.js";

export const SEED_ID_PREFIX = "seed_";

export const SEED_DRAFT_PROJECT_ID = `${SEED_ID_PREFIX}project_draft_hidden`;

export const DEFAULT_PRICE_CURRENCY = "AMD";
export const PLACEHOLDER_IMAGE_BASE = "https://placehold.co";

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

export type SeedProjectPlan = {
  id: string;
  builderId: string;
  name: string;
  slug: string;
  address: string;
  district: string;
  coverId: string;
  buildings: SeedBuildingPlan[];
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
};

export const SEED_BUILDERS: SeedBuilder[] = [
  {
    id: `${SEED_ID_PREFIX}company_glendale`,
    name: "Glendale Hills",
    logoId: `${SEED_ID_PREFIX}media_logo_glendale`,
  },
  {
    id: `${SEED_ID_PREFIX}company_cascade`,
    name: "Cascade Development",
    logoId: `${SEED_ID_PREFIX}media_logo_cascade`,
  },
  {
    id: `${SEED_ID_PREFIX}company_yerevan_city`,
    name: "Yerevan City Builders",
    logoId: `${SEED_ID_PREFIX}media_logo_ycb`,
  },
];

export const SEED_PROJECTS: SeedProjectPlan[] = [
  {
    id: `${SEED_ID_PREFIX}project_northern_avenue`,
    builderId: SEED_BUILDERS[0]!.id,
    name: "Northern Avenue Residences",
    slug: "northern-avenue-residences",
    address: "Northern Avenue 10",
    district: "Kentron",
    coverId: `${SEED_ID_PREFIX}media_cover_northern`,
    buildings: [
      {
        id: `${SEED_ID_PREFIX}building_northern_a`,
        name: "Building A",
        floors: [3, 4, 5],
        aptsPerFloor: 4,
        basePrice: 55_000_000,
      },
      {
        id: `${SEED_ID_PREFIX}building_northern_b`,
        name: "Building B",
        floors: [2, 3],
        aptsPerFloor: 3,
        basePrice: 48_000_000,
      },
    ],
  },
  {
    id: `${SEED_ID_PREFIX}project_cascade_view`,
    builderId: SEED_BUILDERS[1]!.id,
    name: "Cascade View",
    slug: "cascade-view",
    address: "Isahakyan Street 28",
    district: "Kentron",
    coverId: `${SEED_ID_PREFIX}media_cover_cascade`,
    buildings: [
      {
        id: `${SEED_ID_PREFIX}building_cascade_1`,
        name: "Tower 1",
        floors: [5, 6, 7],
        aptsPerFloor: 3,
        basePrice: 62_000_000,
      },
    ],
  },
  {
    id: `${SEED_ID_PREFIX}project_arabkir_park`,
    builderId: SEED_BUILDERS[2]!.id,
    name: "Arabkir Park Homes",
    slug: "arabkir-park-homes",
    address: "Komitas Avenue 45",
    district: "Arabkir",
    coverId: `${SEED_ID_PREFIX}media_cover_arabkir`,
    buildings: [
      {
        id: `${SEED_ID_PREFIX}building_arabkir_a`,
        name: "Block A",
        floors: [1, 2, 3, 4],
        aptsPerFloor: 3,
        basePrice: 38_000_000,
      },
    ],
  },
  {
    id: `${SEED_ID_PREFIX}project_davtashen_sky`,
    builderId: SEED_BUILDERS[0]!.id,
    name: "Davtashen Skyline",
    slug: "davtashen-skyline",
    address: "Davtashen 3rd District 12",
    district: "Davtashen",
    coverId: `${SEED_ID_PREFIX}media_cover_davtashen`,
    buildings: [
      {
        id: `${SEED_ID_PREFIX}building_davtashen_1`,
        name: "Building 1",
        floors: [8, 9],
        aptsPerFloor: 4,
        basePrice: 42_000_000,
      },
    ],
  },
];

export const imageUrl = (label: string): string =>
  `${PLACEHOLDER_IMAGE_BASE}/1200x800/1a1a1a/f5f5f5/png?text=${encodeURIComponent(label)}`;

export const buildApartments = (
  projectKey: string,
  buildingKey: string,
  floorNumber: number,
  count: number,
  basePrice: number,
): SeedApartment[] => {
  const apartments: SeedApartment[] = [];
  const statuses = [
    ApartmentSalesStatus.available,
    ApartmentSalesStatus.reserved,
    ApartmentSalesStatus.sold,
    ApartmentSalesStatus.available,
  ];

  for (let index = 1; index <= count; index += 1) {
    const rooms = (index % 3) + 1;
    apartments.push({
      id: `${SEED_ID_PREFIX}apt_${projectKey}_${buildingKey}_f${floorNumber}_${index}`,
      number: `${floorNumber}${String(index).padStart(2, "0")}`,
      rooms,
      bedrooms: rooms,
      areaTotal: 42 + rooms * 18 + index,
      price: basePrice + rooms * 12_000_000 + index * 500_000,
      salesStatus: statuses[(index - 1) % statuses.length] ?? ApartmentSalesStatus.available,
      priceVisibility:
        index === 1
          ? PriceVisibility.visible_after_login
          : index === 2
            ? PriceVisibility.by_request
            : PriceVisibility.public,
    });
  }

  return apartments;
};
