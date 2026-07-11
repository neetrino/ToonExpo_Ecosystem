import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/builder/assert-builder-session', () => ({
  assertBuilderSession: vi.fn(),
}));

vi.mock('@/lib/builder/mutations', () => ({
  createProject: vi.fn(),
  updateProject: vi.fn(),
  setProjectPublication: vi.fn(),
  createBuilding: vi.fn(),
  updateBuilding: vi.fn(),
  createFloor: vi.fn(),
  updateFloor: vi.fn(),
  upsertApartment: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import {
  createBuilding,
  createFloor,
  createProject,
  setProjectPublication,
  updateBuilding,
  updateFloor,
  updateProject,
  upsertApartment,
} from '@/lib/builder/mutations';

import {
  createBuildingAction,
  createFloorAction,
  createProjectAction,
  setProjectPublicationAction,
  updateBuildingAction,
  updateFloorAction,
  updateProjectAction,
  upsertApartmentAction,
} from './actions';

describe('builder portal actions authz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assertBuilderSession).mockResolvedValue(null);
  });

  it('createProjectAction returns unauthorized without a builder session', async () => {
    const result = await createProjectAction('en', { name: 'Project' });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(createProject).not.toHaveBeenCalled();
  });

  it('updateProjectAction returns unauthorized without a builder session', async () => {
    const result = await updateProjectAction('en', {
      projectId: 'project-1',
      name: 'Project',
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(updateProject).not.toHaveBeenCalled();
  });

  it('setProjectPublicationAction returns unauthorized without a builder session', async () => {
    const result = await setProjectPublicationAction('en', {
      projectId: 'project-1',
      status: 'PUBLISHED',
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(setProjectPublication).not.toHaveBeenCalled();
  });

  it('createBuildingAction returns unauthorized without a builder session', async () => {
    const result = await createBuildingAction('en', {
      projectId: 'project-1',
      name: 'Building',
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(createBuilding).not.toHaveBeenCalled();
  });

  it('updateBuildingAction returns unauthorized without a builder session', async () => {
    const result = await updateBuildingAction('en', {
      buildingId: 'building-1',
      name: 'Building',
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(updateBuilding).not.toHaveBeenCalled();
  });

  it('createFloorAction returns unauthorized without a builder session', async () => {
    const result = await createFloorAction('en', {
      buildingId: 'building-1',
      name: 'Floor',
      level: 1,
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(createFloor).not.toHaveBeenCalled();
  });

  it('updateFloorAction returns unauthorized without a builder session', async () => {
    const result = await updateFloorAction('en', {
      floorId: 'floor-1',
      name: 'Floor',
      level: 1,
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(updateFloor).not.toHaveBeenCalled();
  });

  it('upsertApartmentAction returns unauthorized without a builder session', async () => {
    const result = await upsertApartmentAction('en', {
      floorId: 'floor-1',
      code: 'A-1',
      status: 'AVAILABLE',
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(upsertApartment).not.toHaveBeenCalled();
  });
});
