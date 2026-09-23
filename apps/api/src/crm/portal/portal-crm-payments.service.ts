import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateCrmPaymentBody, CrmPaymentItem } from '@toonexpo/contracts';
import { Prisma } from '@toonexpo/db';

import type { CompanyMemberContext } from '../../company/types/company-member-context.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { entityNotFound } from '../../portal/utils/access.js';
import { CRM_DEFAULT_PAYMENT_CURRENCY } from '../crm.constants.js';
import { mapPaymentItem } from '../mappers/crm.mapper.js';

const PAYMENT_REQUIRES_APARTMENT = 'Link an apartment before recording a payment';

/**
 * Records installment payments against a company CRM deal.
 */
@Injectable()
export class PortalCrmPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async addPayment(
    member: CompanyMemberContext,
    dealId: string,
    actorUserId: string,
    body: CreateCrmPaymentBody,
  ): Promise<CrmPaymentItem> {
    const deal = await this.prisma.db.crmDeal.findFirst({
      where: { id: dealId, companyId: member.companyId },
      select: {
        id: true,
        apartmentLinks: {
          take: 1,
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
          select: {
            apartment: { select: { priceCurrency: true } },
          },
        },
      },
    });
    if (!deal) {
      throw entityNotFound('Deal');
    }
    const apartment = deal.apartmentLinks[0]?.apartment;
    if (!apartment) {
      throw new BadRequestException(PAYMENT_REQUIRES_APARTMENT);
    }

    const payment = await this.prisma.db.crmDealPayment.create({
      data: {
        crmDealId: deal.id,
        amount: new Prisma.Decimal(body.amount),
        currency: apartment.priceCurrency || CRM_DEFAULT_PAYMENT_CURRENCY,
        note: body.note?.trim() || null,
        createdByUserId: actorUserId,
      },
      include: { createdBy: { select: { name: true, surname: true } } },
    });
    await this.prisma.db.crmDeal.update({
      where: { id: deal.id },
      data: { lastActivityAt: new Date() },
    });
    return mapPaymentItem(payment);
  }
}
