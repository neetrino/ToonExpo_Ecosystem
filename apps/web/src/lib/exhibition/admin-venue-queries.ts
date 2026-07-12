import type { ExhibitionEventStatus } from '@toonexpo/domain';
import { prisma } from '@toonexpo/db';

export type AdminVenueBoothRow = {
  id: string;
  code: string;
  label: string;
  xPercent: number;
  yPercent: number;
  note: string | null;
  sortOrder: number;
  companyId: string | null;
  partnerId: string | null;
  companyName: string | null;
  partnerName: string | null;
};

export type AdminVenueMapDetail = {
  event: {
    id: string;
    name: string;
    code: string;
    status: ExhibitionEventStatus;
  };
  venueMap: {
    id: string;
    imageUrl: string;
    imageAlt: string | null;
  } | null;
  booths: AdminVenueBoothRow[];
};

export type AdminAssignmentOption = {
  id: string;
  name: string;
};

export async function loadAdminVenueMapDetail(
  eventId: string,
): Promise<AdminVenueMapDetail | null> {
  const event = await prisma.exhibitionEvent.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
      venueMap: {
        select: {
          id: true,
          imageUrl: true,
          imageAlt: true,
          booths: {
            orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
            select: {
              id: true,
              code: true,
              label: true,
              xPercent: true,
              yPercent: true,
              note: true,
              sortOrder: true,
              companyId: true,
              partnerId: true,
              company: { select: { name: true } },
              partner: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!event) {
    return null;
  }

  const venueMap = event.venueMap;
  return {
    event: {
      id: event.id,
      name: event.name,
      code: event.code,
      status: event.status,
    },
    venueMap: venueMap
      ? { id: venueMap.id, imageUrl: venueMap.imageUrl, imageAlt: venueMap.imageAlt }
      : null,
    booths: (venueMap?.booths ?? []).map((booth) => ({
      id: booth.id,
      code: booth.code,
      label: booth.label,
      xPercent: booth.xPercent,
      yPercent: booth.yPercent,
      note: booth.note,
      sortOrder: booth.sortOrder,
      companyId: booth.companyId,
      partnerId: booth.partnerId,
      companyName: booth.company?.name ?? null,
      partnerName: booth.partner?.name ?? null,
    })),
  };
}

export async function loadAssignmentOptions(): Promise<{
  companies: AdminAssignmentOption[];
  partners: AdminAssignmentOption[];
}> {
  const [companies, partners] = await Promise.all([
    prisma.company.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.partner.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);
  return { companies, partners };
}
