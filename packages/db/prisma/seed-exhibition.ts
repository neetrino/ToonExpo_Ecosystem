/**
 * Idempotent exhibition event + venue map image + sample booths (dev seed).
 */
import {
  BoothType,
  EventStatus,
  MediaAssetType,
  PublicationStatus,
  type PrismaClient,
} from '../src/index.js';
import { SEED_PLATFORM_ADMIN_ID } from './seed-auth.js';
import { DEMO_VENUE_MAP_URL, SEED_ID_PREFIX, SEED_PROJECTS, toSeedMediaUrl } from './seed-data.js';
import { SEED_BANK_COMPANY_ID } from './seed-mortgage.js';

export const SEED_EVENT_ID = `${SEED_ID_PREFIX}event_toonexpo_2026`;
export const SEED_VENUE_MAP_ID = `${SEED_ID_PREFIX}venue_map_main`;
export const SEED_VENUE_MEDIA_ID = `${SEED_ID_PREFIX}media_venue_map`;

type SeedBooth = {
  id: string;
  code: string;
  name: string;
  type: BoothType;
  x: number;
  y: number;
  companyId?: string;
  projectId?: string;
};

/**
 * Creates a published exhibition event with a venue map image and booths.
 */
export const upsertSeedExhibition = async (prisma: PrismaClient): Promise<void> => {
  await prisma.mediaAsset.upsert({
    where: { id: SEED_VENUE_MEDIA_ID },
    create: {
      id: SEED_VENUE_MEDIA_ID,
      ownerCompanyId: null,
      type: MediaAssetType.image,
      fileUrl: toSeedMediaUrl(DEMO_VENUE_MAP_URL),
      title: 'ToonExpo venue map',
      altText: 'Exhibition venue map',
    },
    update: {
      fileUrl: toSeedMediaUrl(DEMO_VENUE_MAP_URL),
      title: 'ToonExpo venue map',
      altText: 'Exhibition venue map',
    },
  });

  const start = new Date('2026-09-15');
  const end = new Date('2026-09-18');

  await prisma.event.upsert({
    where: { id: SEED_EVENT_ID },
    create: {
      id: SEED_EVENT_ID,
      name: 'ToonExpo 2026',
      code: 'toonexpo-2026-seed',
      startDate: start,
      endDate: end,
      status: EventStatus.active,
      publicationStatus: PublicationStatus.published,
    },
    update: {
      name: 'ToonExpo 2026',
      code: 'toonexpo-2026-seed',
      startDate: start,
      endDate: end,
      status: EventStatus.active,
      publicationStatus: PublicationStatus.published,
    },
  });

  await prisma.venueMap.upsert({
    where: { id: SEED_VENUE_MAP_ID },
    create: {
      id: SEED_VENUE_MAP_ID,
      eventId: SEED_EVENT_ID,
      title: 'Main hall',
      mediaAssetId: SEED_VENUE_MEDIA_ID,
      publicationStatus: PublicationStatus.published,
      width: 1600,
      height: 900,
      createdByUserId: SEED_PLATFORM_ADMIN_ID,
      updatedByUserId: SEED_PLATFORM_ADMIN_ID,
    },
    update: {
      eventId: SEED_EVENT_ID,
      title: 'Main hall',
      mediaAssetId: SEED_VENUE_MEDIA_ID,
      publicationStatus: PublicationStatus.published,
      width: 1600,
      height: 900,
      updatedByUserId: SEED_PLATFORM_ADMIN_ID,
    },
  });

  const booths: SeedBooth[] = [
    {
      id: `${SEED_ID_PREFIX}booth_entrance`,
      code: 'E1',
      name: 'Main entrance',
      type: BoothType.entrance,
      x: 12,
      y: 80,
    },
    {
      id: `${SEED_ID_PREFIX}booth_info`,
      code: 'I1',
      name: 'Info desk',
      type: BoothType.info,
      x: 28,
      y: 72,
    },
    {
      id: `${SEED_ID_PREFIX}booth_glendale`,
      code: 'B01',
      name: 'Glendale Hills',
      type: BoothType.builder,
      x: 45,
      y: 40,
      companyId: SEED_PROJECTS[0]!.builderId,
      projectId: SEED_PROJECTS[0]!.id,
    },
    {
      id: `${SEED_ID_PREFIX}booth_cascade`,
      code: 'B02',
      name: 'Cascade Development',
      type: BoothType.builder,
      x: 62,
      y: 35,
      companyId: SEED_PROJECTS[1]!.builderId,
      projectId: SEED_PROJECTS[1]!.id,
    },
    {
      id: `${SEED_ID_PREFIX}booth_bank`,
      code: 'BK1',
      name: 'Ameriabank',
      type: BoothType.bank,
      x: 78,
      y: 55,
      companyId: SEED_BANK_COMPANY_ID,
    },
  ];

  for (const booth of booths) {
    await prisma.booth.upsert({
      where: { id: booth.id },
      create: {
        id: booth.id,
        eventId: SEED_EVENT_ID,
        venueMapId: SEED_VENUE_MAP_ID,
        code: booth.code,
        name: booth.name,
        type: booth.type,
        xPercent: booth.x,
        yPercent: booth.y,
        publicationStatus: PublicationStatus.published,
        locationText: booth.name,
      },
      update: {
        eventId: SEED_EVENT_ID,
        venueMapId: SEED_VENUE_MAP_ID,
        code: booth.code,
        name: booth.name,
        type: booth.type,
        xPercent: booth.x,
        yPercent: booth.y,
        publicationStatus: PublicationStatus.published,
        locationText: booth.name,
      },
    });

    if (!booth.companyId) {
      continue;
    }

    const assignmentId = `${SEED_ID_PREFIX}booth_assign_${booth.id}`;
    await prisma.boothAssignment.upsert({
      where: { id: assignmentId },
      create: {
        id: assignmentId,
        boothId: booth.id,
        companyId: booth.companyId,
        projectId: booth.projectId ?? null,
        active: true,
      },
      update: {
        boothId: booth.id,
        companyId: booth.companyId,
        projectId: booth.projectId ?? null,
        active: true,
      },
    });
  }
};
