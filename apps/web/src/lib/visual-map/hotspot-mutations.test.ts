import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockTx = {
  visualCanvas: { findFirst: vi.fn() },
  hotspot: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock('@toonexpo/db', () => ({
  prisma: {
    $transaction: vi.fn((callback: (tx: typeof mockTx) => Promise<unknown>) => callback(mockTx)),
  },
}));

import { archiveHotspot, restoreHotspot } from './hotspot-mutations';

const OWN_COMPANY_ID = 'company-own';
const FOREIGN_COMPANY_ID = 'company-foreign';

function projectCanvasOwned(status: 'DRAFT' | 'PUBLISHED' = 'PUBLISHED') {
  return {
    id: 'canvas-1',
    status,
    projectId: 'project-1',
    buildingId: null,
    floorId: null,
    project: { id: 'project-1', companyId: OWN_COMPANY_ID },
    building: null,
    floor: null,
  };
}

describe('archiveHotspot / restoreHotspot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('soft-archives hotspot on a published canvas', async () => {
    vi.mocked(mockTx.hotspot.findFirst).mockResolvedValue({
      id: 'hotspot-1',
      canvasId: 'canvas-1',
    });
    vi.mocked(mockTx.visualCanvas.findFirst).mockResolvedValue(projectCanvasOwned('PUBLISHED'));
    vi.mocked(mockTx.hotspot.update).mockResolvedValue({ id: 'hotspot-1' });

    const result = await archiveHotspot(OWN_COMPANY_ID, 'hotspot-1');

    expect(result).toEqual({ ok: true, hotspotId: 'hotspot-1', projectId: 'project-1' });
    expect(mockTx.hotspot.update).toHaveBeenCalledWith({
      where: { id: 'hotspot-1' },
      data: { archivedAt: expect.any(Date) },
    });
    expect(mockTx.hotspot.delete).not.toHaveBeenCalled();
  });

  it('hard-deletes hotspot on a draft canvas', async () => {
    vi.mocked(mockTx.hotspot.findFirst).mockResolvedValue({
      id: 'hotspot-1',
      canvasId: 'canvas-1',
    });
    vi.mocked(mockTx.visualCanvas.findFirst).mockResolvedValue(projectCanvasOwned('DRAFT'));
    vi.mocked(mockTx.hotspot.delete).mockResolvedValue({ id: 'hotspot-1' });

    await archiveHotspot(OWN_COMPANY_ID, 'hotspot-1');

    expect(mockTx.hotspot.delete).toHaveBeenCalledWith({ where: { id: 'hotspot-1' } });
    expect(mockTx.hotspot.update).not.toHaveBeenCalled();
  });

  it('returns notFound for foreign company archive', async () => {
    vi.mocked(mockTx.hotspot.findFirst).mockResolvedValue({
      id: 'hotspot-1',
      canvasId: 'canvas-1',
    });
    vi.mocked(mockTx.visualCanvas.findFirst).mockResolvedValue(null);

    const result = await archiveHotspot(FOREIGN_COMPANY_ID, 'hotspot-1');

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
  });

  it('restores an archived hotspot', async () => {
    vi.mocked(mockTx.hotspot.findFirst).mockResolvedValue({
      id: 'hotspot-1',
      canvasId: 'canvas-1',
    });
    vi.mocked(mockTx.visualCanvas.findFirst).mockResolvedValue(projectCanvasOwned());
    vi.mocked(mockTx.hotspot.update).mockResolvedValue({ id: 'hotspot-1' });

    const result = await restoreHotspot(OWN_COMPANY_ID, 'hotspot-1');

    expect(result).toEqual({ ok: true, hotspotId: 'hotspot-1', projectId: 'project-1' });
    expect(mockTx.hotspot.update).toHaveBeenCalledWith({
      where: { id: 'hotspot-1' },
      data: { archivedAt: null },
    });
  });

  it('returns notFound when restoring a foreign company hotspot', async () => {
    vi.mocked(mockTx.hotspot.findFirst).mockResolvedValue({
      id: 'hotspot-1',
      canvasId: 'canvas-1',
    });
    vi.mocked(mockTx.visualCanvas.findFirst).mockResolvedValue(null);

    const result = await restoreHotspot(FOREIGN_COMPANY_ID, 'hotspot-1');

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
  });
});
