import type { ExhibitionEventStatus } from '@toonexpo/domain';

import { apiRequest } from '@/lib/api/client';

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

export async function loadActiveExhibitionEvent(): Promise<ActiveExhibitionEvent | null> {
  const event = await apiRequest<
    Omit<ActiveExhibitionEvent, 'startDate' | 'endDate'> & {
      startDate: string | null;
      endDate: string | null;
    }
  >('/exhibition/active');
  return event
    ? {
        ...event,
        startDate: event.startDate ? new Date(event.startDate) : null,
        endDate: event.endDate ? new Date(event.endDate) : null,
      }
    : null;
}

export async function loadBuyerCheckIns(_userId: string): Promise<BuyerCheckInRow[]> {
  const rows = await apiRequest<
    Array<
      Omit<BuyerCheckInRow, 'checkedInAt'> & {
        checkedInAt: string;
      }
    >
  >('/exhibition/check-ins');
  return rows.map((row) => ({ ...row, checkedInAt: new Date(row.checkedInAt) }));
}
