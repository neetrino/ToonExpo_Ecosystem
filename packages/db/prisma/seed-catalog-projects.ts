import type {
  ApartmentStatus,
  PriceVisibility,
  PrismaClient,
} from '@prisma/client';

type FloorSeed = { level: number; name: string };

type ApartmentSeed = {
  floorLevel: number;
  code: string;
  status: ApartmentStatus;
  areaSqm: number;
  rooms: number;
  priceAmd: number;
  priceVisibility: PriceVisibility;
};

type MediaSeed = { picsumSeed: string; alt: string };

type CatalogProjectSeed = {
  companySlug: string;
  slug: string;
  name: string;
  description: string;
  city: string;
  address: string;
  buildingName: string;
  floors: readonly FloorSeed[];
  apartments: readonly ApartmentSeed[];
  media: readonly MediaSeed[];
};

type CompanySeed = {
  slug: string;
  name: string;
  description: string;
  logoSeed: string;
  phone: string;
  email: string;
  website: string;
  city: string;
  address: string;
};

export const CATALOG_COMPANY_SEEDS: readonly CompanySeed[] = [
  {
    slug: 'ararat-homes',
    name: 'Ararat Homes',
    description:
      'Regional developer delivering mid-rise housing across Shirak, Lori, and Tavush provinces.',
    logoSeed: 'ararat-homes-logo',
    phone: '+37410000020',
    email: 'info@ararat-homes-demo.local',
    website: 'https://example.com/ararat-homes',
    city: 'Gyumri',
    address: '8 Vardanants Street, Gyumri 3101',
  },
  {
    slug: 'lori-construction',
    name: 'Lori Construction',
    description:
      'Mountain and resort-area residential projects from Lori to Kotayk with family-focused layouts.',
    logoSeed: 'lori-construction-logo',
    phone: '+37410000030',
    email: 'info@lori-construction-demo.local',
    website: 'https://example.com/lori-construction',
    city: 'Vanadzor',
    address: '4 Tigran Mets Avenue, Vanadzor 3701',
  },
] as const;

