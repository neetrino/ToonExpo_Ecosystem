import { describe, expect, it } from 'vitest';

import {
  collectMappableProjectIds,
  resolveMapObjectForProject,
} from '@/features/catalog/utils/resolve-map-object-for-project';

const objects = [
  { id: 'proj-a', projectId: 'proj-a' },
  { id: 'proj-b', projectId: 'proj-b' },
];

describe('resolveMapObjectForProject', () => {
  it('returns the object whose projectId matches', () => {
    expect(resolveMapObjectForProject(objects, 'proj-b')).toEqual({
      id: 'proj-b',
      projectId: 'proj-b',
    });
  });

  it('keeps extra fields on the matched object', () => {
    const withCoords = [{ id: 'proj-a', projectId: 'proj-a', longitude: 44.5 }];
    expect(resolveMapObjectForProject(withCoords, 'proj-a')).toEqual({
      id: 'proj-a',
      projectId: 'proj-a',
      longitude: 44.5,
    });
  });

  it('returns null when the project has no published model', () => {
    expect(resolveMapObjectForProject(objects, 'missing')).toBeNull();
  });
});

describe('collectMappableProjectIds', () => {
  it('collects unique project ids from map objects', () => {
    expect([...collectMappableProjectIds(objects)].sort()).toEqual(['proj-a', 'proj-b']);
  });

  it('returns an empty set for an empty object list', () => {
    expect(collectMappableProjectIds([])).toEqual(new Set());
  });
});
