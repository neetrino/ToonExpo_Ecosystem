import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockTransaction = vi.fn();

const { recordAudit } = vi.hoisted(() => ({
  recordAudit: vi.fn(),
}));

vi.mock('@/lib/audit/record-audit', () => ({
  recordAudit,
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    platformSetting: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

import { upsertSetting } from './settings-mutations';

const ACTOR = { userId: 'admin-1', role: 'BIGPROJECTS_ADMIN' as const };

function txClient() {
  return {
    platformSetting: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
    auditLog: { create: vi.fn() },
  };
}

describe('upsertSetting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(txClient()),
    );
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: 'setting-1' });
    mockUpdate.mockResolvedValue({ id: 'setting-1' });
    recordAudit.mockResolvedValue(undefined);
  });

  it('rejects invalid contact email values', async () => {
    const result = await upsertSetting({ key: 'CONTACT_EMAIL', value: 'not-an-email' }, ACTOR);

    expect(result).toEqual({ ok: false, errorKey: 'invalidInput' });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('creates a new setting and writes an audit row', async () => {
    const result = await upsertSetting(
      { key: 'CONTACT_EMAIL', value: 'contact@toonexpo.com' },
      ACTOR,
    );

    expect(result).toEqual({ ok: true, settingId: 'setting-1', key: 'CONTACT_EMAIL' });
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        key: 'CONTACT_EMAIL',
        value: 'contact@toonexpo.com',
        updatedByUserId: 'admin-1',
      },
      select: { id: true },
    });
    expect(recordAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'SETTINGS_UPDATE',
        entityType: 'PLATFORM_SETTING',
        entityId: 'setting-1',
        detail: 'CONTACT_EMAIL: null→contact@toonexpo.com',
      }),
    );
  });

  it('updates an existing setting and records the previous value in audit detail', async () => {
    mockFindUnique.mockResolvedValue({ id: 'setting-1', value: 'old@toonexpo.com' });

    const result = await upsertSetting({ key: 'CONTACT_EMAIL', value: 'new@toonexpo.com' }, ACTOR);

    expect(result).toEqual({ ok: true, settingId: 'setting-1', key: 'CONTACT_EMAIL' });
    expect(mockUpdate).toHaveBeenCalled();
    expect(recordAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        detail: 'CONTACT_EMAIL: old@toonexpo.com→new@toonexpo.com',
      }),
    );
  });
});
