import { BoxGeometry, Mesh, MeshStandardMaterial, Scene } from 'three';
import { describe, expect, it } from 'vitest';

import { flattenModelMaterials } from '@/features/geo-map/three/flatten-model-materials';

describe('flattenModelMaterials', () => {
  it('makes a lit material unlit with a shared white tint', () => {
    const material = new MeshStandardMaterial({ color: 0x552200, metalness: 0.8, roughness: 0.1 });
    const mesh = new Mesh(new BoxGeometry(1, 1, 1), material);
    const scene = new Scene();
    scene.add(mesh);
    flattenModelMaterials(scene);
    const next = mesh.material;
    expect(Array.isArray(next)).toBe(false);
    if (Array.isArray(next)) {
      return;
    }
    expect(next.type).toBe('MeshBasicMaterial');
    expect(next.color.getHex()).toBe(0xffffff);
  });
});