export const CATALOG_PROJECT_SEEDS: readonly CatalogProjectSeed[] = [
  {
    companySlug: 'demo-development',
    slug: 'mount-ararat-residence',
    name: 'Mount Ararat Residence',
    description:
      'Premium apartments near the Cascade with Ararat views and underground parking.',
    city: 'Yerevan',
    address: '15 Tamanyan Street, Yerevan 0009',
    buildingName: 'Tower A',
    floors: [
      { level: 1, name: 'Floor 1' },
      { level: 2, name: 'Floor 2' },
    ],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 78, rooms: 2, priceAmd: 92000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '102', status: 'RESERVED', areaSqm: 96, rooms: 3, priceAmd: 118000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 2, code: '201', status: 'AVAILABLE', areaSqm: 65, rooms: 2, priceAmd: 81000000, priceVisibility: 'BY_REQUEST' },
      { floorLevel: 2, code: '202', status: 'SOLD', areaSqm: 112, rooms: 4, priceAmd: 152000000, priceVisibility: 'VISIBLE_AFTER_LOGIN' },
    ],
    media: [
      { picsumSeed: 'mount-ararat-1', alt: 'Mount Ararat Residence facade' },
      { picsumSeed: 'mount-ararat-2', alt: 'Mount Ararat Residence courtyard' },
    ],
  },
  {
    companySlug: 'demo-development',
    slug: 'abovyan-gardens',
    name: 'Abovyan Gardens',
    description: 'Green courtyard complex with landscaped play areas in Abovyan.',
    city: 'Abovyan',
    address: '22 Hanrapetutyan Street, Abovyan 2201',
    buildingName: 'Block 1',
    floors: [{ level: 1, name: 'Floor 1' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 70, rooms: 2, priceAmd: 42000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '102', status: 'AVAILABLE', areaSqm: 88, rooms: 3, priceAmd: 54000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '103', status: 'RESERVED', areaSqm: 55, rooms: 1, priceAmd: 35000000, priceVisibility: 'BY_REQUEST' },
    ],
    media: [
      { picsumSeed: 'abovyan-gardens-1', alt: 'Abovyan Gardens entrance' },
      { picsumSeed: 'abovyan-gardens-2', alt: 'Abovyan Gardens courtyard' },
    ],
  },
  {
    companySlug: 'demo-development',
    slug: 'cascade-heights',
    name: 'Cascade Heights',
    description: 'Boutique residences steps from the Cascade complex and Opera district.',
    city: 'Yerevan',
    address: '3 Isahakyan Street, Yerevan 0009',
    buildingName: 'Building A',
    floors: [
      { level: 1, name: 'Floor 1' },
      { level: 2, name: 'Floor 2' },
    ],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 82, rooms: 2, priceAmd: 105000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 2, code: '201', status: 'AVAILABLE', areaSqm: 74, rooms: 2, priceAmd: 98000000, priceVisibility: 'VISIBLE_AFTER_LOGIN' },
      { floorLevel: 2, code: '202', status: 'SOLD', areaSqm: 101, rooms: 3, priceAmd: 128000000, priceVisibility: 'PUBLIC' },
    ],
    media: [
      { picsumSeed: 'cascade-heights-1', alt: 'Cascade Heights exterior' },
      { picsumSeed: 'cascade-heights-2', alt: 'Cascade Heights lobby' },
    ],
  },
  {
    companySlug: 'demo-development',
    slug: 'nor-nork-park',
    name: 'Nor Nork Park',
    description: 'Family-oriented mid-rise near Nor Nork Park with school and transit access.',
    city: 'Yerevan',
    address: '18 Garegin Nzhdeh Street, Yerevan 0056',
    buildingName: 'Tower B',
    floors: [{ level: 1, name: 'Floor 1' }, { level: 2, name: 'Floor 2' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 68, rooms: 2, priceAmd: 62000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '102', status: 'AVAILABLE', areaSqm: 91, rooms: 3, priceAmd: 78000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 2, code: '201', status: 'RESERVED', areaSqm: 72, rooms: 2, priceAmd: 65000000, priceVisibility: 'BY_REQUEST' },
      { floorLevel: 2, code: '202', status: 'AVAILABLE', areaSqm: 105, rooms: 4, priceAmd: 89000000, priceVisibility: 'VISIBLE_AFTER_LOGIN' },
    ],
    media: [
      { picsumSeed: 'nor-nork-park-1', alt: 'Nor Nork Park building view' },
      { picsumSeed: 'nor-nork-park-2', alt: 'Nor Nork Park green area' },
    ],
  },
  {
    companySlug: 'demo-development',
    slug: 'sevan-lake-view',
    name: 'Sevan Lake View',
    description: 'Weekend and year-round homes overlooking Lake Sevan with shared beach access.',
    city: 'Sevan',
    address: '5 Lake Shore Road, Sevan 1501',
    buildingName: 'Lakeside Block',
    floors: [{ level: 1, name: 'Floor 1' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 75, rooms: 2, priceAmd: 48000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '102', status: 'SOLD', areaSqm: 98, rooms: 3, priceAmd: 61000000, priceVisibility: 'PUBLIC' },
    ],
    media: [
      { picsumSeed: 'sevan-lake-view-1', alt: 'Sevan Lake View terrace' },
      { picsumSeed: 'sevan-lake-view-2', alt: 'Sevan Lake View shoreline' },
    ],
  },
  {
    companySlug: 'demo-development',
    slug: 'etchmiadzin-gate',
    name: 'Etchmiadzin Gate',
    description: 'Calm residential block near the Mother See with wide boulevard frontage.',
    city: 'Vagharshapat',
    address: '9 Mesrop Mashtots Avenue, Vagharshapat 1101',
    buildingName: 'Gate Building',
    floors: [{ level: 1, name: 'Floor 1' }, { level: 2, name: 'Floor 2' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 64, rooms: 2, priceAmd: 39000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '102', status: 'AVAILABLE', areaSqm: 86, rooms: 3, priceAmd: 47000000, priceVisibility: 'BY_REQUEST' },
      { floorLevel: 2, code: '201', status: 'AVAILABLE', areaSqm: 70, rooms: 2, priceAmd: 41000000, priceVisibility: 'VISIBLE_AFTER_LOGIN' },
    ],
    media: [
      { picsumSeed: 'etchmiadzin-gate-1', alt: 'Etchmiadzin Gate facade' },
      { picsumSeed: 'etchmiadzin-gate-2', alt: 'Etchmiadzin Gate street view' },
    ],
  },
  {
    companySlug: 'ararat-homes',
    slug: 'gyumri-heritage-lofts',
    name: 'Gyumri Heritage Lofts',
    description: 'Loft-style units in restored stone buildings near Kumayri historic district.',
    city: 'Gyumri',
    address: '11 Abovyan Street, Gyumri 3104',
    buildingName: 'Heritage Block',
    floors: [{ level: 1, name: 'Floor 1' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 92, rooms: 2, priceAmd: 38000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '102', status: 'RESERVED', areaSqm: 78, rooms: 2, priceAmd: 34000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '103', status: 'AVAILABLE', areaSqm: 110, rooms: 3, priceAmd: 45000000, priceVisibility: 'BY_REQUEST' },
    ],
    media: [
      { picsumSeed: 'gyumri-heritage-1', alt: 'Gyumri Heritage Lofts stone facade' },
      { picsumSeed: 'gyumri-heritage-2', alt: 'Gyumri Heritage Lofts interior' },
    ],
  },
  {
    companySlug: 'ararat-homes',
    slug: 'vanadzor-ridge',
    name: 'Vanadzor Ridge',
    description: 'Hillside apartments with Lori valley views and heated underground parking.',
    city: 'Vanadzor',
    address: '6 Kirov Street, Vanadzor 3702',
    buildingName: 'Ridge Tower',
    floors: [{ level: 1, name: 'Floor 1' }, { level: 2, name: 'Floor 2' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 71, rooms: 2, priceAmd: 36000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 2, code: '201', status: 'AVAILABLE', areaSqm: 84, rooms: 3, priceAmd: 42000000, priceVisibility: 'VISIBLE_AFTER_LOGIN' },
      { floorLevel: 2, code: '202', status: 'SOLD', areaSqm: 58, rooms: 1, priceAmd: 29000000, priceVisibility: 'PUBLIC' },
    ],
    media: [
      { picsumSeed: 'vanadzor-ridge-1', alt: 'Vanadzor Ridge panorama' },
      { picsumSeed: 'vanadzor-ridge-2', alt: 'Vanadzor Ridge building' },
    ],
  },
  {
    companySlug: 'ararat-homes',
    slug: 'dilijan-forest-retreat',
    name: 'Dilijan Forest Retreat',
    description: 'Eco-minded cottages and apartments surrounded by Dilijan national park trails.',
    city: 'Dilijan',
    address: '4 Sharambeyan Street, Dilijan 3901',
    buildingName: 'Forest Lodge',
    floors: [{ level: 1, name: 'Floor 1' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 66, rooms: 2, priceAmd: 52000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '102', status: 'AVAILABLE', areaSqm: 89, rooms: 3, priceAmd: 68000000, priceVisibility: 'BY_REQUEST' },
    ],
    media: [
      { picsumSeed: 'dilijan-forest-1', alt: 'Dilijan Forest Retreat exterior' },
      { picsumSeed: 'dilijan-forest-2', alt: 'Dilijan Forest Retreat forest path' },
    ],
  },
  {
    companySlug: 'ararat-homes',
    slug: 'kapan-riverfront',
    name: 'Kapan Riverfront',
    description: 'Riverside residences in southern Syunik with mountain backdrop balconies.',
    city: 'Kapan',
    address: '2 Shahumyan Street, Kapan 3301',
    buildingName: 'River Block',
    floors: [{ level: 1, name: 'Floor 1' }, { level: 2, name: 'Floor 2' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 73, rooms: 2, priceAmd: 31000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '102', status: 'RESERVED', areaSqm: 95, rooms: 3, priceAmd: 39000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 2, code: '201', status: 'AVAILABLE', areaSqm: 80, rooms: 3, priceAmd: 35000000, priceVisibility: 'VISIBLE_AFTER_LOGIN' },
      { floorLevel: 2, code: '202', status: 'AVAILABLE', areaSqm: 62, rooms: 2, priceAmd: 28000000, priceVisibility: 'PUBLIC' },
    ],
    media: [
      { picsumSeed: 'kapan-riverfront-1', alt: 'Kapan Riverfront balcony view' },
      { picsumSeed: 'kapan-riverfront-2', alt: 'Kapan Riverfront riverside' },
    ],
  },
  {
    companySlug: 'ararat-homes',
    slug: 'goris-stone-homes',
    name: 'Goris Stone Homes',
    description: 'Traditional stone-clad homes near Old Goris with cave-town excursion access.',
    city: 'Goris',
    address: '7 Ankakhutyan Street, Goris 3201',
    buildingName: 'Stone House A',
    floors: [{ level: 1, name: 'Floor 1' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 77, rooms: 2, priceAmd: 33000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '102', status: 'SOLD', areaSqm: 99, rooms: 3, priceAmd: 41000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '103', status: 'AVAILABLE', areaSqm: 54, rooms: 1, priceAmd: 24000000, priceVisibility: 'BY_REQUEST' },
    ],
    media: [
      { picsumSeed: 'goris-stone-1', alt: 'Goris Stone Homes facade' },
      { picsumSeed: 'goris-stone-2', alt: 'Goris Stone Homes lane' },
    ],
  },
  {
    companySlug: 'ararat-homes',
    slug: 'ashtarak-vineyards',
    name: 'Ashtarak Vineyards',
    description: 'Vineyard-adjacent apartments between Ashtarak and the Aragats slopes.',
    city: 'Ashtarak',
    address: '14 Baghramyan Street, Ashtarak 0201',
    buildingName: 'Vineyard Block',
    floors: [{ level: 1, name: 'Floor 1' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 69, rooms: 2, priceAmd: 37000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '102', status: 'AVAILABLE', areaSqm: 87, rooms: 3, priceAmd: 44000000, priceVisibility: 'VISIBLE_AFTER_LOGIN' },
    ],
    media: [
      { picsumSeed: 'ashtarak-vineyards-1', alt: 'Ashtarak Vineyards terrace' },
      { picsumSeed: 'ashtarak-vineyards-2', alt: 'Ashtarak Vineyards rows' },
    ],
  },
  {
    companySlug: 'ararat-homes',
    slug: 'artashat-square',
    name: 'Artashat Square',
    description: 'Central square apartments with retail on the ground floor in Artashat.',
    city: 'Artashat',
    address: '1 Republic Square, Artashat 0202',
    buildingName: 'Square Tower',
    floors: [{ level: 1, name: 'Floor 1' }, { level: 2, name: 'Floor 2' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 76, rooms: 2, priceAmd: 35000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 2, code: '201', status: 'RESERVED', areaSqm: 90, rooms: 3, priceAmd: 43000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 2, code: '202', status: 'AVAILABLE', areaSqm: 63, rooms: 2, priceAmd: 30000000, priceVisibility: 'BY_REQUEST' },
    ],
    media: [
      { picsumSeed: 'artashat-square-1', alt: 'Artashat Square building' },
      { picsumSeed: 'artashat-square-2', alt: 'Artashat Square plaza' },
    ],
  },
  {
    companySlug: 'lori-construction',
    slug: 'hrazdan-green-lane',
    name: 'Hrazdan Green Lane',
    description: 'Tree-lined mid-rise homes along the Hrazdan river promenade.',
    city: 'Hrazdan',
    address: '10 Myasnikyan Street, Hrazdan 2301',
    buildingName: 'Green Lane A',
    floors: [{ level: 1, name: 'Floor 1' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 72, rooms: 2, priceAmd: 34000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '102', status: 'AVAILABLE', areaSqm: 94, rooms: 3, priceAmd: 41000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '103', status: 'SOLD', areaSqm: 60, rooms: 1, priceAmd: 27000000, priceVisibility: 'VISIBLE_AFTER_LOGIN' },
    ],
    media: [
      { picsumSeed: 'hrazdan-green-1', alt: 'Hrazdan Green Lane facade' },
      { picsumSeed: 'hrazdan-green-2', alt: 'Hrazdan Green Lane river walk' },
    ],
  },
  {
    companySlug: 'lori-construction',
    slug: 'ijevan-terrace',
    name: 'Ijevan Terrace',
    description: 'Terraced apartments overlooking the Aghstev valley in northern Tavush.',
    city: 'Ijevan',
    address: '8 Yerevanyan Street, Ijevan 4001',
    buildingName: 'Terrace Block',
    floors: [{ level: 1, name: 'Floor 1' }, { level: 2, name: 'Floor 2' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 67, rooms: 2, priceAmd: 32000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 2, code: '201', status: 'AVAILABLE', areaSqm: 81, rooms: 3, priceAmd: 39000000, priceVisibility: 'BY_REQUEST' },
    ],
    media: [
      { picsumSeed: 'ijevan-terrace-1', alt: 'Ijevan Terrace valley view' },
      { picsumSeed: 'ijevan-terrace-2', alt: 'Ijevan Terrace building' },
    ],
  },
  {
    companySlug: 'lori-construction',
    slug: 'yeghegnadzor-valley',
    name: 'Yeghegnadzor Valley',
    description: 'Valley-facing homes near Areni wine country and Noravank gorge routes.',
    city: 'Yeghegnadzor',
    address: '3 Shahumyan Street, Yeghegnadzor 3601',
    buildingName: 'Valley House',
    floors: [{ level: 1, name: 'Floor 1' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 74, rooms: 2, priceAmd: 36000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '102', status: 'RESERVED', areaSqm: 97, rooms: 3, priceAmd: 45000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '103', status: 'AVAILABLE', areaSqm: 56, rooms: 1, priceAmd: 26000000, priceVisibility: 'VISIBLE_AFTER_LOGIN' },
    ],
    media: [
      { picsumSeed: 'yeghegnadzor-valley-1', alt: 'Yeghegnadzor Valley exterior' },
      { picsumSeed: 'yeghegnadzor-valley-2', alt: 'Yeghegnadzor Valley landscape' },
    ],
  },
  {
    companySlug: 'lori-construction',
    slug: 'charentsavan-hills',
    name: 'Charentsavan Hills',
    description: 'Affordable hillside units on the Sevan-Yerevan highway corridor.',
    city: 'Charentsavan',
    address: '16 Highway 1, Charentsavan 2501',
    buildingName: 'Hills Block',
    floors: [{ level: 1, name: 'Floor 1' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 65, rooms: 2, priceAmd: 29000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '102', status: 'AVAILABLE', areaSqm: 83, rooms: 3, priceAmd: 36000000, priceVisibility: 'PUBLIC' },
    ],
    media: [
      { picsumSeed: 'charentsavan-hills-1', alt: 'Charentsavan Hills building' },
      { picsumSeed: 'charentsavan-hills-2', alt: 'Charentsavan Hills hillside' },
    ],
  },
  {
    companySlug: 'lori-construction',
    slug: 'tsaghkadzor-alpine',
    name: 'Tsaghkadzor Alpine',
    description: 'Ski-resort adjacent apartments with seasonal rental management options.',
    city: 'Tsaghkadzor',
    address: '5 Olympic Avenue, Tsaghkadzor 2310',
    buildingName: 'Alpine Lodge',
    floors: [{ level: 1, name: 'Floor 1' }, { level: 2, name: 'Floor 2' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 70, rooms: 2, priceAmd: 58000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '102', status: 'SOLD', areaSqm: 92, rooms: 3, priceAmd: 72000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 2, code: '201', status: 'AVAILABLE', areaSqm: 78, rooms: 2, priceAmd: 61000000, priceVisibility: 'BY_REQUEST' },
      { floorLevel: 2, code: '202', status: 'RESERVED', areaSqm: 108, rooms: 4, priceAmd: 85000000, priceVisibility: 'VISIBLE_AFTER_LOGIN' },
    ],
    media: [
      { picsumSeed: 'tsaghkadzor-alpine-1', alt: 'Tsaghkadzor Alpine chalet' },
      { picsumSeed: 'tsaghkadzor-alpine-2', alt: 'Tsaghkadzor Alpine slopes' },
    ],
  },
  {
    companySlug: 'lori-construction',
    slug: 'armavir-central',
    name: 'Armavir Central',
    description: 'Walkable city-center flats near Armavir railway station and markets.',
    city: 'Armavir',
    address: '12 Hanrapetutyan Street, Armavir 0901',
    buildingName: 'Central Tower',
    floors: [{ level: 1, name: 'Floor 1' }],
    apartments: [
      { floorLevel: 1, code: '101', status: 'AVAILABLE', areaSqm: 68, rooms: 2, priceAmd: 31000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '102', status: 'AVAILABLE', areaSqm: 85, rooms: 3, priceAmd: 38000000, priceVisibility: 'PUBLIC' },
      { floorLevel: 1, code: '103', status: 'AVAILABLE', areaSqm: 52, rooms: 1, priceAmd: 22000000, priceVisibility: 'BY_REQUEST' },
    ],
    media: [
      { picsumSeed: 'armavir-central-1', alt: 'Armavir Central facade' },
      { picsumSeed: 'armavir-central-2', alt: 'Armavir Central street' },
    ],
  },
] as const;

