import {
  PrismaClient,
  type Apartment,
  type Building,
  type Company,
  type Floor,
  type Project,
} from '@prisma/client';
import argon2 from 'argon2';
import { seedCatalogProjects } from './seed-catalog-projects';

const prisma = new PrismaClient();

const HASH_OPTIONS = { type: argon2.argon2id } as const;

const DEMO_COMPANY_SLUG = 'demo-development';
const DEMO_COMPANY_NAME = 'Demo Development';
const DEMO_BUILDER_EMAIL = 'builder@demo.toonexpo.local';
const SUNRISE_SLUG = 'sunrise-residence';
const HIDDEN_COURT_SLUG = 'hidden-court';
const BUILDING_NAME = 'Tower A';

const FLOOR_CONFIGS = [
  { level: 1, name: 'Floor 1' },
  { level: 2, name: 'Floor 2' },
] as const;

const APARTMENT_CONFIGS = [
  {
    floorIndex: 0,
    code: '101',
    status: 'AVAILABLE' as const,
    areaSqm: 72.5,
    rooms: 2,
    priceAmd: 85000000,
    priceVisibility: 'PUBLIC' as const,
  },
  {
    floorIndex: 0,
    code: '102',
    status: 'RESERVED' as const,
    areaSqm: 95.0,
    rooms: 3,
    priceAmd: 112000000,
    priceVisibility: 'PUBLIC' as const,
  },
  {
    floorIndex: 1,
    code: '201',
    status: 'SOLD' as const,
    areaSqm: 68.0,
    rooms: 2,
    priceAmd: 79000000,
    priceVisibility: 'BY_REQUEST' as const,
  },
  {
    floorIndex: 1,
    code: '202',
    status: 'AVAILABLE' as const,
    areaSqm: 110.0,
    rooms: 4,
    priceAmd: 145000000,
    priceVisibility: 'VISIBLE_AFTER_LOGIN' as const,
  },
] as const;

async function seedAdmin(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('Skipping admin seed: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set.');
    return;
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'BIGPROJECTS_ADMIN' },
  });

  if (existingAdmin) {
    console.log('Skipping admin seed: a BIGPROJECTS_ADMIN user already exists.');
    return;
  }

  const passwordHash = await argon2.hash(password, HASH_OPTIONS);

  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name: 'Seed Admin',
      passwordHash,
      role: 'BIGPROJECTS_ADMIN',
    },
  });

  console.log(`Created seed BIGPROJECTS_ADMIN: ${email}`);
}

async function seedBuilder(): Promise<void> {
  const password = process.env.SEED_DEMO_BUILDER_PASSWORD;

  if (!password) {
    console.log('Skipping builder seed: SEED_DEMO_BUILDER_PASSWORD must be set.');
    return;
  }

  const existingBuilder = await prisma.user.findUnique({
    where: { email: DEMO_BUILDER_EMAIL },
  });

  if (existingBuilder) {
    console.log('Skipping builder seed: demo builder user already exists.');
    return;
  }

  const company = await prisma.company.findUnique({
    where: { slug: DEMO_COMPANY_SLUG },
  });

  if (!company) {
    console.log('Skipping builder seed: demo company not found.');
    return;
  }

  const passwordHash = await argon2.hash(password, HASH_OPTIONS);

  const builder = await prisma.user.create({
    data: {
      email: DEMO_BUILDER_EMAIL,
      name: 'Demo Builder',
      passwordHash,
      role: 'BUILDER',
    },
  });

  await prisma.companyMember.create({
    data: {
      companyId: company.id,
      userId: builder.id,
      role: 'BUILDER',
    },
  });

  console.log(`Created seed BUILDER: ${DEMO_BUILDER_EMAIL}`);
}

async function seedEntranceStaff(): Promise<void> {
  const email = process.env.SEED_ENTRANCE_EMAIL?.trim();
  const password = process.env.SEED_ENTRANCE_PASSWORD;

  if (!email || !password) {
    console.log(
      'Skipping entrance staff seed: SEED_ENTRANCE_EMAIL and SEED_ENTRANCE_PASSWORD must be set.',
    );
    return;
  }

  const existingStaff = await prisma.user.findFirst({
    where: { role: 'ENTRANCE_STAFF' },
  });

  if (existingStaff) {
    console.log('Skipping entrance staff seed: an ENTRANCE_STAFF user already exists.');
    return;
  }

  const passwordHash = await argon2.hash(password, HASH_OPTIONS);

  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name: 'Seed Entrance Staff',
      passwordHash,
      role: 'ENTRANCE_STAFF',
    },
  });

  console.log(`Created seed ENTRANCE_STAFF: ${email}`);
}

