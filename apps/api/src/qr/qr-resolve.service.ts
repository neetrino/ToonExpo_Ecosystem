import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { QrResolveResponse } from "@toonexpo/contracts";
import {
  AccountType,
  CompanyMemberStatus,
  CompanyType,
  QrCodeStatus,
  QrScanContext,
  QrScanResultStatus,
  decryptQrToken,
  hashQrToken,
} from "@toonexpo/db";

import type { AuthenticatedUser } from "../auth/types/authenticated-user.js";
import type { AppEnv } from "../config/env.validation.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { AnalyticsService } from "../analytics/analytics.service.js";
import {
  buildBuyerQrPayloadUrl,
  extractQrToken,
} from "./qr-payload.util.js";

export type QrResolveMeta = {
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
};

type QrWithBuyer = {
  id: string;
  status: QrCodeStatus;
  tokenEncrypted: string;
  buyerProfile: {
    id: string;
    userId: string;
    name: string;
    phone: string;
    email: string;
  };
};

@Injectable()
export class QrResolveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppEnv, true>,
    private readonly analytics: AnalyticsService,
  ) {}

  async resolve(
    rawTokenInput: string,
    scanner: AuthenticatedUser | null,
    meta: QrResolveMeta,
  ): Promise<QrResolveResponse> {
    const token = extractQrToken(rawTokenInput);
    const pepper = this.configService.get("SESSION_TOKEN_PEPPER", {
      infer: true,
    });
    const tokenHash = hashQrToken(token, pepper);
    const qr = await this.prisma.db.qrCode.findUnique({
      where: { tokenHash },
      include: { buyerProfile: true },
    });

    if (!qr) {
      throw new NotFoundException("QR code not found");
    }

    if (qr.status !== QrCodeStatus.active) {
      await this.recordScan(qr, scanner, null, {
        scanContext: this.contextFor(scanner, qr.buyerProfile.userId),
        resultStatus: QrScanResultStatus.blocked,
        meta,
      });
      throw new NotFoundException("QR code not found");
    }

    return this.resolveActive(qr, scanner, meta, pepper);
  }

  private async resolveActive(
    qr: QrWithBuyer,
    scanner: AuthenticatedUser | null,
    meta: QrResolveMeta,
    pepper: string,
  ): Promise<QrResolveResponse> {
    if (scanner?.accountType === AccountType.buyer) {
      if (scanner.id === qr.buyerProfile.userId) {
        return this.resolveOwner(qr, scanner, meta, pepper);
      }
      return this.deny(qr, scanner, meta, QrScanContext.unknown);
    }

    if (scanner?.accountType === AccountType.entrance_staff) {
      return this.resolveEntrance(qr, scanner, meta);
    }

    if (scanner?.accountType === AccountType.platform_admin) {
      return this.resolveEntrance(qr, scanner, meta);
    }

    if (scanner?.accountType === AccountType.company_member) {
      return this.resolveBuilder(qr, scanner, meta);
    }

    return this.deny(qr, scanner, meta, QrScanContext.unknown);
  }

  private async resolveOwner(
    qr: QrWithBuyer,
    scanner: AuthenticatedUser,
    meta: QrResolveMeta,
    pepper: string,
  ): Promise<QrResolveResponse> {
    const scanEventId = await this.recordScan(qr, scanner, null, {
      scanContext: QrScanContext.buyer_self_view,
      resultStatus: QrScanResultStatus.resolved,
      meta,
    });
    const token = decryptQrToken(qr.tokenEncrypted, pepper);
    const appUrl = this.configService.get("APP_URL", { infer: true });

    return {
      kind: "owner_profile",
      buyerId: qr.buyerProfile.userId,
      buyerProfileId: qr.buyerProfile.id,
      name: qr.buyerProfile.name,
      phone: qr.buyerProfile.phone,
      email: qr.buyerProfile.email,
      scanEventId,
      payloadUrl: buildBuyerQrPayloadUrl(appUrl, token),
    };
  }

  private async resolveEntrance(
    qr: QrWithBuyer,
    scanner: AuthenticatedUser,
    meta: QrResolveMeta,
  ): Promise<QrResolveResponse> {
    const scanEventId = await this.recordScan(qr, scanner, null, {
      scanContext: QrScanContext.entrance_checkin,
      resultStatus: QrScanResultStatus.resolved,
      meta,
      scannerRole: AccountType.entrance_staff,
    });

    return {
      kind: "entrance_checkin",
      buyerId: qr.buyerProfile.userId,
      buyerProfileId: qr.buyerProfile.id,
      name: qr.buyerProfile.name,
      scanEventId,
      qrCodeId: qr.id,
    };
  }

  private async resolveBuilder(
    qr: QrWithBuyer,
    scanner: AuthenticatedUser,
    meta: QrResolveMeta,
  ): Promise<QrResolveResponse> {
    const membership = await this.prisma.db.companyMember.findFirst({
      where: {
        userId: scanner.id,
        status: CompanyMemberStatus.active,
        company: { type: CompanyType.builder },
      },
      include: { company: true },
    });

    if (!membership) {
      return this.deny(qr, scanner, meta, QrScanContext.builder_scan);
    }

    const scanEventId = await this.recordScan(qr, scanner, membership.companyId, {
      scanContext: QrScanContext.builder_scan,
      resultStatus: QrScanResultStatus.resolved,
      meta,
      scannerRole: membership.role,
    });

    this.analytics.track({
      eventType: "qr_scanned",
      source: QrScanContext.builder_scan,
      companyId: membership.companyId,
      actorUserId: scanner.id,
      actorRole: scanner.accountType,
      metadata: { scanEventId, buyerProfileId: qr.buyerProfile.id },
    });

    return {
      kind: "buyer_action",
      buyerId: qr.buyerProfile.userId,
      buyerProfileId: qr.buyerProfile.id,
      name: qr.buyerProfile.name,
      phone: qr.buyerProfile.phone,
      email: qr.buyerProfile.email,
      scanEventId,
      scannerCompanyId: membership.companyId,
    };
  }

  private async deny(
    qr: QrWithBuyer,
    scanner: AuthenticatedUser | null,
    meta: QrResolveMeta,
    scanContext: QrScanContext,
  ): Promise<never> {
    await this.recordScan(qr, scanner, null, {
      scanContext,
      resultStatus: QrScanResultStatus.unauthorized,
      meta,
    });
    throw new NotFoundException("QR code not found");
  }

  private contextFor(
    scanner: AuthenticatedUser | null,
    ownerUserId: string,
  ): QrScanContext {
    if (!scanner) {
      return QrScanContext.unknown;
    }
    if (
      scanner.accountType === AccountType.buyer &&
      scanner.id === ownerUserId
    ) {
      return QrScanContext.buyer_self_view;
    }
    if (scanner.accountType === AccountType.entrance_staff) {
      return QrScanContext.entrance_checkin;
    }
    if (scanner.accountType === AccountType.company_member) {
      return QrScanContext.builder_scan;
    }
    return QrScanContext.unknown;
  }

  private async recordScan(
    qr: QrWithBuyer,
    scanner: AuthenticatedUser | null,
    scannerCompanyId: string | null,
    options: {
      scanContext: QrScanContext;
      resultStatus: QrScanResultStatus;
      meta: QrResolveMeta;
      scannerRole?: string;
    },
  ): Promise<string> {
    const event = await this.prisma.db.qrScanEvent.create({
      data: {
        qrCodeId: qr.id,
        buyerProfileId: qr.buyerProfile.id,
        scannerUserId: scanner?.id ?? null,
        scannerCompanyId,
        scannerRole: options.scannerRole ?? scanner?.accountType ?? null,
        scanContext: options.scanContext,
        resultStatus: options.resultStatus,
        ipAddress: options.meta.ipAddress ?? null,
        userAgent: options.meta.userAgent ?? null,
      },
    });
    return event.id;
  }
}