type SeedStats = { projectsUpserted: number; companiesUpserted: number };

async function upsertCatalogCompany(
  prisma: PrismaClient,
  seed: CompanySeed,
): Promise<string> {
  const company = await prisma.company.upsert({
    where: { slug: seed.slug },
    update: {
      name: seed.name,
      description: seed.description,
      logoUrl: `https://picsum.photos/seed/${seed.logoSeed}/200/200`,
      phone: seed.phone,
      email: seed.email,
      website: seed.website,
      city: seed.city,
      address: seed.address,
    },
    create: {
      name: seed.name,
      slug: seed.slug,
      description: seed.description,
      logoUrl: `https://picsum.photos/seed/${seed.logoSeed}/200/200`,
      phone: seed.phone,
      email: seed.email,
      website: seed.website,
      city: seed.city,
      address: seed.address,
    },
    select: { id: true },
  });
  return company.id;
}

async function upsertCatalogProjectMedia(
  prisma: PrismaClient,
  projectId: string,
  media: readonly MediaSeed[],
): Promise<void> {
  for (const [index, asset] of media.entries()) {
    const url = `https://picsum.photos/seed/${asset.picsumSeed}/1200/800`;
    const existing = await prisma.mediaAsset.findFirst({
      where: { projectId, url },
    });
    const data = { alt: asset.alt, sortOrder: index };
    if (existing) {
      await prisma.mediaAsset.update({ where: { id: existing.id }, data });
    } else {
      await prisma.mediaAsset.create({ data: { projectId, url, ...data } });
    }
  }
}

