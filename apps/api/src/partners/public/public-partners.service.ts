import { Injectable, NotFoundException } from '@nestjs/common';
import type { PublicPartnerDetail, PublicPartnerListResponse } from '@toonexpo/contracts';
import {
  PartnerCompanyStatus,
  PartnerCompanyType,
  PublicationStatus,
  type Prisma,
} from '@toonexpo/db';
import type { SupportedLocale } from '@toonexpo/shared';

import { loadTranslations } from '../../catalog/utils/load-translations.js';
import {
  resolveCatalogLocale,
  resolveTranslatedValue,
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
} from '../../catalog/utils/resolve-translation.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AnalyticsService } from '../../analytics/analytics.service.js';
import { toPublicPartnerDetail, toPublicPartnerListItem } from '../mappers/partner.mapper.js';
import type { ListPublicPartnersQueryDto } from './dto/list-public-partners.query.dto.js';

const publicPartnerInclude = {
  logoMedia: { select: { fileUrl: true } },
  coverMedia: { select: { fileUrl: true } },
} satisfies Prisma.PartnerCompanyInclude;

@Injectable()
export class PublicPartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  buildPublicWhere(query: ListPublicPartnersQueryDto): Prisma.PartnerCompanyWhereInput {
    const where: Prisma.PartnerCompanyWhereInput = {
      status: PartnerCompanyStatus.active,
      publicationStatus: PublicationStatus.published,
    };

    if (query.type) {
      where.type = query.type;
    }
    if (query.featured === true) {
      where.featured = true;
    }

    return where;
  }

  async list(query: ListPublicPartnersQueryDto): Promise<PublicPartnerListResponse> {
    const locale = resolveCatalogLocale(query.locale);
    const where = this.buildPublicWhere(query);
    const skip = (query.page - 1) * query.pageSize;

    const [total, partners] = await this.prisma.db.$transaction([
      this.prisma.db.partnerCompany.count({ where }),
      this.prisma.db.partnerCompany.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { name: 'asc' }],
        skip,
        take: query.pageSize,
        include: publicPartnerInclude,
      }),
    ]);

    const translationRows = await loadTranslations(
      this.prisma.db,
      TRANSLATION_ENTITY.partnerCompany,
      partners.map((partner) => partner.id),
    );

    return {
      data: partners.map((partner) =>
        toPublicPartnerListItem(
          partner,
          resolveTranslatedValue(
            translationRows,
            TRANSLATION_ENTITY.partnerCompany,
            partner.id,
            TRANSLATION_FIELD.shortDescription,
            locale,
            partner.shortDescription,
          ),
        ),
      ),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
      },
    };
  }

  async getBySlug(slug: string, localeInput?: string): Promise<PublicPartnerDetail> {
    const locale = resolveCatalogLocale(localeInput);

    const partner = await this.prisma.db.partnerCompany.findFirst({
      where: {
        slug,
        status: PartnerCompanyStatus.active,
        publicationStatus: PublicationStatus.published,
      },
      include: {
        ...publicPartnerInclude,
        offers: {
          where: { publicationStatus: PublicationStatus.published },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
        bankOffers: {
          where: { publicationStatus: PublicationStatus.published },
          orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { rate: 'asc' }],
        },
      },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    const partnerRows = await loadTranslations(this.prisma.db, TRANSLATION_ENTITY.partnerCompany, [
      partner.id,
    ]);
    const offerRows = await loadTranslations(
      this.prisma.db,
      TRANSLATION_ENTITY.partnerOffer,
      partner.offers.map((offer) => offer.id),
    );

    const localizedOffers = this.localizeOffers(partner.offers, offerRows, locale);

    this.analytics.track({
      eventType: 'partner_profile_view',
      companyId: partner.id,
    });

    return toPublicPartnerDetail(
      partner,
      partner.offers,
      {
        shortDescription: resolveTranslatedValue(
          partnerRows,
          TRANSLATION_ENTITY.partnerCompany,
          partner.id,
          TRANSLATION_FIELD.shortDescription,
          locale,
          partner.shortDescription,
        ),
        fullDescription: resolveTranslatedValue(
          partnerRows,
          TRANSLATION_ENTITY.partnerCompany,
          partner.id,
          TRANSLATION_FIELD.fullDescription,
          locale,
          partner.fullDescription,
        ),
        offerTexts: localizedOffers,
      },
      partner.type === PartnerCompanyType.bank ? partner.bankOffers : [],
    );
  }

  private localizeOffers(
    offers: Array<{ id: string; title: string; description: string | null }>,
    rows: Awaited<ReturnType<typeof loadTranslations>>,
    locale: SupportedLocale,
  ) {
    const map = new Map<string, { title: string; description: string | null }>();

    for (const offer of offers) {
      map.set(offer.id, {
        title:
          resolveTranslatedValue(
            rows,
            TRANSLATION_ENTITY.partnerOffer,
            offer.id,
            TRANSLATION_FIELD.title,
            locale,
            offer.title,
          ) ?? offer.title,
        description: resolveTranslatedValue(
          rows,
          TRANSLATION_ENTITY.partnerOffer,
          offer.id,
          TRANSLATION_FIELD.description,
          locale,
          offer.description,
        ),
      });
    }

    return map;
  }
}
