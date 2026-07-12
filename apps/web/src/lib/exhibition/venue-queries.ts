import type { ExhibitionEventStatus } from '@toonexpo/domain';
import { prisma } from '@toonexpo/db';

import { isPublicVenueMapEventStatus } from './venue-visibility';

export type PublicBooth = {
  id: string;
  code: string;
  label: string;
  xPercent: number;
  yPercent: number;
  note: string | null;
  company: { id: string; name: string; slug: string } | null;
  partner: { id: string; name: string; slug: string } | null;
};

export type PublicVenueMap = {
  id: string;
  imageUrl: string;
  imageAlt: string | null;
  event: {
    id: string;
    name: string;
    code: string;
    status: ExhibitionEventStatus;
  };
  booths: PublicBooth[];
};

const boothSelect = {
  id: true,
  code: true,
  label: true,
  xPercent: true,
  yPercent: true,
  note: true,
  company: { select: { id: true, name: true, slug: true } },
  partner: { select: { id: true, name: true, slug: true } },
} as const;

/** True when an ACTIVE event has a venue map (for public nav). */
export async function hasPublicVenueMap(): Promise<boolean> {
  const count = await prisma.venueMap.count({
    where: { event: { status: 'ACTIVE' } },
  });
  return count > 0;
}

/** Loads the ACTIVE event venue map for public visitors, or null. */
export async function loadPublicVenueMap(): Promise<PublicVenueMap | null> {
  const venueMap = await prisma.venueMap.findFirst({
    where: { event: { status: 'ACTIVE' } },
    orderBy: { event: { startDate: 'desc' } },
    select: {
      id: true,
      imageUrl: true,
      imageAlt: true,
      event: {
        select: { id: true, name: true, code: true, status: true },
      },
      booths: {
        orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
        select: boothSelect,
      },
    },
  });

  if (!venueMap || !isPublicVenueMapEventStatus(venueMap.event.status)) {
    return null;
  }

  return {
    id: venueMap.id,
    imageUrl: venueMap.imageUrl,
    imageAlt: venueMap.imageAlt,
    event: venueMap.event,
    booths: venueMap.booths,
  };
}

export type CompanyBoothAssignment = {
  code: string;
  label: string;
  eventName: string;
};

/** Booth assigned to a company on the ACTIVE event (builder portal). */
export async function loadCompanyActiveBooth(
  companyId: string,
): Promise<CompanyBoothAssignment | null> {
  const booth = await prisma.booth.findFirst({
    where: {
      companyId,
      venueMap: { event: { status: 'ACTIVE' } },
    },
    orderBy: { sortOrder: 'asc' },
    select: {
      code: true,
      label: true,
      venueMap: { select: { event: { select: { name: true } } } },
    },
  });

  if (!booth) {
    return null;
  }

  return {
    code: booth.code,
    label: booth.label,
    eventName: booth.venueMap.event.name,
  };
}
