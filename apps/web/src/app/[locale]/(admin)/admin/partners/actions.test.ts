import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/admin/assert-admin-session', () => ({
  assertAdminSession: vi.fn(),
}));

vi.mock('@/lib/admin/partner-mutations', () => ({
  createPartner: vi.fn(),
  updatePartner: vi.fn(),
  setPartnerStatus: vi.fn(),
  createBankOffer: vi.fn(),
  updateBankOffer: vi.fn(),
  setBankOfferStatus: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/shared/revalidate-partner-paths', () => ({
  revalidatePartnerPaths: vi.fn(),
}));

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { createBankOffer, createPartner } from '@/lib/admin/partner-mutations';

import { createBankOfferAction, createPartnerAction, updatePartnerAction } from './actions';

describe('admin partner actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized when createPartnerAction rejects the caller', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue(null);

    const result = await createPartnerAction('en', { name: 'Demo Bank', type: 'BANK' });

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(createPartner).not.toHaveBeenCalled();
  });

  it('returns unauthorized when updatePartnerAction rejects the caller', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue(null);

    const result = await updatePartnerAction('en', {
      partnerId: 'partner-1',
      name: 'Demo Bank',
      type: 'BANK',
    });

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
  });

  it('returns unauthorized when createBankOfferAction rejects the caller', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue(null);

    const result = await createBankOfferAction('en', {
      partnerId: 'partner-1',
      title: 'Offer',
      interestRate: 10,
      maxTermMonths: 240,
    });

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(createBankOffer).not.toHaveBeenCalled();
  });
});

describe('createBankOffer mutation guard', () => {
  it('surfaces notBankPartner from the mutation layer', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue({
      user: { id: 'admin-1', role: 'BIGPROJECTS_ADMIN' },
    } as never);
    vi.mocked(createBankOffer).mockResolvedValue({ ok: false, errorKey: 'notBankPartner' });

    const result = await createBankOfferAction('en', {
      partnerId: 'partner-service',
      title: 'Offer',
      interestRate: 10,
      minDownPaymentPercent: 10,
      maxTermMonths: 240,
    });

    expect(result).toEqual({ ok: false, errorKey: 'notBankPartner' });
  });
});
