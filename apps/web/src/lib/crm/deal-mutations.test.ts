import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockTx = {
  deal: {
    findFirst: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  dealApartment: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  dealActivity: { create: vi.fn(), findFirst: vi.fn() },
  apartment: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn(),
  },
  companyMember: { findFirst: vi.fn() },
  project: { findFirst: vi.fn() },
};

vi.mock('@toonexpo/db', () => ({
  prisma: {
    $transaction: vi.fn((callback: (tx: typeof mockTx) => Promise<unknown>) => callback(mockTx)),
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

import {
  addDealActivity,
  assignDeal,
  createManualDeal,
  linkDealApartment,
  unlinkDealApartment,
  updateDealStage,
} from './deal-mutations';

const COMPANY_ID = 'company-own';
const FOREIGN_COMPANY_ID = 'company-foreign';
const DEAL_ID = 'deal-1';
const APARTMENT_ID = 'apt-1';
const APARTMENT_PROJECT_ID = 'project-from-apt';
const ACTOR_ID = 'user-builder';

const CLAIM_WHERE_RESERVED = expect.objectContaining({
  id: { in: [APARTMENT_ID] },
  OR: expect.any(Array),
});

function dealRow(
  overrides: Partial<{
    stage: string;
    projectId: string | null;
    apartmentCount: number;
  }> = {},
) {
  return {
    id: DEAL_ID,
    stage: overrides.stage ?? 'CONTACTED',
    projectId: overrides.projectId === undefined ? 'project-1' : overrides.projectId,
    assignedUserId: null,
    _count: { apartments: overrides.apartmentCount ?? 0 },
  };
}

function apartmentWithProject(projectId: string) {
  return {
    floor: { building: { projectId } },
  };
}

describe('updateDealStage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockTx.deal.update).mockResolvedValue({ id: DEAL_ID });
    vi.mocked(mockTx.dealActivity.create).mockResolvedValue({ id: 'act-1' });
    vi.mocked(mockTx.apartment.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(mockTx.dealApartment.findFirst).mockResolvedValue(null);
    vi.mocked(mockTx.apartment.findFirst).mockResolvedValue(null);
    vi.mocked(mockTx.apartment.findMany).mockResolvedValue([apartmentWithProject('project-1')]);
  });

  it('returns apartmentRequired when moving to RESERVED without apartments', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(dealRow({ apartmentCount: 0 }));
    vi.mocked(mockTx.dealApartment.findMany).mockResolvedValue([]);
    vi.mocked(mockTx.apartment.findMany).mockResolvedValue([]);

    const result = await updateDealStage(COMPANY_ID, {
      dealId: DEAL_ID,
      stage: 'RESERVED',
    });

    expect(result).toEqual({ ok: false, errorKey: 'apartmentRequired' });
    expect(mockTx.deal.update).not.toHaveBeenCalled();
  });

  it('sets apartments RESERVED via guarded claim when moving to RESERVED', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(dealRow({ apartmentCount: 1 }));
    vi.mocked(mockTx.dealApartment.findMany).mockResolvedValue([{ apartmentId: APARTMENT_ID }]);

    const result = await updateDealStage(
      COMPANY_ID,
      { dealId: DEAL_ID, stage: 'RESERVED' },
      ACTOR_ID,
    );

    expect(result).toEqual({
      ok: true,
      dealId: DEAL_ID,
      affectedProjectIds: ['project-1'],
    });
    expect(mockTx.apartment.updateMany).toHaveBeenCalledWith({
      where: CLAIM_WHERE_RESERVED,
      data: { status: 'RESERVED' },
    });
    expect(mockTx.dealActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'STATUS_CHANGE',
        body: 'CONTACTED→RESERVED',
        authorUserId: ACTOR_ID,
      }),
    });
  });

  it('returns reservationConflict when guarded claim updates fewer rows than expected', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(dealRow({ apartmentCount: 1 }));
    vi.mocked(mockTx.dealApartment.findMany).mockResolvedValue([{ apartmentId: APARTMENT_ID }]);
    vi.mocked(mockTx.apartment.updateMany).mockResolvedValue({ count: 0 });

    const result = await updateDealStage(COMPANY_ID, {
      dealId: DEAL_ID,
      stage: 'RESERVED',
    });

    expect(result).toEqual({ ok: false, errorKey: 'reservationConflict' });
    expect(mockTx.deal.update).not.toHaveBeenCalled();
  });

  it('sets apartments SOLD via guarded claim when moving to CONVERTED with own hold', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(
      dealRow({ stage: 'RESERVED', apartmentCount: 1 }),
    );
    vi.mocked(mockTx.dealApartment.findMany).mockResolvedValue([{ apartmentId: APARTMENT_ID }]);

    const result = await updateDealStage(COMPANY_ID, {
      dealId: DEAL_ID,
      stage: 'CONVERTED',
    });

    expect(result.ok).toBe(true);
    expect(mockTx.apartment.updateMany).toHaveBeenCalledWith({
      where: CLAIM_WHERE_RESERVED,
      data: { status: 'SOLD' },
    });
  });

  it('returns reservationConflict when CONVERTED claim is blocked by foreign hold', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(
      dealRow({ stage: 'APARTMENT_SELECTED', apartmentCount: 1 }),
    );
    vi.mocked(mockTx.dealApartment.findMany).mockResolvedValue([{ apartmentId: APARTMENT_ID }]);
    vi.mocked(mockTx.apartment.updateMany).mockResolvedValue({ count: 0 });

    const result = await updateDealStage(COMPANY_ID, {
      dealId: DEAL_ID,
      stage: 'CONVERTED',
    });

    expect(result).toEqual({ ok: false, errorKey: 'reservationConflict' });
    expect(mockTx.deal.update).not.toHaveBeenCalled();
  });

  it('releases reserved apartments to AVAILABLE when moving to LOST', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(
      dealRow({ stage: 'RESERVED', apartmentCount: 1 }),
    );
    vi.mocked(mockTx.dealApartment.findMany).mockResolvedValue([{ apartmentId: APARTMENT_ID }]);
    vi.mocked(mockTx.dealApartment.findFirst).mockResolvedValue(null);

    const result = await updateDealStage(COMPANY_ID, {
      dealId: DEAL_ID,
      stage: 'LOST',
    });

    expect(result.ok).toBe(true);
    expect(mockTx.apartment.updateMany).toHaveBeenCalledWith({
      where: { id: APARTMENT_ID, status: 'RESERVED' },
      data: { status: 'AVAILABLE' },
    });
  });

  it('returns apartment-derived projectId when deal.projectId is null', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(
      dealRow({ projectId: null, apartmentCount: 1 }),
    );
    vi.mocked(mockTx.dealApartment.findMany).mockResolvedValue([{ apartmentId: APARTMENT_ID }]);
    vi.mocked(mockTx.apartment.findMany).mockResolvedValue([
      apartmentWithProject(APARTMENT_PROJECT_ID),
    ]);

    const result = await updateDealStage(COMPANY_ID, {
      dealId: DEAL_ID,
      stage: 'RESERVED',
    });

    expect(result).toEqual({
      ok: true,
      dealId: DEAL_ID,
      affectedProjectIds: [APARTMENT_PROJECT_ID],
    });
  });

  it('returns notFound for a foreign company dealId', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(null);

    const result = await updateDealStage(FOREIGN_COMPANY_ID, {
      dealId: DEAL_ID,
      stage: 'CONTACTED',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(mockTx.deal.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: DEAL_ID, companyId: FOREIGN_COMPANY_ID },
      }),
    );
  });
});

