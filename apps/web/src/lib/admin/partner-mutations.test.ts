import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/shared/unique-slug', () => ({
  allocateUniqueSlug: vi.fn(),
  MAX_SLUG_ATTEMPTS: 50,
}));

const {
  partnerFindUnique,
  partnerUpdate,
  bankOfferFindUnique,
  bankOfferUpdate,
  bankOfferCreate,
  transaction,
} = vi.hoisted(() => ({
  partnerFindUnique: vi.fn(),
  partnerUpdate: vi.fn(),
  bankOfferFindUnique: vi.fn(),
  bankOfferUpdate: vi.fn(),
  bankOfferCreate: vi.fn(),
  transaction: vi.fn(),
}));

const { recordAudit } = vi.hoisted(() => ({
  recordAudit: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    partner: {
      findUnique: partnerFindUnique,
      update: partnerUpdate,
    },
    bankOffer: {
      findUnique: bankOfferFindUnique,
      update: bankOfferUpdate,
      create: bankOfferCreate,
    },
    $transaction: transaction,
  },
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      code: string;
      constructor(message: string, { code }: { code: string }) {
        super(message);
        this.code = code;
      }
    },
  },
}));

vi.mock('@/lib/audit/record-audit', () => ({
  recordAudit,
  formatStatusTransition: (from: string, to: string) => `${from}→${to}`,
}));

import { prisma } from '@toonexpo/db';

import { createBankOffer, setBankOfferStatus, setPartnerStatus } from './partner-mutations';

const ACTOR = { userId: 'admin-1', role: 'BIGPROJECTS_ADMIN' as const };

describe('createBankOffer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns notBankPartner when partner is not a bank', async () => {
    vi.mocked(prisma.partner.findUnique).mockResolvedValue({
      id: 'partner-1',
      type: 'SERVICE_COMPANY',
    } as never);

    const result = await createBankOffer({
      partnerId: 'partner-1',
      title: 'Offer',
      interestRate: 10,
      maxTermMonths: 240,
    });

    expect(result).toEqual({ ok: false, errorKey: 'notBankPartner' });
    expect(prisma.bankOffer.create).not.toHaveBeenCalled();
  });
});

describe('setPartnerStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        partner: { findUnique: partnerFindUnique, update: partnerUpdate },
        auditLog: { create: vi.fn() },
      }),
    );
  });

  it('writes an audit row on partner status change', async () => {
    partnerFindUnique.mockResolvedValue({
      id: 'partner-1',
      slug: 'acme-bank',
      status: 'DRAFT',
      companyId: 'company-1',
    });
    partnerUpdate.mockResolvedValue({ id: 'partner-1' });
    recordAudit.mockResolvedValue(undefined);

    const result = await setPartnerStatus({ partnerId: 'partner-1', status: 'PUBLISHED' }, ACTOR);

    expect(result).toEqual({
      ok: true,
      partnerId: 'partner-1',
      partnerSlug: 'acme-bank',
    });
    expect(recordAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        entityType: 'PARTNER',
        detail: 'DRAFT→PUBLISHED',
      }),
    );
  });
});

describe('setBankOfferStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        bankOffer: { findUnique: bankOfferFindUnique, update: bankOfferUpdate },
        auditLog: { create: vi.fn() },
      }),
    );
  });

  it('writes an audit row on bank offer status change', async () => {
    bankOfferFindUnique.mockResolvedValue({
      id: 'offer-1',
      status: 'DRAFT',
      partner: { type: 'BANK', slug: 'acme-bank', companyId: null },
    });
    bankOfferUpdate.mockResolvedValue({ id: 'offer-1' });
    recordAudit.mockResolvedValue(undefined);

    const result = await setBankOfferStatus({ bankOfferId: 'offer-1', status: 'PUBLISHED' }, ACTOR);

    expect(result).toEqual({
      ok: true,
      bankOfferId: 'offer-1',
      partnerSlug: 'acme-bank',
    });
    expect(recordAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        entityType: 'BANK_OFFER',
        detail: 'DRAFT→PUBLISHED',
      }),
    );
  });
});
