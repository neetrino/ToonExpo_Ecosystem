import { Injectable } from "@nestjs/common";
import type { PartnerOfferItem } from "@toonexpo/contracts";
import { PublicationStatus, type Prisma } from "@toonexpo/db";

import { loadTranslations } from "../../catalog/utils/load-translations.js";
import { TRANSLATION_ENTITY } from "../../catalog/utils/resolve-translation.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { toPartnerOfferItem } from "../mappers/partner.mapper.js";
import { groupPartnerOfferTranslations } from "../utils/group-partner-translations.js";
import { offerNotFound } from "../utils/partner-access.js";
import { upsertPartnerOfferTranslations } from "../utils/partner-translations.util.js";
import { AdminPartnersService } from "./admin-partners.service.js";
import type { CreatePartnerOfferDto } from "./dto/admin-partner-offer.dto.js";
import type { UpdatePartnerOfferDto } from "./dto/admin-partner-offer.dto.js";

@Injectable()
export class AdminPartnerOffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly partners: AdminPartnersService,
  ) {}

  async create(
    partnerId: string,
    userId: string,
    dto: CreatePartnerOfferDto,
  ): Promise<PartnerOfferItem> {
    await this.partners.requirePartner(partnerId);

    const offer = await this.prisma.db.partnerOffer.create({
      data: {
        partnerCompanyId: partnerId,
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

    return this.toOfferItem(offer);
  }

  async update(
    partnerId: string,
    offerId: string,
    userId: string,
    dto: UpdatePartnerOfferDto,
  ): Promise<PartnerOfferItem> {
    await this.requireOwnedOffer(partnerId, offerId);

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

    return this.toOfferItem(offer);
  }

  async remove(partnerId: string, offerId: string): Promise<void> {
    await this.requireOwnedOffer(partnerId, offerId);
    await this.prisma.db.partnerOffer.delete({ where: { id: offerId } });
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