describe('linkDealApartment / unlinkDealApartment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns notFound when linking a foreign apartment', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(dealRow());
    vi.mocked(mockTx.apartment.findFirst).mockResolvedValue(null);

    const result = await linkDealApartment(COMPANY_ID, {
      dealId: DEAL_ID,
      apartmentId: 'apt-foreign',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(mockTx.dealApartment.create).not.toHaveBeenCalled();
  });

  it('returns notFound for foreign company deal on link', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(null);

    const result = await linkDealApartment(FOREIGN_COMPANY_ID, {
      dealId: DEAL_ID,
      apartmentId: APARTMENT_ID,
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
  });

  it('stores apartment price and status snapshot on link', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(dealRow());
    vi.mocked(mockTx.apartment.findFirst).mockResolvedValue({
      id: APARTMENT_ID,
      status: 'AVAILABLE',
      priceAmd: 12_500_000,
      floor: { building: { projectId: APARTMENT_PROJECT_ID } },
    });
    vi.mocked(mockTx.dealApartment.create).mockResolvedValue({ id: 'link-1' });

    const result = await linkDealApartment(COMPANY_ID, {
      dealId: DEAL_ID,
      apartmentId: APARTMENT_ID,
    });

    expect(result.ok).toBe(true);
    expect(mockTx.dealApartment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        dealId: DEAL_ID,
        apartmentId: APARTMENT_ID,
        priceAmdSnapshot: 12_500_000,
        statusSnapshot: 'AVAILABLE',
        snapshotAt: expect.any(Date),
      }),
    });
  });

  it('returns apartmentRequired when unlinking the last apartment on RESERVED', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(
      dealRow({ stage: 'RESERVED', apartmentCount: 1 }),
    );
    vi.mocked(mockTx.dealApartment.findUnique).mockResolvedValue({ id: 'link-1' });
    vi.mocked(mockTx.apartment.findFirst).mockResolvedValue({
      id: APARTMENT_ID,
      status: 'RESERVED',
      priceAmd: null,
      floor: { building: { projectId: 'project-1' } },
    });
    vi.mocked(mockTx.dealApartment.findMany).mockResolvedValue([{ apartmentId: APARTMENT_ID }]);

    const result = await unlinkDealApartment(COMPANY_ID, {
      dealId: DEAL_ID,
      apartmentId: APARTMENT_ID,
    });

    expect(result).toEqual({ ok: false, errorKey: 'apartmentRequired' });
    expect(mockTx.dealApartment.delete).not.toHaveBeenCalled();
    expect(mockTx.apartment.updateMany).not.toHaveBeenCalled();
  });

  it('releases apartment on unlink when no other active holder', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(
      dealRow({ stage: 'CONTACTED', apartmentCount: 2 }),
    );
    vi.mocked(mockTx.dealApartment.findUnique).mockResolvedValue({ id: 'link-1' });
    vi.mocked(mockTx.apartment.findFirst).mockResolvedValue({
      id: APARTMENT_ID,
      status: 'RESERVED',
      priceAmd: null,
      floor: { building: { projectId: APARTMENT_PROJECT_ID } },
    });
    vi.mocked(mockTx.dealApartment.findMany).mockResolvedValue([
      { apartmentId: APARTMENT_ID },
      { apartmentId: 'apt-2' },
    ]);
    vi.mocked(mockTx.dealApartment.delete).mockResolvedValue({ id: 'link-1' });
    vi.mocked(mockTx.dealApartment.findFirst).mockResolvedValue(null);
    vi.mocked(mockTx.apartment.updateMany).mockResolvedValue({ count: 1 });

    const result = await unlinkDealApartment(COMPANY_ID, {
      dealId: DEAL_ID,
      apartmentId: APARTMENT_ID,
    });

    expect(result).toEqual({
      ok: true,
      dealId: DEAL_ID,
      affectedProjectIds: expect.arrayContaining(['project-1', APARTMENT_PROJECT_ID]),
    });
    expect(mockTx.dealApartment.delete).toHaveBeenCalled();
    expect(mockTx.dealApartment.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          apartmentId: APARTMENT_ID,
          dealId: { not: DEAL_ID },
        }),
      }),
    );
    expect(mockTx.apartment.updateMany).toHaveBeenCalledWith({
      where: { id: APARTMENT_ID, status: 'RESERVED' },
      data: { status: 'AVAILABLE' },
    });
  });

  it('does not release apartment on unlink when another active deal holds it', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(
      dealRow({ stage: 'CONTACTED', apartmentCount: 2 }),
    );
    vi.mocked(mockTx.dealApartment.findUnique).mockResolvedValue({ id: 'link-1' });
    vi.mocked(mockTx.apartment.findFirst).mockResolvedValue({
      id: APARTMENT_ID,
      status: 'RESERVED',
      priceAmd: null,
      floor: { building: { projectId: APARTMENT_PROJECT_ID } },
    });
    vi.mocked(mockTx.dealApartment.findMany).mockResolvedValue([
      { apartmentId: APARTMENT_ID },
      { apartmentId: 'apt-2' },
    ]);
    vi.mocked(mockTx.dealApartment.delete).mockResolvedValue({ id: 'link-1' });
    vi.mocked(mockTx.dealApartment.findFirst).mockResolvedValue({ id: 'other-link' });

    const result = await unlinkDealApartment(COMPANY_ID, {
      dealId: DEAL_ID,
      apartmentId: APARTMENT_ID,
    });

    expect(result.ok).toBe(true);
    expect(mockTx.dealApartment.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          dealId: { not: DEAL_ID },
        }),
      }),
    );
    expect(mockTx.apartment.updateMany).not.toHaveBeenCalled();
  });

  it('returns notFound for foreign company deal on unlink', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(null);

    const result = await unlinkDealApartment(FOREIGN_COMPANY_ID, {
      dealId: DEAL_ID,
      apartmentId: APARTMENT_ID,
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
  });
});

