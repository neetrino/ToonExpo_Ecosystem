import {
  PrismaClient,
  type Apartment,
  type Building,
  type Company,
  type Floor,
  type Project,
} from '@prisma/client';
import argon2 from 'argon2';

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
  },
  {
    floorIndex: 0,
    code: '102',
    status: 'RESERVED' as const,
    areaSqm: 95.0,
    rooms: 3,
    priceAmd: 112000000,
  },
  {
    floorIndex: 1,
    code: '201',
    status: 'SOLD' as const,
    areaSqm: 68.0,
    rooms: 2,
    priceAmd: 79000000,
  },
  {
    floorIndex: 1,
    code: '202',
    status: 'AVAILABLE' as const,
    areaSqm: 110.0,
    rooms: 4,
    priceAmd: 145000000,
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
    update: { name: DEMO_COMPANY_NAME },
    create: { name: DEMO_COMPANY_NAME, slug: DEMO_COMPANY_SLUG },
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
    data: { projectId, name: BUILDING_NAME },
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
      },
      create: {
        floorId: floor.id,
        code: config.code,
        status: config.status,
        areaSqm: config.areaSqm,
        rooms: config.rooms,
        priceAmd: config.priceAmd,
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

async function main(): Promise<void> {
  await seedAdmin();
  const catalog = await seedDemoCatalog();
  await seedBuilder();
  await seedDemoCrmDeals(catalog.company, catalog.sunriseProject, catalog.apartments);
  await seedSunriseVisualMaps(
    catalog.sunriseProject,
    catalog.building,
    catalog.floors,
    catalog.apartments,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
