import { Injectable } from '@nestjs/common';
import {
  bankOfferUpsertInputSchema,
  partnerSelfProfileInputSchema,
  type AuthSession,
} from '@toonexpo/contracts';

import { PrismaService } from '../../common/prisma.service';

const partnerSelect = {
  id: true,
  companyId: true,
  name: true,
  slug: true,
  type: true,
  logoUrl: true,
  description: true,
  phone: true,
  email: true,
  website: true,
  serviceCategories: true,
  status: true,
} as const;

@Injectable()
export class PartnerService {
  constructor(private readonly prisma: PrismaService) {}

  async context(session: AuthSession) {
    const membership = await this.prisma.client.companyMember.findFirst({
      where: { userId: session.user.id, role: 'PARTNER' },
      orderBy: { createdAt: 'asc' },
      select: { companyId: true },
    });
    if (!membership) {
      return null;
    }
    const partner = await this.prisma.client.partner.findUnique({
      where: { companyId: membership.companyId },
      select: partnerSelect,
    });
    if (!partner?.companyId) {
      return null;
    }
    return {
      session,
      partnerId: partner.id,
      companyId: partner.companyId,
      partner: { ...partner, companyId: partner.companyId },
    };
  }

  async detail(userId: string) {
    const partner = await this.findOwnPartner(userId);
    if (!partner) {
      return null;
    }
    return this.prisma.client.partner.findUnique({
      where: { id: partner.id },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        logoUrl: true,
        description: true,
        phone: true,
        email: true,
        website: true,
        serviceCategories: true,
        status: true,
        bankOffers: {
          orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
          select: {
            id: true,
            title: true,
            description: true,
            interestRate: true,
            minDownPaymentPercent: true,
            maxTermMonths: true,
            maxAmountAmd: true,
            featured: true,
            status: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async updateProfile(userId: string, raw: unknown) {
    const parsed = partnerSelfProfileInputSchema.safeParse(raw);
    if (!parsed.success) {
      return invalid();
    }
    const partner = await this.findOwnPartner(userId);
    if (!partner) {
      return notFound();
    }
    await this.prisma.client.partner.update({
      where: { id: partner.id },
      data: {
        name: parsed.data.name,
        logoUrl: parsed.data.logoUrl ?? null,
        description: parsed.data.description ?? null,
        phone: parsed.data.phone ?? null,
        email: parsed.data.email ?? null,
        website: parsed.data.website ?? null,
        serviceCategories: parsed.data.serviceCategories ?? [],
      },
    });
    return {
      ok: true as const,
      partnerId: partner.id,
      partnerSlug: partner.slug,
    };
  }

  async createOffer(userId: string, raw: unknown) {
    const partner = await this.findOwnPartner(userId);
    if (!partner) {
      return notFound();
    }
    if (partner.type !== 'BANK') {
      return { ok: false as const, errorKey: 'notBankPartner' as const };
    }
    const parsed = bankOfferUpsertInputSchema.safeParse({
      ...asObject(raw),
      partnerId: partner.id,
    });
    if (!parsed.success || parsed.data.bankOfferId) {
      return invalid();
    }
    const offer = await this.prisma.client.bankOffer.create({
      data: { partnerId: partner.id, ...offerData(parsed.data) },
    });
    return {
      ok: true as const,
      bankOfferId: offer.id,
      partnerSlug: partner.slug,
    };
  }

  async updateOffer(userId: string, offerId: string, raw: unknown) {
    const partner = await this.findOwnPartner(userId);
    if (!partner) {
      return notFound();
    }
    if (partner.type !== 'BANK') {
      return { ok: false as const, errorKey: 'notBankPartner' as const };
    }
    const parsed = bankOfferUpsertInputSchema.safeParse({
      ...asObject(raw),
      partnerId: partner.id,
      bankOfferId: offerId,
    });
    if (!parsed.success) {
      return invalid();
    }
    const result = await this.prisma.client.bankOffer.updateMany({
      where: { id: offerId, partnerId: partner.id },
      data: offerData(parsed.data),
    });
    return result.count
      ? { ok: true as const, bankOfferId: offerId, partnerSlug: partner.slug }
      : notFound();
  }

  private async findOwnPartner(userId: string) {
    const membership = await this.prisma.client.companyMember.findFirst({
      where: { userId, role: 'PARTNER' },
      orderBy: { createdAt: 'asc' },
      select: { companyId: true },
    });
    if (!membership) {
      return null;
    }
    return this.prisma.client.partner.findUnique({
      where: { companyId: membership.companyId },
      select: { id: true, slug: true, type: true },
    });
  }
}

function offerData(input: {
  title: string;
  description?: string;
  interestRate: number;
  minDownPaymentPercent: number;
  maxTermMonths: number;
  maxAmountAmd?: number;
  featured?: boolean;
}) {
  return {
    title: input.title,
    description: input.description ?? null,
    interestRate: input.interestRate,
    minDownPaymentPercent: input.minDownPaymentPercent,
    maxTermMonths: input.maxTermMonths,
    maxAmountAmd: input.maxAmountAmd ?? null,
    featured: input.featured ?? false,
  };
}

function asObject(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' ? { ...raw } : {};
}

function invalid() {
  return { ok: false as const, errorKey: 'invalidInput' as const };
}

function notFound() {
  return { ok: false as const, errorKey: 'notFound' as const };
}
