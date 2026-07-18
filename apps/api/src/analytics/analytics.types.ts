import type { AnalyticsEventType } from "@toonexpo/contracts";
import type { Prisma } from "@toonexpo/db";

/** Input for fire-and-forget analytics tracking. */
export type TrackAnalyticsEventInput = {
  eventType: AnalyticsEventType;
  actorUserId?: string | null;
  actorRole?: string | null;
  companyId?: string | null;
  projectId?: string | null;
  buildingId?: string | null;
  floorId?: string | null;
  apartmentId?: string | null;
  eventId?: string | null;
  boothId?: string | null;
  requestId?: string | null;
  crmDealId?: string | null;
  source?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export type ResolvedAnalyticsDateRange = {
  from: Date;
  to: Date;
  fromIso: string;
  toIso: string;
};