async function upsertProjectMedia(
  projectId: string,
  assets: ReadonlyArray<{ url: string; alt: string; sortOrder: number }>,
): Promise<void> {
  for (const asset of assets) {
    const existing = await prisma.mediaAsset.findFirst({
      where: { projectId, url: asset.url },
    });

    if (existing) {
      await prisma.mediaAsset.update({
        where: { id: existing.id },
        data: { alt: asset.alt, sortOrder: asset.sortOrder },
      });
    } else {
      await prisma.mediaAsset.create({
        data: { projectId, url: asset.url, alt: asset.alt, sortOrder: asset.sortOrder },
      });
    }
  }
}

async function upsertApartmentMedia(
  apartmentId: string,
  asset: { url: string; alt: string; sortOrder: number },
): Promise<void> {
  const existing = await prisma.mediaAsset.findFirst({
    where: { apartmentId, url: asset.url },
  });

  if (existing) {
    await prisma.mediaAsset.update({
      where: { id: existing.id },
      data: { alt: asset.alt, sortOrder: asset.sortOrder },
    });
  } else {
    await prisma.mediaAsset.create({
      data: {
        apartmentId,
        url: asset.url,
        alt: asset.alt,
        sortOrder: asset.sortOrder,
      },
    });
  }
}

async function upsertDemoCompany(): Promise<Company> {
  return prisma.company.upsert({
    where: { slug: DEMO_COMPANY_SLUG },
    update: {
      name: DEMO_COMPANY_NAME,
      description: 'Sunrise Development builds premium residential projects in central Yerevan.',
      logoUrl: 'https://picsum.photos/seed/sunrise-builder/200/200',
      phone: '+37410000010',
      email: 'info@sunrise-demo.local',
      website: 'https://example.com/sunrise-development',
      city: 'Yerevan',
      address: '12 Abovyan Street, Yerevan 0001',
    },
    create: {
      name: DEMO_COMPANY_NAME,
      slug: DEMO_COMPANY_SLUG,
      description: 'Sunrise Development builds premium residential projects in central Yerevan.',
      logoUrl: 'https://picsum.photos/seed/sunrise-builder/200/200',
      phone: '+37410000010',
      email: 'info@sunrise-demo.local',
      website: 'https://example.com/sunrise-development',
      city: 'Yerevan',
      address: '12 Abovyan Street, Yerevan 0001',
    },
  });
}

async function upsertSunriseProject(companyId: string): Promise<Project> {
  return prisma.project.upsert({
    where: { companyId_slug: { companyId, slug: SUNRISE_SLUG } },
    update: {
      name: 'Sunrise Residence',
      description:
        'A modern residential complex in central Yerevan with panoramic views and premium finishes.',
      city: 'Yerevan',
      address: '12 Abovyan Street, Yerevan 0001',
      status: 'PUBLISHED',
    },
    create: {
      companyId,
      name: 'Sunrise Residence',
      slug: SUNRISE_SLUG,
      description:
        'A modern residential complex in central Yerevan with panoramic views and premium finishes.',
      city: 'Yerevan',
      address: '12 Abovyan Street, Yerevan 0001',
      status: 'PUBLISHED',
    },
  });
}

async function upsertSunriseBuilding(projectId: string): Promise<Building> {
  const existing = await prisma.building.findFirst({
    where: { projectId, name: BUILDING_NAME },
  });

  if (existing) {
    return existing;
  }

  return prisma.building.create({
    data: { projectId, name: BUILDING_NAME, status: 'PUBLISHED' },
  });
}

async function upsertSunriseFloors(buildingId: string): Promise<Floor[]> {
  const floors: Floor[] = [];

  for (const floorConfig of FLOOR_CONFIGS) {
    const floor = await prisma.floor.upsert({
      where: { buildingId_level: { buildingId, level: floorConfig.level } },
      update: { name: floorConfig.name },
      create: {
        buildingId,
        level: floorConfig.level,
        name: floorConfig.name,
        status: 'PUBLISHED',
      },
    });
    floors.push(floor);
  }

  return floors;
}

async function upsertSunriseApartments(floors: Floor[]): Promise<Apartment[]> {
  const apartments: Apartment[] = [];

  for (const config of APARTMENT_CONFIGS) {
    const floor = floors[config.floorIndex];
    const apartment = await prisma.apartment.upsert({
      where: { floorId_code: { floorId: floor.id, code: config.code } },
      update: {
        status: config.status,
        areaSqm: config.areaSqm,
        rooms: config.rooms,
        priceAmd: config.priceAmd,
        priceVisibility: config.priceVisibility,
      },
      create: {
        floorId: floor.id,
        code: config.code,
        status: config.status,
        areaSqm: config.areaSqm,
        rooms: config.rooms,
        priceAmd: config.priceAmd,
        priceVisibility: config.priceVisibility,
      },
    });
    apartments.push(apartment);
  }

  return apartments;
}

