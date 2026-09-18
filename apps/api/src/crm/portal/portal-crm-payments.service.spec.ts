import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompanyMemberRole, Prisma } from '@toonexpo/db';

import type { PrismaService } from '../../prisma/prisma.service.js';
import { PortalCrmPaymentsService } from './portal-crm-payments.service.js';

const MEMBER = {
  companyId: 'co_1',
  membershipId: 'mem_1',
  role: CompanyMemberRole.company_admin,
};

describe('PortalCrmPaymentsService', () => {
  const dealFindFirst = vi.fn();
  const paymentCreate = vi.fn();
  const dealUpdate = vi.fn();
  let service: PortalCrmPaymentsService;

  beforeEach(() => {
    vi.clearAllMocks();
    dealFindFirst.mockResolvedValue({
      id: 'deal_1',
      apartmentLinks: [{ apartment: { priceCurrency: 'AMD' } }],
    });
    paymentCreate.mockResolvedValue({
      id: 'pay_1',
      amount: new Prisma.Decimal('1500000'),
      currency: 'AMD',
      note: null,
      createdByUserId: 'user_1',
      createdAt: new Date('2026-09-18T00:00:00.000Z'),
      createdBy: { name: 'Ani' },
    });
    const prisma = {
      db: {
        crmDeal: { findFirst: dealFindFirst, update: dealUpdate },
        crmDealPayment: { create: paymentCreate },
      },
    } as unknown as PrismaService;
    service = new PortalCrmPaymentsService(prisma);
  });

  it('records a payment against a linked apartment', async () => {
    const result = await service.addPayment(MEMBER, 'deal_1', 'user_1', { amount: 1_500_000 });
    expect(paymentCreate).toHaveBeenCalled();
    expect(result.amount).toBe('1500000');
    expect(dealUpdate).toHaveBeenCalled();
  });

  it('rejects payment when the deal has no apartment', async () => {
    dealFindFirst.mockResolvedValue({ id: 'deal_1', apartmentLinks: [] });
    await expect(
      service.addPayment(MEMBER, 'deal_1', 'user_1', { amount: 100 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(paymentCreate).not.toHaveBeenCalled();
  });
});
