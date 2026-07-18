import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { CheckInScanResponse } from "@toonexpo/contracts";
import {
  CheckInStatus,
  QrCodeStatus,
  hashQrToken,
} from "@toonexpo/db";

import type { AppEnv } from "../../config/env.validation.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AnalyticsService } from "../../analytics/analytics.service.js";
import { extractQrToken } from "../../qr/qr-payload.util.js";
import { isUniqueAllowedViolation } from "./checkin.utils.js";

type SuccessfulScanInput = {
  eventId: string;
  buyerProfileId: string;
  qrCodeId: string;
  scanEventId: string;
  staffUserId: string;
  visitorDisplayName: string;
  checkedInAt: Date;
};

/**
 * Persists check-in scan outcomes: allowed, duplicate, denied, and race recovery.
 */
@Injectable()
export class CheckInScanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppEnv, true>,
    private readonly analytics: AnalyticsService,
  ) {}

  async recordSuccessfulScan(
    input: SuccessfulScanInput,
  ): Promise<CheckInScanResponse> {
    const existingAllowed = await this.prisma.db.checkInRecord.findFirst({
      where: {
        eventId: input.eventId,
        buyerProfileId: input.buyerProfileId,
        status: CheckInStatus.allowed,
      },
    });

    if (existingAllowed) {
      return this.createDuplicateRecord(input, existingAllowed.id);
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

  async handleDeniedScan(
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

  async lookupQrCodeId(buyerProfileId: string): Promise<string> {
    const qr = await this.prisma.db.qrCode.findUniqueOrThrow({
      where: { buyerProfileId },
      select: { id: true },
    });
    return qr.id;
  }

  private async createDuplicateRecord(
    input: SuccessfulScanInput,
    duplicateOfCheckInId: string,
  ): Promise<CheckInScanResponse> {
    const duplicate = await this.prisma.db.checkInRecord.create({
      data: {
        eventId: input.eventId,
        buyerProfileId: input.buyerProfileId,
        qrCodeId: input.qrCodeId,
        scanEventId: input.scanEventId,
        checkedInByUserId: input.staffUserId,
        status: CheckInStatus.duplicate_checkin,
        checkedInAt: input.checkedInAt,
        duplicateOfCheckInId,
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

  private async convertRaceToDuplicate(
    input: SuccessfulScanInput,
  ): Promise<CheckInScanResponse> {
    const existingAllowed = await this.prisma.db.checkInRecord.findFirstOrThrow({
      where: {
        eventId: input.eventId,
        buyerProfileId: input.buyerProfileId,
        status: CheckInStatus.allowed,
      },
    });

    return this.createDuplicateRecord(input, existingAllowed.id);
  }

  private trackCheckIn(eventId: string, status: CheckInStatus): void {
    this.analytics.track({
      eventType: "check_in_recorded",
      eventId,
      metadata: { status },
    });
  }
}