async function seedSunriseMedia(projectId: string, apartments: Apartment[]): Promise<void> {
  await upsertProjectMedia(projectId, [
    {
      url: 'https://picsum.photos/seed/sunrise-residence-1/1200/800',
      alt: 'Sunrise Residence exterior view',
      sortOrder: 0,
    },
    {
      url: 'https://picsum.photos/seed/sunrise-residence-2/1200/800',
      alt: 'Sunrise Residence lobby',
      sortOrder: 1,
    },
  ]);

  await upsertApartmentMedia(apartments[0].id, {
    url: 'https://picsum.photos/seed/sunrise-apt-101/1200/800',
    alt: 'Apartment 101 living room',
    sortOrder: 0,
  });
}

async function upsertHiddenCourtProject(companyId: string): Promise<void> {
  await prisma.project.upsert({
    where: { companyId_slug: { companyId, slug: HIDDEN_COURT_SLUG } },
    update: { name: 'Hidden Court', status: 'DRAFT' },
    create: {
      companyId,
      name: 'Hidden Court',
      slug: HIDDEN_COURT_SLUG,
      status: 'DRAFT',
    },
  });
}

async function seedDemoCatalog(): Promise<{
  company: Company;
  sunriseProject: Project;
  building: Building;
  floors: Floor[];
  apartments: Apartment[];
}> {
  const company = await upsertDemoCompany();
  const sunriseProject = await upsertSunriseProject(company.id);
  const building = await upsertSunriseBuilding(sunriseProject.id);
  const floors = await upsertSunriseFloors(building.id);
  const apartments = await upsertSunriseApartments(floors);

  await seedSunriseMedia(sunriseProject.id, apartments);
  await upsertHiddenCourtProject(company.id);

  console.log('Demo catalog seed complete.');
  return { company, sunriseProject, building, floors, apartments };
}

const DEMO_DEAL_PROJECT_TITLE = 'Demo project-page request';
const DEMO_DEAL_RESERVED_TITLE = 'Demo reserved apartment deal';

async function seedDemoCrmDeals(
  company: Company,
  sunriseProject: Project,
  apartments: Apartment[],
): Promise<void> {
  const builder = await prisma.user.findUnique({
    where: { email: DEMO_BUILDER_EMAIL },
  });

  const reservedApartment = apartments.find((apartment) => apartment.code === '102');
  if (!reservedApartment) {
    console.log('Skipping CRM deal seed: apartment 102 not found.');
    return;
  }

  const existingProjectDeal = await prisma.deal.findFirst({
    where: {
      companyId: company.id,
      title: DEMO_DEAL_PROJECT_TITLE,
      source: 'PROJECT_PAGE',
    },
  });

  let projectDealId = existingProjectDeal?.id;

  if (existingProjectDeal) {
    console.log('Skipping project-page deal seed: already exists.');
  } else {
    const projectDeal = await prisma.deal.create({
      data: {
        companyId: company.id,
        projectId: sunriseProject.id,
        stage: 'NEW_REQUEST',
        source: 'PROJECT_PAGE',
        title: DEMO_DEAL_PROJECT_TITLE,
        contactName: 'Ani Petrosyan',
        contactPhone: '+37491112233',
        contactEmail: 'ani.petrosyan@example.com',
        message: 'Interested in Sunrise Residence 2-bedroom units.',
        createdByUserId: builder?.id,
        lastActivityAt: new Date(),
      },
    });
    projectDealId = projectDeal.id;
    console.log('Created demo project-page CRM deal.');
  }

  if (projectDealId) {
    const existingActivity = await prisma.dealActivity.findFirst({
      where: {
        dealId: projectDealId,
        type: 'COMMENT',
        body: 'Seed: inbound project-page request.',
      },
    });

    if (existingActivity) {
      console.log('Skipping project-page deal activity: already exists.');
    } else {
      await prisma.dealActivity.create({
        data: {
          dealId: projectDealId,
          authorUserId: builder?.id,
          type: 'COMMENT',
          body: 'Seed: inbound project-page request.',
        },
      });
      console.log('Created project-page deal activity.');
    }
  }

  const existingReservedDeal = await prisma.deal.findFirst({
    where: {
      companyId: company.id,
      title: DEMO_DEAL_RESERVED_TITLE,
      source: 'MANUAL_BUILDER_ENTRY',
    },
  });

  let reservedDealId = existingReservedDeal?.id;

  if (existingReservedDeal) {
    console.log('Skipping reserved deal seed: already exists.');
  } else {
    const reservedDeal = await prisma.deal.create({
      data: {
        companyId: company.id,
        projectId: sunriseProject.id,
        stage: 'RESERVED',
        source: 'MANUAL_BUILDER_ENTRY',
        title: DEMO_DEAL_RESERVED_TITLE,
        contactName: 'Karen Sargsyan',
        contactPhone: '+37499123456',
        contactEmail: 'karen.sargsyan@example.com',
        message: 'Builder reserved apartment 102 after site visit.',
        assignedUserId: builder?.id,
        createdByUserId: builder?.id,
        lastActivityAt: new Date(),
        apartments: {
          create: { apartmentId: reservedApartment.id },
        },
      },
    });
    reservedDealId = reservedDeal.id;
    console.log('Created demo reserved CRM deal with apartment link.');
  }

  if (reservedDealId) {
    const existingLink = await prisma.dealApartment.findUnique({
      where: {
        dealId_apartmentId: {
          dealId: reservedDealId,
          apartmentId: reservedApartment.id,
        },
      },
    });

    if (!existingLink) {
      await prisma.dealApartment.create({
        data: { dealId: reservedDealId, apartmentId: reservedApartment.id },
      });
      console.log('Linked reserved deal to apartment 102.');
    }

    const existingActivity = await prisma.dealActivity.findFirst({
      where: {
        dealId: reservedDealId,
        type: 'STATUS_CHANGE',
        body: 'Seed: moved to reserved with apartment 102.',
      },
    });

    if (existingActivity) {
      console.log('Skipping reserved deal activity: already exists.');
    } else {
      await prisma.dealActivity.create({
        data: {
          dealId: reservedDealId,
          authorUserId: builder?.id,
          type: 'STATUS_CHANGE',
          body: 'Seed: moved to reserved with apartment 102.',
        },
      });
      console.log('Created reserved deal activity.');
    }
  }
}