async function upsertCatalogFloors(
  prisma: PrismaClient,
  buildingId: string,
  floors: readonly FloorSeed[],
): Promise<Map<number, string>> {
  const floorByLevel = new Map<number, string>();
  for (const floorSeed of floors) {
    const floor = await prisma.floor.upsert({
      where: { buildingId_level: { buildingId, level: floorSeed.level } },
      update: { name: floorSeed.name },
      create: {
        buildingId,
        level: floorSeed.level,
        name: floorSeed.name,
        status: 'PUBLISHED',
      },
    });
    floorByLevel.set(floorSeed.level, floor.id);
  }
  return floorByLevel;
}

async function upsertCatalogApartments(
  prisma: PrismaClient,
  floorByLevel: Map<number, string>,
  apartments: readonly ApartmentSeed[],
): Promise<void> {
  for (const apt of apartments) {
    const floorId = floorByLevel.get(apt.floorLevel);
    if (!floorId) {
      continue;
    }
    await prisma.apartment.upsert({
      where: { floorId_code: { floorId, code: apt.code } },
      update: {
        status: apt.status,
        areaSqm: apt.areaSqm,
        rooms: apt.rooms,
        priceAmd: apt.priceAmd,
        priceVisibility: apt.priceVisibility,
      },
      create: {
        floorId,
        code: apt.code,
        status: apt.status,
        areaSqm: apt.areaSqm,
        rooms: apt.rooms,
        priceAmd: apt.priceAmd,
        priceVisibility: apt.priceVisibility,
      },
    });
  }
}

