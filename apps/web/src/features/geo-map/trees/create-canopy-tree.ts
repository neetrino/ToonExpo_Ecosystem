import {
  BufferAttribute,
  Color,
  CylinderGeometry,
  MeshStandardMaterial,
  SphereGeometry,
  type BufferGeometry,
} from 'three';
import {
  TREE_CANOPY_COLOR_A,
  TREE_CANOPY_COLOR_B,
  TREE_CANOPY_COLOR_C,
  TREE_TRUNK_COLOR,
} from '@/features/geo-map/trees/constants';
import { mergeTreeGeometries } from '@/features/geo-map/trees/merge-tree-geometries';

const paintGeometry = (geometry: BufferGeometry, hex: number): BufferGeometry => {
  const count = geometry.getAttribute('position').count;
  const colors = new Float32Array(count * 3);
  const color = new Color(hex);
  for (let index = 0; index < count; index += 1) {
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  return geometry;
};

const createLobe = (
  radius: number,
  x: number,
  y: number,
  z: number,
  hex: number,
): BufferGeometry => {
  const lobe = new SphereGeometry(radius, 10, 8);
  lobe.translate(x, y, z);
  return paintGeometry(lobe, hex);
};

/**
 * One stylized oak: tapered trunk + overlapping canopy lobes.
 * Merged for a single InstancedMesh draw.
 */
export const createCanopyTreeGeometry = (): BufferGeometry => {
  const trunk = new CylinderGeometry(0.16, 0.28, 2.5, 8);
  trunk.translate(0, 1.25, 0);
  paintGeometry(trunk, TREE_TRUNK_COLOR);
  const parts = [
    trunk,
    createLobe(1.65, 0, 3.35, 0, TREE_CANOPY_COLOR_A),
    createLobe(1.12, -0.85, 3.05, 0.25, TREE_CANOPY_COLOR_B),
    createLobe(1.18, 0.9, 3.15, -0.2, TREE_CANOPY_COLOR_B),
    createLobe(1.02, 0.1, 3.5, 0.85, TREE_CANOPY_COLOR_C),
    createLobe(0.92, 0.05, 4.35, -0.15, TREE_CANOPY_COLOR_A),
  ];
  const merged = mergeTreeGeometries(parts);
  for (const part of parts) {
    part.dispose();
  }
  merged.computeVertexNormals();
  return merged;
};

export const createCanopyTreeMaterial = (): MeshStandardMaterial =>
  new MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.84,
    metalness: 0,
  });