const PROJECT_CANVAS_TITLE = 'Sunrise site plan';
const FLOOR_CANVAS_TITLE = 'Sunrise Floor 1 plan';
const PROJECT_CANVAS_IMAGE = 'https://picsum.photos/seed/sunrise-visual-project/1200/800';
const FLOOR_CANVAS_IMAGE = 'https://picsum.photos/seed/sunrise-visual-floor1/1200/800';

async function upsertProjectCanvas(projectId: string, buildingId: string): Promise<void> {
  const existing = await prisma.visualCanvas.findFirst({
    where: { projectId, title: PROJECT_CANVAS_TITLE },
  });

  let canvasId = existing?.id;

  if (existing) {
    await prisma.visualCanvas.update({
      where: { id: existing.id },
      data: {
        imageUrl: PROJECT_CANVAS_IMAGE,
        imageAlt: 'Sunrise Residence site plan',
        status: 'PUBLISHED',
      },
    });
    console.log('Updated sunrise project visual canvas.');
  } else {
    const canvas = await prisma.visualCanvas.create({
      data: {
        projectId,
        title: PROJECT_CANVAS_TITLE,
        imageUrl: PROJECT_CANVAS_IMAGE,
        imageAlt: 'Sunrise Residence site plan',
        status: 'PUBLISHED',
      },
    });
    canvasId = canvas.id;
    console.log('Created sunrise project visual canvas.');
  }

  if (!canvasId) {
    return;
  }

  const existingHotspot = await prisma.hotspot.findFirst({
    where: { canvasId, buildingId },
  });

  if (existingHotspot) {
    await prisma.hotspot.update({
      where: { id: existingHotspot.id },
      data: { x: 42, y: 55, label: BUILDING_NAME, sortOrder: 0 },
    });
    console.log('Updated sunrise project building hotspot.');
  } else {
    await prisma.hotspot.create({
      data: {
        canvasId,
        buildingId,
        x: 42,
        y: 55,
        label: BUILDING_NAME,
        sortOrder: 0,
      },
    });
    console.log('Created sunrise project building hotspot.');
  }
}

async function upsertFloorCanvas(floorId: string, apartments: Apartment[]): Promise<void> {
  const apt101 = apartments.find((apartment) => apartment.code === '101');
  const apt102 = apartments.find((apartment) => apartment.code === '102');
  if (!apt101 || !apt102) {
    console.log('Skipping floor canvas seed: apartments 101/102 not found.');
    return;
  }

  const existing = await prisma.visualCanvas.findFirst({
    where: { floorId, title: FLOOR_CANVAS_TITLE },
  });

  let canvasId = existing?.id;

  if (existing) {
    await prisma.visualCanvas.update({
      where: { id: existing.id },
      data: {
        imageUrl: FLOOR_CANVAS_IMAGE,
        imageAlt: 'Sunrise Residence Floor 1 floorplan',
        status: 'PUBLISHED',
      },
    });
    console.log('Updated sunrise floor visual canvas.');
  } else {
    const canvas = await prisma.visualCanvas.create({
      data: {
        floorId,
        title: FLOOR_CANVAS_TITLE,
        imageUrl: FLOOR_CANVAS_IMAGE,
        imageAlt: 'Sunrise Residence Floor 1 floorplan',
        status: 'PUBLISHED',
      },
    });
    canvasId = canvas.id;
    console.log('Created sunrise floor visual canvas.');
  }

  if (!canvasId) {
    return;
  }

  for (const [apartment, x, y, sortOrder] of [
    [apt101, 28, 40, 0],
    [apt102, 68, 40, 1],
  ] as const) {
    const existingHotspot = await prisma.hotspot.findFirst({
      where: { canvasId, apartmentId: apartment.id },
    });

    if (existingHotspot) {
      await prisma.hotspot.update({
        where: { id: existingHotspot.id },
        data: { x, y, label: `Apt ${apartment.code}`, sortOrder },
      });
    } else {
      await prisma.hotspot.create({
        data: {
          canvasId,
          apartmentId: apartment.id,
          x,
          y,
          label: `Apt ${apartment.code}`,
          sortOrder,
        },
      });
    }
  }
  console.log('Upserted sunrise floor apartment hotspots.');
}

