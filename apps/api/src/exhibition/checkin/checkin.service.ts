import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  ActiveEventResponse,
  CheckInScanResponse,
  RecentCheckInResponse,
} from "@toonexpo/contracts";
import { CheckInStatus, EventStatus } from "@toonexpo/db";

import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { QrResolveMeta } from "../../qr/qr-resolve.service.js";
import { QrResolveService } from "../../qr/qr-resolve.service.js";
import { RECENT_CHECKINS_LIMIT } from "../exhibition.constants.js";
import { CheckInScanService } from "./checkin-scan.service.js";
import { formatCheckInDate } from "./checkin.utils.js";

@Injectable()
export class CheckInService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qrResolve: QrResolveService,
    private readonly scanService: CheckInScanService,
  ) {}

  async getActiveEvent(): Promise<ActiveEventResponse> {
    const event = await this.prisma.db.event.findFirst({
      where: { status: EventStatus.active },
      orderBy: [{ updatedAt: "desc" }],
    });

    if (!event) {
      throw new NotFoundException("No active event");
    }

    return {
      id: event.id,
      name: event.name,
      code: event.code,
      startDate: formatCheckInDate(event.startDate),
      endDate: formatCheckInDate(event.endDate),
    };
  }

  async scan(
    staff: AuthenticatedUser,
    tokenInput: string,
    eventId: string,
    meta: QrResolveMeta,
  ): Promise<CheckInScanResponse> {
    await this.requireActiveEvent(eventId);
    const checkedInAt = new Date();

    try {
      const resolved = await this.qrResolve.resolve(tokenInput, staff, meta);

      if (resolved.kind !== "entrance_checkin") {
        return {
          status: CheckInStatus.error,
          visitorDisplayName: null,
          checkedInAt: null,
          duplicateWarning: false,
        };
      }

      return this.scanService.recordSuccessfulScan({
        eventId,
        buyerProfileId: resolved.buyerProfileId,
        qrCodeId: await this.scanService.lookupQrCodeId(resolved.buyerProfileId),
        scanEventId: resolved.scanEventId,
        staffUserId: staff.id,
        visitorDisplayName: resolved.name,
        checkedInAt,
      });
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }

      return this.scanService.handleDeniedScan(
        tokenInput,
        eventId,
        staff.id,
        checkedInAt,
      );
    }
  }

  async listRecent(staffUserId: string, eventId: string): Promise<RecentCheckInResponse> {
    await this.requireEvent(eventId);

    const records = await this.prisma.db.checkInRecord.findMany({
      where: { eventId, checkedInByUserId: staffUserId },
      orderBy: [{ checkedInAt: "desc" }],
      take: RECENT_CHECKINS_LIMIT,
      include: {
        buyerProfile: { select: { name: true } },
      },
    });

    return {
      data: records.map((row) => ({
        visitorDisplayName: row.buyerProfile.name,
        status: row.status,
        checkedInAt: row.checkedInAt.toISOString(),
      })),
    };
  }

  private async requireActiveEvent(eventId: string): Promise<void> {
    const event = await this.prisma.db.event.findFirst({
      where: { id: eventId, status: EventStatus.active },
      select: { id: true },
    });

    if (!event) {
      throw new NotFoundException("Active event not found");
    }
  }

  private async requireEvent(eventId: string): Promise<void> {
    const event = await this.prisma.db.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }
  }
}