async function upsertCatalogProjectTree(
  prisma: PrismaClient,
  companyId: string,
  seed: CatalogProjectSeed,
): Promise<void> {
  const project = await prisma.project.upsert({
    where: { companyId_slug: { companyId, slug: seed.slug } },
    update: {
      name: seed.name,
      description: seed.description,
      city: seed.city,
      address: seed.address,
      status: 'PUBLISHED',
    },
    create: {
      companyId,
      name: seed.name,
      slug: seed.slug,
      description: seed.description,
      city: seed.city,
      address: seed.address,
      status: 'PUBLISHED',
    },
  });

  const existingBuilding = await prisma.building.findFirst({
    where: { projectId: project.id, name: seed.buildingName },
  });
  const building =
    existingBuilding ??
    (await prisma.building.create({
      data: { projectId: project.id, name: seed.buildingName, status: 'PUBLISHED' },
    }));

  const floorByLevel = await upsertCatalogFloors(prisma, building.id, seed.floors);
  await upsertCatalogApartments(prisma, floorByLevel, seed.apartments);
  await upsertCatalogProjectMedia(prisma, project.id, seed.media);
}

/** Seeds ~19 published catalog projects across demo-development + 2 new companies. */
export async function seedCatalogProjects(prisma: PrismaClient): Promise<SeedStats> {
  const companyIds = new Map<string, string>();

  for (const companySeed of CATALOG_COMPANY_SEEDS) {
    const id = await upsertCatalogCompany(prisma, companySeed);
    companyIds.set(companySeed.slug, id);
  }

  const demoCompany = await prisma.company.findUnique({
    where: { slug: 'demo-development' },
    select: { id: true },
  });
  if (demoCompany) {
    companyIds.set('demo-development', demoCompany.id);
  }

  let projectsUpserted = 0;
  for (const projectSeed of CATALOG_PROJECT_SEEDS) {
    const companyId = companyIds.get(projectSeed.companySlug);
    if (!companyId) {
      console.log(`Skipping catalog project ${projectSeed.slug}: company not found.`);
      continue;
    }
    await upsertCatalogProjectTree(prisma, companyId, projectSeed);
    projectsUpserted += 1;
  }

  const publishedCount = await prisma.project.count({ where: { status: 'PUBLISHED' } });
  const companySlugs = [...companyIds.keys()].sort().join(', ');
  console.log(
    `Catalog projects seed: ${projectsUpserted} upserted; ${publishedCount} PUBLISHED total (${companySlugs}).`,
  );

  return { projectsUpserted, companiesUpserted: CATALOG_COMPANY_SEEDS.length };
}