async function seedSunriseVisualMaps(
  sunriseProject: Project,
  building: Building,
  floors: Floor[],
  apartments: Apartment[],
): Promise<void> {
  await upsertProjectCanvas(sunriseProject.id, building.id);

  const floor1 = floors.find((floor) => floor.level === 1);
  if (!floor1) {
    console.log('Skipping floor canvas seed: Floor 1 not found.');
    return;
  }

  const floor1Apartments = apartments.filter((apartment) => apartment.floorId === floor1.id);
  await upsertFloorCanvas(floor1.id, floor1Apartments);
}

const CONVERSE_BANK_SLUG = 'converse-bank-demo';
const PIXEL_RENDER_SLUG = 'pixelrender-studio';
const DRAFT_PARTNER_SLUG = 'draft-partner-demo';

async function upsertBankOffer(params: {
  partnerId: string;
  title: string;
  interestRate: number;
  minDownPaymentPercent: number;
  maxTermMonths: number;
  maxAmountAmd: number;
  description: string;
  featured: boolean;
}): Promise<void> {
  const existing = await prisma.bankOffer.findFirst({
    where: { partnerId: params.partnerId, title: params.title },
  });

  const data = {
    description: params.description,
    interestRate: params.interestRate,
    minDownPaymentPercent: params.minDownPaymentPercent,
    maxTermMonths: params.maxTermMonths,
    maxAmountAmd: params.maxAmountAmd,
    featured: params.featured,
    status: 'PUBLISHED' as const,
  };

  if (existing) {
    await prisma.bankOffer.update({ where: { id: existing.id }, data });
    return;
  }

  await prisma.bankOffer.create({
    data: {
      partnerId: params.partnerId,
      title: params.title,
      ...data,
    },
  });
}

async function seedPartners(): Promise<void> {
  const converse = await prisma.partner.upsert({
    where: { slug: CONVERSE_BANK_SLUG },
    create: {
      name: 'Converse Bank Demo',
      slug: CONVERSE_BANK_SLUG,
      type: 'BANK',
      description: 'Demo bank partner with sample mortgage offers.',
      phone: '+37410000001',
      email: 'mortgage@converse-demo.local',
      website: 'https://example.com/converse-bank-demo',
      status: 'PUBLISHED',
    },
    update: {
      name: 'Converse Bank Demo',
      type: 'BANK',
      description: 'Demo bank partner with sample mortgage offers.',
      status: 'PUBLISHED',
    },
  });

  await upsertBankOffer({
    partnerId: converse.id,
    title: 'Preferential mortgage',
    interestRate: 9.5,
    minDownPaymentPercent: 10,
    maxTermMonths: 240,
    maxAmountAmd: 80_000_000,
    description: 'Preferential rate for primary-market apartments.',
    featured: true,
  });

  await upsertBankOffer({
    partnerId: converse.id,
    title: 'Standard mortgage',
    interestRate: 12.0,
    minDownPaymentPercent: 20,
    maxTermMonths: 360,
    maxAmountAmd: 120_000_000,
    description: 'Standard long-term mortgage offer.',
    featured: false,
  });

  await prisma.partner.upsert({
    where: { slug: PIXEL_RENDER_SLUG },
    create: {
      name: 'PixelRender Studio',
      slug: PIXEL_RENDER_SLUG,
      type: 'SERVICE_COMPANY',
      description: 'Render and media studio for builder readiness materials.',
      website: 'https://example.com/pixelrender-studio',
      serviceCategories: ['photography', 'render_studio', 'video_production'],
      status: 'PUBLISHED',
    },
    update: {
      name: 'PixelRender Studio',
      type: 'SERVICE_COMPANY',
      description: 'Render and media studio for builder readiness materials.',
      serviceCategories: ['photography', 'render_studio', 'video_production'],
      status: 'PUBLISHED',
    },
  });

  await prisma.partner.upsert({
    where: { slug: DRAFT_PARTNER_SLUG },
    create: {
      name: 'Draft Partner Demo',
      slug: DRAFT_PARTNER_SLUG,
      type: 'SPONSOR',
      description: 'Unpublished sponsor profile for admin workflow demos.',
      status: 'DRAFT',
    },
    update: {
      name: 'Draft Partner Demo',
      type: 'SPONSOR',
      status: 'DRAFT',
    },
  });

  console.log('Upserted demo partners (Converse Bank, PixelRender Studio, Draft Partner).');
}

