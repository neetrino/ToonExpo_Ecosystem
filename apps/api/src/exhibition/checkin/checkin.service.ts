import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  ActiveEventResponse,
  CheckInScanResponse,
  RecentCheckInResponse,
} from "@toonexpo/contracts";
import {
  CheckInStatus,
  EventStatus,
  Prisma,
  QrCodeStatus,
  hashQrToken,
} from "@toonexpo/db";

import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import type { AppEnv } from "../../config/env.validation.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AnalyticsService } from "../../analytics/analytics.service.js";
import { extractQrToken } from "../../qr/qr-payload.util.js";
import type { QrResolveMeta } from "../../qr/qr-resolve.service.js";
import { QrResolveService } from "../../qr/qr-resolve.service.js";
import { RECENT_CHECKINS_LIMIT } from "../exhibition.constants.js";

@Injectable()
export class CheckInService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qrResolve: QrResolveService,
    private readonly configService: ConfigService<AppEnv, true>,
    private readonly analytics: AnalyticsService,
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
      startDate: formatDate(event.startDate),
      endDate: formatDate(event.endDate),
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

      return this.recordSuccessfulScan({
        eventId,
        buyerProfileId: resolved.buyerProfileId,
        qrCodeId: await this.lookupQrCodeId(resolved.buyerProfileId),
        scanEventId: resolved.scanEventId,
        staffUserId: staff.id,
        visitorDisplayName: resolved.name,
        checkedInAt,
      });
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }

      return this.handleDeniedScan(tokenInput, eventId, staff.id, checkedInAt);
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

  private async recordSuccessfulScan(input: {
    eventId: string;
    buyerProfileId: string;
    qrCodeId: string;
    scanEventId: string;
    staffUserId: string;
    visitorDisplayName: string;
    checkedInAt: Date;
  }): Promise<CheckInScanResponse> {
    const existingAllowed = await this.prisma.db.checkInRecord.findFirst({
      where: {
        eventId: input.eventId,
        buyerProfileId: input.buyerProfileId,
        status: CheckInStatus.allowed,
      },
    });

    if (existingAllowed) {
      const duplicate = await this.prisma.db.checkInRecord.create({
        data: {
          eventId: input.eventId,
          buyerProfileId: input.buyerProfileId,
          qrCodeId: input.qrCodeId,
          scanEventId: input.scanEventId,
          checkedInByUserId: input.staffUserId,
          status: CheckInStatus.duplicate_checkin,
          checkedInAt: input.checkedInAt,
          duplicateOfCheckInId: existingAllowed.id,
        },
      });

      this.trackCheckIn(input.eventId, CheckInStatus.duplicate_checkin);

      return {
        status: CheckInStatus.duplicate_checkin,
        visitorDisplayName: input.visitorDisplayName,
        checkedInAt: duplicate.checkedInAt.toISOString(),
        duplicateWarning: true,
      };
    }

    try {
      const allowed = await this.prisma.db.checkInRecord.create({
        data: {
          eventId: input.eventId,
          buyerProfileId: input.buyerProfileId,
          qrCodeId: input.qrCodeId,
          scanEventId: input.scanEventId,
          checkedInByUserId: input.staffUserId,
          status: CheckInStatus.allowed,
          checkedInAt: input.checkedInAt,
        },
      });

      this.trackCheckIn(input.eventId, CheckInStatus.allowed);

      return {
        status: CheckInStatus.allowed,
        visitorDisplayName: input.visitorDisplayName,
        checkedInAt: allowed.checkedInAt.toISOString(),
        duplicateWarning: false,
      };
    } catch (error) {
      if (!isUniqueAllowedViolation(error)) {
        throw error;
      }

      return this.convertRaceToDuplicate(input);
    }
  }

  private async convertRaceToDuplicate(input: {
    eventId: string;
    buyerProfileId: string;
    qrCodeId: string;
    scanEventId: string;
    staffUserId: string;
    visitorDisplayName: string;
    checkedInAt: Date;
  }): Promise<CheckInScanResponse> {
    const existingAllowed = await this.prisma.db.checkInRecord.findFirstOrThrow({
      where: {
        eventId: input.eventId,
        buyerProfileId: input.buyerProfileId,
        status: CheckInStatus.allowed,
      },
    });

    const duplicate = await this.prisma.db.checkInRecord.create({
      data: {
        eventId: input.eventId,
        buyerProfileId: input.buyerProfileId,
        qrCodeId: input.qrCodeId,
        scanEventId: input.scanEventId,
        checkedInByUserId: input.staffUserId,
        status: CheckInStatus.duplicate_checkin,
        checkedInAt: input.checkedInAt,
        duplicateOfCheckInId: existingAllowed.id,
      },
    });

    this.trackCheckIn(input.eventId, CheckInStatus.duplicate_checkin);

    return {
      status: CheckInStatus.duplicate_checkin,
      visitorDisplayName: input.visitorDisplayName,
      checkedInAt: duplicate.checkedInAt.toISOString(),
      duplicateWarning: true,
    };
  }

  private trackCheckIn(eventId: string, status: CheckInStatus): void {
    this.analytics.track({
      eventType: "check_in_recorded",
      eventId,
      metadata: { status },
    });
  }

  private async handleDeniedScan(
    tokenInput: string,
    eventId: string,
    staffUserId: string,
    checkedInAt: Date,
  ): Promise<CheckInScanResponse> {
    const token = extractQrToken(tokenInput);
    const pepper = this.configService.get("SESSION_TOKEN_PEPPER", {
      infer: true,
    });
    const tokenHash = hashQrToken(token, pepper);

    const qr = await this.prisma.db.qrCode.findUnique({
      where: { tokenHash },
      include: { buyerProfile: { select: { id: true, name: true } } },
    });

    if (!qr) {
      return {
        status: CheckInStatus.denied_invalid_qr,
        visitorDisplayName: null,
        checkedInAt: null,
        duplicateWarning: false,
      };
    }

    const status =
      qr.status === QrCodeStatus.active
        ? CheckInStatus.error
        : CheckInStatus.denied_blocked;

    await this.prisma.db.checkInRecord.create({
      data: {
        eventId,
        buyerProfileId: qr.buyerProfile.id,
        qrCodeId: qr.id,
        checkedInByUserId: staffUserId,
        status,
        checkedInAt,
      },
    });

    this.trackCheckIn(eventId, status);

    return {
      status,
      visitorDisplayName:
        status === CheckInStatus.denied_blocked
          ? qr.buyerProfile.name
          : null,
      checkedInAt: checkedInAt.toISOString(),
      duplicateWarning: false,
    };
  }

  private async lookupQrCodeId(buyerProfileId: string): Promise<string> {
    const qr = await this.prisma.db.qrCode.findUniqueOrThrow({
      where: { buyerProfileId },
      select: { id: true },
    });
    return qr.id;
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

const formatDate = (value: Date | null): string | null =>
  value ? value.toISOString().slice(0, 10) : null;

const isUniqueAllowedViolation = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";
