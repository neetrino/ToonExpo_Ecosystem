import { describe, expect, it } from 'vitest';

import { GEO_MAP_GLB_MAX_BYTES } from '@/features/geo-map/admin/constants';
import { validateGlbFile } from '@/features/geo-map/admin/utils/validate-glb-file';

const makeFile = (name: string, size: number, type = 'model/gltf-binary'): File => {
  const buffer = new Uint8Array(Math.min(size, 8));
  return new File([buffer], name, { type });
};

describe('validateGlbFile', () => {
  it('accepts a .glb with model/gltf-binary mime', () => {
    expect(validateGlbFile(makeFile('tower.glb', 1024))).toBeNull();
  });

  it('accepts a .glb with empty mime (common in browsers)', () => {
    expect(validateGlbFile(makeFile('tower.glb', 1024, ''))).toBeNull();
  });

  it('rejects non-.glb extension', () => {
    expect(validateGlbFile(makeFile('tower.gltf', 1024))).toBe('type');
  });

  it('rejects unexpected mime when set', () => {
    expect(validateGlbFile(makeFile('tower.glb', 1024, 'image/png'))).toBe('type');
  });

  it('rejects files over the 15 MB limit', () => {
    const oversized = new File([new Uint8Array(1)], 'tower.glb', {
      type: 'model/gltf-binary',
    });
    Object.defineProperty(oversized, 'size', { value: GEO_MAP_GLB_MAX_BYTES + 1 });
    expect(validateGlbFile(oversized)).toBe('size');
  });
});
