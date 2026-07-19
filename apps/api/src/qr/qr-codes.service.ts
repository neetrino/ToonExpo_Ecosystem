import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  BuyerQrResponse,
  BuyerQrScanHistoryResponse,
} from "@toonexpo/contracts";
import {
  QrCodeStatus,
  createQrToken,
  decryptQrToken,
  encryptQrToken,
  hashQrToken,
  type Prisma,
} from "@toonexpo/db";

import {
  BUYER_QR_SCANS_DEFAULT_PAGE_SIZE,
} from "../common/constants/app.constants.js";
import type { AppEnv } from "../config/env.validation.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { buildBuyerQrPayloadUrl } from "./qr-payload.util.js";

type TxClient = Prisma.TransactionClient;

@Injectable()
export class QrCodesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppEnv, true>,
  ) {}

  /**
   * Issues a permanent active QR for a buyer profile (registration / seed).
   */
  async createForBuyerProfile(
    buyerProfileId: string,
    tx?: TxClient,
  ): Promise<void> {
    const db = tx ?? this.prisma.db;
    const pepper = this.pepper();
    const token = createQrToken();

    await db.qrCode.create({
      data: {
        buyerProfileId,
        tokenHash: hashQrToken(token, pepper),
        tokenEncrypted: encryptQrToken(token, pepper),
        status: QrCodeStatus.active,
      },
    });
  }

  async getBuyerQr(userId: string): Promise<BuyerQrResponse> {
    const qr = await this.findActiveBuyerQr(userId);
    const token = decryptQrToken(qr.tokenEncrypted, this.pepper());
    const appUrl = this.configService.get("APP_URL", { infer: true });

    return {
      qrCodeId: qr.id,
      status: qr.status,
      payloadUrl: buildBuyerQrPayloadUrl(appUrl, token),
      createdAt: qr.createdAt.toISOString(),
    };
  }

  async listBuyerScans(
    userId: string,
    page = 1,
    pageSize = BUYER_QR_SCANS_DEFAULT_PAGE_SIZE,
  ): Promise<BuyerQrScanHistoryResponse> {
    const qr = await this.findActiveBuyerQr(userId);
    const events = await this.prisma.db.qrScanEvent.findMany({
      where: { qrCodeId: qr.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const companyIds = [
      ...new Set(
        events
          .map((event) => event.scannerCompanyId)
          .filter((id): id is string => id != null),
      ),
    ];
    const companies =
      companyIds.length === 0
        ? []
        : await this.prisma.db.company.findMany({
            where: { id: { in: companyIds } },
            select: { id: true, name: true },
          });
    const companyNameById = new Map(
      companies.map((company) => [company.id, company.name]),
    );

    return {
      data: events.map((event) => ({
        id: event.id,
        scanContext: event.scanContext,
        resultStatus: event.resultStatus,
        createdAt: event.createdAt.toISOString(),
        scannerCompanyName: event.scannerCompanyId
          ? (companyNameById.get(event.scannerCompanyId) ?? null)
          : null,
      })),
    };
  }

  private async findActiveBuyerQr(userId: string): Promise<{
    id: string;
    status: QrCodeStatus;
    tokenEncrypted: string;
    createdAt: Date;
  }> {
    const profile = await this.prisma.db.buyerProfile.findUnique({
      where: { userId },
      include: { qrCode: true },
    });

    if (!profile?.qrCode) {
      throw new NotFoundException("QR code not found");
    }

    return profile.qrCode;
  }

  private pepper(): string {
    return this.configService.get("SESSION_TOKEN_PEPPER", { infer: true });
  }
}
