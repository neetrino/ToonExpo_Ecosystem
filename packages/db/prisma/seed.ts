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
  return { company, sunriseProject, apartments };
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

async function main(): Promise<void> {
  await seedAdmin();
  const catalog = await seedDemoCatalog();
  await seedBuilder();
  await seedDemoCrmDeals(catalog.company, catalog.sunriseProject, catalog.apartments);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
