import { Injectable } from "@nestjs/common";
import type { PortalPartnerDetail, PartnerOfferItem } from "@toonexpo/contracts";
import { PublicationStatus, type Prisma } from "@toonexpo/db";

import { loadTranslations } from "../../catalog/utils/load-translations.js";
import { TRANSLATION_ENTITY } from "../../catalog/utils/resolve-translation.js";
import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import { WebRevalidationService } from "../../common/web-revalidation/web-revalidation.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { toPortalPartnerDetail, toPartnerOfferItem } from "../mappers/partner.mapper.js";
import { groupPartnerOfferTranslations } from "../utils/group-partner-translations.js";
import {
  loadPartnerTranslationRows,
  offerNotFound,
  partnerNotFound,
} from "../utils/partner-access.js";
import { upsertPartnerOfferTranslations, upsertPartnerProfileTranslations } from "../utils/partner-translations.util.js";
import type { CreatePartnerOfferDto } from "../admin/dto/admin-partner-offer.dto.js";
import type { UpdatePartnerOfferDto } from "../admin/dto/admin-partner-offer.dto.js";
import type { UpdatePortalPartnerDto } from "./dto/portal-partner.dto.js";

const partnerOffersInclude = {
  offers: { orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }] },
} satisfies Prisma.PartnerCompanyInclude;

/** Portal-editable partner profile fields (admin-only fields excluded). */
const PORTAL_PARTNER_EDITABLE_KEYS = [
  "shortDescription",
  "fullDescription",
  "contacts",
  "website",
  "socialLinks",
  "logoMediaId",
  "coverMediaId",
  "translations",
] as const;

@Injectable()
export class PortalPartnerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webRevalidation: WebRevalidationService,
  ) {}

  portalEditableFieldKeys(): readonly string[] {
    return PORTAL_PARTNER_EDITABLE_KEYS;
  }

  async getOwnProfile(member: CompanyMemberContext): Promise<PortalPartnerDetail> {
    const partner = await this.findOwnPartner(member.companyId);
    const translationRows = await loadPartnerTranslationRows(
      this.prisma.db,
      partner.id,
      partner.offers.map((offer) => offer.id),
    );
    return toPortalPartnerDetail(partner, partner.offers, translationRows);
  }

  async updateOwnProfile(
    member: CompanyMemberContext,
    userId: string,
    dto: UpdatePortalPartnerDto,
  ): Promise<PortalPartnerDetail> {
    const partner = await this.findOwnPartner(member.companyId);

    await this.prisma.db.partnerCompany.update({
      where: { id: partner.id },
      data: {
        ...(dto.shortDescription !== undefined
          ? { shortDescription: dto.shortDescription }
          : {}),
        ...(dto.fullDescription !== undefined
          ? { fullDescription: dto.fullDescription }
          : {}),
        ...(dto.contacts !== undefined
          ? { contacts: dto.contacts as Prisma.InputJsonValue }
          : {}),
        ...(dto.website !== undefined ? { website: dto.website } : {}),
        ...(dto.socialLinks !== undefined
          ? { socialLinks: dto.socialLinks as Prisma.InputJsonValue }
          : {}),
        ...(dto.logoMediaId !== undefined ? { logoMediaId: dto.logoMediaId } : {}),
        ...(dto.coverMediaId !== undefined ? { coverMediaId: dto.coverMediaId } : {}),
      },
    });

    await upsertPartnerProfileTranslations(
      this.prisma.db,
      partner.id,
      userId,
      dto.translations,
    );

    return this.getOwnProfile(member);
  }

  async createOffer(
    member: CompanyMemberContext,
    userId: string,
    dto: CreatePartnerOfferDto,
  ): Promise<PartnerOfferItem> {
    const partner = await this.findOwnPartner(member.companyId);

    const offer = await this.prisma.db.partnerOffer.create({
      data: {
        partnerCompanyId: partner.id,
        title: dto.title.trim(),
        publicationStatus: dto.publicationStatus ?? PublicationStatus.draft,
        sortOrder: dto.sortOrder ?? 0,
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
      },
    });

    await upsertPartnerOfferTranslations(
      this.prisma.db,
      offer.id,
      userId,
      dto.translations,
    );

    if (
      (dto.publicationStatus ?? PublicationStatus.draft) ===
      PublicationStatus.published
    ) {
      this.webRevalidation.revalidatePartners();
    }

    return this.toOfferItem(offer);
  }

  async updateOffer(
    member: CompanyMemberContext,
    offerId: string,
    userId: string,
    dto: UpdatePartnerOfferDto,
  ): Promise<PartnerOfferItem> {
    const partner = await this.findOwnPartner(member.companyId);
    await this.requireOwnedOffer(partner.id, offerId);

    const offer = await this.prisma.db.partnerOffer.update({
      where: { id: offerId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.publicationStatus !== undefined
          ? { publicationStatus: dto.publicationStatus }
          : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });

    await upsertPartnerOfferTranslations(
      this.prisma.db,
      offer.id,
      userId,
      dto.translations,
    );

    if (dto.publicationStatus !== undefined) {
      this.webRevalidation.revalidatePartners();
    }

    return this.toOfferItem(offer);
  }

  async removeOffer(member: CompanyMemberContext, offerId: string): Promise<void> {
    const partner = await this.findOwnPartner(member.companyId);
    await this.requireOwnedOffer(partner.id, offerId);
    await this.prisma.db.partnerOffer.delete({ where: { id: offerId } });
  }

  private async findOwnPartner(companyId: string) {
    const partner = await this.prisma.db.partnerCompany.findUnique({
      where: { companyId },
      include: partnerOffersInclude,
    });
    if (!partner) {
      throw partnerNotFound();
    }
    return partner;
  }

  private async requireOwnedOffer(partnerId: string, offerId: string) {
    const offer = await this.prisma.db.partnerOffer.findFirst({
      where: { id: offerId, partnerCompanyId: partnerId },
    });
    if (!offer) {
      throw offerNotFound();
    }
    return offer;
  }

  private async toOfferItem(
    offer: Prisma.PartnerOfferGetPayload<object>,
  ): Promise<PartnerOfferItem> {
    const rows = await loadTranslations(
      this.prisma.db,
      TRANSLATION_ENTITY.partnerOffer,
      [offer.id],
    );
    const translations = groupPartnerOfferTranslations(rows);
    return toPartnerOfferItem(
      offer,
      Object.keys(translations).length > 0 ? translations : undefined,
    );
  }
}
