import { Injectable } from "@nestjs/common";
import { AnalyticsEventType as DbAnalyticsEventType } from "@toonexpo/db";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { PrismaService } from "../prisma/prisma.service.js";
import type { TrackAnalyticsEventInput } from "./analytics.types.js";

const EVENT_TYPE_MAP: Record<
  TrackAnalyticsEventInput["eventType"],
  DbAnalyticsEventType
> = {
  project_view: DbAnalyticsEventType.project_view,
  building_view: DbAnalyticsEventType.building_view,
  floor_view: DbAnalyticsEventType.floor_view,
  apartment_view: DbAnalyticsEventType.apartment_view,
  builder_profile_view: DbAnalyticsEventType.builder_profile_view,
  partner_profile_view: DbAnalyticsEventType.partner_profile_view,
  mortgage_page_view: DbAnalyticsEventType.mortgage_page_view,
  bank_offer_selected: DbAnalyticsEventType.bank_offer_selected,
  favorite_added: DbAnalyticsEventType.favorite_added,
  request_created: DbAnalyticsEventType.request_created,
  qr_scanned: DbAnalyticsEventType.qr_scanned,
  check_in_recorded: DbAnalyticsEventType.check_in_recorded,
  booth_selected: DbAnalyticsEventType.booth_selected,
  route_requested: DbAnalyticsEventType.route_requested,
  crm_status_changed: DbAnalyticsEventType.crm_status_changed,
  readiness_status_changed: DbAnalyticsEventType.readiness_status_changed,
};

/**
 * Fire-and-forget product analytics tracking.
 * Never throws to callers — failures are logged only.
 */
@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(AnalyticsService.name)
    private readonly logger: PinoLogger,
  ) {}

  track(event: TrackAnalyticsEventInput): void {
    void this.persist(event).catch((error: unknown) => {
      this.logger.error(
        { err: error, eventType: event.eventType },
        "analytics track failed",
      );
    });
  }

  private async persist(event: TrackAnalyticsEventInput): Promise<void> {
    await this.prisma.db.analyticsEvent.create({
      data: {
        eventType: EVENT_TYPE_MAP[event.eventType],
        actorUserId: event.actorUserId ?? null,
        actorRole: event.actorRole ?? null,
        companyId: event.companyId ?? null,
        projectId: event.projectId ?? null,
        buildingId: event.buildingId ?? null,
        floorId: event.floorId ?? null,
        apartmentId: event.apartmentId ?? null,
        eventId: event.eventId ?? null,
        boothId: event.boothId ?? null,
        requestId: event.requestId ?? null,
        crmDealId: event.crmDealId ?? null,
        source: event.source ?? null,
        ...(event.metadata !== undefined ? { metadata: event.metadata } : {}),
      },
    });
  }
}
