import type { ExhibitionEventStatus } from '@toonexpo/domain';
import { prisma } from '@toonexpo/db';

export type ActiveExhibitionEvent = {
  id: string;
  name: string;
  code: string;
  startDate: Date | null;
  endDate: Date | null;
  status: ExhibitionEventStatus;
};

export type BuyerCheckInRow = {
  id: string;
  checkedInAt: Date;
  eventName: string;
  eventCode: string;
};

const RECENT_CHECK_INS_LIMIT = 20;

export async function loadActiveExhibitionEvent(): Promise<ActiveExhibitionEvent | null> {
  return prisma.exhibitionEvent.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      name: true,
      code: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  });
}

export async function loadBuyerCheckIns(userId: string): Promise<BuyerCheckInRow[]> {
  const profile = await prisma.buyerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) {
    return [];
  }

  const rows = await prisma.checkIn.findMany({
    where: { buyerProfileId: profile.id },
    orderBy: { checkedInAt: 'desc' },
    take: RECENT_CHECK_INS_LIMIT,
    select: {
      id: true,
      checkedInAt: true,
      event: { select: { name: true, code: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    checkedInAt: row.checkedInAt,
    eventName: row.event.name,
    eventCode: row.event.code,
  }));
}
