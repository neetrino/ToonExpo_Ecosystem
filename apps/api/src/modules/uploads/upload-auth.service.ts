import { Injectable } from '@nestjs/common';
import type { AuthSession, UploadPurpose } from '@toonexpo/contracts';

import { type PrismaService } from '../../common/prisma.service';
import type { UploadObjectScope } from './object-key';

/** Must match apps/web active-company cookie (same-origin /nest rewrite forwards it). */
export const ACTIVE_COMPANY_COOKIE = 'toonexpo_active_company';

export type ResolvedUploadAuth =
  { ok: true; userId: string; scope: UploadObjectScope } | { ok: false };

@Injectable()
export class UploadAuthService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(
    purpose: UploadPurpose,
    session: AuthSession,
    activeCompanyId: string | undefined,
  ): Promise<ResolvedUploadAuth> {
    if (purpose === 'VENUE_IMAGE') {
      return this.resolveAdmin(session);
    }

    if (purpose === 'MEDIA' || purpose === 'CANVAS_IMAGE') {
      return this.resolveBuilder(session, activeCompanyId);
    }

    const builder = await this.resolveBuilder(session, activeCompanyId);
    if (builder.ok) {
      return builder;
    }
    const partner = await this.resolvePartner(session);
    if (partner.ok) {
      return partner;
    }
    return this.resolveAdmin(session);
  }

  private resolveAdmin(session: AuthSession): ResolvedUploadAuth {
    if (session.user.role !== 'BIGPROJECTS_ADMIN') {
      return { ok: false };
    }
    return {
      ok: true,
      userId: session.user.id,
      scope: { kind: 'admin', userId: session.user.id },
    };
  }

  private async resolveBuilder(
    session: AuthSession,
    activeCompanyId: string | undefined,
  ): Promise<ResolvedUploadAuth> {
    if (session.user.role === 'BUILDER') {
      return this.resolveBuilderMembership(session.user.id, activeCompanyId);
    }
    if (session.user.role === 'BIGPROJECTS_ADMIN') {
      return this.resolveAdminActingCompany(session.user.id, activeCompanyId);
    }
    return { ok: false };
  }

  private async resolveBuilderMembership(
    userId: string,
    activeCompanyId: string | undefined,
  ): Promise<ResolvedUploadAuth> {
    const memberships = await this.prisma.client.companyMember.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { companyId: true },
    });
    if (memberships.length === 0) {
      return { ok: false };
    }

    const matched = activeCompanyId
      ? memberships.find((row) => row.companyId === activeCompanyId)
      : undefined;
    const companyId = matched?.companyId ?? memberships[0]!.companyId;
    return { ok: true, userId, scope: { kind: 'company', companyId } };
  }

  private async resolveAdminActingCompany(
    userId: string,
    activeCompanyId: string | undefined,
  ): Promise<ResolvedUploadAuth> {
    if (!activeCompanyId) {
      return { ok: false };
    }
    const company = await this.prisma.client.company.findUnique({
      where: { id: activeCompanyId },
      select: { id: true },
    });
    if (!company) {
      return { ok: false };
    }
    return { ok: true, userId, scope: { kind: 'company', companyId: company.id } };
  }

  private async resolvePartner(session: AuthSession): Promise<ResolvedUploadAuth> {
    if (session.user.role !== 'PARTNER') {
      return { ok: false };
    }

    const membership = await this.prisma.client.companyMember.findFirst({
      where: { userId: session.user.id, role: 'PARTNER' },
      orderBy: { createdAt: 'asc' },
      select: { companyId: true },
    });
    if (!membership) {
      return { ok: false };
    }

    const partner = await this.prisma.client.partner.findUnique({
      where: { companyId: membership.companyId },
      select: { companyId: true },
    });
    if (!partner?.companyId) {
      return { ok: false };
    }

    return {
      ok: true,
      userId: session.user.id,
      scope: { kind: 'company', companyId: partner.companyId },
    };
  }
}
