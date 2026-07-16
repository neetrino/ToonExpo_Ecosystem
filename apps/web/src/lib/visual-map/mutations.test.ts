import { beforeEach, describe, expect, it, vi } from 'vitest';

const { recordAudit } = vi.hoisted(() => ({
  recordAudit: vi.fn(),
}));

vi.mock('@/lib/audit/record-audit', () => ({
  recordAudit,
  formatStatusTransition: (from: string, to: string) => `${from}→${to}`,
}));

vi.mock('@/lib/storage', () => ({
  bestEffortDeleteR2Object: vi.fn(),
  bestEffortDeleteReplacedR2Object: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    visualCanvas: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    project: {
      findFirst: vi.fn(),
    },
    building: {
      findFirst: vi.fn(),
    },
    floor: {
      findFirst: vi.fn(),
    },
    apartment: {
      findFirst: vi.fn(),
    },
    hotspot: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(async (callback: (tx: typeof prisma) => Promise<unknown>) =>
      callback(prisma),
    ),
  },
}));

import { prisma } from '@toonexpo/db';

import {
  createCanvas,
  createHotspot,
  deleteCanvas,
  moveHotspot,
  setCanvasStatus,
  updateCanvas,
  updateHotspot,
} from './mutations';

const OWN_COMPANY_ID = 'company-own';
const FOREIGN_COMPANY_ID = 'company-foreign';
const ACTOR = { userId: 'builder-1', role: 'BUILDER' as const };
function projectCanvasOwned() {
  return {
    id: 'canvas-1',
    status: 'DRAFT' as const,
    projectId: 'project-1',
    buildingId: null,
    floorId: null,
    project: { id: 'project-1', companyId: OWN_COMPANY_ID },
    building: null,
    floor: null,
  };
}

function floorCanvasOwned() {
  return {
    id: 'canvas-floor',
    status: 'DRAFT' as const,
    projectId: null,
    buildingId: null,
    floorId: 'floor-1',
    project: null,
    building: null,
    floor: {
      id: 'floor-1',
      building: { id: 'building-1', project: { id: 'project-1', companyId: OWN_COMPANY_ID } },
    },
  };
}

describe('visual-map mutations ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns notFound when createCanvas targets a foreign project', async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValue(null);

    const result = await createCanvas(FOREIGN_COMPANY_ID, {
      projectId: 'project-1',
      imageUrl: 'https://picsum.photos/seed/map/1200/800',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(prisma.visualCanvas.create).not.toHaveBeenCalled();
  });

  it('returns notFound when hotspot canvas belongs to another company', async () => {
    vi.mocked(prisma.visualCanvas.findFirst).mockResolvedValue(projectCanvasOwned() as never);

    const result = await createHotspot(FOREIGN_COMPANY_ID, {
      canvasId: 'canvas-1',
      x: 10,
      y: 20,
      buildingId: 'building-1',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(prisma.hotspot.create).not.toHaveBeenCalled();
  });

  it('returns targetMismatch when project canvas targets a floor', async () => {
    vi.mocked(prisma.visualCanvas.findFirst).mockResolvedValue(projectCanvasOwned() as never);

    const result = await createHotspot(OWN_COMPANY_ID, {
      canvasId: 'canvas-1',
      x: 10,
      y: 20,
      floorId: 'floor-other',
    });

    expect(result).toEqual({ ok: false, errorKey: 'targetMismatch' });
    expect(prisma.hotspot.create).not.toHaveBeenCalled();
  });

  it('returns targetMismatch when building target is outside the project', async () => {
    vi.mocked(prisma.visualCanvas.findFirst).mockResolvedValue(projectCanvasOwned() as never);
    vi.mocked(prisma.building.findFirst).mockResolvedValue({
      id: 'building-foreign',
      projectId: 'project-other',
    } as never);

    const result = await createHotspot(OWN_COMPANY_ID, {
      canvasId: 'canvas-1',
      x: 10,
      y: 20,
      buildingId: 'building-foreign',
    });

    expect(result).toEqual({ ok: false, errorKey: 'targetMismatch' });
  });

  it('returns targetMismatch when apartment is on another floor', async () => {
    vi.mocked(prisma.visualCanvas.findFirst).mockResolvedValue(floorCanvasOwned() as never);
    vi.mocked(prisma.hotspot.findFirst).mockResolvedValue({ id: 'hotspot-1' } as never);
    vi.mocked(prisma.apartment.findFirst).mockResolvedValue({
      id: 'apt-other-floor',
      floorId: 'floor-2',
    } as never);

    const result = await updateHotspot(OWN_COMPANY_ID, {
      hotspotId: 'hotspot-1',
      canvasId: 'canvas-floor',
      x: 40,
      y: 60,
      apartmentId: 'apt-other-floor',
    });

    expect(result).toEqual({ ok: false, errorKey: 'targetMismatch' });
    expect(prisma.hotspot.update).not.toHaveBeenCalled();
  });

  it('returns notFound when updateCanvas targets a foreign company canvas', async () => {
    vi.mocked(prisma.visualCanvas.findFirst).mockResolvedValue(null);

    const result = await updateCanvas(FOREIGN_COMPANY_ID, {
      canvasId: 'canvas-1',
      imageUrl: 'https://picsum.photos/seed/map/1200/800',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(prisma.visualCanvas.update).not.toHaveBeenCalled();
  });

  it('returns notFound when moveHotspot targets a foreign company canvas', async () => {
    vi.mocked(prisma.hotspot.findFirst).mockResolvedValue({
      id: 'hotspot-1',
      canvasId: 'canvas-1',
    } as never);
    vi.mocked(prisma.visualCanvas.findFirst).mockResolvedValue(null);

    const result = await moveHotspot(FOREIGN_COMPANY_ID, {
      hotspotId: 'hotspot-1',
      x: 10,
      y: 20,
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(prisma.hotspot.update).not.toHaveBeenCalled();
  });

  it('returns invalidInput when deleting a non-draft canvas', async () => {
    vi.mocked(prisma.visualCanvas.findFirst).mockResolvedValue({
      ...projectCanvasOwned(),
      status: 'PUBLISHED',
    } as never);

    const result = await deleteCanvas(OWN_COMPANY_ID, 'canvas-1');
    expect(result).toEqual({ ok: false, errorKey: 'invalidInput' });
    expect(prisma.visualCanvas.delete).not.toHaveBeenCalled();
  });

  it('writes an audit row when canvas status changes', async () => {
    vi.mocked(prisma.visualCanvas.findFirst).mockResolvedValue(projectCanvasOwned() as never);
    vi.mocked(prisma.visualCanvas.update).mockResolvedValue({ id: 'canvas-1' } as never);
    recordAudit.mockResolvedValue(undefined);

    const result = await setCanvasStatus(
      OWN_COMPANY_ID,
      { canvasId: 'canvas-1', status: 'PUBLISHED' },
      ACTOR,
    );

    expect(result).toEqual({ ok: true, canvasId: 'canvas-1', projectId: 'project-1' });
    expect(recordAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        actor: ACTOR,
        entityType: 'VISUAL_CANVAS',
        entityId: 'canvas-1',
        companyId: OWN_COMPANY_ID,
        detail: 'DRAFT→PUBLISHED',
      }),
    );
  });
});
