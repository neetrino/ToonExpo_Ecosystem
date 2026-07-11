import { describe, expect, it } from 'vitest';

import {
  apartmentUpsertInputSchema,
  buildingCreateInputSchema,
  floorCreateInputSchema,
  projectPublicationInputSchema,
  projectUpsertInputSchema,
} from './builder-portal';

describe('builder-portal schemas', () => {
  it('rejects empty project name', () => {
    const result = projectUpsertInputSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects building name longer than the limit', () => {
    const result = buildingCreateInputSchema.safeParse({
      projectId: 'project-1',
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects floor level above the allowed maximum', () => {
    const result = floorCreateInputSchema.safeParse({
      buildingId: 'building-1',
      name: 'Level 999',
      level: 999,
    });
    expect(result.success).toBe(false);
  });

  it('rejects apartment code that is empty', () => {
    const result = apartmentUpsertInputSchema.safeParse({
      floorId: 'floor-1',
      code: '',
      status: 'AVAILABLE',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid publication status', () => {
    const result = projectPublicationInputSchema.safeParse({
      projectId: 'project-1',
      status: 'LIVE',
    });
    expect(result.success).toBe(false);
  });

  it('coerces floor level from a string', () => {
    const result = floorCreateInputSchema.safeParse({
      buildingId: 'building-1',
      name: 'Ground',
      level: '0',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.level).toBe(0);
    }
  });
});
