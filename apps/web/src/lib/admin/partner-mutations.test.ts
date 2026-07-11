import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/shared/unique-slug', () => ({
  allocateUniqueSlug: vi.fn(),
  MAX_SLUG_ATTEMPTS: 50,
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    partner: {
      findUnique: vi.fn(),
    },
    bankOffer: {
      create: vi.fn(),
    },
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

import { prisma } from '@toonexpo/db';

import { createBankOffer } from './partner-mutations';

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
