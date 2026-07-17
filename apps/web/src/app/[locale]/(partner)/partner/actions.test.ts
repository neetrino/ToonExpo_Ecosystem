import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/partner/assert-partner-session', () => ({
  assertPartnerSession: vi.fn(),
}));

vi.mock('@/lib/partner/mutations', () => ({
  updateOwnPartnerProfile: vi.fn(),
  createOwnBankOffer: vi.fn(),
  updateOwnBankOffer: vi.fn(),
}));

vi.mock('@/lib/shared/revalidate-partner-paths', () => ({
  revalidatePartnerPaths: vi.fn(),
}));

import { assertPartnerSession } from '@/lib/partner/assert-partner-session';
import {
  createOwnBankOffer,
  updateOwnBankOffer,
  updateOwnPartnerProfile,
} from '@/lib/partner/mutations';

import {
  createOwnBankOfferAction,
  updateOwnBankOfferAction,
  updateOwnPartnerProfileAction,
} from './actions';

const BANK_CTX = {
  session: { user: { id: 'user-1', role: 'PARTNER' } },
  partnerId: 'partner-own',
  companyId: 'company-1',
  partner: {
    id: 'partner-own',
    companyId: 'company-1',
    name: 'Own Bank',
    slug: 'own-bank',
    type: 'BANK' as const,
    logoUrl: null,
    description: null,
    phone: null,
    email: null,
    website: null,
    serviceCategories: [] as string[],
    status: 'DRAFT' as const,
  },
};

const SERVICE_CTX = {
  ...BANK_CTX,
  partnerId: 'partner-service',
  partner: {
    ...BANK_CTX.partner,
    id: 'partner-service',
    type: 'SERVICE_COMPANY' as const,
  },
};

describe('partner cabinet actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects profile update when session is missing', async () => {
    vi.mocked(assertPartnerSession).mockResolvedValue(null);

    const result = await updateOwnPartnerProfileAction('en', { name: 'Updated' });

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(updateOwnPartnerProfile).not.toHaveBeenCalled();
  });

  it('updates own profile scoped to session partnerId', async () => {
    vi.mocked(assertPartnerSession).mockResolvedValue(BANK_CTX as never);
    vi.mocked(updateOwnPartnerProfile).mockResolvedValue({
      ok: true,
      partnerId: 'partner-own',
      partnerSlug: 'own-bank',
    });

    const result = await updateOwnPartnerProfileAction('en', {
      name: 'Updated Bank',
      phone: '+37410000000',
    });

    expect(result).toEqual({ ok: true, partnerId: 'partner-own', partnerSlug: 'own-bank' });
    expect(updateOwnPartnerProfile).toHaveBeenCalledWith('partner-own', {
      name: 'Updated Bank',
      phone: '+37410000000',
    });
  });

  it('rejects bank offer create for non-BANK partner', async () => {
    vi.mocked(assertPartnerSession).mockResolvedValue(SERVICE_CTX as never);

    const result = await createOwnBankOfferAction('en', {
      title: 'Offer',
      interestRate: 10,
      minDownPaymentPercent: 10,
      maxTermMonths: 240,
    });

    expect(result).toEqual({ ok: false, errorKey: 'notBankPartner' });
    expect(createOwnBankOffer).not.toHaveBeenCalled();
  });

  it('forces session partnerId when creating a bank offer', async () => {
    vi.mocked(assertPartnerSession).mockResolvedValue(BANK_CTX as never);
    vi.mocked(createOwnBankOffer).mockResolvedValue({
      ok: true,
      bankOfferId: 'offer-1',
      partnerSlug: 'own-bank',
    });

    const result = await createOwnBankOfferAction('en', {
      partnerId: 'foreign-partner',
      title: 'Preferential',
      interestRate: 9.5,
      minDownPaymentPercent: 10,
      maxTermMonths: 240,
    });

    expect(result).toEqual({ ok: true, bankOfferId: 'offer-1', partnerSlug: 'own-bank' });
    expect(createOwnBankOffer).toHaveBeenCalledWith(
      expect.objectContaining({
        partnerId: 'partner-own',
        title: 'Preferential',
      }),
    );
  });

  it('forces session partnerId when updating a bank offer (foreign partner denied)', async () => {
    vi.mocked(assertPartnerSession).mockResolvedValue(BANK_CTX as never);
    vi.mocked(updateOwnBankOffer).mockResolvedValue({ ok: false, errorKey: 'notFound' });

    const result = await updateOwnBankOfferAction('en', {
      bankOfferId: 'foreign-offer',
      partnerId: 'foreign-partner',
      title: 'Stolen',
      interestRate: 10,
      minDownPaymentPercent: 10,
      maxTermMonths: 240,
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(updateOwnBankOffer).toHaveBeenCalledWith(
      expect.objectContaining({
        partnerId: 'partner-own',
        bankOfferId: 'foreign-offer',
      }),
    );
  });
});