describe('assignDeal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockTx.deal.update).mockResolvedValue({ id: DEAL_ID });
    vi.mocked(mockTx.dealActivity.create).mockResolvedValue({ id: 'act-1' });
  });

  it('returns notFound when assignee is not a company member', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(dealRow({ stage: 'NEW_REQUEST' }));
    vi.mocked(mockTx.companyMember.findFirst).mockResolvedValue(null);

    const result = await assignDeal(COMPANY_ID, {
      dealId: DEAL_ID,
      assigneeUserId: 'user-outsider',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(mockTx.deal.update).not.toHaveBeenCalled();
  });

  it('returns notFound for foreign company deal', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(null);

    const result = await assignDeal(FOREIGN_COMPANY_ID, {
      dealId: DEAL_ID,
      assigneeUserId: null,
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
  });

  it('auto-moves NEW_REQUEST to ASSIGNED and writes STATUS_CHANGE', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(dealRow({ stage: 'NEW_REQUEST' }));
    vi.mocked(mockTx.companyMember.findFirst).mockResolvedValue({ id: 'member-1' });

    const result = await assignDeal(
      COMPANY_ID,
      { dealId: DEAL_ID, assigneeUserId: 'user-member' },
      ACTOR_ID,
    );

    expect(result).toEqual({ ok: true, dealId: DEAL_ID });
    expect(mockTx.deal.update).toHaveBeenCalledWith({
      where: { id: DEAL_ID },
      data: expect.objectContaining({
        assignedUserId: 'user-member',
        stage: 'ASSIGNED',
      }),
    });
    expect(mockTx.dealActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'STATUS_CHANGE',
        body: 'NEW_REQUEST→ASSIGNED',
      }),
    });
  });
});