/** v1 category set from docs 03-Categories-Scoring examples. */
const READINESS_CATEGORY_SEEDS = [
  {
    key: 'company_profile',
    name: 'Company profile',
    description: 'Company profile completeness, contacts, logo/brand.',
    sortOrder: 10,
    serviceCategoryKey: null as string | null,
  },
  {
    key: 'project_information',
    name: 'Project information',
    description: 'Project description, location, public trust information.',
    sortOrder: 20,
    serviceCategoryKey: null,
  },
  {
    key: 'media_materials',
    name: 'Media materials',
    description: 'Cover images, gallery, renders, video.',
    sortOrder: 30,
    serviceCategoryKey: 'render_studio',
  },
  {
    key: 'apartment_inventory',
    name: 'Apartment inventory',
    description: 'Apartments, plans, availability completeness.',
    sortOrder: 40,
    serviceCategoryKey: null,
  },
  {
    key: 'visual_map_readiness',
    name: 'Visual map readiness',
    description: 'Visual maps and hotspots for buyer navigation.',
    sortOrder: 50,
    serviceCategoryKey: 'render_studio',
  },
  {
    key: 'pricing_status_clarity',
    name: 'Pricing / status clarity',
    description: 'Consistent prices and apartment statuses.',
    sortOrder: 60,
    serviceCategoryKey: null,
  },
  {
    key: 'crm_request_readiness',
    name: 'CRM / request readiness',
    description: 'Buyer request and CRM follow-up readiness.',
    sortOrder: 70,
    serviceCategoryKey: null,
  },
  {
    key: 'event_presentation_readiness',
    name: 'Event presentation readiness',
    description: 'Overall readiness for public/event exposure.',
    sortOrder: 80,
    serviceCategoryKey: null,
  },
] as const;

async function seedReadinessCategories(): Promise<Map<string, string>> {
  const idByKey = new Map<string, string>();

  for (const category of READINESS_CATEGORY_SEEDS) {
    const row = await prisma.readinessCategory.upsert({
      where: { key: category.key },
      create: {
        key: category.key,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        serviceCategoryKey: category.serviceCategoryKey,
        active: true,
      },
      update: {
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        serviceCategoryKey: category.serviceCategoryKey,
        active: true,
      },
      select: { id: true, key: true },
    });
    idByKey.set(row.key, row.id);
  }

  console.log(`Upserted ${READINESS_CATEGORY_SEEDS.length} readiness categories.`);
  return idByKey;
}

async function seedDemoReadinessAssessment(
  company: Company,
  categoryIds: Map<string, string>,
): Promise<void> {
  const existing = await prisma.readinessAssessment.findFirst({
    where: {
      companyId: company.id,
      targetType: 'BUILDER_COMPANY',
      projectId: null,
      archivedAt: null,
    },
    select: { id: true },
  });

  const scoreConfigs = [
    {
      key: 'company_profile',
      score: 80,
      status: 'READY' as const,
      recommendation: 'Keep company contacts and logo up to date.',
      requiredActions: null as string | null,
      internalNote: 'Looks solid for demo.',
    },
    {
      key: 'project_information',
      score: 65,
      status: 'IN_PROGRESS' as const,
      recommendation: 'Expand project location and description detail.',
      requiredActions: 'Review Sunrise Residence public text.',
      internalNote: null,
    },
    {
      key: 'media_materials',
      score: 28,
      status: 'NEEDS_IMPROVEMENT' as const,
      recommendation: 'Upload higher-quality project renders and cover images.',
      requiredActions: 'Replace weak cover image; add gallery renders.',
      internalNote: 'Builder is slow with materials — follow up before event.',
    },
    {
      key: 'apartment_inventory',
      score: 72,
      status: 'READY' as const,
      recommendation: 'Apartment inventory is acceptable for v1.',
      requiredActions: null,
      internalNote: null,
    },
    {
      key: 'visual_map_readiness',
      score: 55,
      status: 'IN_PROGRESS' as const,
      recommendation: 'Finish hotspot coverage on floor canvases.',
      requiredActions: 'Add remaining floor hotspots.',
      internalNote: null,
    },
    {
      key: 'pricing_status_clarity',
      score: 70,
      status: 'READY' as const,
      recommendation: 'Keep apartment prices and statuses consistent.',
      requiredActions: null,
      internalNote: null,
    },
    {
      key: 'crm_request_readiness',
      score: 60,
      status: 'IN_PROGRESS' as const,
      recommendation: 'Confirm request routing and response SLAs.',
      requiredActions: 'Assign a default CRM owner.',
      internalNote: null,
    },
    {
      key: 'event_presentation_readiness',
      score: 45,
      status: 'IN_PROGRESS' as const,
      recommendation: 'Prepare booth materials and media for the event.',
      requiredActions: 'Confirm event presentation checklist.',
      internalNote: 'Event presentation concern — recheck week before.',
    },
  ];

  const scored = scoreConfigs
    .map((config) => ({ ...config, categoryId: categoryIds.get(config.key) }))
    .filter((config): config is (typeof scoreConfigs)[number] & { categoryId: string } => {
      return typeof config.categoryId === 'string';
    });

  const overallScore = Math.round(
    scored.reduce((sum, entry) => sum + entry.score, 0) / scored.length,
  );

  const assessmentData = {
    status: 'NEEDS_IMPROVEMENT' as const,
    overallScore,
    responsibleContact: 'BigProjects readiness desk',
    recommendation:
      'Focus on media materials first, then finish visual map and event presentation items.',
    requiredActions:
      'Upload better renders; complete floor hotspots; confirm event presentation checklist.',
    internalNotes:
      'INTERNAL: demo builder is slow with materials; data quality risk on media — do not share with builder.',
    lastEvaluatedAt: new Date(),
  };

  if (existing) {
    await prisma.readinessCategoryScore.deleteMany({ where: { assessmentId: existing.id } });
    await prisma.readinessAssessment.update({
      where: { id: existing.id },
      data: {
        ...assessmentData,
        categoryScores: {
          create: scored.map((entry) => ({
            categoryId: entry.categoryId,
            score: entry.score,
            status: entry.status,
            recommendation: entry.recommendation,
            requiredActions: entry.requiredActions,
            internalNote: entry.internalNote,
            evaluatedAt: new Date(),
          })),
        },
      },
    });
    console.log('Updated demo company readiness assessment for demo-development.');
    return;
  }

  await prisma.readinessAssessment.create({
    data: {
      targetType: 'BUILDER_COMPANY',
      companyId: company.id,
      projectId: null,
      ...assessmentData,
      categoryScores: {
        create: scored.map((entry) => ({
          categoryId: entry.categoryId,
          score: entry.score,
          status: entry.status,
          recommendation: entry.recommendation,
          requiredActions: entry.requiredActions,
          internalNote: entry.internalNote,
          evaluatedAt: new Date(),
        })),
      },
    },
  });

  console.log('Created demo company readiness assessment for demo-development.');
}

