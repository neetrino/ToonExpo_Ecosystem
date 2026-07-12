import type { ExhibitionEventStatus, VenuePathNodeKind } from '@toonexpo/domain';
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
  projectId: string | null;
  companyName: string | null;
  partnerName: string | null;
  projectName: string | null;
};

export type AdminPathNodeRow = {
  id: string;
  xPercent: number;
  yPercent: number;
  kind: VenuePathNodeKind;
  boothId: string | null;
};

export type AdminPathEdgeRow = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
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
    entranceXPercent: number | null;
    entranceYPercent: number | null;
  } | null;
  booths: AdminVenueBoothRow[];
  pathNodes: AdminPathNodeRow[];
  pathEdges: AdminPathEdgeRow[];
};

export type AdminAssignmentOption = {
  id: string;
  name: string;
};

export type AdminProjectOption = {
  id: string;
  name: string;
  companyId: string;
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
          entranceXPercent: true,
          entranceYPercent: true,
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
              projectId: true,
              company: { select: { name: true } },
              partner: { select: { name: true } },
              project: { select: { name: true } },
            },
          },
          pathNodes: {
            select: {
              id: true,
              xPercent: true,
              yPercent: true,
              kind: true,
              boothId: true,
            },
          },
          pathEdges: {
            select: {
              id: true,
              fromNodeId: true,
              toNodeId: true,
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
      ? {
          id: venueMap.id,
          imageUrl: venueMap.imageUrl,
          imageAlt: venueMap.imageAlt,
          entranceXPercent: venueMap.entranceXPercent,
          entranceYPercent: venueMap.entranceYPercent,
        }
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
      projectId: booth.projectId,
      companyName: booth.company?.name ?? null,
      partnerName: booth.partner?.name ?? null,
      projectName: booth.project?.name ?? null,
    })),
    pathNodes: venueMap?.pathNodes ?? [],
    pathEdges: venueMap?.pathEdges ?? [],
  };
}

export async function loadAssignmentOptions(): Promise<{
  companies: AdminAssignmentOption[];
  partners: AdminAssignmentOption[];
  projects: AdminProjectOption[];
}> {
  const [companies, partners, projects] = await Promise.all([
    prisma.company.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.partner.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, companyId: true },
    }),
  ]);
  return { companies, partners, projects };
}