describe('addDealActivity / createManualDeal ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockTx.deal.update).mockResolvedValue({ id: DEAL_ID });
    vi.mocked(mockTx.dealActivity.create).mockResolvedValue({ id: 'act-1' });
    vi.mocked(mockTx.deal.create).mockResolvedValue({ id: 'deal-new' });
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(dealRow());
  });

  it('recomputes nextFollowUpAt without clobbering an earlier PLANNED follow-up', async () => {
    vi.mocked(mockTx.dealActivity.findFirst).mockResolvedValue({
      dueAt: new Date('2026-07-10T09:00:00Z'),
    });

    const result = await addDealActivity(
      COMPANY_ID,
      {
        dealId: DEAL_ID,
        type: 'FOLLOW_UP',
        body: 'Later follow-up',
        nextFollowUpAt: new Date('2026-08-15T09:00:00Z'),
      },
      ACTOR_ID,
    );

    expect(result).toEqual({ ok: true, dealId: DEAL_ID });
    expect(mockTx.deal.update).toHaveBeenCalledWith({
      where: { id: DEAL_ID },
      data: { lastActivityAt: expect.any(Date) },
    });
    expect(mockTx.deal.update).toHaveBeenCalledWith({
      where: { id: DEAL_ID },
      data: { nextFollowUpAt: new Date('2026-07-10T09:00:00Z') },
    });
  });

  it('returns notFound for foreign company deal on addDealActivity', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(null);

    const result = await addDealActivity(FOREIGN_COMPANY_ID, {
      dealId: DEAL_ID,
      type: 'COMMENT',
      body: 'Note',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
  });

  it('returns notFound for foreign project on createManualDeal', async () => {
    vi.mocked(mockTx.project.findFirst).mockResolvedValue(null);

    const result = await createManualDeal(COMPANY_ID, {
      companyId: COMPANY_ID,
      contactName: 'Test',
      contactPhone: '+37491111111',
      projectId: 'project-foreign',
      source: 'MANUAL_BUILDER_ENTRY',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(mockTx.deal.create).not.toHaveBeenCalled();
  });
});