const DEMO_EVENT_CODE = 'toonexpo-2026-demo';
const DEMO_EVENT_NAME = 'ToonExpo 2026 Demo';

const DEMO_VENUE_IMAGE_URL = 'https://picsum.photos/seed/toonexpo-venue-2026/1200/800';
const DEMO_VENUE_IMAGE_ALT = 'ToonExpo 2026 demo pavilion floor plan';

async function seedExhibitionVenueMap(eventId: string, companyId: string): Promise<void> {
  const partner = await prisma.partner.findUnique({
    where: { slug: CONVERSE_BANK_SLUG },
    select: { id: true },
  });

  const venueMap = await prisma.venueMap.upsert({
    where: { eventId },
    create: {
      eventId,
      imageUrl: DEMO_VENUE_IMAGE_URL,
      imageAlt: DEMO_VENUE_IMAGE_ALT,
    },
    update: {
      imageUrl: DEMO_VENUE_IMAGE_URL,
      imageAlt: DEMO_VENUE_IMAGE_ALT,
    },
    select: { id: true },
  });

  const booths = [
    {
      code: 'A12',
      label: 'Demo Development',
      xPercent: 28,
      yPercent: 42,
      companyId,
      partnerId: null as string | null,
      note: 'Builder stand near the main aisle',
      sortOrder: 0,
    },
    {
      code: 'B03',
      label: 'Converse Bank',
      xPercent: 55,
      yPercent: 35,
      companyId: null as string | null,
      partnerId: partner?.id ?? null,
      note: null as string | null,
      sortOrder: 1,
    },
    {
      code: 'C01',
      label: 'Info Desk',
      xPercent: 48,
      yPercent: 78,
      companyId: null as string | null,
      partnerId: null as string | null,
      note: 'Visitor information',
      sortOrder: 2,
    },
  ];

  for (const booth of booths) {
    await prisma.booth.upsert({
      where: {
        venueMapId_code: { venueMapId: venueMap.id, code: booth.code },
      },
      create: {
        venueMapId: venueMap.id,
        code: booth.code,
        label: booth.label,
        xPercent: booth.xPercent,
        yPercent: booth.yPercent,
        companyId: booth.companyId,
        partnerId: booth.partnerId,
        note: booth.note,
        sortOrder: booth.sortOrder,
      },
      update: {
        label: booth.label,
        xPercent: booth.xPercent,
        yPercent: booth.yPercent,
        companyId: booth.companyId,
        partnerId: booth.partnerId,
        note: booth.note,
        sortOrder: booth.sortOrder,
      },
    });
  }

  await seedExhibitionVenuePathGraph(venueMap.id);

  console.log(`Seeded venue map + ${booths.length} booths for ${DEMO_EVENT_CODE}`);
}

const DEMO_ENTRANCE = { xPercent: 50, yPercent: 95 };

