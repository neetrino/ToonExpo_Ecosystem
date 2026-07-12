import type { ExhibitionEventStatus } from '@toonexpo/domain';
import { prisma } from '@toonexpo/db';

export type AdminExhibitionEventRow = {
  id: string;
  name: string;
  code: string;
  startDate: Date | null;
  endDate: Date | null;
  status: ExhibitionEventStatus;
  checkInCount: number;
  updatedAt: Date;
};

/** Recent check-ins: display name only — no phone/email. */
export type AdminRecentCheckInRow = {
  id: string;
  checkedInAt: Date;
  eventName: string;
  buyerName: string | null;
  staffName: string | null;
};

const RECENT_CHECK_INS_LIMIT = 30;

export async function loadExhibitionEvents(): Promise<AdminExhibitionEventRow[]> {
  const events = await prisma.exhibitionEvent.findMany({
    orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      name: true,
      code: true,
      startDate: true,
      endDate: true,
      status: true,
      updatedAt: true,
      _count: { select: { checkIns: true } },
    },
  });

  return events.map((event) => ({
    id: event.id,
    name: event.name,
    code: event.code,
    startDate: event.startDate,
    endDate: event.endDate,
    status: event.status,
    checkInCount: event._count.checkIns,
    updatedAt: event.updatedAt,
  }));
}

export async function loadRecentCheckIns(
  eventId?: string,
): Promise<AdminRecentCheckInRow[]> {
  const rows = await prisma.checkIn.findMany({
    where: eventId ? { eventId } : undefined,
    orderBy: { checkedInAt: 'desc' },
    take: RECENT_CHECK_INS_LIMIT,
    select: {
      id: true,
      checkedInAt: true,
      event: { select: { name: true } },
      buyerProfile: {
        select: {
          user: { select: { name: true } },
        },
      },
      checkedInByUser: { select: { name: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    checkedInAt: row.checkedInAt,
    eventName: row.event.name,
    buyerName: row.buyerProfile.user.name,
    staffName: row.checkedInByUser.name,
  }));
}
