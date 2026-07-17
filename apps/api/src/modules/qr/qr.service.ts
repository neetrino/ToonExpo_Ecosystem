import { createHash, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import type { AuthSession, BuilderQrScanDealInput, CheckInInput } from '@toonexpo/contracts';
import type { Prisma } from '@toonexpo/db';

import { type PrismaService } from '../../common/prisma.service';

const QR_TOKEN_BYTE_LENGTH = 32;
const SCAN_DEBOUNCE_MS = 5 * 60 * 1000;
const DEAL_DEDUP_MS = 24 * 60 * 60 * 1000;
const OPEN_DEAL_STAGES = [
  'NEW_REQUEST',
  'ASSIGNED',
  'CONTACTED',
  'FOLLOW_UP_NEEDED',
  'APARTMENT_SELECTED',
  'RESERVED',
] as const;

export type QrResult =
  | { ok: true; qrCodeId: string; token: string; revoked: false }
  | { ok: true; qrCodeId: string; revoked: true }
  | { ok: false; errorKey: 'invalidInput' | 'notFound' | 'unauthorized' };

@Injectable()
export class QrService {
  constructor(private readonly prisma: PrismaService) {}

  ensure(userId: string): Promise<QrResult> {
    return this.prisma.client.$transaction(async (tx) => {
      const profile = await this.ensureProfile(tx, userId);
      const existing = await tx.qrCode.findUnique({ where: { buyerProfileId: profile.id } });
      if (existing?.revokedAt) {
        return { ok: true, qrCodeId: existing.id, revoked: true };
      }
      if (existing) {
        return { ok: true, qrCodeId: existing.id, token: existing.token, revoked: false };
      }
      const pair = this.tokenPair();
      const created = await tx.qrCode.create({
        data: { buyerProfileId: profile.id, ...pair },
        select: { id: true },
      });
      return { ok: true, qrCodeId: created.id, token: pair.token, revoked: false };
    });
  }

  revoke(userId: string): Promise<QrResult> {
    return this.prisma.client.$transaction(async (tx) => {
      const profile = await tx.buyerProfile.findUnique({ where: { userId }, select: { id: true } });
      if (!profile) {
        return { ok: false, errorKey: 'notFound' };
      }
      const qr = await tx.qrCode.findUnique({ where: { buyerProfileId: profile.id } });
      if (!qr) {
        return { ok: false, errorKey: 'notFound' };
      }
      if (!qr.revokedAt) {
        await tx.qrCode.update({ where: { id: qr.id }, data: { revokedAt: new Date() } });
      }
      return { ok: true, qrCodeId: qr.id, revoked: true };
    });
  }

  regenerate(userId: string): Promise<QrResult> {
    return this.prisma.client.$transaction(async (tx) => {
      const profile = await this.ensureProfile(tx, userId);
      const pair = this.tokenPair();
      const qr = await tx.qrCode.upsert({
        where: { buyerProfileId: profile.id },
        create: { buyerProfileId: profile.id, ...pair },
        update: { ...pair, revokedAt: null },
        select: { id: true },
      });
      return { ok: true, qrCodeId: qr.id, token: pair.token, revoked: false };
    });
  }

  async resolve(token: string, session: AuthSession | null, companyId?: string) {
    const qr = await this.prisma.client.qrCode.findFirst({
      where: { tokenHash: this.hash(token), revokedAt: null },
      select: { id: true, buyerProfile: { select: { userId: true } } },
    });
    if (!qr) {
      return { kind: 'invalid' as const };
    }
    if (session?.user.id === qr.buyerProfile.userId) {
      return { kind: 'owner' as const, qrCodeId: qr.id };
    }
    if (session?.user.role === 'ENTRANCE_STAFF') {
      const buyer = await this.prisma.client.user.findUnique({
        where: { id: qr.buyerProfile.userId },
        select: { id: true, name: true },
      });
      return buyer
        ? { kind: 'entrance' as const, qrCodeId: qr.id, buyer: { userId: buyer.id, name: buyer.name } }
        : { kind: 'invalid' as const };
    }
    if (session?.user.role === 'BUILDER' && companyId) {
      const allowed = await this.isCompanyMember(session.user.id, companyId, 'BUILDER');
      if (allowed) {
        return this.resolveForBuilder(qr.id, qr.buyerProfile.userId, companyId);
      }
    }
    return { kind: 'limited' as const, qrCodeId: qr.id };
  }

  async checkIn(userId: string, input: CheckInInput) {
    return this.prisma.client.$transaction(async (tx) => {
      const qr = await tx.qrCode.findFirst({
        where: { tokenHash: this.hash(input.qrToken), revokedAt: null },
        select: { id: true, buyerProfileId: true },
      });
      if (!qr) {
        return { ok: false as const, errorKey: 'notFound' as const };
      }
      const event = await tx.exhibitionEvent.findFirst({
        where: { ...(input.eventId ? { id: input.eventId } : {}), status: 'ACTIVE' },
        orderBy: { startDate: 'desc' },
        select: { id: true },
      });
      if (!event) {
        return { ok: false as const, errorKey: 'noActiveEvent' as const };
      }
      await this.logScan(tx, qr.id, userId, 'ENTRANCE_CHECKIN');
      const existing = await tx.checkIn.findUnique({
        where: {
          eventId_buyerProfileId: {
            eventId: event.id,
            buyerProfileId: qr.buyerProfileId,
          },
        },
        select: { id: true, checkedInAt: true },
      });
      if (existing) {
        return {
          ok: true as const,
          checkInId: existing.id,
          checkedInAt: existing.checkedInAt,
          alreadyCheckedIn: true,
        };
      }
      const checkIn = await tx.checkIn.upsert({
        where: { eventId_buyerProfileId: { eventId: event.id, buyerProfileId: qr.buyerProfileId } },
        create: {
          eventId: event.id,
          buyerProfileId: qr.buyerProfileId,
          qrCodeId: qr.id,
          checkedInByUserId: userId,
          status: 'ALLOWED',
        },
        update: {},
        select: { id: true, checkedInAt: true },
      });
      return {
        ok: true as const,
        checkInId: checkIn.id,
        checkedInAt: checkIn.checkedInAt,
        alreadyCheckedIn: false,
      };
    });
  }

  async createDeal(userId: string, companyId: string, input: BuilderQrScanDealInput) {
    if (!(await this.isCompanyMember(userId, companyId, 'BUILDER'))) {
      return { ok: false as const, errorKey: 'unauthorized' as const };
    }
    return this.prisma.client.$transaction(async (tx) => {
      const qr = await tx.qrCode.findFirst({
        where: { tokenHash: this.hash(input.qrToken), revokedAt: null },
        select: { id: true, buyerProfile: { select: { user: true } } },
      });
      if (!qr || qr.buyerProfile.user.id === userId) {
        return { ok: false as const, errorKey: 'notFound' as const };
      }
      if (input.projectId && !(await tx.project.findFirst({ where: { id: input.projectId, companyId } }))) {
        return { ok: false as const, errorKey: 'invalidInput' as const };
      }
      const existing = await tx.deal.findFirst({
        where: {
          companyId,
          buyerUserId: qr.buyerProfile.user.id,
          projectId: input.projectId ?? null,
          stage: { in: [...OPEN_DEAL_STAGES] },
          createdAt: { gte: new Date(Date.now() - DEAL_DEDUP_MS) },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (existing) {
        await tx.dealActivity.create({
          data: { dealId: existing.id, authorUserId: userId, type: 'COMMENT', body: input.note ?? 'Repeated QR scan interest recorded.' },
        });
        return { ok: true as const, deduped: true as const, dealId: existing.id };
      }
      const buyer = qr.buyerProfile.user;
      const deal = await tx.deal.create({
        data: {
          companyId,
          projectId: input.projectId,
          buyerUserId: buyer.id,
          createdByUserId: userId,
          source: 'BUILDER_QR_SCAN',
          contactName: buyer.name?.trim() || buyer.email,
          contactPhone: buyer.phone?.trim() || '—',
          contactEmail: buyer.email,
          message: input.note,
          lastActivityAt: new Date(),
        },
        select: { id: true },
      });
      return { ok: true as const, dealId: deal.id };
    });
  }

  async logBuilderScan(userId: string, companyId: string, qrCodeId: string): Promise<void> {
    if (!(await this.isCompanyMember(userId, companyId, 'BUILDER'))) {
      return;
    }
    await this.logScan(this.prisma.client, qrCodeId, userId, 'BUILDER_SCAN', companyId);
  }

  private async resolveForBuilder(qrCodeId: string, buyerUserId: string, companyId: string) {
    const [buyer, projects] = await Promise.all([
      this.prisma.client.user.findUnique({
        where: { id: buyerUserId },
        select: { id: true, name: true, email: true, phone: true },
      }),
      this.prisma.client.project.findMany({
        where: { companyId, status: { in: ['PUBLISHED', 'DRAFT'] } },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);
    return buyer
      ? { kind: 'builder' as const, qrCodeId, buyer: { userId: buyer.id, name: buyer.name, email: buyer.email, phone: buyer.phone }, projects }
      : { kind: 'invalid' as const };
  }

  private async isCompanyMember(userId: string, companyId: string, role: 'BUILDER'): Promise<boolean> {
    return Boolean(await this.prisma.client.companyMember.findFirst({ where: { userId, companyId, role } }));
  }

  private async ensureProfile(tx: Prisma.TransactionClient, userId: string) {
    return tx.buyerProfile.upsert({ where: { userId }, create: { userId }, update: {}, select: { id: true } });
  }

  private tokenPair(): { token: string; tokenHash: string } {
    const token = randomBytes(QR_TOKEN_BYTE_LENGTH).toString('base64url');
    return { token, tokenHash: this.hash(token) };
  }

  private hash(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  }

  private async logScan(
    tx: Prisma.TransactionClient | PrismaService['client'],
    qrCodeId: string,
    userId: string,
    purpose: 'BUILDER_SCAN' | 'ENTRANCE_CHECKIN',
    companyId?: string,
  ): Promise<void> {
    const recent = await tx.qrScanLog.findFirst({
      where: { qrCodeId, scannedByUserId: userId, purpose, scannedAt: { gte: new Date(Date.now() - SCAN_DEBOUNCE_MS) } },
    });
    if (!recent) {
      await tx.qrScanLog.create({ data: { qrCodeId, scannedByUserId: userId, purpose, companyId } });
    }
  }
}