async function seedExhibitionVenuePathGraph(venueMapId: string): Promise<void> {
  const boothRows = await prisma.booth.findMany({
    where: { venueMapId },
    select: { id: true, code: true, xPercent: true, yPercent: true },
  });
  const byCode = new Map(boothRows.map((row) => [row.code, row]));
  const boothA12 = byCode.get('A12');
  const boothB03 = byCode.get('B03');
  const boothC01 = byCode.get('C01');
  if (!boothA12 || !boothB03 || !boothC01) {
    throw new Error('Demo booths A12/B03/C01 required before path graph seed');
  }

  await prisma.venuePathEdge.deleteMany({ where: { venueMapId } });
  await prisma.venuePathNode.deleteMany({ where: { venueMapId } });

  await prisma.venueMap.update({
    where: { id: venueMapId },
    data: {
      entranceXPercent: DEMO_ENTRANCE.xPercent,
      entranceYPercent: DEMO_ENTRANCE.yPercent,
    },
  });

  const entrance = await prisma.venuePathNode.create({
    data: {
      venueMapId,
      kind: 'ENTRANCE',
      xPercent: DEMO_ENTRANCE.xPercent,
      yPercent: DEMO_ENTRANCE.yPercent,
    },
    select: { id: true },
  });
  const wpMain = await prisma.venuePathNode.create({
    data: { venueMapId, kind: 'WAYPOINT', xPercent: 50, yPercent: 70 },
    select: { id: true },
  });
  const wpHub = await prisma.venuePathNode.create({
    data: { venueMapId, kind: 'WAYPOINT', xPercent: 50, yPercent: 50 },
    select: { id: true },
  });
  const wpA = await prisma.venuePathNode.create({
    data: { venueMapId, kind: 'WAYPOINT', xPercent: 28, yPercent: 50 },
    select: { id: true },
  });
  const nodeA12 = await prisma.venuePathNode.create({
    data: {
      venueMapId,
      kind: 'BOOTH',
      boothId: boothA12.id,
      xPercent: boothA12.xPercent,
      yPercent: boothA12.yPercent,
    },
    select: { id: true },
  });
  const nodeB03 = await prisma.venuePathNode.create({
    data: {
      venueMapId,
      kind: 'BOOTH',
      boothId: boothB03.id,
      xPercent: boothB03.xPercent,
      yPercent: boothB03.yPercent,
    },
    select: { id: true },
  });
  const nodeC01 = await prisma.venuePathNode.create({
    data: {
      venueMapId,
      kind: 'BOOTH',
      boothId: boothC01.id,
      xPercent: boothC01.xPercent,
      yPercent: boothC01.yPercent,
    },
    select: { id: true },
  });

  const undirectedPairs: Array<[string, string]> = [
    [entrance.id, wpMain.id],
    [wpMain.id, nodeC01.id],
    [wpMain.id, wpHub.id],
    [wpHub.id, wpA.id],
    [wpA.id, nodeA12.id],
    [wpHub.id, nodeB03.id],
  ];

  for (const [a, b] of undirectedPairs) {
    const [fromNodeId, toNodeId] = a < b ? [a, b] : [b, a];
    await prisma.venuePathEdge.create({
      data: { venueMapId, fromNodeId, toNodeId },
    });
  }

  console.log('Seeded venue path graph (entrance + waypoints + booth routes)');
}

async function seedExhibitionEvent(companyId: string): Promise<void> {
  const existing = await prisma.exhibitionEvent.findUnique({
    where: { code: DEMO_EVENT_CODE },
    select: { id: true },
  });

  let eventId: string;
  if (existing) {
    await prisma.exhibitionEvent.update({
      where: { id: existing.id },
      data: {
        name: DEMO_EVENT_NAME,
        status: 'ACTIVE',
      },
    });
    console.log(`Updated demo exhibition event: ${DEMO_EVENT_CODE}`);
    eventId = existing.id;
  } else {
    const created = await prisma.exhibitionEvent.create({
      data: {
        name: DEMO_EVENT_NAME,
        code: DEMO_EVENT_CODE,
        status: 'ACTIVE',
        startDate: new Date('2026-07-01T09:00:00.000Z'),
        endDate: new Date('2026-07-31T18:00:00.000Z'),
      },
      select: { id: true },
    });
    console.log(`Created demo exhibition event: ${DEMO_EVENT_CODE}`);
    eventId = created.id;
  }

  await seedExhibitionVenueMap(eventId, companyId);
}

async function main(): Promise<void> {
  await seedAdmin();
  const catalog = await seedDemoCatalog();
  await seedCatalogProjects(prisma);
  await seedBuilder();
  await seedEntranceStaff();
  await seedDemoCrmDeals(catalog.company, catalog.sunriseProject, catalog.apartments);
  await seedSunriseVisualMaps(
    catalog.sunriseProject,
    catalog.building,
    catalog.floors,
    catalog.apartments,
  );
  await seedPartners();
  const categoryIds = await seedReadinessCategories();
  await seedDemoReadinessAssessment(catalog.company, categoryIds);
  await seedExhibitionEvent(catalog.company.id);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
