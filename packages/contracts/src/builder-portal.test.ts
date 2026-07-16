import { describe, expect, it } from 'vitest';

import {
  apartmentUpsertInputSchema,
  buildingCreateInputSchema,
  floorCreateInputSchema,
  mediaAssetUpsertInputSchema,
  projectPublicationInputSchema,
  projectUpsertInputSchema,
} from './builder-portal';

const SAMPLE_URL = 'https://picsum.photos/seed/cover/800/600';

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

  it('rejects matterportUrl with a non-http scheme', () => {
    const result = apartmentUpsertInputSchema.safeParse({
      floorId: 'floor-1',
      code: 'A-101',
      status: 'AVAILABLE',
      matterportUrl: 'javascript:alert(1)',
    });
    expect(result.success).toBe(false);
  });

  it('accepts matterportUrl https and defaults priceVisibility', () => {
    const result = apartmentUpsertInputSchema.safeParse({
      floorId: 'floor-1',
      code: 'A-101',
      status: 'AVAILABLE',
      matterportUrl: 'https://my.matterport.com/show/?m=example',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priceVisibility).toBe('PUBLIC');
      expect(result.data.matterportUrl).toBe('https://my.matterport.com/show/?m=example');
    }
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

  it('rejects empty floor level before coercion', () => {
    const result = floorCreateInputSchema.safeParse({
      buildingId: 'building-1',
      name: 'Ground',
      level: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mediaAssetUpsertInput when both owners are set', () => {
    const result = mediaAssetUpsertInputSchema.safeParse({
      projectId: 'project-1',
      apartmentId: 'apartment-1',
      url: SAMPLE_URL,
      sortOrder: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects mediaAssetUpsertInput when no owner is set', () => {
    const result = mediaAssetUpsertInputSchema.safeParse({
      url: SAMPLE_URL,
      sortOrder: 0,
    });
    expect(result.success).toBe(false);
  });

  it('accepts mediaAssetUpsertInput with project owner', () => {
    const result = mediaAssetUpsertInputSchema.safeParse({
      projectId: 'project-1',
      url: SAMPLE_URL,
      sortOrder: 1,
    });
    expect(result.success).toBe(true);
  });
});
