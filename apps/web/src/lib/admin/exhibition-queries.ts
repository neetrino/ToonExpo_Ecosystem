import type { ExhibitionEventStatus } from '@toonexpo/domain';

import { adminApiRequest } from './admin-api';

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
  return adminApiRequest<AdminExhibitionEventRow[]>('/exhibition/events');
}

export async function loadRecentCheckIns(eventId?: string): Promise<AdminRecentCheckInRow[]> {
  const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : '';
  const rows = await adminApiRequest<AdminRecentCheckInRow[]>(`/exhibition/check-ins${query}`);
  return rows.slice(0, RECENT_CHECK_INS_LIMIT);
}
