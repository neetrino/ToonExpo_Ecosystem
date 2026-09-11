import { MeshStandardMaterial, type BufferGeometry } from 'three';

import {
  createTrafficCarBodyParts,
  createTrafficCarGlassParts,
  createTrafficCarWheelParts,
} from '@/features/geo-map/traffic/create-traffic-car-parts';
import { mergeTreeGeometries } from '@/features/geo-map/trees/merge-tree-geometries';

/**
 * One white sedan, length along +Z so heading 0 faces south.
 * Merged for a single InstancedMesh draw — no extra GLB or renderer.
 */
export const createTrafficCarGeometry = (): BufferGeometry => {
  const parts = [
    ...createTrafficCarBodyParts(),
    ...createTrafficCarGlassParts(),
    ...createTrafficCarWheelParts(),
  ];
  const merged = mergeTreeGeometries(parts);
  for (const part of parts) {
    part.dispose();
  }
  merged.computeVertexNormals();
  return merged;
};

export const createTrafficCarMaterial = (): MeshStandardMaterial =>
  new MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.26,
    metalness: 0.2,
  });
