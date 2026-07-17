import { Injectable } from '@nestjs/common';
import type { AuthSession } from '@toonexpo/contracts';

import { PrismaService } from '../../common/prisma.service';

export const ACTIVE_COMPANY_COOKIE = 'toonexpo_active_company';

export type BuilderContext = {
  session: AuthSession;
  companyId: string;
  companySlug: string;
  companyName: string;
  actingOnBehalf: boolean;
  membershipCount: number;
};

@Injectable()
export class BuilderContextService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(session: AuthSession, activeCompanyId?: string): Promise<BuilderContext | null> {
    if (session.user.role === 'BUILDER') {
      return this.resolveBuilder(session, activeCompanyId);
    }
    if (session.user.role === 'BIGPROJECTS_ADMIN') {
      return this.resolveAdmin(session, activeCompanyId);
    }
    return null;
  }

  private async resolveBuilder(
    session: AuthSession,
    activeCompanyId?: string,
  ): Promise<BuilderContext | null> {
    const memberships = await this.prisma.client.companyMember.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
      select: { company: { select: { id: true, slug: true, name: true } } },
    });
    if (memberships.length === 0) {
      return null;
    }
    const selected = activeCompanyId
      ? memberships.find(({ company }) => company.id === activeCompanyId)
      : undefined;
    const company = selected?.company ?? memberships[0]!.company;
    return {
      session,
      companyId: company.id,
      companySlug: company.slug,
      companyName: company.name,
      actingOnBehalf: false,
      membershipCount: memberships.length,
    };
  }

  private async resolveAdmin(
    session: AuthSession,
    activeCompanyId?: string,
  ): Promise<BuilderContext | null> {
    if (!activeCompanyId) {
      return null;
    }
    const company = await this.prisma.client.company.findUnique({
      where: { id: activeCompanyId },
      select: { id: true, slug: true, name: true },
    });
    return company
      ? {
          session,
          companyId: company.id,
          companySlug: company.slug,
          companyName: company.name,
          actingOnBehalf: true,
          membershipCount: 0,
        }
      : null;
  }
}
