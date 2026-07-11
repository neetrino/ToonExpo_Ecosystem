import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/builder/assert-builder-session', () => ({
  assertBuilderSession: vi.fn(),
}));

vi.mock('@/lib/crm/deal-mutations', () => ({
  updateDealStage: vi.fn(),
  linkDealApartment: vi.fn(),
  unlinkDealApartment: vi.fn(),
  addDealActivity: vi.fn(),
  assignDeal: vi.fn(),
  createManualDeal: vi.fn(),
}));

vi.mock('@/lib/shared/resolve-catalog-paths', () => ({
  resolveCatalogPaths: vi.fn(),
  resolveCatalogPathsForProjects: vi.fn(),
}));

vi.mock('@/lib/shared/revalidate-catalog-paths', () => ({
  revalidateCatalogPaths: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import {
  addDealActivity,
  assignDeal,
  createManualDeal,
  linkDealApartment,
  unlinkDealApartment,
  updateDealStage,
} from '@/lib/crm/deal-mutations';

import {
  addDealActivityAction,
  assignDealAction,
  createManualDealAction,
  linkDealApartmentAction,
  unlinkDealApartmentAction,
  updateDealStageAction,
} from './actions';

describe('portal CRM actions authz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assertBuilderSession).mockResolvedValue(null);
  });

  it('updateDealStageAction returns unauthorized without a builder session', async () => {
    const result = await updateDealStageAction('en', {
      dealId: 'deal-1',
      stage: 'CONTACTED',
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(updateDealStage).not.toHaveBeenCalled();
  });

  it('linkDealApartmentAction returns unauthorized without a builder session', async () => {
    const result = await linkDealApartmentAction('en', {
      dealId: 'deal-1',
      apartmentId: 'apt-1',
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(linkDealApartment).not.toHaveBeenCalled();
  });

  it('unlinkDealApartmentAction returns unauthorized without a builder session', async () => {
    const result = await unlinkDealApartmentAction('en', {
      dealId: 'deal-1',
      apartmentId: 'apt-1',
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(unlinkDealApartment).not.toHaveBeenCalled();
  });

  it('addDealActivityAction returns unauthorized without a builder session', async () => {
    const result = await addDealActivityAction('en', {
      dealId: 'deal-1',
      type: 'COMMENT',
      body: 'Note',
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(addDealActivity).not.toHaveBeenCalled();
  });

  it('assignDealAction returns unauthorized without a builder session', async () => {
    const result = await assignDealAction('en', {
      dealId: 'deal-1',
      assigneeUserId: null,
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(assignDeal).not.toHaveBeenCalled();
  });

  it('createManualDealAction returns unauthorized without a builder session', async () => {
    const result = await createManualDealAction('en', {
      contactName: 'Test',
      contactPhone: '+37491111111',
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(createManualDeal).not.toHaveBeenCalled();
  });
});
